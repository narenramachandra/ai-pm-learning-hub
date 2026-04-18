# Eval Run Log

## Run 1 — April 18, 2026

Model: claude-haiku-4-5
Method: Manual (run in Claude.ai conversation)

| # | Type        | Input                                        | Verdict      | Notes                                                                 |
|---|-------------|----------------------------------------------|--------------|-----------------------------------------------------------------------|
| 1 | Common      | What is a North Star metric?                 | ✅ Pass      | 32 results from Lenny, Aakash found. Attribution tags present.        |
| 2 | Common      | How should I think about activation?         | ✅ Pass      | 241 results (Lenny), Aakash PLG content found. Both sources returned. |
| 3 | Realistic   | that north star thing lenny mentioned        | ⚠️ Conditional | Data exists. Depends on system prompt handling informal phrasing.   |
| 4 | Realistic   | lenny aakash growth loops thoughts           | ✅ Pass      | Both sources returned relevant content.                               |
| 5 | Invalid     | what's the weather in San Francisco          | ✅ Pass      | MCP returned 0 results. Out-of-scope path fires correctly.            |
| 6 | Invalid     | asdfjkl; xyz!!!                              | ✅ Pass      | MCP returned 0 results. No crash, no fabrication.                     |
| 7 | Specific    | What does Elena Verna say about retention?   | ✅ Pass      | Guest field correctly identifies Elena Verna, not just Lenny.         |
| 8 | Specific    | What does Aakash say about pricing strategy? | ⚠️ Conditional | Content exists but paywalled. Correct behavior = surface preview + note paywall. |
| 9 | Performance | Long-form RAG vs fine-tuning question        | ✅ Pass      | Both sources returned. No truncation or timeout.                      |
|10 | Performance | What is a North Star metric? (repeat)        | ✅ Pass      | Identical top 3 sources as run 1. MCP search is deterministic.        |

Score: 8 Pass / 2 Conditional / 0 Fail

## Known Limitations Identified

1. Informal phrasing — system prompt handles it but untested end-to-end
2. Aakash paid content — paywalled. Fix: run Substack2Markdown before unsubscribing.

## Next Run

Trigger: After uploading Aakash paid archive via Substack2Markdown
Expected improvement: Test 8 should move from Conditional → Pass
