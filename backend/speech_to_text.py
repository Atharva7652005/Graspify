"""AssemblyAI-based speech-to-text service for uploaded audio and video."""

from __future__ import annotations

from os import getenv
from pathlib import Path
from time import monotonic, sleep

import httpx
from dotenv import load_dotenv

load_dotenv()


class MediaTranscriptionError(RuntimeError):
    """Raised when AssemblyAI cannot transcribe uploaded media."""


ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com"
POLL_INTERVAL_SECONDS = 3
MAX_POLL_SECONDS = 1800


def _api_key() -> str:
    """Read the standard AssemblyAI key name and a backwards-compatible fallback."""
    key = getenv("ASSEMBLYAI_API_KEY") or getenv("ASSEMBLY_API_KEY")
    if not key:
        raise MediaTranscriptionError("ASSEMBLYAI_API_KEY is not configured on the server.")
    return key


def _provider_error(response: httpx.Response, action: str) -> MediaTranscriptionError:
    try:
        message = response.json().get("error") or response.text
    except ValueError:
        message = response.text
    return MediaTranscriptionError(f"AssemblyAI could not {action} (HTTP {response.status_code}): {message}")


def transcribe_media(media_path: str | Path, language: str = "en-US", max_duration_seconds: int = 1800) -> str:
    """Upload media to AssemblyAI, submit transcription, and wait for its result.

    AssemblyAI decodes uploaded media on its servers, so the backend does not use
    FFmpeg, Pydub, or local audio chunking. The caller must enforce the MVP's
    duration limit before upload because media duration is not decoded locally.
    """
    path = Path(media_path)
    if not path.is_file():
        raise MediaTranscriptionError("The uploaded media file could not be found.")

    headers = {"Authorization": _api_key()}
    language_code = language.strip().replace("-", "_").lower()
    try:
        with httpx.Client(timeout=httpx.Timeout(120.0, connect=30.0)) as client:
            with path.open("rb") as media_file:
                upload_response = client.post(
                    f"{ASSEMBLYAI_BASE_URL}/v2/upload",
                    headers={**headers, "Content-Type": "application/octet-stream"},
                    content=media_file,
                )
            if upload_response.is_error:
                raise _provider_error(upload_response, "upload the media")
            upload_url = upload_response.json().get("upload_url")
            if not upload_url:
                raise MediaTranscriptionError("AssemblyAI did not return an upload URL.")

            transcript_response = client.post(
                f"{ASSEMBLYAI_BASE_URL}/v2/transcript",
                headers=headers,
                json={
                    "audio_url": upload_url,
                    "speech_models": ["universal-3-5-pro", "universal-2"],
                    "language_code": language_code,
                },
            )
            if transcript_response.is_error:
                raise _provider_error(transcript_response, "start transcription")
            transcript_id = transcript_response.json().get("id")
            if not transcript_id:
                raise MediaTranscriptionError("AssemblyAI did not return a transcript job ID.")

            deadline = monotonic() + MAX_POLL_SECONDS
            while monotonic() < deadline:
                result_response = client.get(f"{ASSEMBLYAI_BASE_URL}/v2/transcript/{transcript_id}", headers=headers)
                if result_response.is_error:
                    raise _provider_error(result_response, "retrieve transcription")
                result = result_response.json()
                if result.get("status") == "completed":
                    transcript = (result.get("text") or "").strip()
                    if transcript:
                        return transcript
                    raise MediaTranscriptionError("AssemblyAI completed the job but returned no transcript text.")
                if result.get("status") == "error":
                    raise MediaTranscriptionError(f"AssemblyAI transcription failed: {result.get('error', 'unknown error')}")
                sleep(POLL_INTERVAL_SECONDS)
    except httpx.HTTPError as exc:
        raise MediaTranscriptionError("The AssemblyAI service could not be reached.") from exc

    raise MediaTranscriptionError("AssemblyAI transcription timed out. Try a shorter upload.")
