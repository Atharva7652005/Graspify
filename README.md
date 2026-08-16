# Graspify

Graspify is an AI-powered educational content understanding and learner-analytics framework. It transforms multilingual educational audio or video into structured learning material, grounded question answering, automatically generated assessments, and concept-level grasping estimates.

> **MVP status:** The FastAPI learning workflow is implemented. It uses an in-memory store for content and quizzes, so data is cleared whenever the API server restarts.

## Overview

Graspify is designed for educational recordings of up to approximately 30 minutes. It retains the original transcript, creates an English translation, extracts educationally meaningful content, and supports learners through chat, quizzes, and revision recommendations.

The learner analysis is an **estimated grasping level based on observable assessment and interaction performance**. It is not a measurement of a learner's cognitive ability.

### MVP capabilities

- Upload commonly used-language audio and video educational content.
- Extract audio from video using FFmpeg.
- Transcribe speech in its original language.
- Preserve the original transcript and provide an English translation.
- Produce concise and detailed summaries, key concepts, definitions, and topics.
- Answer questions using retrieval-augmented generation (RAG) grounded in the uploaded content.
- Generate grounded MCQ and true/false quizzes.
- Report concept-wise performance, highlight weak concepts, and recommend revision material.

## Technology Stack

| Area | Planned technology |
| --- | --- |
| Frontend | React + Vite |
| API service | Python + FastAPI |
| Media processing | AssemblyAI-managed media decoding |
| Speech-to-text | AssemblyAI Universal transcription model |
| Translation, summaries, chat, quizzes | OpenAI GPT model or another high-quality LLM |
| Embeddings | Multilingual embeddings (for example BGE-M3, Cohere Embed, or OpenAI embeddings) |
| Vector storage | PostgreSQL + pgvector |

The existing `backend/Youtube_Chatbot_model.py` is an experimental YouTube transcript RAG workflow using YouTube Transcript API, LangChain, Gemini embeddings/chat, and FAISS. It is a model reference to be refactored behind API services; it is not an HTTP server.

## Repository Structure

```text
Graspify/
|-- backend/
|   |-- main.py                    # FastAPI application entry point
|   |-- Youtube_Chatbot_model.py   # Current YouTube RAG model experiment
|   |-- Speech_to_text.ipynb       # Speech-to-text exploration notebook
|   |-- model_pipeline.py          # Import-safe transcript, RAG, and learning-generation service
|   |-- speech_to_text.py          # Import-safe audio/video transcription service
|   |-- content_store.py           # In-memory MVP content and quiz store
|   `-- requirements.txt           # Python dependencies
|-- frontend/                      # React/Vite client
`-- README.md
```

## Setup

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later (for the frontend)
- A configured model-provider API key: `GEMINI_API_KEY` for RAG plus `ASSEMBLYAI_API_KEY` for uploaded audio/video transcription
- PostgreSQL with the `pgvector` extension when persistent vector storage is added

### Backend

From the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` and add only the provider variables required by the selected model integration:

```env
GEMINI_API_KEY=your_key_here
ASSEMBLYAI_API_KEY=your_key_here
```

When FastAPI routes are implemented, start the development server with:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The interactive API documentation will then be available at `http://localhost:8000/docs`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Processing Pipeline

```text
Audio/Video Upload
        |
Validation (file type, size, duration)
        |
Upload audio/video to AssemblyAI
        |
AssemblyAI speech-to-text in the original language
        |
Original transcript + timestamps
        |
English translation
        |
Educational summary + key concepts + definitions
        |
Chunking + multilingual embeddings
        |
PostgreSQL + pgvector
        |
RAG retrieval -> grounded chat / quiz generation
        |
Quiz results + interactions -> grasping estimates + recommendations
```

### API pipeline responsibilities

- **Routes:** receive HTTP requests and return typed, consistent responses.
- **Schemas:** validate files, URLs, questions, and quiz submissions with Pydantic models.
- **Services:** wrap transcription, translation, summarization, embeddings, retrieval, quiz generation, and analysis models.
- **Repositories:** isolate relational and vector database operations.
- **Jobs:** keep long-running upload processing asynchronous and track a processing status.
- **Error handling and logging:** translate expected failures into safe API errors and log diagnostic context without exposing secrets.

## API Endpoints (Architecture Contract)

