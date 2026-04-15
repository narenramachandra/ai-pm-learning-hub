import { useState, useEffect, useRef } from "react";

const MODEL = "claude-haiku-4-5-20251001";
const MCP = { type: "url", url: "https://mcp.lennysdata.com/mcp", name: "lennys-data" };
const WEB_SEARCH = { type: "web_search_20250305", name: "web_search" };

const SYS = `You are the AI PM Learning Hub — a research assistant for product managers.

Search BOTH sources for every question:
1. Lenny Rachitsky — use lennys-data MCP tools: search_content(query, content_type?, limit?), read_excerpt(filename, query?). Search with focused 2-4 word queries. Try both "podcast" and "newsletter" content_type if needed.
2. Aakash Gupta / Product Growth — use web_search targeting productgrowth.substack.com

ATTRIBUTION (always use most granular level — never wrong):
• Lenny newsletter → [Lenny Rachitsky]
• Lenny podcast, Lenny speaking → [Lenny Rachitsky, Lenny's Podcast]  
• Lenny podcast, guest speaking → [Guest Name, via Lenny's Podcast]
• Aakash newsletter → [Aakash Gupta, Product Growth]

RESPONSE FORMAT:
Synthesized answer with inline [Attribution] woven naturally. Example:
"[Brian Balfour, via Lenny's Podcast] argues that growth loops compound while funnels don't..."

End with EXACTLY this block:
<<<SOURCES>>>
[{"title":"...","creator":"...","type":"podcast or newsletter","guest":"Name or null","date":"YYYY-MM or null","url":"url or null"}]
<<<END>>>

If a source has no relevant content, say so. Never fabricate attributions or content.`;

const SUGGESTIONS = [
  "What is a North Star metric?",
  "How do top PMs think about activation?",
  "Growth loops vs funnels — what's the difference?",
  "How should I prioritize features?"
];

