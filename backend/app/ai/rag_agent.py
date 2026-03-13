from __future__ import annotations

import json
import os
import uuid

from .config import load_ai_config
from .gemini_client import GeminiClient
from .knowledge import chunk_text, load_knowledge_docs
from .roles import ROLE_PACK, pick_roles
from .schemas import Artifact, Citation
from .tools import execute_tool, tool_declarations
from .vector_store import ChromaVectorStore


def _kb_dir() -> str:
    # backend/app/ai -> backend/app/knowledge
    here = os.path.dirname(__file__)
    return os.path.abspath(os.path.join(here, "..", "knowledge"))


def _chroma_dir() -> str:
    here = os.path.dirname(__file__)
    return os.path.abspath(os.path.join(here, "..", "..", "..", ".chroma"))


class RAGAgent:
    def __init__(self):
        self.cfg = load_ai_config()
        self.gemini = GeminiClient(self.cfg)
        self.store = ChromaVectorStore(persist_dir=_chroma_dir(), collection_name=self.cfg.rag_collection)

    def ingest_local_knowledge(self) -> tuple[int, int]:
        docs = load_knowledge_docs(_kb_dir(), tags=["jalsatark"])
        ingested_sources = 0
        ingested_chunks = 0

        ids: list[str] = []
        texts: list[str] = []
        metas: list[dict] = []

        for d in docs:
            ingested_sources += 1
            chunks = chunk_text(d.text)
            for idx, ch in enumerate(chunks):
                chunk_id = f"{d.doc_id}::chunk::{idx}"
                ids.append(chunk_id)
                texts.append(ch)
                metas.append({"title": d.title, "doc_id": d.doc_id, "chunk_index": idx, "tags": d.tags})
            ingested_chunks += len(chunks)

        if texts:
            embs = self.gemini.embed_texts(texts)
            self.store.upsert_texts(ids=ids, texts=texts, embeddings=embs, metadatas=metas)

        return ingested_sources, ingested_chunks

    def chat(
        self,
        *,
        message: str,
        mode: str | None = None,
        context: dict | None = None,
    ) -> tuple[str, list[Citation], list[Artifact], dict]:
        context = context or {}
        roles = pick_roles(message, mode)

        q_emb = self.gemini.embed_texts([message])[0]
        retrieved = self.store.query(embedding=q_emb, top_k=self.cfg.rag_top_k)

        citations: list[Citation] = []
        context_blocks: list[str] = []
        for r in retrieved[: self.cfg.rag_top_k]:
            snippet = (r.text[:400] + "...") if len(r.text) > 400 else r.text
            citations.append(Citation(source_id=r.source_id, title=r.title, snippet=snippet, score=r.score))
            context_blocks.append(f"[{r.title} | {r.source_id}]\n{r.text}")

        role_brief = "\n".join(
            [
                f"- {ROLE_PACK[r]['name']}: {ROLE_PACK[r]['style']} Focus: {', '.join(ROLE_PACK[r]['focus'])}"
                for r in roles
                if r in ROLE_PACK
            ]
        )

        sys_rules = (
            "You are Jal-Satark's professional multi-disciplinary advisory agent.\n"
            "Rules:\n"
            "- Use ONLY the provided context as ground truth; if not present, state assumptions clearly.\n"
            "- Be concrete and operational: who/what/when.\n"
            "- Prefer calling tools when you need data (wards/hotspots) or when generating charts/diagrams.\n"
            "- Do NOT hand-write chart/diagram JSON unless the tool is unavailable.\n"
            "- Keep answers structured: Situation, Assessment, Recommendations, Next steps.\n"
        )

        prompt = (
            f"{sys_rules}\n"
            f"Active roles:\n{role_brief}\n\n"
            f"User context (JSON): {context}\n\n"
            f"Retrieved knowledge:\n---\n" + "\n\n---\n".join(context_blocks) + "\n---\n\n"
            f"User question: {message}\n\n"
            "Return a professional answer in markdown.\n"
            "If you need visuals, CALL tools `make_chart` and/or `make_diagram`.\n"
        )

        text, tool_events = self.gemini.generate_with_tools(
            prompt=prompt,
            tool_decls=tool_declarations(),
            tool_executor=execute_tool,
            max_steps=4,
        )

        artifacts = _artifacts_from_events(tool_events)
        profile = {"roles": roles, "mode": mode}
        return text, citations, artifacts, profile


def new_session_id() -> str:
    return str(uuid.uuid4())


def _extract_artifacts(text: str) -> tuple[str, list[Artifact]]:
    """
    Extract artifacts from a model response using sentinel markers:
      ARTIFACTS_JSON
      <json>
      END_ARTIFACTS_JSON
    """
    if not text:
        return "", []

    start_marker = "ARTIFACTS_JSON"
    end_marker = "END_ARTIFACTS_JSON"

    start = text.find(start_marker)
    if start == -1:
        return text, []

    end = text.find(end_marker, start)
    if end == -1:
        # If malformed, don't break answer
        return text, []

    json_block = text[start + len(start_marker) : end].strip()
    # Remove optional code fences
    if json_block.startswith("```"):
        json_block = json_block.strip("`").strip()
        # If "json" language tag exists, drop first line
        lines = json_block.splitlines()
        if lines and lines[0].strip().lower() in {"json", "javascript"}:
            json_block = "\n".join(lines[1:]).strip()

    artifacts: list[Artifact] = []
    try:
        parsed = json.loads(json_block)
        if isinstance(parsed, list):
            for a in parsed:
                if not isinstance(a, dict):
                    continue
                if "type" not in a or "renderer" not in a or "spec" not in a:
                    continue
                artifacts.append(
                    Artifact(
                        type=str(a.get("type")),
                        renderer=str(a.get("renderer")),
                        title=a.get("title"),
                        spec=a.get("spec"),
                    )
                )
    except Exception:
        artifacts = []

    cleaned = (text[:start].rstrip() + "\n").strip()
    return cleaned, artifacts


def _artifacts_from_events(events: list[dict]) -> list[Artifact]:
    out: list[Artifact] = []
    seen: set[str] = set()
    for e in events:
        res = e.get("result")
        if isinstance(res, dict) and isinstance(res.get("artifact"), dict):
            a = res["artifact"]
            try:
                key = json.dumps(
                    {"type": a.get("type"), "renderer": a.get("renderer"), "title": a.get("title"), "spec": a.get("spec")},
                    sort_keys=True,
                    ensure_ascii=False,
                    default=str,
                )
                if key in seen:
                    continue
                seen.add(key)
                out.append(
                    Artifact(
                        type=str(a.get("type")),
                        renderer=str(a.get("renderer")),
                        title=a.get("title"),
                        spec=a.get("spec"),
                    )
                )
            except Exception:
                continue
    return out
