from __future__ import annotations

from pydantic import BaseModel, Field


class Citation(BaseModel):
    source_id: str
    title: str
    snippet: str
    score: float = Field(ge=0.0)


class Artifact(BaseModel):
    type: str  # "chart" | "diagram" | "table" | "plan"
    renderer: str  # "vega-lite" | "mermaid" | "table" | "markdown"
    title: str | None = None
    spec: dict | str


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str
    context: dict | None = None
    mode: str | None = None  # "qa" | "plan" | "visualize"


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    citations: list[Citation] = Field(default_factory=list)
    artifacts: list[Artifact] = Field(default_factory=list)
    profile: dict | None = None


class IngestRequest(BaseModel):
    # For MVP we ingest server-side known files (docs folder)
    path: str = "app_knowledge"
    tags: list[str] = Field(default_factory=list)


class IngestResponse(BaseModel):
    ingested_sources: int
    ingested_chunks: int

