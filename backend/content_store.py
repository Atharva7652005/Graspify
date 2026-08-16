"""MongoDB store for the learning workflow."""

from __future__ import annotations

from dataclasses import dataclass, field
from uuid import uuid4
from pymongo import MongoClient

try:
    client = MongoClient("mongodb://127.0.0.1:27017/")
    db = client["graspify"]
    content_collection = db["fastapi_content"]
    quizzes_collection = db["fastapi_quizzes"]
except Exception as e:
    print(f"Warning: Could not connect to MongoDB: {e}")

@dataclass
class ContentRecord:
    transcript: str
    source_type: str
    translation: str | None = None
    summary: str | None = None

@dataclass
class QuizRecord:
    content_id: str
    questions: list[dict]

class LearningStore:
    def add_content(self, record: ContentRecord) -> str:
        content_id = str(uuid4())
        doc = {
            "_id": content_id,
            "transcript": record.transcript,
            "source_type": record.source_type,
            "translation": record.translation,
            "summary": record.summary
        }
        content_collection.insert_one(doc)
        return content_id

    def get_content(self, content_id: str) -> ContentRecord | None:
        doc = content_collection.find_one({"_id": content_id})
        if doc:
            return ContentRecord(
                transcript=doc.get("transcript", ""),
                source_type=doc.get("source_type", ""),
                translation=doc.get("translation"),
                summary=doc.get("summary")
            )
        return None

    def update_content(self, content_id: str, record: ContentRecord):
        content_collection.update_one(
            {"_id": content_id},
            {"$set": {
                "transcript": record.transcript,
                "source_type": record.source_type,
                "translation": record.translation,
                "summary": record.summary
            }}
        )

    def add_quiz(self, content_id: str, questions: list[dict]) -> str:
        quiz_id = str(uuid4())
        doc = {"_id": quiz_id, "content_id": content_id, "questions": questions}
        quizzes_collection.insert_one(doc)
        return quiz_id

    def get_quiz(self, quiz_id: str) -> QuizRecord | None:
        doc = quizzes_collection.find_one({"_id": quiz_id})
        if doc:
            return QuizRecord(
                content_id=doc.get("content_id", ""),
                questions=doc.get("questions", [])
            )
        return None