export default function PMHub() {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    text: "Welcome to your AI PM Learning Hub.\n\nAsk anything about product management — I search Lenny Rachitsky's newsletter and podcast (640+ items via MCP) and Aakash Gupta's Product Growth newsletter simultaneously, attributing insights to the actual speaker.",
    sources: []
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [tab, setTab] = useState("chat");
  const [reviewBanner, setReviewBanner] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { initStorage(); }, []);
  useEffect(() => {
    if (tab === "chat") endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, tab]);

  async function initStorage() {
    try {
      const l = await window.storage.get("pmhub-log");
      const parsed = l ? JSON.parse(l.value) : [];
      setLog(parsed);
      const s = await window.storage.get("pmhub-session");
      if (s && parsed.length >= 3) {
        const days = (Date.now() - Number(s.value)) / 86400000;
        if (days >= 7) setReviewBanner(true);
      }
      await window.storage.set("pmhub-session", String(Date.now()));
    } catch {}
  }

  async function addToLog(q) {
    const entry = { q: q.slice(0, 90), t: Date.now() };
    setLog(prev => {
      const next = [entry, ...prev].slice(0, 50);
      try { window.storage.set("pmhub-log", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  async function ask(question) {
    if (!question?.trim() || loading) return;
    const q = question.trim();
    setInput("");
    if (taRef.current) taRef.current.style.height = "36px";
    setLoading(true);
    setTab("chat");

    const userMsg = { role: "user", text: q };
    const newHistory = [...msgs, userMsg];
    setMsgs(newHistory);
    await addToLog(q);

    try {
      const apiMsgs = newHistory.map(m => ({
        role: m.role,
        content: m.fullContent || m.text
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          system: SYS,
          messages: apiMsgs,
          mcp_servers: [MCP],
          tools: [WEB_SEARCH]
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const raw = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      let text = raw, sources = [];
      const match = raw.match(/<<<SOURCES>>>([\s\S]*?)<<<END>>>/);
      if (match) {
        text = raw.replace(/<<<SOURCES>>>[\s\S]*?<<<END>>>/, "").trim();
        try { sources = JSON.parse(match[1].trim()); } catch {}
      }

      setMsgs(prev => [...prev, { role: "assistant", text, fullContent: raw, sources }]);
    } catch (err) {
      setMsgs(prev => [...prev, {
        role: "assistant",
        text: `Something went wrong: ${err.message}. Please try again.`,
        sources: []
      }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function startReview() {
    setReviewBanner(false);
    const topics = log.slice(0, 6).map(e => e.q).join("; ");
    ask(`Spaced repetition review. Topics I've explored: "${topics}". Ask me ONE thoughtful question on these topics. Wait for my answer before asking the next one.`);
  }

  function Attrib({ text }) {
    return (
      <>
        {text.split(/(\[[^\]]+\])/g).map((p, i) => {
          if (/^\[.+\]$/.test(p)) {
            const isAakash = /aakash/i.test(p);
            return (
              <span key={i} style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.73em",
                padding: "1px 5px",
                borderRadius: "3px",
                background: isAakash ? "rgba(29,158,117,0.12)" : "rgba(200,150,60,0.13)",
                color: isAakash ? "#0f6e56" : "#8a5c10",
                border: `0.5px solid ${isAakash ? "rgba(29,158,117,0.35)" : "rgba(200,150,60,0.4)"}`,
                whiteSpace: "nowrap",
                margin: "0 2px"
              }}>{p}</span>
            );
          }
          return <span key={i}>{p}</span>;
        })}
      </>
    );
  }

  function MsgBody({ text }) {
    return (
      <div style={{ fontSize: "15px", lineHeight: "1.75", color: "var(--color-text-primary)" }}>
        {text.split(/\n\n+/).filter(Boolean).map((para, i) => {
          const lines = para.split("\n");
          const isList = lines.every(l => /^[•\-\*]/.test(l.trim()) || /^\d+\./.test(l.trim()));
          if (isList) {
            return (
              <ul key={i} style={{ margin: "0 0 0.8em", paddingLeft: "1.4em" }}>
                {lines.filter(Boolean).map((l, j) => (
                  <li key={j} style={{ marginBottom: "0.3em" }}>
                    <Attrib text={l.replace(/^[•\-\*\d\.]\s*/, "")} />
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} style={{ margin: "0 0 0.8em" }}>
              <Attrib text={para} />
            </p>
          );
        })}
      </div>
    );
  }

  function SrcCard({ s }) {
    const isLenny = /lenny/i.test(s.creator);
    const typeIcon = s.type === "podcast" ? "🎙" : "📄";
    return (
      <div style={{
        borderRadius: "0 var(--border-radius-md) var(--border-radius-md) 0",
        padding: "7px 10px",
        marginBottom: "6px",
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderLeft: `2px solid ${isLenny ? "#c8963c" : "#1d9e75"}`
      }}>
        <div style={{ fontWeight: 500, fontSize: "12px", color: "var(--color-text-primary)", marginBottom: "2px" }}>
          {typeIcon} {s.title || "(untitled)"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
          {s.guest ? `${s.guest} · ` : ""}{s.creator}{s.date ? ` · ${s.date}` : ""}
        </div>
        {s.url && (
          <a href={s.url} style={{ fontSize: "11px", color: "var(--color-text-info)", textDecoration: "none" }}>
            Read original →
          </a>
        )}
      </div>
    );
  }

  function autoResize(e) {
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  const weekAgo = Date.now() - 7 * 86400000;
  const thisWeek = log.filter(e => e.t > weekAgo);
  const older = log.filter(e => e.t <= weekAgo);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "620px", fontFamily: "var(--font-sans)" }}>
      <style>{`
        @keyframes blink { 0%,80%,100%{opacity:.15} 40%{opacity:.9} }
        .dot { width:6px;height:6px;border-radius:50%;background:var(--color-text-secondary);animation:blink 1.2s ease-in-out infinite; }
        .log-btn:hover { background: var(--color-background-secondary) !important; }
        .pill-btn:hover { background: var(--color-background-secondary) !important; opacity:0.85; }
        textarea:focus { outline: none; box-shadow: 0 0 0 2px var(--color-border-secondary); }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "0 16px", display: "flex", alignItems: "center", height: "46px", flexShrink: 0, gap: "4px" }}>
        <div style={{ fontWeight: 500, fontSize: "14px", marginRight: "16px", color: "var(--color-text-primary)" }}>
          AI PM Hub
        </div>
        {[["chat","Chat"], ["log", `Log (${log.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: "none", border: "none",
            borderBottom: tab === id ? "2px solid var(--color-text-primary)" : "2px solid transparent",
            padding: "0 10px", height: "100%", fontSize: "13px", cursor: "pointer",
            color: tab === id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            fontWeight: tab === id ? 500 : 400
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "10px", background: "rgba(200,150,60,0.13)", color: "#8a5c10", border: "0.5px solid rgba(200,150,60,0.4)" }}>Lenny MCP</span>
          <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "10px", background: "rgba(29,158,117,0.12)", color: "#0f6e56", border: "0.5px solid rgba(29,158,117,0.35)" }}>Aakash RSS</span>
        </div>
      </div>

      {/* Review Banner */}
      {reviewBanner && tab === "chat" && (
        <div style={{ background: "var(--color-background-warning)", borderBottom: "0.5px solid var(--color-border-warning)", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", flexShrink: 0 }}>
          <span style={{ color: "var(--color-text-warning)" }}>It's been 7+ days — time for a spaced repetition review!</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={startReview} style={{ background: "var(--color-text-warning)", color: "#fff", border: "none", borderRadius: "var(--border-radius-md)", padding: "3px 10px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>Start review</button>
            <button onClick={() => setReviewBanner(false)} style={{ background: "none", border: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: "12px" }}>✕</button>
          </div>
        </div>
      )}

      {/* Chat */}
      {tab === "chat" && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
            {msgs.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => ask(s)} className="pill-btn" style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "20px", padding: "5px 12px",
                    fontSize: "12px", color: "var(--color-text-secondary)", cursor: "pointer"
                  }}>{s}</button>
                ))}
              </div>
            )}

            {msgs.map((msg, i) => (
              <div key={i} style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "user" ? (
                  <div style={{
                    maxWidth: "78%", background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)", padding: "8px 12px",
                    fontSize: "15px", lineHeight: 1.6, color: "var(--color-text-primary)"
                  }}>{msg.text}</div>
                ) : (
                  <div style={{ width: "100%" }}>
                    <MsgBody text={msg.text} />
                    {msg.sources?.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Sources</div>
                        {msg.sources.map((s, j) => <SrcCard key={j} s={s} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: "5px", padding: "4px 0 16px" }}>
                <div className="dot" style={{ animationDelay: "0s" }} />
                <div className="dot" style={{ animationDelay: "0.2s" }} />
                <div className="dot" style={{ animationDelay: "0.4s" }} />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "10px 16px", display: "flex", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
            <textarea
              ref={el => { inputRef.current = el; taRef.current = el; }}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              placeholder="Ask about PM… (Enter to send, Shift+Enter for new line)"
              style={{
                flex: 1, border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "var(--border-radius-md)", padding: "8px 12px",
                fontSize: "14px", fontFamily: "var(--font-sans)", resize: "none",
                background: "var(--color-background-primary)", color: "var(--color-text-primary)",
                lineHeight: 1.5, height: "36px", maxHeight: "120px", overflowY: "auto"
              }}
            />
            <button onClick={() => ask(input)} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim() ? "var(--color-background-secondary)" : "var(--color-text-primary)",
              color: loading || !input.trim() ? "var(--color-text-secondary)" : "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              borderRadius: "var(--border-radius-md)", padding: "0 16px",
              fontSize: "13px", cursor: loading || !input.trim() ? "default" : "pointer",
              fontWeight: 500, height: "36px", flexShrink: 0
            }}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </>
      )}

      {/* Log Tab */}
      {tab === "log" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {log.length === 0 ? (
            <div style={{ color: "var(--color-text-secondary)", fontSize: "14px", textAlign: "center", padding: "60px 0" }}>
              No queries yet — ask questions in Chat to build your learning log.
            </div>
          ) : (
            <>
              {thisWeek.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>This week</div>
                  {thisWeek.map((e, i) => (
                    <button key={i} className="log-btn" onClick={() => { setTab("chat"); ask(e.q); }} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", background: "none", border: "none",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                      padding: "9px 4px", fontSize: "14px", color: "var(--color-text-primary)",
                      cursor: "pointer", textAlign: "left", gap: "8px"
                    }}>
                      <span style={{ flex: 1 }}>{e.q}</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", flexShrink: 0 }}>{new Date(e.t).toLocaleDateString()} ↗</span>
                    </button>
                  ))}
                </div>
              )}
              {older.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Earlier</div>
                  {older.map((e, i) => (
                    <button key={i} className="log-btn" onClick={() => { setTab("chat"); ask(e.q); }} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      width: "100%", background: "none", border: "none",
                      borderBottom: "0.5px solid var(--color-border-tertiary)",
                      padding: "9px 4px", fontSize: "13px", color: "var(--color-text-secondary)",
                      cursor: "pointer", textAlign: "left", gap: "8px"
                    }}>
                      <span style={{ flex: 1 }}>{e.q}</span>
                      <span style={{ fontSize: "11px", flexShrink: 0 }}>{new Date(e.t).toLocaleDateString()} ↗</span>
                    </button>
                  ))}
                </div>
              )}
              <div style={{ textAlign: "center", paddingTop: "8px" }}>
                <button onClick={startReview} style={{
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-secondary)",
                  borderRadius: "var(--border-radius-md)", padding: "8px 20px",
                  fontSize: "13px", cursor: "pointer", color: "var(--color-text-primary)"
                }}>Start review session →</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
