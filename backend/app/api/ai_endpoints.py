from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..ai.rag_agent import RAGAgent, new_session_id
from ..ai.schemas import ChatRequest, ChatResponse, IngestRequest, IngestResponse


router = APIRouter()

_agent: RAGAgent | None = None


def get_agent() -> RAGAgent:
    global _agent
    if _agent is None:
        _agent = RAGAgent()
    return _agent


@router.post("/ai/ingest", response_model=IngestResponse)
def ingest(_: IngestRequest):
    try:
        sources, chunks = get_agent().ingest_local_knowledge()
        return IngestResponse(ingested_sources=sources, ingested_chunks=chunks)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    session_id = req.session_id or new_session_id()
    try:
        answer, citations, artifacts, profile = get_agent().chat(
            message=req.message,
            mode=req.mode,
            context=req.context,
        )
        return ChatResponse(
            session_id=session_id,
            answer=answer,
            citations=citations,
            artifacts=artifacts,
            profile=profile,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

