# AI PM Learning Hub

> A personal AI learning companion that lets product managers search, synthesize, and retain insights across their favorite creators and course materials — without switching between 10 tabs.

---

## The Problem

You subscribe to Lenny. You follow Aakash Gupta. You've taken AI PM courses. You've read dozens of newsletters, listened to hundreds of podcast episodes, and taken notes you never revisit.

The knowledge is there. Finding it isn't the problem. **Connecting it is.**

When you're trying to figure out how to think about North Star metrics, you want to know what Lenny said *and* what Aakash said *and* what Brian Balfour said on Lenny's podcast three years ago — in one answer, attributed correctly, with links to go deeper.

That's what this does.

---

## What It Does

- **Chat across sources** — ask a question, get a synthesized answer drawing from Lenny's newsletter, Lenny's podcast guests, and Aakash Gupta's Product Growth newsletter simultaneously
- **Speaker-level attribution** — answers cite who actually said it: not just "Lenny's Podcast" but "Brian Balfour, via Lenny's Podcast, Episode: How to Build a Growth Machine"
- **Source cards** — every answer surfaces the original source with title, date, and link
- **Learning log** — every question you ask is silently logged with a timestamp
- **Weekly review mode** — come back a week later and get quizzed on concepts you explored, using spaced repetition

---

## Demo

> *Coming soon — first working version in progress*

---

## How It Works

```
You ask a question
        ↓
Lenny MCP → searches 640 items (podcast transcripts + newsletter archive)
Aakash RSS → fetches latest posts from productgrowth.substack.com
        ↓
Claude API (Haiku 4.5) synthesizes both sources into one answer
        ↓
Response with inline speaker tags + source cards below
Learning log updated with topic + timestamp
```

**Tech stack:**
- React (single artifact, no build step)
- Anthropic API — claude-haiku-4-5 for cost efficiency (~$1/month)
- Lenny's official MCP server (LennysData.com) — 640 items, podcast + newsletter
- Aakash Gupta's Substack RSS — public feed
- Artifact storage API — persists learning log across sessions

**No backend. No deployment. No infrastructure.**  
Runs entirely inside Claude.ai as a single artifact.

---

## Setup

1. Get a free Anthropic API key at [platform.claude.com](https://platform.claude.com) (~$5 free credit, no card required)
2. Connect the Lenny MCP in Claude.ai settings (LennysData.com)
3. Open the artifact and start asking

That's it.

---

## Cost

| Item | Cost |
|---|---|
| Anthropic API (Haiku 4.5, ~150 questions/month) | ~$0.75/month |
| Weekly review sessions (4/month) | ~$0.06/month |
| Lenny MCP | Free |
| Aakash RSS | Free |
| **Total** | **< $1/month** |

---

## Roadmap

**v1 — MVP (current)**
- [x] Plan + PRD
- [ ] Chat Q&A across Lenny + Aakash
- [ ] Speaker-level attribution
- [ ] Source cards
- [ ] Learning log
- [ ] Weekly review / quiz mode

**v2 — Expand**
- [ ] Add more creators via RSS (Shreyas Doshi, Wes Kao)
- [ ] Upload personal course materials (Maven AI PM course)
- [ ] Keyword search / browse mode
- [ ] Filter by creator or topic tag

**v3 — Polish**
- [ ] Weekly digest view
- [ ] Email delivery via Gmail integration
- [ ] Reading list / save for later

---

## Why I Built This

I'm a product manager on sabbatical breaking into AI PM. I found myself spending more time hunting for insights I'd already encountered than actually learning new ones.

This started as a personal tool. It's also my first AI-native product — designed from scratch using the Anthropic API, Lenny's official MCP server, and a PRD-first approach before a single line of code was written.

If you're an AI PM or aspiring to be one, the process of building this is as instructive as the tool itself. See [/docs/DECISIONS.md](./docs/DECISIONS.md) for every non-obvious choice made along the way.

---

## Built With

- [Lenny's Data MCP](https://lennysdata.com) — Lenny Rachitsky's official podcast + newsletter archive
- [Anthropic API](https://platform.claude.com) — Claude Haiku 4.5
- [Aakash Gupta's Product Growth](https://www.productgrowth.com) — Substack RSS

---

*Built as part of [Lenny's Data Challenge](https://www.lennysnewsletter.com/p/how-i-built-lennyrpg) — April 2026*
