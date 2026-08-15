"""Reusable speech-to-text service derived from Speech_to_text.ipynb."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from pydub import AudioSegment
import speech_recognition as sr


class MediaTranscriptionError(RuntimeError):
    """Raised when uploaded media cannot be decoded or transcribed."""


def transcribe_media(media_path: str | Path, language: str = "en-US", max_duration_seconds: int = 1800) -> str:
    """Decode media, split it into 30-second chunks, and transcribe it.

    This is the notebook's Google Web Speech workflow refactored for API use.
    FFmpeg must be available for compressed audio and video formats.
    """
    try:
        audio = AudioSegment.from_file(media_path).set_channels(1).set_frame_rate(16000)
    except Exception as exc:
        raise MediaTranscriptionError("The uploaded file could not be decoded as audio or video.") from exc


    duration_seconds = len(audio) / 1000

    if duration_seconds == 0:
        raise MediaTranscriptionError("The uploaded media contains no audio.")

    if duration_seconds > max_duration_seconds:
        raise MediaTranscriptionError(
            f"The media duration is {duration_seconds:.0f} seconds; the MVP limit is {max_duration_seconds} seconds."
        )

    recognizer = sr.Recognizer()

    transcript_parts: list[str] = []

    for start in range(0, len(audio), 30_000):
        wav_buffer = BytesIO()
        audio[start : start + 30_000].export(wav_buffer, format="wav")
        wav_buffer.seek(0)
        with sr.AudioFile(wav_buffer) as source:
            audio_data = recognizer.record(source)

        try:
            text = recognizer.recognize_google(audio_data, language=language)
        except sr.UnknownValueError:
            continue
        except sr.RequestError as exc:
            raise MediaTranscriptionError("The speech recognition provider could not be reached.") from exc

        if text.strip():
            transcript_parts.append(text.strip())

    transcript = " ".join(transcript_parts)

    if not transcript:
        raise MediaTranscriptionError("Speech could not be recognized in the uploaded media.")

    return transcript
