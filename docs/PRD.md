# PRD: AI PM Learning Hub

**Owner:** [Your name]  
**Status:** Kickoff  
**Last Updated:** April 2026  
**Version:** 1.0

---

## Executive Summary

Product managers consume content across newsletters, podcasts, and courses but have no unified way to search, synthesize, or retain it. This tool is a personal AI learning companion that queries multiple creator sources simultaneously, attributes insights to the specific speaker (not just the publication), and builds a spaced-repetition review system from your actual usage patterns. MVP ships as a Claude.ai artifact with zero infrastructure.

---

## Opportunity Framing

**Core Problem:** PM knowledge is trapped across 10 tabs. Finding a specific insight means remembering which creator said it, in which format, in which episode — then going back to find it manually.

**Hypothesis:** A chat-first interface that synthesizes multiple creator sources simultaneously — with speaker-level attribution — will reduce time-to-insight and increase retention of content already consumed.

**Strategy Fit:** Personal productivity tool and AI PM portfolio piece. Doubles as a submission for Lenny's Data Challenge (deadline: April 15, 2026).

---

## Pain Point Validation

Before scoping, size the pain using the Maven Five-Factor framework. This forces honest assessment before committing to build.

| Factor | Question | Assessment | Score (1-5) |
|---|---|---|---|
| **Magnitude** | How large is the addressable audience? | Every PM who follows multiple creators — tens of thousands globally | 4 |
| **Frequency** | How often is the pain felt? | Daily — content consumption is a daily habit for active PMs | 5 |
| **Severity** | Painkiller or vitamin? | Vitamin — painful to not have, but not blocking work | 2 |
| **Competition** | What existing solutions exist? | Readwise, NotebookLM, generic search — none do cross-creator synthesis with speaker attribution | 3 |
| **Contrast** | What do people complain about in current solutions? | Tools don't connect creators, don't surface who actually said something, require switching contexts | 4 |

**Honest assessment:** This is a vitamin, not a painkiller. Severity score of 2 is intentional — this tool makes PM learning significantly better, not possible at all. That's fine for a personal tool and portfolio piece. It would be a concern for a venture-backed product.

**Why this matters as a PM skill:** Sizing pain before scoping prevents building solutions to problems that don't hurt enough. The Five Factors force you to be honest about severity — the most commonly inflated dimension in PM writing.

---

## Scope

### In ✅
- Chat Q&A across Lenny (MCP) and Aakash Gupta (RSS)
- Speaker-level attribution — not just creator, but guest name
- Inline attribution tags + source cards per answer
- Learning log: silent timestamp recording per question asked
- Weekly review mode: quiz on topics explored ~7 days prior
- Both sources queried simultaneously by default, answers synthesized

### Out ❌
- Email digest / automated delivery
- Adding creators beyond Lenny + Aakash in v1
- User accounts or external persistence (artifact storage only)
- Mobile app
- Public deployment

---

## Success Measurement

| Metric | Target | How Measured |
|---|---|---|
| Time to find an insight | < 30 seconds | Personal observation vs. baseline (current: 3-5 min manual search) |
| Weekly review completion | 1 session/week | Learning log streak |
| Questions asked per week | ≥ 5 | Learning log count |
| Lenny challenge submission | Submitted by April 15 | Binary |
| Portfolio conversations | Tool referenced in ≥ 2 networking conversations | Self-tracked |

---

## Data Sources

| Source | Method | Coverage | Status |
|---|---|---|---|
| Lenny's newsletter | MCP (LennysData.com) | 349 issues | ✅ Live |
| Lenny's podcast | MCP (LennysData.com) | 291 episodes + guest metadata | ✅ Live |
| Aakash Gupta (free) | Substack RSS — productgrowth.substack.com/feed | Free posts only | ⏳ MVP |
| Aakash Gupta (paid) | Substack2Markdown — github.com/timf34/Substack2Markdown | Full archive | 📋 Before unsubscribing |
| Maven AI PM course | Manual upload (PDF/text) | Templates + frameworks | 📋 V2 |

---

## Behavior Specification

### Attribution Rules

