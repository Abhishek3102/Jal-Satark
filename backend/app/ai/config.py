import os
from dataclasses import dataclass


@dataclass(frozen=True)
class AIConfig:
    gemini_api_key: str
    gemini_chat_model: str
    gemini_embed_model: str
    rag_top_k: int
    rag_collection: str


def _get_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def load_ai_config() -> AIConfig:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY in environment")

    return AIConfig(
        gemini_api_key=api_key,
        gemini_chat_model=os.getenv("GEMINI_CHAT_MODEL", "gemini-2.5-flash").strip(),
        gemini_embed_model=os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001").strip(),
        rag_top_k=_get_int("RAG_TOP_K", 8),
        rag_collection=os.getenv("RAG_COLLECTION", "jalsatark_knowledge").strip(),
    )

