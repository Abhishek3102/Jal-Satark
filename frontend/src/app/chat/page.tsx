"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader2, Bot, User, Link2, BarChart3, GitBranch } from "lucide-react";
import mermaid from "mermaid";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

type Citation = {
  source_id: string;
  title: string;
  snippet: string;
  score: number;
};

type Artifact = {
  type: string;
  renderer: string;
  title?: string | null;
  spec: unknown;
};

type ChatResponse = {
  session_id: string;
  answer: string;
  citations: Citation[];
  artifacts: Artifact[];
  profile?: Record<string, unknown> | null;
};

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  artifacts?: Artifact[];
};

function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8001";
  return base.replace(/\/+$/, "");
}

function simpleMarkdownToHtml(md: string): string {
  // Minimal renderer for MVP (no dependency). We can upgrade to react-markdown later.
  const esc = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return esc
    .replace(/^### (.*)$/gm, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2 class='text-xl font-semibold mt-5 mb-2'>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1 class='text-2xl font-semibold mt-6 mb-3'>$1</h1>")
    .replace(/^\- (.*)$/gm, "<li class='ml-5 list-disc'>$1</li>")
    .replace(/\n{2,}/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<"qa" | "plan" | "visualize">("qa");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask me anything about Jal-Satark — micro-hotspots, readiness scores, drainage sensing, IoT/CV fusion, or request a ward action plan.\n\nTip: Switch mode to **Plan** for incident/action plans.",
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);
  const mermaidInitialized = useRef(false);

  const apiBase = useMemo(() => getApiBase(), []);

  useEffect(() => {
    if (mermaidInitialized.current) return;
    mermaidInitialized.current = true;
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "strict",
    });
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setLoading(true);
    setInput("");

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch(`${apiBase}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: text,
          mode,
          context: {},
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Request failed (${res.status})`);
      }

      const data = (await res.json()) as ChatResponse;
      if (!sessionId) setSessionId(data.session_id);

      const assistantMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        citations: data.citations || [],
        artifacts: data.artifacts || [],
      };
      setMessages((m) => [...m, assistantMsg]);

      queueMicrotask(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 pt-24">
      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Chat */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="flex flex-col">
                  <div className="font-outfit font-semibold text-white/90 leading-tight">
                    Jal-Satark AI (RAG)
                  </div>
                  <div className="text-xs text-slate-400">
                    Backend:{" "}
                    <span className="font-mono text-slate-300">
                      {apiBase.replace("http://", "").replace("https://", "")}
                    </span>
                    {sessionId ? (
                      <>
                        {" "}
                        · Session{" "}
                        <span className="font-mono text-slate-300">{sessionId.slice(0, 8)}…</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(["qa", "plan", "visualize"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      mode === m
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {m === "qa" ? "Ask" : m === "plan" ? "Plan" : "Visualize"}
                  </button>
                ))}
              </div>
            </div>

            <div ref={listRef} className="h-[65vh] overflow-y-auto px-5 py-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" ? (
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-slate-200" />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[850px] rounded-3xl px-5 py-4 border ${
                      msg.role === "user"
                        ? "bg-cyan-500/10 border-cyan-500/20"
                        : "bg-white/[0.03] border-white/10"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div
                        className="prose prose-invert prose-p:leading-relaxed max-w-none text-slate-100"
                        dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(msg.content) }}
                      />
                    ) : (
                      <div className="text-slate-100 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    )}

                    {msg.role === "assistant" && msg.artifacts && msg.artifacts.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                        {msg.artifacts.map((a, idx) => (
                          <ArtifactCard key={`${msg.id}-a-${idx}`} artifact={a} />
                        ))}
                      </div>
                    ) : null}

                    {msg.role === "assistant" && msg.citations && msg.citations.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-slate-400 flex items-center gap-2 mb-2">
                          <Link2 className="w-4 h-4" /> Sources
                        </div>
                        <div className="space-y-2">
                          {msg.citations.slice(0, 6).map((c) => (
                            <div
                              key={c.source_id}
                              className="rounded-2xl bg-black/20 border border-white/10 px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-sm font-semibold text-slate-200">{c.title}</div>
                                <div className="text-xs font-mono text-slate-400">
                                  {Math.round(c.score * 100)}%
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 mt-1 line-clamp-3">
                                {c.snippet}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {msg.role === "user" ? (
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-200" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-white/10">
              {error ? (
                <div className="mb-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 text-sm">
                  {error}
                </div>
              ) : null}

              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Ask about micro-hotspots, readiness, IoT/CV sensing… (Enter to send, Shift+Enter newline)"
                  className="flex-1 min-h-[52px] max-h-40 resize-y rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500/40"
                />

                <button
                  onClick={() => void send()}
                  disabled={loading || !input.trim()}
                  className="h-[52px] px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 transition flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Send
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Set{" "}
                <span className="font-mono text-slate-300">NEXT_PUBLIC_BACKEND_URL</span> in your frontend env if your
                backend isn’t on <span className="font-mono text-slate-300">127.0.0.1:8001</span>.
              </div>
            </div>
          </div>

          {/* Right: Quick prompts */}
          <div className="w-full lg:w-[380px] rounded-3xl border border-white/10 bg-white/[0.02] p-5 h-fit">
            <div className="text-white font-outfit font-semibold mb-3">Quick prompts</div>
            <div className="space-y-3">
              {[
                {
                  title: "Ward action plan (monsoon-ready)",
                  prompt: "Create a 7-day pre-monsoon action plan for high-risk wards using the readiness score concept.",
                },
                {
                  title: "Explain micro-hotspots",
                  prompt: "Explain why city-wide alerts fail and how 2,500+ micro-hotspots improve response.",
                },
                {
                  title: "Drainage sensing strategy",
                  prompt: "Propose an IoT + CV strategy to detect drainage blockages and adjust flood risk in real time.",
                },
                {
                  title: "Model assumptions",
                  prompt: "List key assumptions of a hybrid AI-physics flood model and how to validate them in Mumbai.",
                },
              ].map((p) => (
                <button
                  key={p.title}
                  onClick={() => setInput(p.prompt)}
                  className="w-full text-left rounded-2xl border border-white/10 bg-black/20 hover:bg-white/[0.04] transition px-4 py-3"
                >
                  <div className="text-sm font-semibold text-slate-200">{p.title}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">{p.prompt}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="text-xs text-slate-400">Modes</div>
              <ul className="mt-2 text-sm text-slate-200 space-y-1">
                <li>
                  <span className="font-semibold">Ask</span>: domain Q&A with citations
                </li>
                <li>
                  <span className="font-semibold">Plan</span>: action plans, incident workflows, roadmaps
                </li>
                <li>
                  <span className="font-semibold">Visualize</span>: returns chart/diagram specs (coming next)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const title =
    artifact.title || (artifact.type === "diagram" ? "Diagram" : artifact.type === "chart" ? "Chart" : "Artifact");

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        <div className="text-xs font-mono text-slate-500">
          {artifact.type}/{artifact.renderer}
        </div>
      </div>
      <div className="p-4">
        {artifact.renderer === "mermaid" && typeof artifact.spec === "string" ? (
          <MermaidBlock code={artifact.spec} />
        ) : artifact.renderer === "recharts" && typeof artifact.spec === "object" && artifact.spec !== null ? (
          <RechartsBlock spec={artifact.spec as RechartsSpec} />
        ) : (
          <pre className="text-xs text-slate-300 whitespace-pre-wrap break-words">
            {JSON.stringify(artifact.spec, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setErr(null);
      try {
        const id = `m-${crypto.randomUUID()}`;
        const out = await mermaid.render(id, code);
        if (cancelled) return;
        if (ref.current) ref.current.innerHTML = out.svg;
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to render diagram");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (err) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
        {err}
        <pre className="mt-2 text-xs text-red-200/80 whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }
  return <div ref={ref} className="w-full overflow-x-auto" />;
}

type RechartsSpec = {
  chartType: "line" | "bar" | "area";
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey?: string;
  series?: Array<{ key: string; name?: string; color?: string }>;
};

function RechartsBlock({ spec }: { spec: RechartsSpec }) {
  const chartType = spec.chartType || "line";
  const data = Array.isArray(spec.data) ? spec.data : [];
  const xKey = spec.xKey;

  const series =
    spec.series && spec.series.length > 0
      ? spec.series
      : spec.yKey
        ? [{ key: spec.yKey, name: spec.yKey, color: "#22d3ee" }]
        : [];

  if (!xKey || data.length === 0 || series.length === 0) {
    return (
      <div className="text-sm text-slate-300">
        Invalid chart spec. Expecting: <span className="font-mono">chartType, data[], xKey, yKey/series</span>
      </div>
    );
  }

  const common = (
    <>
      <CartesianGrid stroke="rgba(255,255,255,0.08)" />
      <XAxis dataKey={xKey} stroke="rgba(226,232,240,0.7)" fontSize={12} />
      <YAxis stroke="rgba(226,232,240,0.7)" fontSize={12} />
      <Tooltip
        contentStyle={{
          background: "rgba(2,6,23,0.9)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          color: "rgba(226,232,240,0.9)",
        }}
      />
    </>
  );

  return (
    <div className="w-full h-[320px]">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        {chartType === "line" ? <GitBranch className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
        Rendered chart
      </div>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "bar" ? (
          <BarChart data={data}>
            {common}
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.name || s.key} fill={s.color || "#60a5fa"} />
            ))}
          </BarChart>
        ) : chartType === "area" ? (
          <AreaChart data={data}>
            {common}
            {series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                name={s.name || s.key}
                stroke={s.color || "#22d3ee"}
                fill={s.color ? `${s.color}55` : "rgba(34,211,238,0.25)"}
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart data={data}>
            {common}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name || s.key}
                stroke={s.color || "#22d3ee"}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

