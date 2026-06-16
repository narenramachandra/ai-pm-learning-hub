import { searchLocalLenny } from "@/lib/lennyFallback";

const MODEL = "claude-haiku-4-5-20251001";
// Lenny MCP + web_search from the original artifact. Two changes are required to
// run against the real API (the artifact ran behind claude.ai's MCP proxy):
//   1. Under the mcp-client-2025-11-20 beta, each mcp_servers entry must be
//      referenced by an mcp_toolset in `tools` (MCP_TOOLSET below).
//   2. The Lenny MCP server requires auth — pass a bearer token via
//      LENNY_MCP_TOKEN (claude.ai authorized this via OAuth for you).
const MCP = { type: "url", url: "https://mcp.lennysdata.com/mcp", name: "lennys-data" };
const MCP_TOOLSET = { type: "mcp_toolset", mcp_server_name: "lennys-data" };
const WEB_SEARCH = { type: "web_search_20250305", name: "web_search" };

const SYS = `You are the AI PM Learning Hub — a research assistant for product managers.

Search BOTH sources for every question:
1. Lenny Rachitsky — use lennys-data MCP tools: search_content(query, content_type?, limit?), read_excerpt(filename, query?). Search with focused 2-4 word queries. Try both "podcast" and "newsletter" content_type if needed.
2. Aakash Gupta / Product Growth — use web_search targeting productgrowth.substack.com

ATTRIBUTION (always use most granular level — never wrong):
• Lenny newsletter, Lenny writing → [Lenny Rachitsky]
• Lenny newsletter, guest author → [Guest Name, via Lenny's Newsletter]
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

// Build the inline [Attribution] for a local source, matching the SYS rules so
// the attribution chips render the same in fallback mode.
function attributionFor(s) {
  if (/aakash/i.test(s.creator || "")) return "[Aakash Gupta, Product Growth]";
  if (s.type === "podcast") {
    return s.guest ? `[${s.guest}, via Lenny's Podcast]` : "[Lenny Rachitsky, Lenny's Podcast]";
  }
  // newsletter: guest author when present, otherwise Lenny.
  return s.guest ? `[${s.guest}, via Lenny's Newsletter]` : "[Lenny Rachitsky]";
}

// Synthesize a Messages-API-shaped response from the local archive so the
// frontend's existing text/SOURCES parsing and source cards work unchanged.
function buildFallbackResponse(query) {
  const matches = searchLocalLenny(query);

  let text;
  if (matches.length === 0) {
    text =
      "Live MCP search is unavailable right now, and I found no matching items in the local Lenny archive. Please try again shortly.";
  } else {
    const lines = matches.map(
      (s) => `• ${attributionFor(s)} ${s.title}${s.snippet ? ` — ${s.snippet}` : ""}`
    );
    text =
      `Live MCP search is unavailable, so I searched the local Lenny archive and found ` +
      `${matches.length} relevant item(s):\n\n${lines.join("\n")}`;
  }

  const sources = matches.map((s) => ({
    title: s.title,
    creator: s.creator,
    type: s.type,
    guest: s.guest,
    date: s.date,
    url: s.url,
  }));

  const raw = `${text}\n\n<<<SOURCES>>>\n${JSON.stringify(sources)}\n<<<END>>>`;
  return { content: [{ type: "text", text: raw }] };
}

export async function POST(request) {
  const { messages } = await request.json();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        // MCP connector requires this beta header on the real API.
        "anthropic-beta": "mcp-client-2025-11-20",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYS,
        messages,
        mcp_servers: [
          process.env.LENNY_MCP_TOKEN
            ? { ...MCP, authorization_token: process.env.LENNY_MCP_TOKEN }
            : MCP,
        ],
        tools: [WEB_SEARCH, MCP_TOOLSET],
      }),
    });

    const data = await res.json();
    if (data.error) {
      console.error("Anthropic error response:", res.status, JSON.stringify(data));
      throw new Error(data.error.message);
    }

    return Response.json(data);
  } catch (err) {
    console.error("Live API call failed:", err);
    // Request-level fallback: the MCP-backed call failed → local Markdown archive.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const query = typeof lastUser?.content === "string" ? lastUser.content : "";
    return Response.json(buildFallbackResponse(query));
  }
}
