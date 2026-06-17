import fs from "node:fs";
import path from "node:path";

// Local Lenny archive used when the MCP-backed search fails (request-level fallback).
// Files are Markdown with YAML frontmatter:
//   title, date, type, guest, channel, youtube_url, description, tags, word_count
// Layout: app/data/lenny/{02-newsletters,03-podcasts}/**.md
// The 01-start-here folder (license/readme/index.json) is skipped.
const DATA_DIR = path.join(process.cwd(), "data", "lenny");
const SKIP_DIRS = new Set(["01-start-here"]);
const ALLOWED_TYPES = new Set(["podcast", "newsletter"]);

// Terms shorter than this, or in the stopword list, are dropped so common words
// (e.g. "a", "is", "the") don't substring-match nearly every file.
const MIN_TERM_LEN = 3;
const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can",
  "her", "was", "one", "our", "out", "his", "has", "how", "who", "why",
  "what", "when", "with", "this", "that", "from", "your", "about", "into",
  "does", "have", "they", "them", "then", "than", "will", "would"
]);

// Count non-overlapping occurrences of term in haystack (both lowercased).
function countOccurrences(haystack, term) {
  return haystack.split(term).length - 1;
}

// Recursively collect .md files, skipping ignored folders.
function collectMarkdown(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return []; // directory missing — stub gracefully
  }

  const out = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...collectMarkdown(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

// Minimal frontmatter parser — avoids adding a YAML dependency (MVP rule).
// Splits the leading `---` ... `---` block from the body and reads `key: value` lines.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["']|["']$/g, ""); // strip surrounding quotes
    meta[key] = val;
  }
  return { meta, body: match[2] };
}

// Newsletters carry no author field, so guest writers are only named in the body
// (e.g. "As today's guest author, [Caitlin Sullivan](...)" or "guest post by Todd
// Jackson"). Extract the first such name; require a Capitalized name to avoid
// false positives like "guest authors, and the community" or "written by an AI".
// Match only true bylines: "guest author[,] Name" or "guest post by Name".
// (Not "guest post:" linking a post title, nor "guest post I did on...".)
const GUEST_AUTHOR_RE =
  /guest (?:author,?\s+|post\s+by\s+)\[?([A-Z][A-Za-z.'’-]*(?:\s+[A-Z][A-Za-z.'’-]*){0,3})/;

function extractGuestAuthor(body) {
  const m = body.match(GUEST_AUTHOR_RE);
  return m ? m[1].trim() : null;
}

// Case-insensitive keyword search across title / description / tags / body.
// Maps frontmatter → the source shape the UI renders, preserving speaker-level
// attribution: channel→creator, type→type, guest→guest, date→date, youtube_url→url.
export function searchLocalLenny(query) {
  const files = collectMarkdown(DATA_DIR);

  // Tokenize on non-alphanumerics (so "activation?" → "activation"), drop short
  // words and stopwords, and dedupe so a repeated word isn't counted twice.
  const terms = [
    ...new Set(
      (query || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= MIN_TERM_LEN && !STOPWORDS.has(t))
    ),
  ];

  // No usable terms (empty or all-stopword query) → no matches.
  if (terms.length === 0) return [];

  // First pass: per-file term occurrence counts + document frequency per term
  // (df = how many files contain the term), used for IDF weighting below.
  const candidates = [];
  const df = Object.create(null);
  let corpusSize = 0;

  for (const file of files) {
    let raw;
    try {
      raw = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const { meta, body } = parseFrontmatter(raw);

    // Only podcast/newsletter entries — skip anything else.
    if (!ALLOWED_TYPES.has((meta.type || "").toLowerCase())) continue;
    corpusSize++;

    const haystack = [meta.title, meta.description, meta.tags, body]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const counts = {};
    let matched = false;
    for (const t of terms) {
      const c = countOccurrences(haystack, t);
      if (c > 0) {
        counts[t] = c;
        df[t] = (df[t] || 0) + 1;
        matched = true;
      }
    }
    if (!matched) continue;

    const type = (meta.type || "").toLowerCase();
    // Podcast guests come from frontmatter; newsletter guests are parsed from body text.
    const guest = meta.guest || (type === "newsletter" ? extractGuestAuthor(body) : null) || null;

    candidates.push({
      counts,
      source: {
        title: meta.title || path.basename(file, ".md"),
        creator: meta.channel || "Lenny Rachitsky",
        type: meta.type || null,
        guest,
        date: meta.date || null,
        url: meta.youtube_url || null,
        snippet: (meta.description || "").slice(0, 140),
      },
    });
  }

  // Second pass: IDF-weighted score so rare, meaningful terms (e.g. "activation",
  // in ~94 files) outweigh ubiquitous ones (e.g. "think", in nearly every file).
  // idf = ln(corpusSize / df); a term present in every file contributes ~0.
  for (const cand of candidates) {
    cand.score = 0;
    for (const t in cand.counts) {
      cand.score += cand.counts[t] * Math.log(corpusSize / df[t]);
    }
  }

  // Most relevant first; tie-break by how many distinct query terms matched.
  candidates.sort(
    (a, b) =>
      b.score - a.score ||
      Object.keys(b.counts).length - Object.keys(a.counts).length
  );
  return candidates.slice(0, 6).map((c) => c.source);
}
