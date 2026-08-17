# Graspify

Graspify is an AI-powered educational content understanding and learner-analytics framework. It transforms multilingual educational audio or video into structured learning material, grounded question answering, automatically generated assessments, and concept-level grasping estimates.

## Overview

Graspify is designed for educational recordings of up to approximately 30 minutes. It extracts educationally meaningful content and supports learners through chat, quizzes, and revision recommendations. 

The learner analysis provides an **estimated grasping level based on observable assessment and interaction performance**. It is not a measurement of a learner's cognitive ability.

### Core Capabilities

- **Intelligent Media Processing**: Upload audio/video files or supply YouTube URLs.
- **Automatic Language Detection (ALD)**: Automatically identifies the spoken language of the content and preserves the original transcript.
- **On-Demand Translation**: Translates non-English transcripts to English with a single click, intelligently skipping the process if the content is already in English.
- **Learning Material Generation**: Produces concise summaries, structured study notes, flashcards, key concepts, and definitions.
- **Interactive Chat**: Answer questions using retrieval-augmented generation (RAG) grounded directly in the uploaded content.
- **Quizzes & Assessments**: Generates grounded multiple-choice quizzes to test knowledge retention.
- **Grasping Estimates**: Evaluates quiz performance, highlights weak concepts, and recommends specific topics for revision.

## Technology Stack

The project operates on a robust three-tier architecture:

| Area | Technology |
| --- | --- |
| Frontend | React + Vite, Global Dark/Light Theme |
| Primary Backend | Node.js + Express (JWT Authentication) |
| Database | MongoDB |
| AI Processing Service | Python + FastAPI |
| Speech-to-text / ALD | AssemblyAI Universal transcription model |
| Translation, summaries, chat, quizzes | Google Gemini 3.6 Flash (via LangChain) |
| Embeddings & Vector Storage | Google Generative AI Embeddings + FAISS (In-Memory MVP) |

## Repository Structure

```text
Graspify/
|-- backend/                       # FastAPI AI Processing Application
|   |-- main.py                    # FastAPI entry point
|   |-- model_pipeline.py          # AI integration, RAG, and learning-generation service
|   |-- speech_to_text.py          # AssemblyAI audio/video transcription service
|   |-- content_store.py           # In-memory FAISS store bridge
|   `-- requirements.txt           # Python dependencies
|-- express-backend/               # Node.js/Express API Gateway
|   |-- controllers/               # Route logic (Auth, User, Learning)
|   |-- models/                    # MongoDB schemas (User, LearningContent)
|   |-- routes/                    # Express routing definitions
|   `-- package.json               # Node dependencies
|-- frontend/                      # React/Vite client
|   |-- src/                       # Components, Pages, and Global CSS
|   `-- package.json
`-- README.md
```

## Setup & Installation

### Prerequisites

- Python 3.10 or later
- Node.js 18 or later
- MongoDB instance (local or Atlas cluster)
- A configured `GEMINI_API_KEY` for LLM capabilities
- A configured `ASSEMBLYAI_API_KEY` for media transcription

### 1. Python AI Backend (FastAPI)

From the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` and add the provider keys:

```env
GEMINI_API_KEY=your_gemini_key_here
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
GEMINI_MODEL=gemini-3.6-flash
```

Start the development server:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Express API Gateway

Open a new terminal window:

```powershell
cd express-backend
npm install
```

Create `express-backend/.env`:

```env
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017/graspify
JWT_SECRET=your_jwt_secret_here
FASTAPI_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
```

Start the Express server:

```powershell
npm run dev
```

### 3. React Frontend

Open a third terminal window:

```powershell
cd frontend
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Processing Pipeline

```text
Audio/Video Upload OR YouTube Link
        |
Express API Gateway (Auth & MongoDB creation)
        |
FastAPI AI Service (Payload Validation)
        |
AssemblyAI / YouTube Transcript API (Automatic Language Detection)
        |
Original Transcript + Language Tag
        |
Gemini LLM (Optional English Translation)
        |
Gemini LLM (Summary, Notes, Flashcards, Quizzes)
        |
FAISS In-Memory Vectorization (RAG Chat capability)
        |
Results saved to MongoDB & returned to User Interface
```

## Known Issues

- The current vector storage (FAISS) operates in-memory. If the Python FastAPI server restarts, RAG chat context for previously uploaded documents is lost (though the transcripts and generated materials persist in MongoDB).
- YouTube videos with transcripts completely disabled (no auto-generated or manual captions available) cannot currently be processed.

## Future Improvements / Pending Tasks

- **Vector Storage**: Migrate the in-memory LangChain FAISS index to a persistent PostgreSQL + `pgvector` database to ensure chat context survives server restarts.
- **Analysis Page**: Develop a dedicated analytics dashboard to provide a holistic view of a user's combined quiz performance and grasping trajectory over time.
- **Chatbot Feedback System**: Introduce a thumbs up/down interaction mechanism on RAG chat responses to fine-tune prompts and improve answer quality.
- **Subscriptions & Rewards**: Implement the "Graspify Pro" subscription tier and a "Learning Rewards" gamification system.
