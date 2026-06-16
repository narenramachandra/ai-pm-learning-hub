<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project-specific rules for the AI PM Learning Hub

- NEVER call the Anthropic API from a client component. All Anthropic
  calls must go through a server-side /api route that reads the key from
  process.env.ANTHROPIC_API_KEY.
- When parsing Anthropic API responses that use MCP servers, always filter
  content blocks by type === "text" to extract the answer. Do not assume
  content[0] is the text — the response mixes text, mcp_tool_use, and
  mcp_tool_result blocks.
- This is an MVP. Keep it minimal. No new dependencies without a clear reason.
