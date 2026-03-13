from __future__ import annotations

from google import genai

from .config import AIConfig


class GeminiClient:
    def __init__(self, cfg: AIConfig):
        self.cfg = cfg
        self.client = genai.Client(api_key=cfg.gemini_api_key)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        # Keep it simple for MVP: one-by-one (can batch later)
        vectors: list[list[float]] = []
        for t in texts:
            res = self.client.models.embed_content(
                model=self.cfg.gemini_embed_model,
                contents=t,
            )
            # python-genai returns embeddings list; normalize to first embedding vector
            emb = res.embeddings[0].values if hasattr(res.embeddings[0], "values") else res.embeddings[0]
            vectors.append(list(emb))
        return vectors

    def generate(self, prompt: str) -> str:
        res = self.client.models.generate_content(
            model=self.cfg.gemini_chat_model,
            contents=prompt,
        )
        # Try common shapes
        if hasattr(res, "text") and res.text:
            return res.text
        try:
            return "".join([p.text for p in res.candidates[0].content.parts if hasattr(p, "text")])
        except Exception:
            return str(res)