All endpoints are versioned under `/api/v1`. Authentication is outside the MVP scope, but production deployments should require authorization, enforce upload limits, and restrict allowed origins.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/content` | Upload an educational audio/video file and begin processing. |
| `GET` | `/api/v1/content/{content_id}` | Get processing status and processed content metadata. |
| `GET` | `/api/v1/content/{content_id}/learning-material` | Retrieve transcripts, translation, summaries, and concepts. |
| `POST` | `/api/v1/content/{content_id}/chat` | Ask a RAG-grounded question about the content. |
| `POST` | `/api/v1/content/{content_id}/quizzes` | Generate a quiz from the processed content. |
| `POST` | `/api/v1/quizzes/{quiz_id}/submissions` | Submit answers and create a grasping analysis. |
| `GET` | `/api/v1/content/{content_id}/grasping-analysis` | Retrieve concept-level estimates and revision recommendations. |
| `GET` | `/health` | Return service health for deployment checks. |

### Example: ask a grounded question

```http
POST /api/v1/content/lecture_123/chat
Content-Type: application/json

{
  "question": "What does the lecturer say about SQL joins?"
}
```

```json
{
  "content_id": "lecture_123",
  "answer": "...",
  "sources": [
    {
      "chunk_id": "chunk_08",
      "start_time_seconds": 642,
      "end_time_seconds": 701
    }
  ]
}
```

### Example: submit quiz answers

```http
POST /api/v1/quizzes/quiz_456/submissions
Content-Type: application/json

{
  "answers": [
    {"question_id": "q1", "selected_option": "B"},
    {"question_id": "q2", "selected_option": true}
  ]
}
```

An analysis response should report per-concept performance, such as `SQL Joins: 45%`, and link the learner to relevant content sections and targeted follow-up questions.

## Usage

1. Start the backend and frontend after the API implementation is available.
2. Upload an educational audio or video file through `POST /api/v1/content`.
3. Poll `GET /api/v1/content/{content_id}` until processing completes.
4. Display the transcript, English translation, summary, and concepts.
5. Use the chat endpoint for source-grounded learning questions.
6. Generate and complete a quiz.
7. Use the grasping-analysis endpoint to show strong concepts, weak concepts, and revision recommendations.

## Testing

The API implementation should include automated tests for request validation, service integration, failure cases, and response schemas.

Suggested test layout:

```text
backend/tests/
|-- test_health.py
|-- test_content.py
|-- test_chat.py
|-- test_quizzes.py
`-- test_grasping_analysis.py
```

Run the suite once tests are added:

```powershell
cd backend
pytest
```

Test with small, non-sensitive sample media and mock external model calls. Cover invalid media, missing or disabled transcripts, unsupported languages, failed AssemblyAI/Gemini calls, empty retrieval results, malformed quiz submissions, and timestamp/source formatting.

## Development Notes

- Keep model code out of route handlers. Model integrations should be importable service modules with explicit input and output contracts.
- Do not run interactive code such as `input()` or print final model results at import time; APIs must initialize safely on server startup.
- Retain timestamps throughout processing so chat citations and revision recommendations can point learners to the relevant lecture section.
- AssemblyAI decodes uploaded media on its servers; FFmpeg is not required by the backend upload pipeline.
- Use background processing for media and model operations that exceed normal HTTP request durations.
- Never commit `.env` files or API keys.

## Implemented FastAPI Endpoints

Start the backend with `uvicorn main:app --reload` from `backend`, then open `http://localhost:8000/docs` for the generated OpenAPI documentation.

| Method | Endpoint | Input | Output |
| --- | --- | --- | --- |
| `POST` | `/transcript` | JSON YouTube URL, or multipart audio/video file | `content_id`, original transcript, optional English translation |
| `POST` | `/summary` | `content_id` | Detailed structured summary |
| `POST` | `/chat` | `content_id`, question | Transcript-grounded answer and retrieved context |
| `POST` | `/quiz` | `content_id`, optional question count (3–10) | Quiz ID and MCQs; answers remain server-side |
| `POST` | `/evaluate` | Quiz ID and selected answers | Accuracy, concept-wise results, weak areas, and suggestions |

### Create a YouTube transcript

```json
POST /transcript
{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en",
  "translate_to_english": true
}
```

### Create an uploaded-media transcript

```powershell
curl.exe -X POST http://localhost:8000/transcript `
  -F "file=@lecture.mp4" `
  -F "language=en-US" `
  -F "translate_to_english=true"
```

Use the returned `content_id` in later calls:

```json
POST /chat
{
  "content_id": "CONTENT_ID",
  "question": "What are the key ideas explained in the lecture?"
}
```

```json
POST /evaluate
{
  "quiz_id": "QUIZ_ID",
  "answers": [
    {"question_id": "q1", "answer": "Option text selected by the learner"}
  ]
}
```

## Future Scope

Future work may add authentication, user accounts, subscriptions, Razorpay payments, per-plan upload limits, durable processing queues, and expanded language/model support.
