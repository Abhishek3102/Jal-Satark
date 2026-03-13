from __future__ import annotations

import os
import uuid

from .config import load_ai_config
from .gemini_client import GeminiClient
from .knowledge import chunk_text, load_knowledge_docs
from .roles import ROLE_PACK, pick_roles
from .schemas import Artifact, Citation
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
            "- If user asks for charts/diagrams, output a JSON artifact spec after the answer.\n"
            "- Keep answers structured: Situation, Assessment, Recommendations, Next steps.\n"
        )

        prompt = (
            f"{sys_rules}\n"
            f"Active roles:\n{role_brief}\n\n"
            f"User context (JSON): {context}\n\n"
            f"Retrieved knowledge:\n---\n" + "\n\n---\n".join(context_blocks) + "\n---\n\n"
            f"User question: {message}\n\n"
            "Return:\n"
            "1) A professional answer in markdown.\n"
            "2) If visualization is needed, include a final section `ARTIFACTS_JSON` containing a JSON array.\n"
            "   Each artifact must be {type, renderer, title, spec}.\n"
        )

        text = self.gemini.generate(prompt)

        artifacts: list[Artifact] = []
        # MVP: do not parse artifacts automatically yet (frontend can ignore). We keep hook for later.
        profile = {"roles": roles, "mode": mode}
        return text, citations, artifacts, profile


def new_session_id() -> str:
    return str(uuid.uuid4())

