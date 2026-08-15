"""FastAPI entry point for the Graspify processing pipeline."""

from __future__ import annotations

import logging
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from pydantic import AnyHttpUrl, BaseModel, Field, ValidationError

from content_store import ContentRecord, LearningStore
from model_pipeline import (
    ProcessingError,
    answer_from_transcript,
    fetch_youtube_transcript,
    generate_detailed_summary,
    generate_quiz_questions,
    translate_to_english,
)
from speech_to_text import MediaTranscriptionError, transcribe_media

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("graspify.api")

app = FastAPI(title="Graspify API", version="1.0.0")
store = LearningStore()

MAX_UPLOAD_BYTES = 200 * 1024 * 1024
ALLOWED_MEDIA_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".mp4", ".mov", ".mkv", ".webm"}
DEFAULT_QUESTION = "Summarize this educational content in 3 concise lines."


class YouTubeProcessRequest(BaseModel):
    url: AnyHttpUrl = Field(description="A YouTube watch, short, embed, or youtu.be URL.")
    language: str = Field(default="en", min_length=2, max_length=10)
    question: str = Field(default=DEFAULT_QUESTION, min_length=3, max_length=2000)


class ProcessResponse(BaseModel):
    request_id: str
    input_type: str
    transcript: str
    answer: str
    retrieved_context: list[str]


class TranscriptUrlRequest(BaseModel):
    youtube_url: AnyHttpUrl
    language: str = Field(default="en", min_length=2, max_length=10)
    translate_to_english: bool = False


class TranscriptResponse(BaseModel):
    content_id: str
    source_type: Literal["youtube_url", "media_upload"]
    original_transcript: str
    english_translation: str | None = None


class ContentRequest(BaseModel):
    content_id: str = Field(min_length=1)


class ChatRequest(ContentRequest):
    question: str = Field(min_length=3, max_length=2000)


class QuizRequest(ContentRequest):
    count: int = Field(default=5, ge=3, le=10)


class QuizAnswer(BaseModel):
    question_id: str
    answer: str


class EvaluateRequest(BaseModel):
    quiz_id: str = Field(min_length=1)
    answers: list[QuizAnswer] = Field(min_length=1)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    """Return service health for deployment checks."""
    return {"status": "ok"}


def _pipeline_error(exc: Exception) -> HTTPException:

    if isinstance(exc, ValidationError):
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=exc.errors())

    if isinstance(exc, (ProcessingError, MediaTranscriptionError)):
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(exc))

    logger.exception("Unexpected processing failure")

    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Processing failed unexpectedly.")


def _content_or_404(content_id: str) -> ContentRecord:

    record = store.get_content(content_id)

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content was not found or has expired.")

    return record


async def _save_uploaded_transcript(file: UploadFile, language: str) -> str:

    filename = file.filename or "upload"

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_MEDIA_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported media type. Supported extensions: {', '.join(sorted(ALLOWED_MEDIA_EXTENSIONS))}.",
        )

    with TemporaryDirectory(prefix="graspify-") as directory:
        media_path = Path(directory) / f"upload{extension}"
        size = 0
        with media_path.open("wb") as destination:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Upload exceeds the 200 MB MVP limit.",
                    )
                destination.write(chunk)

        return await run_in_threadpool(transcribe_media, media_path, language)


@app.post("/transcript", response_model=TranscriptResponse, tags=["Learning workflow"])
async def create_transcript(request: Request) -> TranscriptResponse:
    """Create a transcript from JSON YouTube input or multipart media input.

    Send JSON with `youtube_url`, `language`, and `translate_to_english`, or multipart
    form data with `file`, `language`, and `translate_to_english`.
    """
    content_type = request.headers.get("content-type", "")

    try:
        if content_type.startswith("application/json"):
            payload = TranscriptUrlRequest.model_validate(await request.json())
            transcript = await run_in_threadpool(fetch_youtube_transcript, str(payload.youtube_url), payload.language)
            source_type = "youtube_url"
            translate = payload.translate_to_english
        elif content_type.startswith("multipart/form-data"):
            form = await request.form()
            file = form.get("file")
            if not hasattr(file, "read"):
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Provide a media file in the 'file' field.")
            language = str(form.get("language", "en-US"))
            translate = str(form.get("translate_to_english", "false")).lower() in {"true", "1", "yes"}
            transcript = await _save_uploaded_transcript(file, language)
            source_type = "media_upload"
            await file.close()
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Use application/json for a YouTube URL or multipart/form-data for an uploaded file.",
            )
        translation = await run_in_threadpool(translate_to_english, transcript) if translate else None
    except HTTPException:
        raise
    except Exception as exc:
        raise _pipeline_error(exc) from exc

    content_id = store.add_content(ContentRecord(transcript=transcript, source_type=source_type, translation=translation))

    logger.info("Created transcript content %s", content_id)

    return TranscriptResponse(
        content_id=content_id,
        source_type=source_type,
        original_transcript=transcript,
        english_translation=translation,
    )


@app.post("/summary", tags=["Learning workflow"])
async def create_summary(request: ContentRequest) -> dict[str, str]:
    """Generate a detailed, structured summary for previously transcribed content."""

    record = _content_or_404(request.content_id)

    try:
        summary = await run_in_threadpool(generate_detailed_summary, record.transcript)
    except Exception as exc:
        raise _pipeline_error(exc) from exc

    record.summary = summary

    return {"content_id": request.content_id, "summary": summary}


