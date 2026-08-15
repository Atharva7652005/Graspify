"""Import-safe RAG pipeline adapted from Youtube_Chatbot_model.py."""

from __future__ import annotations

import json
from os import getenv
from urllib.parse import parse_qs, urlparse

from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from youtube_transcript_api import TranscriptsDisabled, YouTubeTranscriptApi

load_dotenv()


class ProcessingError(RuntimeError):
    """A user-safe failure produced by the processing pipeline."""


def get_video_id(url: str) -> str | None:
    """Extract a video identifier from common YouTube URL forms."""

    parsed = urlparse(url)

    hostname = (parsed.hostname or "").lower()

    if hostname in {"www.youtube.com", "youtube.com", "m.youtube.com"}:
        if parsed.path == "/watch":
            return parse_qs(parsed.query).get("v", [None])[0]
        if parsed.path.startswith(("/shorts/", "/embed/")):
            parts = parsed.path.strip("/").split("/")
            return parts[1] if len(parts) > 1 else None

    if hostname == "youtu.be":
        return parsed.path.strip("/") or None

    return None


def fetch_youtube_transcript(url: str, language: str) -> str:
    video_id = get_video_id(url)
    if not video_id:
        raise ProcessingError("Provide a valid YouTube watch, short, embed, or youtu.be URL.")
    try:
        items = YouTubeTranscriptApi().fetch(video_id, languages=[language.split("-")[0].lower()])
    except TranscriptsDisabled as exc:
        raise ProcessingError("Captions are disabled for this YouTube video.") from exc
    except Exception as exc:
        raise ProcessingError(f"Unable to retrieve the YouTube transcript: {exc}") from exc
    transcript = " ".join(item.text for item in items if item.text.strip())
    if not transcript:
        raise ProcessingError("The YouTube video did not return any readable transcript text.")
    return transcript


def answer_from_transcript(transcript: str, question: str) -> tuple[str, list[str]]:
    """Create a FAISS index and produce an answer grounded only in the transcript."""

    api_key = getenv("GEMINI_API_KEY")

    if not api_key:
        raise ProcessingError("GEMINI_API_KEY is not configured on the server.")

    chunks = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200).create_documents([transcript])

    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001", google_api_key=api_key)

        vector_store = FAISS.from_documents(chunks, embeddings)

        documents = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4}).invoke(question)

        context = "\n\n".join(document.page_content for document in documents)

        prompt = PromptTemplate(
            template=("You are a helpful educational assistant. Answer ONLY from the transcript context. "
                      "If the context is insufficient, say you do not know.\n\n"
                      "{context}\n\nQuestion: {question}"),
            input_variables=["context", "question"],
        )

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            google_api_key=api_key, 
            temperature=0.1
        )

        response = llm.invoke(
            prompt.invoke(
                {
                    "context": context, 
                    "question": question
                }
            )
        )

    except Exception as exc:
        raise ProcessingError(f"Unable to create an AI response: {exc}") from exc

    return response.content, [document.page_content for document in documents]


def _get_llm() -> ChatGoogleGenerativeAI:
    api_key = getenv("GEMINI_API_KEY")
    if not api_key:
        raise ProcessingError("GEMINI_API_KEY is not configured on the server.")
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, temperature=0.1)


def generate_from_transcript(transcript: str, instruction: str) -> str:
    """Generate learning material using only the supplied transcript."""
    if not transcript.strip():
        raise ProcessingError("Cannot process an empty transcript.")
    prompt = (
        "Use only the transcript below. Do not add facts that are not present in it. "
        f"{instruction}\n\nTranscript:\n{transcript}"
    )
    try:
        return str(_get_llm().invoke(prompt).content)
    except Exception as exc:
        raise ProcessingError(f"Unable to generate learning material: {exc}") from exc


def translate_to_english(transcript: str) -> str:
    return generate_from_transcript(
        transcript,
        "Translate the transcript into clear English. Preserve the meaning and use plain paragraphs.",
    )


def generate_detailed_summary(transcript: str) -> str:
    return generate_from_transcript(
        transcript,
        "Write a detailed, structured educational summary with headings for the main topics, key points, "
        "important definitions, and a concise conclusion.",
    )


def generate_quiz_questions(transcript: str, count: int) -> list[dict]:
    """Generate grounded MCQs. Correct answers remain server-side for evaluation."""
    raw = generate_from_transcript(
        transcript,
        "Create exactly " + str(count) + " multiple-choice quiz questions. Return JSON only in this form: "
        '{"questions":[{"question":"...","options":["...","...","...","..."],'
        '"correct_answer":"exact option text","concept":"short topic","explanation":"..."}]}. '
        "Every question and answer must be supported by the transcript.",
    )
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        questions = json.loads(cleaned)["questions"]
        if not isinstance(questions, list) or len(questions) != count:
            raise ValueError("unexpected question count")
        for question in questions:
            if not all(key in question for key in ("question", "options", "correct_answer", "concept", "explanation")):
                raise ValueError("missing quiz field")
            if question["correct_answer"] not in question["options"]:
                raise ValueError("correct answer is not an option")
        return questions
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise ProcessingError("The model returned an invalid quiz format. Please try again.") from exc
