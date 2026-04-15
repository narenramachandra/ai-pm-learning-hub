# Lessons Learned — AI PM Learning Hub

A running log of PM skills applied during this project, written as teaching notes for future projects. Each entry explains *what* we did, *why* it matters, and *what to do differently* next time.

---

## Lesson 1: Plan Before You Build — Even for Personal Tools

**What we did:** Spent multiple sessions planning, scoping, and writing a PRD before a single line of code. This felt slow. It was correct.

**Why it matters:** The Maven course frames this well — PRDs aren't documentation, they're decision-making tools. Every hour spent clarifying scope before building saves three hours of rework. This is especially true for AI products, where non-deterministic behavior makes late-stage course corrections expensive.

**The trap we avoided:** "I'll just start and figure it out." This produces a tool that does something but not the right thing. You end up rebuilding the foundation after you've already put up the walls.

**Rule for next time:** No code until you can answer three questions in one sentence each:
1. What problem does this solve?
2. Who has this problem?
3. How will I know if it's solved?

---

## Lesson 2: Your Data Source Choice IS a Product Decision

**What we did:** Compared three options for Lenny's content (MCP, GitHub repo, downloaded files) and chose the MCP. Compared two options for Aakash's content (paid RSS, free RSS) and chose free RSS for MVP with a plan to archive paid content before unsubscribing.

**Why it matters:** Data source decisions determine quality ceiling, maintenance burden, and scope. The GitHub repo had 269 transcripts; the MCP had 640 items including newsletters. Same effort to implement, dramatically different output quality. Choosing wrong here would have meant rebuilding the data layer later.

**The PM skill here:** Treat data sourcing like infrastructure — boring but foundational. Ask:
- What's the coverage? (breadth)
- How fresh is it? (recency)
- What metadata is available? (depth)
- What's the maintenance burden? (sustainability)

**Rule for next time:** Evaluate data sources on all four dimensions before picking one. Never choose based on "what's easiest to get" alone.

---

## Lesson 3: Attribution Is a Design Decision, Not an Engineering Detail

**What we did:** Discovered the Lenny MCP returns a `guest` field per podcast episode. Decided to use it for speaker-level attribution ("Brian Balfour, via Lenny's Podcast") rather than creator-level ("Lenny's Podcast").

**Why it matters:** This single decision changes the quality ceiling of the entire product. "Lenny's Podcast said X" is useful. "Brian Balfour said X" is actionable — you can look up Brian Balfour, follow him, read more of his work. Attribution granularity determines how useful the output actually is.

**The trap most builders fall into:** Using whatever attribution is easiest to implement. In this case, creator-level attribution would have been easier (no guest metadata lookup) but significantly less valuable.

**Rule for next time:** Before implementing any AI output, ask: "What's the most granular, accurate attribution I can provide?" Then check if the data to support it actually exists. In our case it did — the MCP `guest` field was sitting there unused.

---

## Lesson 4: Scope Discipline Is a Skill, Not a Constraint

**What we did:** Defined explicit non-goals in the PRD (no public deployment, no email delivery, not a podcast player, not Notion). Added a 3-question filter for evaluating new features during build.

**Why it matters:** The biggest risk for solo builders is feature creep disguised as "while I'm in here anyway." Each new feature adds complexity, delays shipping, and dilutes the core value proposition. Explicit non-goals make it easy to say no — not because you don't want to build something, but because the PRD already decided you wouldn't.

**The 3-question filter:**
1. Does it serve the north star one-liner?
2. Can I demo it in under 60 seconds?
3. Does it require anything not already in the plan?

If #3 is yes → it goes in FUTURE.md, not the build.

**Rule for next time:** Write non-goals before you write features. It's harder to add something to a non-goals list than to a backlog — that friction is intentional.

---

## Lesson 5: Size the Pain Honestly Before Committing

**What we did:** Ran the Maven Five-Factor framework (Magnitude, Frequency, Severity, Competition, Contrast) on our own product idea. Scored Severity a 2/5 — a vitamin, not a painkiller.

**Why it matters:** This is the most commonly inflated dimension in PM writing. Saying "this is a vitamin" out loud before building is an act of intellectual honesty that most PMs skip. For a personal tool, a vitamin score is fine. For a venture-backed product, it's a red flag. Knowing which situation you're in changes everything about how you design, scope, and pitch.

