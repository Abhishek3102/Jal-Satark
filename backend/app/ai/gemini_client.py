from __future__ import annotations

from typing import Any, Callable

from google import genai
from google.genai import types

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

    def generate_with_tools(
        self,
        *,
        prompt: str,
        tool_decls: list[dict],
        tool_executor: Callable[[str, dict[str, Any]], dict[str, Any]],
        max_steps: int = 4,
    ) -> tuple[str, list[dict]]:
        """
        Run a small tool loop using Gemini function calling.
        Returns final text and list of tool events.
        """
        tools = [types.Tool(function_declarations=tool_decls)]
        config = types.GenerateContentConfig(tools=tools)

        contents: list[Any] = [prompt]
        events: list[dict] = []

        for _ in range(max_steps):
            res = self.client.models.generate_content(
                model=self.cfg.gemini_chat_model,
                contents=contents,
                config=config,
            )

            # If model returned plain text and no function call, we are done
            text = getattr(res, "text", None)

            fn_calls: list[Any] = []
            try:
                parts = res.candidates[0].content.parts
                for p in parts:
                    if hasattr(p, "function_call") and p.function_call is not None:
                        fn_calls.append(p.function_call)
            except Exception:
                fn_calls = []

            if not fn_calls:
                return (text if text is not None else self.generate(prompt)), events

            # Execute each tool call and append results
            for fc in fn_calls:
                name = getattr(fc, "name", None) or fc.get("name")
                args = getattr(fc, "args", None) or fc.get("args") or {}
                if not isinstance(args, dict):
                    args = {}

                tool_result = tool_executor(str(name), args)
                events.append({"tool": str(name), "args": args, "result": tool_result})

                contents.append(
                    types.Content(
                        role="tool",
                        parts=[
                            types.Part(
                                function_response=types.FunctionResponse(
                                    name=str(name),
                                    response=tool_result,
                                )
                            )
                        ],
                    )
                )

        # If we hit max steps, ask for final response
        res = self.client.models.generate_content(
            model=self.cfg.gemini_chat_model,
            contents=contents + ["Provide the final answer now."],
            config=config,
        )
        return (getattr(res, "text", None) or ""), events

