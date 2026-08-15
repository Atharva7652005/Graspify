"""Small in-memory store for the MVP learning workflow.

Replace this with PostgreSQL/pgvector before running multiple API instances.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from threading import Lock
from uuid import uuid4


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


@dataclass
class LearningStore:
    _content: dict[str, ContentRecord] = field(default_factory=dict)
    _quizzes: dict[str, QuizRecord] = field(default_factory=dict)
    _lock: Lock = field(default_factory=Lock)

    def add_content(self, record: ContentRecord) -> str:
        content_id = str(uuid4())
        with self._lock:
            self._content[content_id] = record
        return content_id

    def get_content(self, content_id: str) -> ContentRecord | None:
        with self._lock:
            return self._content.get(content_id)

    def add_quiz(self, content_id: str, questions: list[dict]) -> str:
        quiz_id = str(uuid4())
        with self._lock:
            self._quizzes[quiz_id] = QuizRecord(content_id=content_id, questions=questions)
        return quiz_id

    def get_quiz(self, quiz_id: str) -> QuizRecord | None:
        with self._lock:
            return self._quizzes.get(quiz_id)
