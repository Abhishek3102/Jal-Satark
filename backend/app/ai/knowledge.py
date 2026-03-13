from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class KnowledgeDoc:
    doc_id: str
    title: str
    text: str
    tags: list[str]


def load_knowledge_docs(knowledge_dir: str, tags: list[str] | None = None) -> list[KnowledgeDoc]:
    tags = tags or []
    docs: list[KnowledgeDoc] = []
    if not os.path.isdir(knowledge_dir):
        return docs

    for name in sorted(os.listdir(knowledge_dir)):
        if not name.lower().endswith(".md"):
            continue
        path = os.path.join(knowledge_dir, name)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        docs.append(
            KnowledgeDoc(
                doc_id=name,
                title=name.replace("_", " ").replace(".md", "").strip(),
                text=text,
                tags=tags,
            )
        )
    return docs


def chunk_text(text: str, chunk_size: int = 900, overlap: int = 150) -> list[str]:
    text = (text or "").strip()
    if not text:
        return []
    chunks: list[str] = []
    i = 0
    while i < len(text):
        j = min(len(text), i + chunk_size)
        chunk = text[i:j].strip()
        if chunk:
            chunks.append(chunk)
        if j >= len(text):
            break
        i = max(0, j - overlap)
    return chunks