Every answer must identify the speaker at the most granular level available:

| Source type | Attribution format |
|---|---|
| Lenny newsletter | `[Lenny Rachitsky]` |
| Lenny podcast — Lenny speaking | `[Lenny Rachitsky, Lenny's Podcast]` |
| Lenny podcast — guest speaking | `[Guest Name, via Lenny's Podcast]` |
| Aakash newsletter | `[Aakash Gupta, Product Growth]` |

**Source card format (appears below every answer):**
```
📄 "Post title here"
   Lenny's Newsletter · March 2024 · [link]

🎙️ Brian Balfour on Lenny's Podcast
   "How to Build a Growth Machine" · Jan 2023 · [link]
```

### Example Interactions

**Good response — multi-source synthesis:**
```
User: What's the best way to define a North Star metric?
Response: There are two schools of thought here. [Lenny Rachitsky] argues that 
a North Star metric should reflect the core value exchange between your product 
and user — not a vanity metric like DAU. [Brian Balfour, via Lenny's Podcast] 
goes further, distinguishing between input metrics (things you control) and 
output metrics (things you're ultimately optimizing for).

[Source cards: Lenny newsletter "North Star Metrics" + Brian Balfour episode]
```

**Bad response — no attribution:**
```
User: What's the best way to define a North Star metric?
Response: A North Star metric should reflect core user value...
[No attribution, no source cards]
```

**Bad response — wrong attribution level:**
```
User: What does Brian Balfour say about growth?
Response: According to Lenny's Podcast... [should be "Brian Balfour, via Lenny's Podcast"]
```

**Reject case:**
```
User: What does [guest] say about [topic]?
If neither source has relevant content: "I couldn't find relevant content on 
that topic from Lenny or Aakash. Try rephrasing or ask about a related concept."
```

### Weekly Review Mode

Trigger: User opens app on Wednesday (or any day 7+ days after last session)

Behavior:
1. Pull last 7 days from learning log → extract top 3-5 topics
2. Generate 3 quiz questions per topic from source material
3. Present one at a time, wait for answer
4. Score answer, show source passage, offer to go deeper
5. Session ends after ~5 questions or user exits

**Example quiz question:**
```
Last week you explored "activation metrics." Here's a question:

According to Elena Verna (via Lenny's Podcast), what's the key difference 
between activation and retention?

[Your answer here]
```

---

## UI Placement Specification

From the Maven course: Placement answers "where does this feature live and why?" Underspecifying placement leads to design debt and UX confusion during build.

| Element | Placement | Rationale |
|---|---|---|
| Chat input | Bottom, full width, always visible | Primary interaction — should always be reachable without scrolling |
| Inline attribution tags | Immediately after the attributed claim, in brackets | Keeps reading flow intact — reader doesn't have to scroll to know source |
| Source cards | Below the full answer, collapsible | Secondary — most useful when you want to go deeper, not on first read |
| Learning log indicator | Top right, subtle count | Ambient awareness without distraction — "you've asked 12 questions" |
| Weekly review trigger | Prominent banner when 7+ days since last review | Should feel like a nudge, not buried in settings |
| Creator filter / toggle | Not in MVP — both always queried | Reduces cognitive load; revisit in v2 if users want single-source mode |

**Why this matters as a PM skill:** Placement decisions made before build prevent the most common design failure: features that work technically but feel wrong in context. "Where does it go?" is a design question, not an engineering one — and PMs who don't answer it force designers and engineers to guess.

---

## Evaluation Framework (CRISP)

From the Maven course: AI products are non-deterministic. You cannot rely on manual testing alone. Define test cases before building — this becomes your evaluation suite.

CRISP = Common, Realistic, Invalid, Specific, Performance