@app.post("/chat", tags=["Learning workflow"])
async def chat(request: ChatRequest) -> dict[str, str | list[str]]:
    """Answer a question using retrieved context from the original transcript only."""

    record = _content_or_404(request.content_id)

    try:
        answer, context = await run_in_threadpool(answer_from_transcript, record.transcript, request.question)
    except Exception as exc:
        raise _pipeline_error(exc) from exc
    return {"content_id": request.content_id, "answer": answer, "retrieved_context": context}


@app.post("/quiz", tags=["Learning workflow"])
async def create_quiz(request: QuizRequest) -> dict[str, object]:
    """Generate transcript-grounded MCQs; correct answers are kept server-side."""

    record = _content_or_404(request.content_id)

    try:
        generated_questions = await run_in_threadpool(generate_quiz_questions, record.transcript, request.count)
    except Exception as exc:
        raise _pipeline_error(exc) from exc

    questions = []

    for index, question in enumerate(generated_questions, start=1):
        question["question_id"] = f"q{index}"
        questions.append(question)

    quiz_id = store.add_quiz(request.content_id, questions)

    public_questions = [
        {key: value for key, value in question.items() if key in {"question_id", "question", "options", "concept"}}
        for question in questions
    ]

    return {"quiz_id": quiz_id, "content_id": request.content_id, "questions": public_questions}


@app.post("/evaluate", tags=["Learning workflow"])
async def evaluate_quiz(request: EvaluateRequest) -> dict[str, object]:
    """Evaluate submitted quiz answers and return performance-based grasping estimates."""

    quiz = store.get_quiz(request.quiz_id)

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz was not found or has expired.")

    submitted = {answer.question_id: answer.answer.strip().casefold() for answer in request.answers}

    concept_scores: dict[str, list[bool]] = {}

    results = []

    for question in quiz.questions:
        is_correct = submitted.get(question["question_id"], "") == question["correct_answer"].strip().casefold()
        concept_scores.setdefault(question["concept"], []).append(is_correct)
        results.append({"question_id": question["question_id"], "correct": is_correct, "concept": question["concept"], "explanation": question["explanation"]})

    correct_count = sum(result["correct"] for result in results)

    accuracy = round((correct_count / len(quiz.questions)) * 100, 2)

    concept_accuracy = {concept: round((sum(scores) / len(scores)) * 100, 2) for concept, scores in concept_scores.items()}

    weak_areas = [concept for concept, score in concept_accuracy.items() if score < 70]

    suggestions = (
        [f"Review the transcript sections covering: {', '.join(weak_areas)}, then attempt another focused quiz."]
        if weak_areas else ["Strong performance across assessed concepts. Revisit the summary and try a more difficult quiz."]
    )

    return {
        "quiz_id": request.quiz_id,
        "content_id": quiz.content_id,
        "accuracy_percent": accuracy,
        "estimated_grasping_level": "strong" if accuracy >= 80 else "developing" if accuracy >= 50 else "needs_revision",
        "concept_accuracy": concept_accuracy,
        "weak_areas": weak_areas,
        "improvement_suggestions": suggestions,
        "results": results,
        "disclaimer": "This is an estimated grasping level based on quiz performance, not a measure of cognitive ability.",
    }


async def _build_response(transcript: str, question: str, input_type: str, request_id: str) -> ProcessResponse:
    answer, context = await run_in_threadpool(answer_from_transcript, transcript, question)

    return ProcessResponse(
        request_id=request_id,
        input_type=input_type,
        transcript=transcript,
        answer=answer,
        retrieved_context=context,
    )


@app.post("/api/v1/process/youtube", response_model=ProcessResponse, tags=["Processing"])
async def process_youtube(request: YouTubeProcessRequest) -> ProcessResponse:
    """Fetch a YouTube caption transcript and answer a grounded question about it."""
    request_id = str(uuid4())
    try:
        transcript = await run_in_threadpool(fetch_youtube_transcript, str(request.url), request.language)
        response = await _build_response(transcript, request.question, "youtube_url", request_id)
    except Exception as exc:
        raise _pipeline_error(exc) from exc

    logger.info("Processed YouTube request %s", request_id)

    return response


@app.post("/api/v1/process/media", response_model=ProcessResponse, tags=["Processing"])
async def process_media(
    file: UploadFile = File(..., description="Audio or video file no longer than 30 minutes."),
    language: str = Form(default="en-US", min_length=2, max_length=10),
    question: str = Form(default=DEFAULT_QUESTION, min_length=3, max_length=2000),
) -> ProcessResponse:
    """Transcribe uploaded audio/video and answer a grounded question about it."""

    filename = file.filename or "upload"

    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_MEDIA_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported media type. Supported extensions: {', '.join(sorted(ALLOWED_MEDIA_EXTENSIONS))}.",
        )

    request_id = str(uuid4())

    try:
        with TemporaryDirectory(prefix="graspify-") as directory:
            media_path = Path(directory) / f"upload{extension}"
            size = 0
            with media_path.open("wb") as destination:
                while chunk := await file.read(1024 * 1024):
                    size += len(chunk)
                    if size > MAX_UPLOAD_BYTES:
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="Upload exceeds the 200 MB MVP limit.",
                        )
                    destination.write(chunk)
            transcript = await run_in_threadpool(transcribe_media, media_path, language)
            response = await _build_response(transcript, question, "media_upload", request_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise _pipeline_error(exc) from exc
    finally:
        await file.close()

    logger.info("Processed media request %s", request_id)

    return response
