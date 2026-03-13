from __future__ import annotations

import os
from dataclasses import dataclass

import chromadb
from chromadb.config import Settings


@dataclass(frozen=True)
class RetrievedChunk:
    source_id: str
    title: str
    text: str
    score: float


class ChromaVectorStore:
    def __init__(self, persist_dir: str, collection_name: str):
        os.makedirs(persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )
        self.col = self.client.get_or_create_collection(name=collection_name)

    def upsert_texts(
        self,
        *,
        ids: list[str],
        texts: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        self.col.upsert(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    def query(self, *, embedding: list[float], top_k: int) -> list[RetrievedChunk]:
        res = self.col.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances", "ids"],
        )

        out: list[RetrievedChunk] = []
        ids = res.get("ids", [[]])[0]
        docs = res.get("documents", [[]])[0]
        metas = res.get("metadatas", [[]])[0]
        dists = res.get("distances", [[]])[0]

        for i in range(len(ids)):
            meta = metas[i] or {}
            # Chroma returns smaller distance for more similar (depending on metric). Convert to pseudo-score.
            dist = float(dists[i]) if dists and dists[i] is not None else 0.0
            score = 1.0 / (1.0 + dist)
            out.append(
                RetrievedChunk(
                    source_id=str(ids[i]),
                    title=str(meta.get("title", "Knowledge Base")),
                    text=str(docs[i]),
                    score=score,
                )
            )
        return out