**What changes when you're honest about severity:**
- You don't over-engineer the solution
- You don't pitch it as "essential infrastructure"
- You design for delight, not desperation
- You're not surprised when adoption is gradual

**Rule for next time:** Score severity before scoping. If it's a vitamin, design accordingly — delightful, low-friction, optional. If it's a painkiller, design for reliability and trust above all else.

---

## Lesson 6: CRISP Evaluation — Test Before You Build

**What we did:** Defined 10 test cases across the CRISP framework (Common, Realistic, Invalid, Specific, Performance) before writing any code.

**Why it matters:** AI products fail in predictable ways. They fail on informal input (Realistic), out-of-scope queries (Invalid), edge cases (Specific), and load (Performance). If you don't define what "good" looks like for each of these before building, you have no way to know if your product works — only if it works for the cases you thought to test.

**The most important case types:**
- **Realistic** — users never type the way you imagine. "that lenny thing about metrics" is more common than "What does Lenny Rachitsky say about North Star metrics?"
- **Invalid** — graceful failure is a feature. A product that says "I don't know" clearly is better than one that confidently makes things up.
- **Specific** — this is where attribution errors live. "What does [guest] say?" must return the guest's words, not Lenny's words about the guest.

**Rule for next time:** Write 10 CRISP test cases before the first line of code. Run them manually against the finished build. Fix failures before shipping. This is your acceptance criteria.

---

## Lesson 7: Placement Is a PM Decision, Not a Designer Decision

**What we did:** Specified exactly where each UI element lives and why — chat input at the bottom, attribution inline, source cards collapsible below the answer, learning log indicator top right.

**Why it matters:** When PMs leave placement unspecified, designers and engineers make the call — often based on what's easiest to implement, not what serves the user best. The inline vs. below-the-fold decision for attribution completely changes reading experience. Getting this right requires the PM to think about the user's moment-by-moment experience, not just the feature list.

**The Three P's from Maven:**
- **Prioritization:** Which problem does this feature primarily solve?
- **Placement:** Where in the UI does it live, and why there?
- **Problem solving:** Does every design choice keep the job-to-be-done central?

**Rule for next time:** For every feature, answer "where does it go?" before handing to design or build. One sentence per element is enough. No sentence = no placement spec = guaranteed design debt.

---

## Lesson 8: The Decision Log Is Your Best Portfolio Asset

**What we did:** Maintained a DECISIONS.md file throughout the project, logging every non-obvious choice with alternatives considered and rationale.

**Why it matters:** A GitHub repo with great code and no context looks like engineering work. A GitHub repo with a DECISIONS.md that explains why Haiku over Sonnet, why MCP over GitHub repo, why free RSS for MVP — that looks like product thinking. The latter gets interviews. The former gets "interesting project."

**What to log:**
- Any choice between two real alternatives
- Any time you explicitly decided NOT to do something
- Any time you changed your mind and why

**What not to log:**
- Obvious decisions with no real alternative
- Implementation details (which variable to name what)
- Things you'd do the same way every time regardless

**Rule for next time:** Open DECISIONS.md before you open your code editor. Log the decision first, build second. This forces you to articulate your reasoning before you're too deep in implementation to remember why you made the call.

---

## Meta-Lesson: The PRD Is a Living Document

**What we did:** Started with a lightweight speclet, evolved to a kickoff PRD, then updated it when we applied the Maven framework — adding pain sizing, CRISP test cases, and placement specs.

**Why it matters:** The Maven course describes five PRD stages: Planning → Kickoff → Solution Review → Launch Readiness → Impact Review. We moved from Planning to Kickoff in this session. Each stage adds specificity. The document at Kickoff looks nothing like the document at Planning — and that's correct.

**The failure mode:** Treating the PRD as a one-time artifact. Writing it once, never updating it, and letting it gather dust while the build diverges from the spec. The PRD should be the single source of truth throughout. If the build changes, the PRD changes first.

**Rule for next time:** Date-stamp every significant PRD update. The history of changes tells the story of how your thinking evolved — which is itself a portfolio artifact.