| # | Type | Input | Expected Output | Pass Criteria |
|---|---|---|---|---|
| 1 | **Common** | "What is a North Star metric?" | Synthesized answer from both sources, inline attribution, source cards | Answer cites ≥1 source, attribution present |
| 2 | **Common** | "How should I think about activation?" | Multi-source synthesis with speaker names | Both Lenny and Aakash queried; if only one has content, states so |
| 3 | **Realistic** | "that north star thing lenny mentioned" | Same quality as formal query — handles casual phrasing | Does not fail or return empty on informal input |
| 4 | **Realistic** | "lenny aakash growth loops thoughts" | Synthesized comparison across both creators | Handles multi-entity casual query |
| 5 | **Invalid** | "what's the weather in San Francisco" | Graceful out-of-scope response — does not hallucinate PM content | Returns honest "out of scope" message, no fabricated citations |
| 6 | **Invalid** | "[gibberish / random characters]" | Graceful failure — asks user to rephrase | Does not crash or return empty error |
| 7 | **Specific** | "What does Elena Verna say about retention?" | Correct guest attribution or honest "not found" | Does not attribute to Lenny when it was a guest |
| 8 | **Specific** | Topic only covered by one creator | Answer from available source + note that other creator hasn't covered it | Does not fabricate content from missing source |
| 9 | **Performance** | 200+ word detailed question | Full answer without truncation or timeout | Response time < 10s; no truncation |
| 10 | **Performance** | Same question asked twice in a session | Consistent answer (not contradictory) | Core substance matches; wording may vary |

**Why this matters as a PM skill:** Most PMs test the happy path and ship. CRISP forces you to think adversarially — what happens when users don't behave like you expect? The invalid and specific cases are where AI products most visibly fail in production. Defining these before build means you can evaluate the system before a single real user touches it.

---

## Technical Architecture

**Runtime:**
- React single-file artifact (no build step, no deployment)
- Anthropic API — claude-haiku-4-5 ($1/$5 per MTok input/output)
- Lenny MCP — queries LennysData.com, returns guest metadata per episode
- Aakash RSS — fetches productgrowth.substack.com/feed at query time
- Artifact storage API — persists learning log key-value across sessions

**Per-query flow:**
```
1. User submits question
2. Parallel: MCP query to Lenny + RSS fetch for Aakash
3. Results + question → Haiku 4.5 with attribution system prompt
4. Response rendered with inline tags + source cards
5. Topic + timestamp silently written to artifact storage
```

**Cost per query:** ~$0.005 (Haiku 4.5)  
**Monthly estimate:** ~$0.81 (150 questions + 4 review sessions)

---

## Rollout Plan

| Phase | What | When |
|---|---|---|
| 0 | GitHub repo live — README + PRD as first commit | Week 1 |
| 1 | Working chat query — Lenny + Aakash, no attribution yet | Week 1 |
| 2 | Speaker attribution + source cards | Week 1-2 |
| 3 | Learning log + weekly review mode | Week 2 |
| 4 | Submit to Lenny's Data Challenge | April 15, 2026 |
| 5 | LinkedIn post — "here's what I built and why" | April 15, 2026 |

---

## Risk Management

| Risk | Detection | Mitigation |
|---|---|---|
| Aakash RSS goes down | Query returns empty | Fall back to Lenny-only with note to user |
| Lenny MCP rate limited | Error in response | Cache last results in artifact storage |
| Scope creep delays MVP | Feature not in v1 scope | 3-question filter: does it serve the north star? |
| Aakash paid content lost | Unsubscribe without archiving | Run Substack2Markdown before cancelling |
| API costs spike | Weekly check of platform.claude.com usage | Haiku 4.5 cap; artifact has no auto-loop |

---

## Non-Goals (Explicitly Out)

- **Not a public product.** This is a personal tool and portfolio piece, not a SaaS.
- **Not a full RSS reader.** We're not building Feedly.
- **Not replacing note-taking.** We're not building Notion or Readwise.
- **Not a podcast player.** Audio, video, timestamps — out of scope.
- **Not automated.** No scheduled jobs, no email sending in v1.

---

## Open Questions

| Question | Owner | Due |
|---|---|---|
| Which Maven templates are most useful to ingest first? | You | When available |
| Should quiz questions be generated fresh each time or pre-generated? | Decide at build | Week 2 |
| What's the right weekly review trigger — day-based or usage-based? | Decide at build | Week 2 |

---

## Decision Log

See [DECISIONS.md](./DECISIONS.md) for all non-obvious choices and their rationale.
