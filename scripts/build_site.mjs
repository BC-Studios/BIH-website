import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "site");
const srcDir = path.join(root, "site-src");

const tagSlugs = new Map([
  ["Rhythm & Entrainment", "rhythm-entrainment"],
  ["Flow State", "flow-state"],
  ["Breath & Nervous System", "breath-nervous-system"],
  ["Light & Perception", "light-perception"],
  ["Music & Emotion", "music-emotion"],
]);

const artifactMap = {
  "environmental-architecture": "split-room",
  "light-performance-variable": "light-curve",
  "rhythm-infrastructure": "stem-stack",
  "predictive-brain-yoga-studio": "prediction-loop",
  "sensory-coherence": "coherence-board",
  "collective-flow": "group-flow",
  "state-engineering": "system-map",
  "elite-athletes-yoga-teachers": "attention-map",
  "measure-flow": "measurement-stack",
  "environmental-performance": "system-timeline",
  "beyond-homeostasis": "allostasis",
  "why-beauty-matters": "beauty-coherence",
  "the-neuroscience-of-awe": "awe-scale",
  "where-do-ideas-come-from": "stem-stack",
  "can-technology-become-invisible": "invisible-tech",
  "when-teaching-replaces-practice": "teacher-timeline",
  "designing-states-not-workouts": "state-design",
  "next-performance-revolution-wont-happen-inside-you": "environment-system",
};

const articleResearchNoteSources = new Map([
  ["note-rhythm-entrainment", "rhythm-infrastructure"],
  ["note-predictive-brain", "predictive-brain-yoga-studio"],
  ["note-breath-regulation", "beyond-homeostasis"],
  ["note-sensory-coherence", "sensory-coherence"],
  ["note-state-engineering", "state-engineering"],
  ["note-elite-teaching", "elite-athletes-yoga-teachers"],
  ["note-flow-measurement", "measure-flow"],
  ["note-awe-beauty", "why-beauty-matters"],
  ["note-invisible-tech", "can-technology-become-invisible"],
  ["note-teacher-workload", "when-teaching-replaces-practice"],
]);

const discoveryStories = readDiscoveryStories("content/library/research-note-discoveries.md");

const primaryNav = [
  ["Research", "/research/"],
  ["Training", "/training/"],
  ["Interactive Flow", "/interactive-flow/"],
  ["Manual", "/instruction-manual/"],
  ["Contact", "/#contact"],
];

function parseCsv(source) {
  const rows = [];
  let row = [];
  let cell = "";
  let quote = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (quote) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        i += 1;
      } else if (char === "\"") {
        quote = false;
      } else {
        cell += char;
      }
    } else if (char === "\"") {
      quote = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...data] = rows.filter((item) => item.length && item.some(Boolean));
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function readCsv(relativePath) {
  return parseCsv(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readDiscoveryStories(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return {};

  const source = fs.readFileSync(fullPath, "utf8");
  const stories = {};
  let currentId = "";
  let currentKey = "";

  for (const raw of source.split("\n")) {
    const line = raw.trim();
    const heading = line.match(/^##\s+(note-[a-z0-9-]+)\s*$/);
    if (heading) {
      currentId = heading[1];
      stories[currentId] = {};
      currentKey = "";
      continue;
    }

    const field = line.match(/^-\s+(Year|Discovery|Result):\s*(.*)$/);
    if (field && currentId) {
      currentKey = field[1].toLowerCase() === "discovery" ? "scene" : field[1].toLowerCase();
      stories[currentId][currentKey] = field[2].trim();
      continue;
    }

    if (currentId && currentKey && line) {
      stories[currentId][currentKey] = `${stories[currentId][currentKey]} ${line}`.trim();
    }
  }

  return stories;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

function copyDirContents(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDirContents(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

function writePage(route, html) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  const dir = path.join(outDir, clean);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function stripFrontmatter(markdown) {
  return markdown.replace(/^---[\s\S]*?---\s*/, "");
}

function articleTitle(markdown, fallback) {
  const match = stripFrontmatter(markdown).match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function headingKey(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9&]+/g, " ").replace(/\s+/g, " ").trim();
}

function stripMarkdownSection(markdown, headingTitle) {
  const targetKey = headingKey(headingTitle);
  let skipping = false;
  return markdown.split("\n").filter((line) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading && heading[1].length <= 2 && headingKey(heading[2]) === targetKey) {
      skipping = true;
      return false;
    }
    if (skipping && heading && heading[1].length <= 2) {
      skipping = false;
    }
    return !skipping;
  }).join("\n");
}

function articleBodyMarkdown(markdown, title = "") {
  const titleKey = headingKey(title);
  return stripMarkdownSection(stripFrontmatter(markdown), "Research Notes")
    .replace(/^\s*#\s+.+\n+/, "")
    .split("\n")
    .filter((line) => {
      const heading = line.match(/^#{1,4}\s+(.+)$/);
      return !heading || !titleKey || headingKey(heading[1]) !== titleKey;
    })
    .join("\n");
}

function excerpt(markdown) {
  const text = stripFrontmatter(markdown)
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/[*_`>#-]/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 80)
    .join(" ");
  return text.length > 180 ? `${text.slice(0, 180).trim()}...` : text;
}

function thesisFor(slug, fallback = "") {
  return articleThesesBySlug.get(slug) || fallback;
}

function readingTime(markdown) {
  const words = stripFrontmatter(markdown).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 220));
}

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scriptJson(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function linkResearcherNames(html) {
  const researcherAliases = researcherRows
    .filter((researcher) => researcher.name && researcher.name.length > 4)
    .flatMap((researcher) => {
      const aliases = new Set([researcher.name]);
      aliases.add(researcher.name.replace(/\s+[A-Z]\.\s+/g, " "));
      return [...aliases].map((name) => ({ name, researcher }));
    })
    .filter((entry) => entry.name && entry.name.length > 4)
    .sort((a, b) => b.name.length - a.name.length || a.name.localeCompare(b.name));
  if (!researcherAliases.length) return html;

  let anchorDepth = 0;
  let codeDepth = 0;
  return html.split(/(<[^>]+>)/g).map((token) => {
    if (!token) return token;
    if (token.startsWith("<")) {
      const tag = token.toLowerCase();
      if (/^<a\b/.test(tag)) anchorDepth += 1;
      if (/^<\/a\b/.test(tag)) anchorDepth = Math.max(0, anchorDepth - 1);
      if (/^<code\b/.test(tag)) codeDepth += 1;
      if (/^<\/code\b/.test(tag)) codeDepth = Math.max(0, codeDepth - 1);
      return token;
    }
    if (anchorDepth || codeDepth) return token;

    return researcherAliases.reduce((text, entry) => {
      const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])(${escapeRegExp(entry.name)})(?=$|[^\\p{L}\\p{N}_])`, "gu");
      return text.replace(pattern, `$1<a href="${researcherRoute(entry.researcher)}" class="researcher-link">$2</a>`);
    }, token);
  }).join("");
}

function inlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\[([^\]]+)\]\((\.\/[^)]+|\/[^)]+|https?:\/\/[^)]+)\)/g, (_, label, href) => {
    const route = href.startsWith("./")
      ? routeByMarkdown.get(path.normalize(path.join("articles/readable/markdown", href.replace("./", "")))) || "#"
      : href;
    return `<a href="${route}">${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = linkResearcherNames(html);
  return html;
}

function markdownToHtml(markdown) {
  const lines = stripFrontmatter(markdown).split("\n");
  const out = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    out.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    out.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line === "---") {
      flushParagraph();
      flushList();
      out.push("<hr>");
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(3, heading[1].length);
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      out.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return out.join("\n");
}

function splitValues(value = "") {
  return value.split(";").map((item) => item.trim()).filter(Boolean);
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(value = "") {
  return value.replaceAll("_", " ").replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function routeFromPublic(publicUrl) {
  return publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
}

function tagLink(tag) {
  const slug = tagSlugs.get(tag) || slugify(tag);
  return `/research/themes/${slug}/`;
}

function actLink(act) {
  return `/research/issue-1/#${act.id}`;
}

function actRange(articles) {
  if (!articles.length) return "";
  const numbers = articles.map((article) => Number.parseInt(article.article_number, 10)).filter(Number.isFinite);
  if (!numbers.length) return "";
  const first = Math.min(...numbers);
  const last = Math.max(...numbers);
  return first === last ? `Essay ${first}` : `Essays ${first}-${last}`;
}

function essayLabel(article) {
  return article.article_number ? `Essay ${article.article_number}` : "Companion Essay";
}

function essayReferenceLabel(value = "") {
  return value.replace(/^Article\s+(\d+)$/i, "Essay $1");
}

function companionEssayRoute(slug) {
  return `/research/companion-essays/${slug}/`;
}

function researchNoteRoute(row) {
  return `/research/notes/${row.note_id.replace(/^note-/, "")}/`;
}

function researcherRoute(row) {
  return `/research/researchers/${row.researcher_id}/`;
}

const issueJourneyActs = [
  {
    label: "I",
    title: "The Environment Shapes the Mind",
    dockTitle: "Environment",
    meta: "space / light / rhythm",
    target: "act-environment-shapes-mind",
    description: "Performance begins in the conditions around us: space, light, rhythm, sound, and atmosphere.",
  },
  {
    label: "II",
    title: "The Brain as a Predictive Organism",
    dockTitle: "Prediction",
    meta: "brain / body / signal",
    target: "act-predictive-organism",
    description: "The nervous system anticipates, tests, adapts, and learns through the signals around it.",
  },
  {
    label: "III",
    title: "Flow and State Engineering",
    dockTitle: "Flow + State",
    meta: "attention / synchrony",
    target: "act-state-engineering",
    description: "Flow emerges when attention, rhythm, feedback, and group synchrony reduce friction around action.",
  },
  {
    label: "IV",
    title: "The Future",
    dockTitle: "Future",
    meta: "adaptive rooms",
    target: "act-future",
    description: "The future is environmental: adaptive rooms, coherent sensory systems, and technologies that shape human state.",
  },
];

function issueJourneyDock() {
  const links = issueJourneyActs.map((act, index) => `<a class="${index === 0 ? "active" : ""}" href="#${act.target}" data-journey-dock-link data-target="${act.target}" title="${escapeHtml(act.title)}"><span>${act.label}</span>${escapeHtml(act.dockTitle || act.title)}</a>`).join("");
  return `<nav class="issue-journey-dock" data-journey-dock aria-label="Issue journey">
    <strong>Issue path</strong>
    ${links}
  </nav>`;
}

function artifact(kind = "curve", title = "Session state", label = "") {
  if (kind === "state-design") {
    const points = issueJourneyActs.map((act, index) => `<button class="journey-point journey-point-${index + 1}${index === 0 ? " active" : ""}" type="button" data-journey-point data-target="${act.target}" data-title="${escapeHtml(act.title)}" data-description="${escapeHtml(act.description)}" aria-controls="journey-detail" aria-expanded="${index === 0 ? "true" : "false"}"><span>${act.label}</span><strong>${escapeHtml(act.title)}</strong><small>${escapeHtml(act.meta)}</small></button>`).join("");
    return `<div class="artifact journey-artifact is-ready" data-journey-artifact aria-label="Issue 1 journey path">
      <div class="artifact-label">Issue 1 / journey path</div>
      <div class="journey-map">
        <svg class="journey-route" viewBox="0 0 520 360" preserveAspectRatio="none" focusable="false">
          <path class="journey-route-shadow" d="M54 306 C118 250 72 187 150 155 C231 121 230 58 322 75 C405 91 379 174 458 202 C498 216 489 264 452 304"></path>
          <path class="journey-route-line" d="M54 306 C118 250 72 187 150 155 C231 121 230 58 322 75 C405 91 379 174 458 202 C498 216 489 264 452 304"></path>
        </svg>
        ${points}
      </div>
      <div class="journey-detail" id="journey-detail" data-journey-detail aria-live="polite">
        <span>Act I</span>
        <h2>Environment</h2>
        <p>Performance begins in the conditions around us: space, light, rhythm, sound, and atmosphere.</p>
      </div>
      <div class="journey-compass"><span>Begin with conditions</span><button class="journey-tour" type="button" data-journey-tour>Discover</button><span>Arrive at design</span></div>
    </div>`;
  }
  if (kind === "split-room") {
    return `<div class="artifact" aria-label="Split room comparison">
      <div class="artifact-label">Visual artifact / room state comparison</div>
      <div class="room-split">
        <div class="room noisy"><strong>Fragmented</strong><span>Light, sound, instruction and attention compete.</span></div>
        <div class="room coherent"><strong>Coherent</strong><span>Signals support one behavioural objective.</span></div>
      </div>
    </div>`;
  }
  if (["stem-stack", "measurement-stack", "invisible-tech"].includes(kind)) {
    const labels = kind === "measurement-stack"
      ? ["Self-report", "HRV", "EDA", "Gaze", "Synchrony"]
      : kind === "invisible-tech"
        ? ["Author", "Prepare", "Perform", "Adapt", "Disappear"]
        : ["Pulse", "Bass", "Breath", "Cue", "Group"];
    return `<div class="artifact" aria-label="${escapeHtml(title)} visual stack">
      <div class="artifact-label">${escapeHtml(title)} / signal stack</div>
      <div class="stem-stack">${labels.map((label, index) => `<div><div class="stem"><span style="--w:${44 + index * 10}%; --c:${["var(--teal)", "var(--gold)", "var(--rose)", "var(--violet)", "var(--green)"][index % 5]}"></span></div><div class="curve-labels" style="position:static;margin-top:6px"><span>${label}</span></div></div>`).join("")}</div>
    </div>`;
  }
  if (["prediction-loop", "coherence-board", "system-map", "attention-map", "awe-scale"].includes(kind)) {
    const nodes = kind === "coherence-board"
      ? ["Light", "Rhythm", "Voice", "Breath", "Space"]
      : kind === "system-map"
        ? ["Brain", "Body", "Room", "Teacher", "Time"]
        : kind === "attention-map"
          ? ["Cue", "Gaze", "Quiet", "Action", "Learning"]
          : kind === "awe-scale"
            ? ["Vastness", "Attention", "Meaning", "Scale", "Return"]
            : ["Cue", "Prediction", "Movement", "Error", "Learning"];
    const positions = [["5%","12%"],["55%","8%"],["32%","38%"],["10%","68%"],["62%","66%"]];
    return `<div class="artifact" aria-label="${escapeHtml(title)} concept model">
      <div class="artifact-label">${escapeHtml(title)} / concept model</div>
      <div class="artifact-nodes">${nodes.map((node, index) => `<div class="node" style="left:${positions[index][0]};top:${positions[index][1]}">${node}<small>${index === 2 ? "state shift" : "signal"}</small></div>`).join("")}</div>
    </div>`;
  }
  const displayLabel = label || `${title} / class arc`;
  return `<div class="artifact" aria-label="${escapeHtml(title)} flow curve">
    <div class="artifact-label">${escapeHtml(displayLabel)}</div>
    <div class="curve"></div>
    <div class="curve-labels"><span>Ground</span><span>Build</span><span>Peak</span><span>Settle</span></div>
  </div>`;
}

function layout({
  title,
  description = "",
  body,
  current = "Research",
  brandSub = "Research Journal Issue 1",
  brandHref = "/research/",
  titleSuffix = "Sansara Research",
  section = "research",
  bodyClass = "",
}) {
  const progressBar = section === "research" ? `<div class="reading-progress" data-progress aria-hidden="true"></div>` : "";
  const currentReading = section === "research" ? `<aside class="currently-reading" data-current-reading aria-live="polite">
    <span>Currently reading</span>
    <strong>Research</strong>
    <small>0%</small>
  </aside>` : "";
  const researchSubnav = section === "research" ? `<nav class="section-nav" aria-label="Research navigation">
    <a href="/research/issue-1/">Issue 1</a>
    <a href="/research/themes/">Themes</a>
    <a href="/research/sensory-map/">Sensory map</a>
    <a href="/research/timeline/">Timeline</a>
    <a href="/research/notes/">Notes</a>
    <a href="/research/researchers/">Researchers</a>
  </nav>` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - ${escapeHtml(titleSuffix)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ""}>
  <div class="site-shell">
    ${progressBar}
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="${escapeHtml(brandHref)}">
          <img class="brand-logo" src="/assets/brain-innovation-house-logo-white.png" alt="Brain Innovation House">
          <span class="brand-sub">${escapeHtml(brandSub)}</span>
        </a>
        <nav class="nav" aria-label="Primary navigation">
          ${primaryNav.map(([label, href]) => `<a href="${href}">${label}</a>`).join("\n          ")}
        </nav>
      </div>
    </header>
    ${researchSubnav}
    ${body}
    ${currentReading}
    <footer class="footer">
      <div class="footer-inner">
        <span>Design the whole room, not just the playlist.</span>
        <span>${escapeHtml(current)}</span>
      </div>
    </footer>
  </div>
  <script src="/assets/app.js"></script>
</body>
</html>`;
}

function trainingModuleCard({ label, title, description, items }) {
  return `<article class="training-module">
    <span>${escapeHtml(label)}</span>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(description)}</p>
    <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
  </article>`;
}

function siteFeatureCard({ eyebrow, title, description, href }) {
  return `<a class="site-feature-card" href="${escapeHtml(href)}">
    <span>${escapeHtml(eyebrow)}</span>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(description)}</p>
  </a>`;
}

function siteHomePage() {
  const researchFilterHref = (filter) => `/research/home/?filter=${encodeURIComponent(filter)}#research-tools`;
  const features = [
    {
      eyebrow: "Build",
      title: "Interactive Flow",
      description: "A future-facing class design surface for composing breath, movement, rhythm, energy and atmosphere.",
      href: "/interactive-flow/",
    },
    {
      eyebrow: "Learn",
      title: "Instruction Manual",
      description: "The practical operating language for teachers, studios and collaborators using the Sansara method.",
      href: "/instruction-manual/",
    },
    {
      eyebrow: "Train",
      title: "Training Program",
      description: "A teacher workshop for designing complete class arcs through breath, rhythm, movement, attention and environment.",
      href: "/training/",
    },
    {
      eyebrow: "Think",
      title: "Research Journal",
      description: "Issue 1, research areas, sensory map, timeline and notes all live inside the research section.",
      href: "/research/",
    },
  ].map(siteFeatureCard).join("");
  const stateLinks = [
    ["State Engineering", "/research/designing-human-states/state-engineering/"],
    ["Flow State", researchFilterHref("Flow State")],
    ["Breath & Nervous System", researchFilterHref("Breath & Nervous System")],
    ["Rhythm & Entrainment", researchFilterHref("Rhythm & Entrainment")],
    ["Light & Perception", researchFilterHref("Light & Perception")],
    ["Music & Emotion", researchFilterHref("Music & Emotion")],
  ].map(([label, href], index) => `<a class="button${index === 0 ? " primary" : ""}" href="${href}">${label}</a>`).join("");
  const body = `<main>
    <section class="hero site-hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Sansara</div>
          <h1>Design states, not just sessions.</h1>
          <p class="lead">A system for immersive yoga and human-state design: research, training, interactive flow building, and practical instruction in one place.</p>
          <p class="thesis">Founder-led across London and Beirut, Sansara brings neuroscience, yoga, software, music, light and AI media into one practical method.</p>
          <div class="hero-actions">
            <a class="button primary" href="/#collaborate">Meet the founders</a>
            <a class="button" href="/research/">Open research</a>
          </div>
        </div>
        ${artifact("system-map", "Sansara system")}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>What Sansara Is</h2>
          <p>A state-design system for immersive yoga: part method, part platform, part research translation layer.</p>
        </div>
        <div class="site-feature-grid">${features}</div>
      </div>
    </section>
    <section class="band" id="collaborate">
      <div class="band-inner training-lead-grid">
        <div>
          <div class="eyebrow">Founder collaboration</div>
          <h2>Anastasia Smirnova and Alexandre Khoury.</h2>
          <p>Sansara is built by Brain Innovation House in London and BC Studios in Beirut: neuroscience, software, yoga, music, light and immersive media working as one operating team.</p>
          <div class="hero-actions">
            <a class="button primary" href="/#contact">Start a collaboration</a>
            <a class="button" href="/research/">Read the research</a>
          </div>
        </div>
        <div class="site-feature-grid">
          <div class="site-feature-card">
            <span>London</span>
            <h3>Anastasia Smirnova</h3>
            <p>Neuroscientist, software engineer, yoga teacher, and founder of Brain Innovation House.</p>
          </div>
          <div class="site-feature-card">
            <span>Beirut</span>
            <h3>Alexandre Khoury</h3>
            <p>Creative technologist, media innovator, and founder of BC Studios.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="band" id="state-design">
      <div class="band-inner">
        <div class="section-head">
          <h2>State Design</h2>
          <p>State design shapes rhythm, movement, breath, music, light and space so classes can support attention, regulation, connection, recovery and flow.</p>
        </div>
        <div class="hero-actions">${stateLinks}</div>
      </div>
    </section>
    <section class="band" id="contact">
      <div class="band-inner training-lead-grid">
        <div>
          <div class="eyebrow">Get in touch</div>
          <h2>Start the conversation.</h2>
          <p>Bring Sansara into a studio, collaborate on research, or ask about teacher training and immersive class design.</p>
        </div>
        <form class="lead-form" data-training-form data-mailto="hello@sansara.yoga">
          <label>Name <input name="name" autocomplete="name" required></label>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>What are you interested in? <select name="background">
            <option>Join waiting list</option>
            <option>Studio collaboration</option>
            <option>Teacher training</option>
            <option>Research collaboration</option>
          </select></label>
          <label>Message <textarea name="message" rows="4" placeholder="Tell us what you want to explore."></textarea></label>
          <button class="button primary" type="submit">Send note</button>
          <p class="form-note">This opens an email draft so your note can be sent directly.</p>
        </form>
      </div>
    </section>
  </main>`;
  return layout({
    title: "Home",
    description: "Sansara home: research, training, interactive flow, instruction manual, and collaboration.",
    body,
    current: "Sansara",
    brandSub: "Human State Design",
    brandHref: "/",
    titleSuffix: "Sansara",
    section: "site",
  });
}

function placeholderPage({ title, eyebrow, lead, thesis }) {
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">${escapeHtml(eyebrow)}</div>
          <h1>${escapeHtml(title)}</h1>
          <p class="lead">${escapeHtml(lead)}</p>
          <p class="thesis">${escapeHtml(thesis)}</p>
          <div class="hero-actions">
            <a class="button primary" href="/#collaborate">Join / collaborate</a>
            <a class="button" href="/research/">Open research</a>
          </div>
        </div>
        ${artifact("system-map", title)}
      </div>
    </section>
  </main>`;
  return layout({
    title,
    description: lead,
    body,
    current: title,
    brandSub: "Human State Design",
    brandHref: "/",
    titleSuffix: "Sansara",
    section: "site",
  });
}

function trainingProgramPage() {
  const modules = [
    {
      label: "Foundation",
      title: "Embodied practice",
      description: "Learn the essential teaching ground before adding technology or atmosphere.",
      items: ["Asana families, adaptations, and contraindications", "Breath mechanics and nervous-system literacy", "Cueing that keeps sensation and safety in the foreground"],
    },
    {
      label: "Method",
      title: "4BEAT calibration",
      description: "Use music as timing infrastructure without forcing students into mechanical counts.",
      items: ["Map breath cycles to BPM and breaths per minute", "Choose pacing for grounding, activation, peak, and recovery", "Teach inhale, exhale, transition, and stillness as one rhythm"],
    },
    {
      label: "Design",
      title: "Flow architecture",
      description: "Build classes as coherent state arcs instead of lists of disconnected poses.",
      items: ["Arrival, warm-up, standing, peak, floor, and integration chapters", "Energy curve design for low, rising, peak, and descending phases", "Transition-based sequencing with clear intention"],
    },
    {
      label: "Experience",
      title: "Music, light, and room state",
      description: "Shape the environment as part of responsible teaching, not as decoration.",
      items: ["Scene literacy: Dry, Beat, Original, Peak, Peak Plus, and Bliss", "When to use stable light, dynamic light, or silence", "How atmosphere supports attention, regulation, and focus"],
    },
    {
      label: "Product",
      title: "Sansara app practicum",
      description: "Use the app as a creative instrument for planning, rehearsal, and delivery.",
      items: ["Flow Builder, sets, pose library, and natural-language drafts", "Energy curve, music mapping, lighting controls, Remote, and Up Next", "Export, import, revise, and share teaching work"],
    },
    {
      label: "Delivery",
      title: "Teaching practicum",
      description: "Leave with practiced material, feedback, and a repeatable professional process.",
      items: ["Teaching practice with peer feedback and mentor review", "Relay teaching rounds for cueing, transitions, and handoffs", "One signature class draft plus clear next steps"],
    },
  ];

  const outcomes = [
    ["A complete teaching framework", "A state-based method for designing breath, movement, music, light, and rest into one class arc."],
    ["A signature class draft", "A workshop-built flow, plus the language to explain the intention behind each choice."],
    ["App fluency", "Confidence building, running, revising, exporting, and adapting classes through Sansara."],
    ["Professional readiness", "Teaching practice, relay teaching, safety, scope, ethics, studio delivery, and feedback-based assessment."],
  ];

  const eventDetails = [
    ["Dates", "August 28-29"],
    ["Venue", "Namat Beirut"],
    ["Location", "Waterfront City"],
    ["Format", "Two-day in-person workshop"],
  ];

  const audience = [
    ["Yoga teachers", "Teachers who want stronger class arcs, clearer cueing, and more intentional sensory design."],
    ["Studio owners", "Operators building premium workshop formats, signature classes, or teacher development programs."],
    ["Experience creators", "Movement, music, light, and wellness creators designing immersive group experiences."],
  ];

  const trustPoints = [
    ["Built from practice", "The workshop stays rooted in yoga teaching, live delivery, and responsible facilitation."],
    ["Backed by research language", "Sansara translates nervous-system literacy, rhythm, light, attention, and state design into practical teaching choices."],
    ["Supported by tools", "Participants work with Sansara planning language and app workflows so the method can be reused after the weekend."],
  ];

  const body = `<main class="training-page">
    <section class="training-hero" style="--hero-image:url('/assets/training-hero-teachers-light.png')">
      <div class="training-hero-inner">
          <div class="eyebrow">Two-day workshop</div>
        <h1>Sansara Teacher Workshop</h1>
        <p class="lead">A two-day teacher workshop for designing unforgettable yoga classes through breath, music, movement, light, and state.</p>
        <p class="training-hero-copy">August 28-29 at Namat Beirut, Waterfront City. Leave with a complete signature class, a practical state-design framework, and tools you can use immediately in your teaching.</p>
        <div class="hero-actions">
          <a class="button primary" href="#inquiry">Apply for August 28-29</a>
          <a class="button" href="#inside">See the curriculum</a>
        </div>
        <div class="training-hero-proof" aria-label="Program highlights">
          <span>August 28-29</span>
          <span>Namat Beirut</span>
          <span>Waterfront City</span>
          <span>4BEAT method</span>
          <span>App practicum</span>
          <span>Teaching lab</span>
        </div>
      </div>
    </section>

    <section class="band training-event">
      <div class="band-inner">
        <div class="training-detail-grid" aria-label="Workshop details">
          ${eventDetails.map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="band training-intro">
      <div class="band-inner training-intro-grid">
        <div>
          <div class="eyebrow">Core proposition</div>
          <h2>We train teachers to design the whole experience.</h2>
        </div>
        <div class="training-intro-copy">
          <p>Sansara treats class design as state design. Breath sets the internal rhythm. Music provides an external regulator. Light shapes the room. Movement expresses the arc. Awareness is the outcome.</p>
          <p>The training keeps yoga practice at the center while giving teachers a modern, agnostic language for sensation, nervous-system literacy, sequencing, ethics, and immersive delivery.</p>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Who It's For</h2>
          <p>For teachers and studio teams who want a more complete class-design language, not another disconnected technique list.</p>
        </div>
        <div class="training-audience-grid">
          ${audience.map(([title, text]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="band" id="inside">
      <div class="band-inner">
        <div class="section-head">
          <h2>What's Inside</h2>
          <p>The workshop moves from embodied practice to experience design to live delivery, so participants can teach with clarity instead of hiding behind complexity.</p>
        </div>
        <div class="training-module-grid">${modules.map(trainingModuleCard).join("")}</div>
      </div>
    </section>

    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>How The Arc Works</h2>
          <p>Every Sansara class has a felt shape: arrival, activation, expression, peak, descent, and integration.</p>
        </div>
        <div class="training-arc" aria-label="Sansara class arc">
          <div class="training-arc-curve"></div>
          ${["Arrive", "Warm", "Activate", "Peak", "Integrate"].map((label, index) => `<div class="training-arc-step" style="--i:${index}"><strong>${label}</strong><span>${["Dry / breath", "Beat / rhythm", "Original / expression", "Peak+ / intensity", "Bliss / recovery"][index]}</span></div>`).join("")}
        </div>
      </div>
    </section>

    <section class="band">
      <div class="band-inner training-outcomes">
        <div>
          <div class="eyebrow">Leave with</div>
          <h2>Real teaching assets, not only theory.</h2>
          <p>The two-day curriculum focuses on Sansara's differentiator: breath-music calibration, energy curves, light-aware room design, and app-supported flow planning for teachers who want immediately usable class-design tools.</p>
        </div>
        <div class="training-outcome-list">
          ${outcomes.map(([title, text]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="band training-trust">
      <div class="band-inner">
        <div class="section-head">
          <h2>Why Sansara</h2>
          <p>The method connects embodied teaching, room design, rhythm, light, and app-supported planning without turning yoga into a technical performance.</p>
        </div>
        <div class="training-audience-grid">
          ${trustPoints.map(([title, text]) => `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join("")}
        </div>
      </div>
    </section>

    <section class="band" id="inquiry">
      <div class="band-inner training-lead-grid">
        <div>
          <div class="eyebrow">Workshop inquiry</div>
          <h2>Apply for August 28-29.</h2>
          <p>The next two-day workshop runs August 28-29 at Namat Beirut, Waterfront City. Tell us where you are in your teaching path and what kind of classes you want to build, and we will send the Beirut workshop pack.</p>
        </div>
        <form class="lead-form" data-training-form data-mailto="hello@sansara.yoga">
          <label>Name <input name="name" autocomplete="name" required></label>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Teaching background <select name="background">
            <option>New teacher</option>
            <option>Certified yoga teacher</option>
            <option>Studio owner / operator</option>
            <option>Immersive experience creator</option>
          </select></label>
          <label>What are you interested in? <textarea name="message" rows="4" placeholder="Tell us about your teaching goals and the class experience you want to build."></textarea></label>
          <button class="button primary" type="submit">Send me the workshop pack</button>
          <p class="form-note">This opens an email draft so your note can be sent directly.</p>
        </form>
      </div>
    </section>
  </main>`;

  return layout({
    title: "Teacher Workshop",
    description: "Sansara teacher workshop: a two-day, breath-led, music-driven, light-aware format for state-based class design.",
    body,
    current: "Teacher workshop",
    brandSub: "Teacher Workshop",
    brandHref: "/training/",
    titleSuffix: "Sansara",
    section: "site",
    bodyClass: "training-shell",
  });
}

function aliasPage({ title, target }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}">
  <link rel="canonical" href="${escapeHtml(target)}">
  <title>${escapeHtml(title)} moved - Sansara Research</title>
  <script>window.location.replace(${JSON.stringify(target)});</script>
</head>
<body>
  <main>
    <p>${escapeHtml(title)} has moved to <a href="${escapeHtml(target)}">${escapeHtml(target)}</a>.</p>
  </main>
</body>
</html>`;
}

function contentActions({
  href,
  readLabel = "Read",
  bookmarkLabel = "Bookmark",
  savedLabel = "Bookmarked",
  readFlagLabel = "Read already",
  readSavedLabel = "Read",
}) {
  return `<div class="article-card-actions">
      <a class="mini-button" href="${escapeHtml(href)}">${escapeHtml(readLabel)}</a>
      <button class="mini-button" type="button" data-bookmark="${escapeHtml(href)}" data-bookmark-label="${escapeHtml(bookmarkLabel)}" data-bookmark-saved-label="${escapeHtml(savedLabel)}">${escapeHtml(bookmarkLabel)}</button>
      <button class="mini-button" type="button" data-read-flag="${escapeHtml(href)}" data-read-label="${escapeHtml(readFlagLabel)}" data-read-saved-label="${escapeHtml(readSavedLabel)}">${escapeHtml(readFlagLabel)}</button>
    </div>`;
}

function articleCard(article) {
  const tags = article.tags.join("|");
  const preview = articlePreview(article);
  return `<article class="article-card" data-article-card data-content-card data-tags="${escapeHtml(tags)}" data-title="${escapeHtml(article.title)}" data-route="${escapeHtml(article.route)}" tabindex="0">
    <div class="card-top"><span>${escapeHtml(essayLabel(article))} · ${article.minutes} min</span><span class="status">${article.status.replaceAll("_", " ")}</span></div>
    <h3><a href="${article.route}">${escapeHtml(article.title)}</a></h3>
    <p>${escapeHtml(article.thesis)}</p>
    <div class="article-card-actions">
      <button class="mini-button" type="button" data-preview-toggle>Preview</button>
      <a class="mini-button" href="${escapeHtml(article.route)}">Read</a>
      <button class="mini-button" type="button" data-bookmark="${escapeHtml(article.route)}" data-bookmark-label="Bookmark" data-bookmark-saved-label="Bookmarked">Bookmark</button>
      <button class="mini-button" type="button" data-read-flag="${escapeHtml(article.route)}" data-read-label="Read already" data-read-saved-label="Read">Read already</button>
    </div>
    <div class="article-preview" hidden data-preview>
      ${preview.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <a class="inline-read-link" href="${article.route}">Open full essay</a>
    </div>
    <div class="tag-row">${article.tags.slice(0, 3).map((tag) => `<a class="tag" href="${tagLink(tag)}" data-filter-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</a>`).join("")}</div>
  </article>`;
}

function articlePreview(article) {
  return articleBodyMarkdown(article.markdown, article.title)
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>-]/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 80)
    .slice(0, 2);
}

function sensoryNodeLink(row) {
  return `<a class="tag" href="/research/sensory-map/#${escapeHtml(row.node_id)}">${escapeHtml(row.label)}</a>`;
}

function sensoryNodesForArticle(article) {
  const directNodes = sensoryRows.filter((row) => splitValues(row.article_bridges).includes(article.slug));
  if (directNodes.length) return directNodes;
  return sensoryRows.filter((row) => {
    const bridges = splitValues(row.public_tag_bridges);
    return article.tags.some((tag) => bridges.includes(tag));
  }).slice(0, 5);
}

function sensoryNodesForTag(tag) {
  return sensoryRows.filter((row) => splitValues(row.public_tag_bridges).includes(tag));
}

function sensoryFingerprint(nodes) {
  if (!nodes.length) return "";
  const linkedSystems = [...new Set(nodes.flatMap((row) => splitValues(row.linked_systems)))].slice(0, 6);
  const outcomes = [...new Set(nodes.flatMap((row) => splitValues(row.state_outcomes)))].slice(0, 6);
  return `<div class="sensory-fingerprint">
    <div>
      <h3>Map nodes</h3>
      <div class="tag-row">${nodes.slice(0, 6).map(sensoryNodeLink).join("")}</div>
    </div>
    <div>
      <h3>Linked systems</h3>
      <p>${escapeHtml(linkedSystems.join("; "))}</p>
    </div>
    <div>
      <h3>State outcomes</h3>
      <p>${escapeHtml(outcomes.join("; "))}</p>
    </div>
  </div>`;
}

function themeProfileFor(tag) {
  return themeProfiles[tag] || {
    question: "How does this pathway shape the state of practice?",
    why: tagDescriptions[tag] || "A pathway through the Sansara research journal.",
    startSlugs: [],
  };
}

function uniqueNodeValues(nodes, key, limit = 6) {
  return [...new Set(nodes.flatMap((row) => splitValues(row[key])))].slice(0, limit);
}

function themeBrief(tag, nodes, tagged) {
  const profile = themeProfileFor(tag);
  const dimensions = uniqueNodeValues(nodes, "sensory_dimensions", 5);
  const systems = uniqueNodeValues(nodes, "linked_systems", 5);
  const outcomes = uniqueNodeValues(nodes, "state_outcomes", 5);
  const coreCount = tagged.filter((article) => primaryTheme(article) === tag).length;
  const intersectionCount = Math.max(0, tagged.length - coreCount);
  return `<div class="theme-brief">
    <article class="theme-brief-card theme-brief-card-main">
      <span>Question</span>
      <h2>${escapeHtml(profile.question)}</h2>
      <p>${escapeHtml(profile.why)}</p>
    </article>
    <article class="theme-brief-card">
      <span>Signals</span>
      <p>${escapeHtml(dimensions.join("; ") || "Mapped through the sensory system.")}</p>
    </article>
    <article class="theme-brief-card">
      <span>Systems</span>
      <p>${escapeHtml(systems.join("; ") || "Linked biological and cognitive systems.")}</p>
    </article>
    <article class="theme-brief-card">
      <span>Designed States</span>
      <p>${escapeHtml(outcomes.join("; ") || "The states this theme helps make more likely.")}</p>
    </article>
    <article class="theme-brief-card">
      <span>Coverage</span>
      <p>${coreCount} core essays, ${intersectionCount} intersections, ${nodes.length} sensory map nodes. This is a pathway, not a duplicate archive.</p>
    </article>
  </div>`;
}

function compactArticleLink(article) {
  return `<a href="${article.route}"><span>${escapeHtml(essayLabel(article))}</span><strong>${escapeHtml(article.title)}</strong></a>`;
}

function primaryTheme(article) {
  return article.tags[0] || "";
}

function startHereArticles(tagged, tag) {
  const profile = themeProfileFor(tag);
  const bySlug = new Map(tagged.map((article) => [article.slug, article]));
  const selected = profile.startSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  if (selected.length) return selected;
  return tagged.filter((article) => article.article_number).slice(0, 4);
}

function themeArticlesFor(tag) {
  const profile = themeProfileFor(tag);
  const bySlug = new Map(allArticles.map((article) => [article.slug, article]));
  const curated = profile.startSlugs.map((slug) => bySlug.get(slug)).filter(Boolean);
  if (curated.length) return curated;
  return allArticles.filter((article) => article.tags.includes(tag)).slice(0, 5);
}

function articleLabel(article) {
  return essayLabel(article);
}

function articlesForSensoryRows(rows) {
  const slugs = rows.flatMap((row) => splitValues(row.article_bridges));
  const counts = slugs.reduce((acc, slug) => acc.set(slug, (acc.get(slug) || 0) + 1), new Map());
  return [...counts.entries()]
    .map(([slug, count]) => ({ article: allArticles.find((item) => item.slug === slug), count }))
    .filter((item) => item.article)
    .sort((a, b) => b.count - a.count || Number(a.article.article_number || 99) - Number(b.article.article_number || 99))
    .map((item) => item.article);
}

function researchNotesForSensoryNode(row) {
  const nodeTags = splitValues(row.public_tag_bridges);
  const nodeArticles = splitValues(row.article_bridges)
    .map((slug) => allArticles.find((article) => article.slug === slug))
    .filter(Boolean);
  return researchNoteRows
    .map((note) => {
      const noteTags = splitValues(note.related_tags);
      const tagScore = noteTags.filter((tag) => nodeTags.includes(tag)).length * 4;
      const articleScore = nodeArticles.filter((article) => noteReferencesArticle(note, article)).length * 3;
      const conceptScore = wordOverlapScore(row.label, note.concept) * 2 + wordOverlapScore(row.notes, note.core_question);
      return { note, score: tagScore + articleScore + conceptScore };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.note.concept.localeCompare(b.note.concept))
    .slice(0, 3)
    .map((item) => item.note);
}

function sensoryCanvas() {
  const nodePositions = new Map([
    ["environment", ["10%", "25%"]],
    ["light", ["30%", "16%"]],
    ["space", ["18%", "58%"]],
    ["rhythm", ["48%", "15%"]],
    ["sequence", ["64%", "32%"]],
    ["breath", ["34%", "78%"]],
    ["interoception", ["52%", "83%"]],
    ["sound", ["82%", "16%"]],
    ["music", ["88%", "43%"]],
    ["attention", ["82%", "60%"]],
    ["prediction-load", ["60%", "62%"]],
    ["synchrony", ["94%", "78%"]],
    ["teacher-presence", ["76%", "94%"]],
    ["coherence", ["40%", "43%"]],
  ]);
  const conceptLinks = [
    ["environment", "light"],
    ["environment", "space"],
    ["light", "coherence"],
    ["space", "prediction-load"],
    ["rhythm", "sequence"],
    ["rhythm", "synchrony"],
    ["sequence", "coherence"],
    ["breath", "interoception"],
    ["breath", "sequence"],
    ["interoception", "prediction-load"],
    ["sound", "music"],
    ["music", "rhythm"],
    ["sound", "teacher-presence"],
    ["attention", "prediction-load"],
    ["attention", "coherence"],
    ["synchrony", "teacher-presence"],
    ["synchrony", "coherence"],
    ["coherence", "environment"],
    ["coherence", "breath"],
  ];
  const point = (nodeId) => {
    const [left, top] = nodePositions.get(nodeId) || ["50%", "50%"];
    return [Number.parseFloat(left), Number.parseFloat(top)];
  };
  const lines = conceptLinks.map(([from, to]) => {
    const [x1, y1] = point(from);
    const [x2, y2] = point(to);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
  }).join("");
  const nodes = sensoryRows.map((row) => {
    const [left, top] = nodePositions.get(row.node_id) || ["50%", "50%"];
    const articles = articlesForSensoryRows([row]);
    const notes = researchNotesForSensoryNode(row);
    return `<a class="mind-node canvas-concept-node map-node-${escapeHtml(slugify(row.domain))}" id="${escapeHtml(row.node_id)}" href="${notes[0] ? researchNoteRoute(notes[0]) : "#note-discovery"}" style="--x:${left};--y:${top}">
      <strong>${escapeHtml(row.label)}</strong>
      <span>${escapeHtml(splitValues(row.state_outcomes).slice(0, 2).join(" + "))}</span>
      <small>${articles.length} essays · ${notes.length} notes</small>
    </a>`;
  }).join("");
  const noteCards = researchNoteRows.map((note) => {
    const linkedNodes = sensoryNodesForNote(note, null).slice(0, 4);
    return `<a class="canvas-note-card" href="${researchNoteRoute(note)}">
      <span>${escapeHtml(note.status)}</span>
      <strong>${escapeHtml(note.concept)}</strong>
      <small>${escapeHtml(note.core_question)}</small>
      <em>${linkedNodes.map((node) => escapeHtml(node.label)).join(" / ")}</em>
    </a>`;
  }).join("");
  return `<section class="sensory-canvas-shell" aria-label="Sensory concept canvas">
    <div class="sensory-canvas-copy">
      <div class="eyebrow">Concept canvas</div>
      <h2>Move by relationship, not category.</h2>
      <p>The map connects sensory variables to research notes. Click a concept to open the strongest note behind it, or use the note rail to browse the evidence base.</p>
    </div>
    <div class="concept-canvas">
      <svg class="mind-map-lines" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        ${lines}
        <path class="mind-map-route" d="M27 18 C36 22 43 32 50 48 C58 57 65 62 71 64"></path>
      </svg>
      <div class="map-region map-region-environment">Environment</div>
      <div class="map-region map-region-time">Time</div>
      <div class="map-region map-region-sound">Sound</div>
      <div class="map-region map-region-body">Body</div>
      <div class="map-region map-region-attention">Attention</div>
      <div class="map-region map-region-social">Social field</div>
      ${nodes}
    </div>
    <aside class="note-discovery-panel" id="note-discovery" aria-label="Research note discovery">
      <div class="note-panel-head">
        <span>Research Notes</span>
        <strong>${researchNoteRows.length} linked research notes</strong>
      </div>
      <div class="note-card-list">${noteCards}</div>
    </aside>
    <div class="canvas-lenses" aria-label="Map lenses">
      ${["light -> recovery -> attention", "rhythm -> synchrony -> flow", "breath -> regulation -> readiness", "space -> prediction load -> ease"].map((label) => `<span>${escapeHtml(label)}</span>`).join("")}
    </div>
  </section>`;
}

function sensoryMapPage() {
  const body = `<main>
    <section class="hero sensory-canvas-hero">
      <div class="hero-inner sensory-canvas-hero-inner">
        <div>
          <div class="eyebrow">Experience system</div>
          <h1>Sensory Map</h1>
          <p class="lead">A canvas for discovering how sensory concepts connect to research notes.</p>
          <p class="thesis">This is not a second taxonomy. It is the working map under the research: light, rhythm, breath, sound, space, attention, synchrony and the notes that explain them.</p>
          <div class="hero-actions">
            <a class="button primary" href="#note-discovery">Browse notes</a>
            <a class="button" href="/research/issue-1/">Open Issue 1</a>
          </div>
        </div>
      </div>
    </section>
    ${sensoryCanvas()}
  </main>`;
  return layout({ title: "Sensory Map", description: "Sensory ontology for Sansara research.", body, current: "Sensory map" });
}

function researchStat(label, value, href) {
  return `<a class="research-stat" href="${href}">
    <strong data-counter="${escapeHtml(String(value))}">0</strong>
    <span>${escapeHtml(label)}</span>
  </a>`;
}

function researchPortal({ title, href, eyebrow, description }) {
  return `<article class="research-portal" data-content-card tabindex="0">
    <div class="card-top"><span>${escapeHtml(eyebrow)}</span><span class="status">Open</span></div>
    <h3><a href="${href}">${escapeHtml(title)}</a></h3>
    <p>${escapeHtml(description)}</p>
    ${contentActions({ href, readLabel: "Read", bookmarkLabel: "Bookmark", savedLabel: "Bookmarked" })}
  </article>`;
}

function researchHomePage() {
  const featuredArticles = [1, 6, 7, 12]
    .map((number) => canonical.find((article) => String(article.article_number) === String(number)))
    .filter(Boolean);
  const timelinePreview = timelineRows.slice(-5).reverse().map(timelineItem).join("");
  const notePreview = researchNoteRows.slice(0, 6).map(researchNoteCard).join("");
  const areaPreview = [...tagSlugs.keys()].map((tag) => {
    const count = themeArticlesFor(tag).length;
    return `<a class="research-tag-card" href="${tagLink(tag)}">
      <strong>${escapeHtml(tag)}</strong>
      <span>${count} ${count === 1 ? "essay" : "essays"}</span>
      <small>${escapeHtml(tagDescriptions[tag] || "Research area")}</small>
    </a>`;
  }).join("");
  const portals = [
    {
      title: "Research Journal Issue 1",
      href: "/research/issue-1/",
      eyebrow: "Manifesto issue",
      description: "The manifesto issue: one coherent argument arranged in four acts.",
    },
    {
      title: "Sensory Map",
      href: "/research/sensory-map/",
      eyebrow: "Experience system",
      description: "The connected map of sensory variables, linked systems, and state outcomes.",
    },
    {
      title: "Timeline",
      href: "/research/timeline/",
      eyebrow: "Research lineage",
      description: "A chronological path through the discoveries and theories behind the journal.",
    },
    {
      title: "Research Notes",
      href: "/research/notes/",
      eyebrow: "Evidence base",
      description: "Source-backed notes that connect discoveries, theories, researchers, essays, and next editorial actions.",
    },
    {
      title: "Researchers",
      href: "/research/researchers/",
      eyebrow: "People",
      description: "Profiles for the scientists and theorists whose work anchors the research base.",
    },
  ].map(researchPortal).join("");
  const sidePreview = sideArticles
    .filter((item) => !item.slug.includes("designing-states") && !item.slug.includes("next-performance"))
    .map(articleCard)
    .join("");
  const searchIndex = [
    ...allArticles.map((article) => ({
      type: article.type === "canonical" ? "Issue essay" : "Companion essay",
      title: article.title,
      href: article.route,
      text: `${article.thesis} ${article.excerpt}`,
      tags: article.tags,
      minutes: article.minutes,
    })),
    ...researchNoteRows.map((note) => ({
      type: "Research note",
      title: note.concept,
      href: researchNoteRoute(note),
      text: `${note.core_question || ""} ${note.summary || ""}`,
      tags: splitValues(note.related_tags),
    })),
    ...researcherRows.map((researcher) => ({
      type: "Researcher",
      title: researcher.name,
      href: researcherRoute(researcher),
      text: `${researcher.field} ${researcher.known_for}`,
      tags: splitValues(researcher.primary_tags),
    })),
    ...[...tagSlugs.keys()].map((tag) => ({
      type: "Research area",
      title: tag,
      href: tagLink(tag),
      text: tagDescriptions[tag] || "",
      tags: [tag],
    })),
  ];
  const body = `<main>
    <section class="hero">
      <div class="hero-inner research-home-hero">
        <div>
          <div class="eyebrow">Research home</div>
          <h1>Research</h1>
          <p class="lead">Everything in the Sansara research system: Issue 1, companion essays, sensory map, timeline, notes, and researchers.</p>
          <p class="thesis">Use this page as the table of contents for the whole project. Issue 1 is the main argument; the other views help readers enter, trace, and extend it.</p>
          <div class="hero-actions">
            <a class="button primary" href="/research/issue-1/">Open Issue 1</a>
            <a class="button" href="/research/sensory-map/">Open sensory map</a>
          </div>
        </div>
        ${artifact("system-map", "Research system")}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="research-stats" aria-label="Research inventory">
          ${researchStat("issue essays", canonical.length, "/research/issue-1/")}
          ${researchStat("companion essays", sideArticles.length, "#companion-essays")}
          ${researchStat("research notes", researchNoteRows.length, "/research/notes/")}
          ${researchStat("timeline entries", timelineRows.length, "/research/timeline/")}
          ${researchStat("sensory nodes", sensoryRows.length, "/research/sensory-map/")}
        </div>
      </div>
    </section>
    <section class="band research-tools" id="research-tools">
      <div class="band-inner">
        <div class="research-tool-panel">
          <div class="section-head">
            <h2>Search the Research</h2>
            <p>Search across essays, companion pieces, notes, researchers, and research areas. Use tags to cross-filter the article cards.</p>
          </div>
          <div class="research-search-row">
            <label class="research-search">
              <span>Search</span>
              <input type="search" data-research-search placeholder="Try light, rhythm, flow, predictive brain...">
            </label>
            <button class="button primary" type="button" data-open-subscribe>Subscribe to journal</button>
          </div>
          <div class="filters research-tag-filters" aria-label="Research area filters">
            <button class="filter-chip active" type="button" data-filter="all">All</button>
            ${[...tagSlugs.keys()].map((tag) => `<button class="filter-chip" type="button" data-filter="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}
          </div>
          <div class="saved-research" data-saved-summary>Saved items: 0</div>
          <div class="search-results" data-search-results aria-live="polite"></div>
          <script type="application/json" data-search-index>${scriptJson(searchIndex)}</script>
        </div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Explore</h2>
          <p>Issue 1 is the central object. The map, timeline, notes, and researcher profiles are different ways to move through the same research system.</p>
        </div>
        <div class="research-portal-grid">${portals}</div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Featured Essays</h2>
          <p>A quick path through the spine: environment, sensory coherence, creative flow, and the capstone thesis.</p>
        </div>
        <div class="article-grid">${featuredArticles.map(articleCard).join("")}</div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Research Areas</h2>
          <p>Topic pathways into Issue 1 and its companion essays.</p>
        </div>
        <div class="research-tag-grid">${areaPreview}</div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Timeline Preview</h2>
          <p>Recent and future-facing entries from the research lineage.</p>
        </div>
        <div class="timeline">${timelinePreview}</div>
        <div class="hero-actions" style="margin-top:24px"><a class="button" href="/research/timeline/">Open full timeline</a></div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Research Notes Preview</h2>
          <p>Source-backed notes connect the polished essays to discoveries, theories, scientists, and editorial next steps.</p>
        </div>
        <div class="article-grid">${notePreview}</div>
        <div class="hero-actions" style="margin-top:24px"><a class="button" href="/research/notes/">Open all notes</a></div>
      </div>
    </section>
    <section class="band" id="companion-essays">
      <div class="band-inner">
        <div class="section-head">
          <h2>Companion Essays</h2>
          <p>Essay satellites, product philosophy, archive pieces, and alternate pathways into the Issue 1 argument.</p>
        </div>
        <div class="side-grid">${sidePreview}</div>
      </div>
    </section>
    <div class="journal-modal" data-subscribe-modal hidden>
      <div class="journal-modal-backdrop" data-close-subscribe></div>
      <form class="journal-subscribe" data-journal-subscribe>
        <button class="modal-close" type="button" data-close-subscribe aria-label="Close subscribe form">Close</button>
        <span class="eyebrow">Sansara Research Journal</span>
        <h2>Subscribe to the journal</h2>
        <p>Get new essays, notes, and research updates as the Sansara system develops.</p>
        <label>Name <input name="name" autocomplete="name"></label>
        <label>Email <input name="email" type="email" autocomplete="email" required></label>
        <label>Interest <select name="interest">
          <option>Research updates</option>
          <option>Teacher training</option>
          <option>Studio collaboration</option>
          <option>Investment / partnerships</option>
        </select></label>
        <button class="button primary" type="submit">Join mailing list</button>
        <p class="form-note" data-subscribe-note>Your email is saved locally here and prepared as an email draft for now.</p>
      </form>
    </div>
  </main>`;
  return layout({ title: "Research Home", description: "Home for the Sansara research journal, timeline, sensory map, notes, researchers, and essays.", body, current: "Research home" });
}

const articleActs = [
  {
    id: "act-environment-shapes-mind",
    label: "Act I",
    source: "Act I - The Environment Shapes the Mind",
    title: "The Environment Shapes the Mind",
    description: "Environment, light and rhythm become active conditions in human performance.",
  },
  {
    id: "act-predictive-organism",
    label: "Act II",
    source: "Act II - The Brain as a Predictive Organism",
    title: "The Brain as a Predictive Organism",
    description: "Prediction, interoception and sensory coherence explain why environments change experience.",
  },
  {
    id: "act-state-engineering",
    label: "Act III",
    source: "Act III - Flow and State Engineering",
    title: "Flow and State Engineering",
    description: "Collective flow, teacher attention and performance design move the argument into practice.",
  },
  {
    id: "act-future",
    label: "Act IV",
    source: "Act IV - The Future",
    title: "The Future",
    description: "Measurement and adaptive environments turn Issue 1 into a future-facing position.",
  },
];

function hubPage() {
  const canonicalCards = canonical.map(articleCard).join("");
  const sideCards = sideArticles.filter((item) => !item.slug.includes("designing-states") && !item.slug.includes("next-performance")).map(articleCard).join("");
  const actEntries = articleActs.map((act) => ({
    ...act,
    articles: canonical.filter((article) => article.act === act.source),
  }));
  const actMap = actEntries.map((act) => `<a class="act-map-card" href="#${act.id}">
    <span class="act-map-label">${act.label}</span>
    <strong>${escapeHtml(act.title)}</strong>
    <span class="act-map-meta">${escapeHtml(actRange(act.articles))} · ${act.articles.length} ${act.articles.length === 1 ? "essay" : "essays"}</span>
  </a>`).join("");
  const acts = actEntries.map((act) => {
    const rows = act.articles.map((article) => `<div class="act-row">
      <span class="act-num">${String(article.article_number).padStart(2, "0")}</span>
      <a class="act-title" href="${article.route}">${escapeHtml(article.title)}</a>
      <span class="act-meta">${article.minutes} min</span>
    </div>`).join("");
    return `<section class="act-group" id="${act.id}">
      <div class="act-group-head">
        <span class="act-num">${act.label}</span>
        <div>
          <h3>${escapeHtml(act.title)}</h3>
          <p>${escapeHtml(act.description)}</p>
        </div>
      </div>
      <div class="act-list">${rows}</div>
    </section>`;
  }).join("");
  const timelinePreview = timelineRows.slice(0, 6).map(timelineItem).join("");
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Designing Human States</div>
          <h1>Sansara</h1>
          <p class="lead">A cinematic research journal for immersive yoga, where breath, rhythm, light, attention and environment become tools for designing better human states.</p>
          <p class="thesis">Issue 1 is the manifesto. The essays are its chapters. The companion essays expand the field around it.</p>
          <div class="hero-actions">
            <a class="button primary" href="#series">Read Issue 1</a>
            <a class="button" href="/research/sensory-map/">Explore sensory map</a>
          </div>
        </div>
        ${artifact("coherence-board", "Sensory coherence")}
      </div>
    </section>
    <section class="band" id="series">
      <div class="band-inner">
        <div class="section-head">
          <h2>Issue Essays</h2>
          <p>${canonical.length} essays form the spine of Issue 1. Read them linearly as one manifesto, or filter by research area.</p>
        </div>
        <div class="filters" aria-label="Essay filters">
          <button class="filter-chip active" data-filter="all">All</button>
          ${[...tagSlugs.keys()].map((tag) => `<button class="filter-chip" data-filter="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join("")}
        </div>
        <div class="article-grid">${canonicalCards}</div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Acts</h2>
          <p>The essay spine is divided into four acts, so readers can enter by sequence or by conceptual movement.</p>
        </div>
        <nav class="act-map" aria-label="Jump to issue acts">${actMap}</nav>
        <div class="act-groups">${acts}</div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Research Timeline</h2>
          <p>The journal sits on a research lineage: perception, recovery, light biology, rhythm, flow, predictive processing, neuroaesthetics and measurement.</p>
        </div>
        <div class="timeline">${timelinePreview}</div>
        <div class="hero-actions" style="margin-top:24px"><a class="button" href="/research/timeline/">Open full timeline</a></div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Companion Essays</h2>
          <p>These essays orbit Issue 1 without competing with it. They deepen specific ideas, product philosophy, and field implications.</p>
        </div>
        <div class="side-grid">${sideCards}</div>
      </div>
    </section>
  </main>`;
  return layout({ title: "Designing Human States", description: "Sansara research journal for immersive yoga.", body, current: "Issue 1" });
}

function timelineItem(row) {
  return `<article class="timeline-item">
    <div class="timeline-year">${escapeHtml(row.date_label || row.year)}</div>
    <div class="timeline-card">
      <h3>${linkResearcherNames(escapeHtml(row.researcher_or_group))}</h3>
      <p>${escapeHtml(row.event)}</p>
      <div class="timeline-meta">
        ${timelineTopicTag(row)}
        ${timelineGroupTags(row)}
        ${timelineUsedInTags(row)}
      </div>
    </div>
  </article>`;
}

function timelinePage() {
  const grouped = timelineRows.map(timelineItem).join("");
  const linkedTimelineArticles = timelineRows.flatMap(timelineReferencedArticles);
  const uniqueTimelineArticles = new Map(linkedTimelineArticles.map((article) => [article.slug, article]));
  const timelineSourceIds = new Set(timelineRows.map((row) => row.source_id).filter(Boolean));
  const panel = evidencePanel({
    title: "Lineage Counts",
    eyebrow: "Research lineage",
    note: "Counts timeline entries directly; essay references are supporting connections, not extra entries.",
    stats: [
      evidenceStat("lineage entries", timelineRows.length),
      evidenceStat("linked essays", uniqueTimelineArticles.size, "/research/issue-1/"),
      evidenceStat("source records", timelineSourceIds.size, "/research/notes/"),
    ],
  });
  const body = `<main>
    <section class="hero">
      <div class="hero-inner timeline-hero-inner">
        <div>
          <div class="eyebrow">Research foundation</div>
          <h1>Research Timeline</h1>
          <p class="lead">A curated lineage of the discoveries, theories and experiments behind the Sansara journal.</p>
          <p class="thesis">Follow the ideas that connect perception, recovery, rhythm, flow, prediction and environmental design across Issue 1.</p>
        </div>
        ${panel}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Research Lineage</h2>
          <p>Each entry connects a landmark idea to the essays, research areas and design questions it supports.</p>
        </div>
        <div class="timeline">${grouped}</div>
      </div>
    </section>
  </main>`;
  return layout({ title: "Research Timeline", description: "Research timeline for Sansara Designing Human States.", body, current: "Research timeline" });
}

function sourceLabel(sourceId) {
  const reference = referencesById.get(sourceId);
  const source = sourceCandidatesById.get(sourceId);
  const title = reference?.title || source?.title_or_source;
  return title ? `${sourceId} - ${title}` : sourceId;
}

function sourceCitation(sourceId) {
  const reference = referencesById.get(sourceId);
  if (!reference) {
    return `<li><code>${escapeHtml(sourceLabel(sourceId))}</code></li>`;
  }

  const title = escapeHtml(reference.title);
  const href = reference.url || (reference.doi ? `https://doi.org/${reference.doi}` : "");
  const doiUrl = reference.doi ? `https://doi.org/${reference.doi}` : "";
  const externalLabel = href.includes("pubmed.ncbi.nlm.nih.gov") ? "PubMed" : href === doiUrl ? "DOI" : "Source page";
  const sourceLink = href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${externalLabel}</a>` : "";
  const meta = [reference.authors, reference.year, reference.journal_or_publisher]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");
  const doi = reference.doi && href !== doiUrl ? `<a href="${escapeHtml(doiUrl)}" target="_blank" rel="noopener noreferrer">DOI</a>` : "";
  const links = [sourceLink, doi].filter(Boolean).join("");
  return `<li>
    <h3>${title}</h3>
    <p class="source-meta">${meta}</p>
    <p>${escapeHtml(reference.short_summary)}</p>
    ${links ? `<div class="source-actions">${links}</div>` : ""}
  </li>`;
}

function notesForSourceId(sourceId) {
  return researchNoteRows.filter((note) => splitValues(note.source_ids).includes(sourceId));
}

function sourceResearchConnection(sourceId) {
  const reference = referencesById.get(sourceId);
  const linkedNotes = notesForSourceId(sourceId);
  if (!reference) {
    return `<li>
      <h3>${escapeHtml(sourceLabel(sourceId))}</h3>
      <p>${linkedNotes.length
        ? `Supports ${linkedNotes.map((note) => `<a href="${researchNoteRoute(note)}">${escapeHtml(note.concept)}</a>`).join("; ")}.`
        : "No research notes connected yet."}</p>
    </li>`;
  }

  const href = reference.url || (reference.doi ? `https://doi.org/${reference.doi}` : "");
  const title = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.title)}</a>`
    : escapeHtml(reference.title);
  const meta = [reference.authors, reference.year, reference.journal_or_publisher]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");
  const noteLinks = linkedNotes.map((note) => `<a href="${researchNoteRoute(note)}">${escapeHtml(note.concept)}</a>`).join("; ");
  return `<li>
    <h3>${title}</h3>
    <p class="source-meta">${meta}</p>
    <p>${noteLinks ? `Supports ${noteLinks}.` : "No research notes connected yet."}</p>
  </li>`;
}

function evidenceStat(label, value, href = "") {
  const content = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong>`;
  return href ? `<a class="evidence-stat" href="${href}">${content}</a>` : `<div class="evidence-stat">${content}</div>`;
}

function evidencePanel({ title, eyebrow = "Evidence", stats = [], links = [], note = "" }) {
  return `<aside class="evidence-panel" aria-label="${escapeHtml(title)} evidence summary">
    <div class="evidence-eyebrow">${escapeHtml(eyebrow)}</div>
    <h2>${escapeHtml(title)}</h2>
    ${note ? `<p>${escapeHtml(note)}</p>` : ""}
    <div class="evidence-stats">${stats.join("")}</div>
    ${links.length ? `<div class="evidence-links">${links.join("")}</div>` : ""}
  </aside>`;
}

function relatedArticleLinks(value = "") {
  return splitValues(value).map((item) => {
    const article = canonical.find((entry) => String(entry.article_number) === item)
      || allArticles.find((entry) => entry.title === item)
      || allArticles.find((entry) => entry.slug === slugify(item));
    return article ? `<a href="${article.route}">${escapeHtml(article.title)}</a>` : escapeHtml(item);
  }).join("");
}

function articleFromReference(value = "") {
  return canonical.find((entry) => String(entry.article_number) === value)
    || allArticles.find((entry) => entry.title === value)
    || allArticles.find((entry) => entry.slug === slugify(value));
}

function markdownSection(markdown, headingTitle) {
  const lines = stripFrontmatter(markdown).split("\n");
  const headingPattern = new RegExp(`^(#{1,6})\\s+${escapeRegExp(headingTitle)}\\s*$`, "i");
  const start = lines.findIndex((line) => headingPattern.test(line.trim()));
  if (start === -1) return "";

  const level = lines[start].trim().match(/^(#{1,6})/)?.[1].length ?? 2;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const heading = lines[index].trim().match(/^(#{1,6})\s+/);
    const headingText = lines[index].trim().replace(/^#{1,6}\s+/, "").trim();
    if (
      headingTitle.toLowerCase() === "research notes"
      && /^(open questions|related reading|key references)$/i.test(headingText)
    ) {
      end = index;
      break;
    }
    if (heading && heading[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function articleResearchNotesSection(row) {
  const preferredSlug = articleResearchNoteSources.get(row.note_id);
  const primaryArticle = (preferredSlug && allArticles.find((article) => article.slug === preferredSlug))
    || splitValues(row.related_articles).map(articleFromReference).find(Boolean);
  if (!primaryArticle) return "";

  const notesMarkdown = markdownSection(primaryArticle.markdown, "Research Notes");
  if (!notesMarkdown) return "";
  const noteWordCount = notesMarkdown.split(/\s+/).filter(Boolean).length;
  if (noteWordCount < 30) return "";

  return `<h2 id="article-research-notes">Article Research Notes</h2>
        <p class="source-meta">Extracted from <a href="${primaryArticle.route}">${escapeHtml(primaryArticle.title)}</a>.</p>
        ${markdownToHtml(notesMarkdown)}`;
}

function noteReferencesArticle(note, article) {
  return splitValues(note.related_articles).some((item) => {
    if (String(article.article_number) && item === String(article.article_number)) return true;
    if (item === article.title || slugify(item) === article.slug) return true;
    const linkedArticle = articleFromReference(item);
    return linkedArticle?.slug === article.slug;
  });
}

function researchersForSourceIds(sourceIds) {
  return researcherRows.filter((researcher) => {
    const researcherSourceIds = splitValues(researcher.key_source_ids);
    return sourceIds.some((sourceId) => researcherSourceIds.includes(sourceId));
  });
}

function sensoryNodesForNote(note, article) {
  const noteTags = splitValues(note.related_tags);
  const articleNodes = article ? sensoryNodesForArticle(article) : [];
  const tagNodes = sensoryRows.filter((row) => {
    const bridges = splitValues(row.public_tag_bridges);
    return noteTags.some((tag) => bridges.includes(tag));
  });
  const byId = new Map([...articleNodes, ...tagNodes].map((row) => [row.node_id, row]));
  return [...byId.values()].slice(0, 5);
}

function researchObjectsForArticle(article) {
  const explicitNotes = researchNoteRows
    .filter((note) => noteReferencesArticle(note, article))
    .map((note) => {
      const sourceIds = splitValues(note.source_ids);
      const researchers = researchersForSourceIds(sourceIds);
      return {
        id: `research-object-${note.note_id}`,
        note,
        sourceIds,
        researchers,
        sensoryNodes: sensoryNodesForNote(note, article),
      };
    });
  if (explicitNotes.length) return explicitNotes;

  return researchNoteRows
    .map((note) => {
      const noteTags = splitValues(note.related_tags);
      const score = article.tags.filter((tag) => noteTags.includes(tag)).length;
      return { note, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.note.concept.localeCompare(b.note.concept))
    .slice(0, 3)
    .map(({ note }) => {
      const sourceIds = splitValues(note.source_ids);
      const researchers = researchersForSourceIds(sourceIds);
      return {
        id: `research-object-${note.note_id}`,
        note,
        sourceIds,
        researchers,
        sensoryNodes: sensoryNodesForNote(note, article),
      };
    });
}

function researchObjectCard(object) {
  const href = researchNoteRoute(object.note);
  return `<article class="research-object" id="${escapeHtml(object.id)}" data-content-card tabindex="0">
    <div class="card-top"><span>Research object</span><span class="status">${escapeHtml(object.note.status)}</span></div>
    <h3><a href="${href}">${escapeHtml(object.note.concept)}</a></h3>
    <p>${escapeHtml(object.note.core_question)}</p>
    ${contentActions({ href, readLabel: "Read note", bookmarkLabel: "Bookmark", savedLabel: "Bookmarked" })}
    <div class="object-links">
      <div><strong>Sensory map</strong><div class="tag-row">${object.sensoryNodes.map(sensoryNodeLink).join("") || `<a class="tag" href="/research/sensory-map/">Open map</a>`}</div></div>
      <div><strong>Researchers</strong><p>${object.researchers.slice(0, 6).map((researcher) => `<a href="${researcherRoute(researcher)}">${escapeHtml(researcher.name)}</a>`).join("; ") || "No connected profile yet."}</p></div>
      <div><strong>Sources</strong><p>${object.sourceIds.length} linked ${object.sourceIds.length === 1 ? "source" : "sources"}</p></div>
    </div>
  </article>`;
}

function articleResearchObjectSection(objects) {
  if (!objects.length) return "";
  return `<section class="article-research-objects" aria-label="Article research objects">
    <h2>Research Objects</h2>
    <p>Reusable notes behind this essay. Each object links back to the research note, sensory map and connected authors.</p>
    <div class="research-object-grid">${objects.map(researchObjectCard).join("")}</div>
  </section>`;
}

function sourceInlineLink(sourceId) {
  const reference = referencesById.get(sourceId);
  if (!reference) return `<code>${escapeHtml(sourceLabel(sourceId))}</code>`;

  const href = reference.url || (reference.doi ? `https://doi.org/${reference.doi}` : "");
  const title = escapeHtml(reference.title);
  return href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${title}</a>`
    : title;
}

function researcherResearchObjectCard(note, researcherSourceIds) {
  const noteSourceIds = splitValues(note.source_ids);
  const href = researchNoteRoute(note);
  const matchingSourceIds = noteSourceIds.filter((sourceId) => researcherSourceIds.includes(sourceId));
  const relatedEssays = splitValues(note.related_articles).map(relatedArticleLinks).filter(Boolean).join("; ");
  return `<article class="research-object" id="${escapeHtml(`research-object-${note.note_id}`)}" data-content-card tabindex="0">
    <div class="card-top"><span>Research object</span><span class="status">${escapeHtml(note.status)}</span></div>
    <h3><a href="${href}">${escapeHtml(note.concept)}</a></h3>
    <p>${escapeHtml(note.core_question)}</p>
    ${contentActions({ href, readLabel: "Read note", bookmarkLabel: "Bookmark", savedLabel: "Bookmarked" })}
    <div class="object-links">
      <div><strong>Researcher sources</strong><p>${matchingSourceIds.map(sourceInlineLink).join("; ") || "No direct source connected yet."}</p></div>
      <div><strong>Research areas</strong><div class="tag-row">${splitValues(note.related_tags).slice(0, 4).map((tag) => `<a class="tag" href="${tagLink(tag)}">${escapeHtml(tag)}</a>`).join("")}</div></div>
      <div><strong>Related essays</strong><p>${relatedEssays || "No related essays connected yet."}</p></div>
    </div>
  </article>`;
}

function normalisedWords(value = "") {
  return new Set(value.toLowerCase().replaceAll("&", "and").split(/[^a-z0-9]+/).filter((word) => word.length > 2));
}

function wordOverlapScore(a = "", b = "") {
  const left = normalisedWords(a);
  const right = normalisedWords(b);
  let score = 0;
  for (const word of left) {
    if (right.has(word)) score += 1;
  }
  return score;
}

function scoreTimelineNote(row, note) {
  const noteSourceIds = splitValues(note.source_ids);
  const sourceScore = noteSourceIds.includes(row.source_id) ? 12 : 0;
  const conceptScore = wordOverlapScore(row.topic, note.concept) * 5;
  const tagScore = wordOverlapScore(row.topic, note.related_tags) * 3;
  const questionScore = wordOverlapScore(row.topic, note.core_question);
  return sourceScore + conceptScore + tagScore + questionScore;
}

function bestTimelineResearchNote(row) {
  return researchNoteRows
    .map((note) => ({ note, score: scoreTimelineNote(row, note) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.note.concept.localeCompare(b.note.concept))[0]?.note;
}

function timelineArticleFromReference(value) {
  const articleMatch = value.match(/^Article\s+(\d+)$/i);
  if (articleMatch) {
    return canonical.find((entry) => String(entry.article_number) === articleMatch[1]);
  }
  return allArticles.find((entry) => entry.title === value)
    || allArticles.find((entry) => entry.slug === slugify(value));
}

function timelineReferencedArticles(row) {
  return splitValues(row.used_in).map(timelineArticleFromReference).filter(Boolean);
}

function timelineTopicTag(row) {
  const note = bestTimelineResearchNote(row);
  const href = note ? researchNoteRoute(note) : "/research/notes/";
  return `<a class="tag timeline-tag" href="${href}">${escapeHtml(row.topic)}</a>`;
}

function timelineGroupTags(row) {
  const acts = new Map();
  for (const article of timelineReferencedArticles(row)) {
    const act = articleActs.find((entry) => entry.source === article.act);
    if (act) acts.set(act.id, act);
  }
  return [...acts.values()].map((act) => `<a class="tag timeline-tag timeline-tag-group" href="${actLink(act)}">${escapeHtml(act.label)}</a>`).join(" ");
}

function timelineUsedInTags(row) {
  return splitValues(row.used_in).map((item) => {
    const article = timelineArticleFromReference(item);
    return article
      ? `<a class="tag timeline-tag" href="${article.route}">${escapeHtml(essayReferenceLabel(item))}</a>`
      : `<span class="tag timeline-tag">${escapeHtml(item)}</span>`;
  }).join(" ");
}

function researchNoteCard(row) {
  const href = researchNoteRoute(row);
  return `<article class="article-card" data-content-card tabindex="0">
    <div class="card-top"><span>Research note</span><span class="status">${escapeHtml(row.status)}</span></div>
    <h3><a href="${href}">${escapeHtml(row.concept)}</a></h3>
    <p>${escapeHtml(row.core_question)}</p>
    ${contentActions({ href, readLabel: "Read note", bookmarkLabel: "Bookmark", savedLabel: "Bookmarked" })}
    <div class="tag-row">${splitValues(row.related_tags).slice(0, 3).map((tag) => `<a class="tag" href="${tagLink(tag)}">${escapeHtml(tag)}</a>`).join("")}</div>
  </article>`;
}

function researchNotesPage() {
  const linkedNotes = researchNoteRows.filter((row) => row.status === "linked").length;
  const uniqueSourceIds = new Set(researchNoteRows.flatMap((row) => splitValues(row.source_ids)));
  const panel = evidencePanel({
    title: "Evidence Coverage",
    eyebrow: "Research base",
    note: "A live summary of source-backed research notes, not a decorative diagram.",
    stats: [
      evidenceStat("linked notes", linkedNotes),
      evidenceStat("source links", uniqueSourceIds.size, "/research/timeline/"),
      evidenceStat("researchers", researcherRows.length, "/research/researchers/"),
    ],
    links: [
      `<a href="/research/timeline/">Open timeline</a>`,
      `<a href="/research/sensory-map/">Open sensory map</a>`,
    ],
  });
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Research base</div>
          <h1>Research Notes</h1>
          <p class="lead">Source-backed notes that connect discoveries, theories, researchers, essay drafts and research areas.</p>
          <p class="thesis">Each note starts from a confirmed discovery or theory, then shows the supporting sources behind the essays.</p>
        </div>
        ${panel}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head"><h2>Source-Backed Notes</h2><p>${researchNoteRows.length} research notes currently support the journal.</p></div>
        <div class="article-grid">${researchNoteRows.map(researchNoteCard).join("")}</div>
      </div>
    </section>
  </main>`;
  return layout({ title: "Research Notes", description: "Source-backed discoveries and theories for Sansara.", body, current: "Research base", brandSub: "Research Notes" });
}

function discoveryStorySection(row) {
  const story = discoveryStories[row.note_id];
  if (!story) return "";

  return `<section class="discovery-story" aria-label="${escapeHtml(row.concept)} discovery story">
          <h2 id="discovery">Discovery</h2>
          <p class="source-meta">University research story · ${escapeHtml(story.year)}</p>
          <p>${escapeHtml(story.scene)}</p>
          <p><strong>Result:</strong> ${escapeHtml(story.result)}</p>
        </section>`;
}

function researchNotePage(row) {
  const sourceIds = splitValues(row.source_ids);
  const relatedArticles = splitValues(row.related_articles);
  const relatedTags = splitValues(row.related_tags);
  const researchers = researcherRows.filter((researcher) => {
    const researcherSourceIds = splitValues(researcher.key_source_ids);
    return sourceIds.some((sourceId) => researcherSourceIds.includes(sourceId));
  });
  const panel = evidencePanel({
    title: "Evidence Links",
    eyebrow: "Evidence map",
    note: row.next_action,
    stats: [
      evidenceStat("sources", sourceIds.length, "#sources"),
      evidenceStat("researchers", researchers.length, "#researchers"),
      evidenceStat("essays", relatedArticles.length, "#related-essays"),
    ],
    links: relatedTags.slice(0, 4).map((tag) => `<a href="${tagLink(tag)}">${escapeHtml(tag)}</a>`),
  });
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Research note</div>
          <h1>${escapeHtml(row.concept)}</h1>
          <p class="lead">${escapeHtml(row.core_question)}</p>
          <div class="article-hero-meta">
            <span>${escapeHtml(row.status)}</span>
            <button class="mini-button" type="button" data-bookmark="${escapeHtml(researchNoteRoute(row))}" data-bookmark-label="Bookmark note" data-bookmark-saved-label="Bookmarked">Bookmark note</button>
            <button class="mini-button" type="button" data-read-flag="${escapeHtml(researchNoteRoute(row))}" data-read-label="Read already" data-read-saved-label="Read">Read already</button>
          </div>
          <div class="tag-row" style="margin-top:24px">${splitValues(row.related_tags).map((tag) => `<a class="tag" href="${tagLink(tag)}">${escapeHtml(tag)}</a>`).join("")}</div>
        </div>
        ${panel}
      </div>
    </section>
    <div class="article-layout">
      <article class="article-body">
        ${discoveryStorySection(row)}
        <h2 id="sources">Sources</h2>
        <ul class="source-list">${sourceIds.map(sourceCitation).join("")}</ul>
        ${articleResearchNotesSection(row)}
        <h2 id="researchers">Researchers</h2>
        <ul>${researchers.map((researcher) => `<li><a href="${researcherRoute(researcher)}">${escapeHtml(researcher.name)}</a> - ${escapeHtml(researcher.known_for)}</li>`).join("") || "<li>No researcher rows connected yet.</li>"}</ul>
        <h2 id="related-essays">Related Essays</h2>
        <ul>${relatedArticles.map((item) => `<li>${relatedArticleLinks(item)}</li>`).join("")}</ul>
        <h2>Next Action</h2>
        <p>${escapeHtml(row.next_action)}</p>
      </article>
      <aside class="side-rail" aria-label="Research note context">
        <div class="rail-block"><h2>Status</h2><p>${escapeHtml(row.status)}</p></div>
        <div class="rail-block"><h2>Research Areas</h2><div class="tag-row">${splitValues(row.related_tags).map((tag) => `<a class="tag" href="${tagLink(tag)}">${escapeHtml(tag)}</a>`).join("")}</div></div>
      </aside>
    </div>
  </main>`;
  return layout({ title: row.concept, description: row.core_question, body, current: "Research note", brandSub: "Research Notes" });
}

function researcherCard(row) {
  return `<article class="article-card">
    <div class="card-top"><span>Researcher</span><span class="status">${escapeHtml(row.field.split(";")[0] || "research")}</span></div>
    <h3><a href="${researcherRoute(row)}">${escapeHtml(row.name)}</a></h3>
    <p>${escapeHtml(row.known_for)}</p>
  </article>`;
}

function researchersPage() {
  const connectedResearchers = researcherRows.filter((row) => splitValues(row.key_source_ids).length).length;
  const panel = evidencePanel({
    title: "Researcher Coverage",
    eyebrow: "Research base",
    note: "People are shown through the concepts and sources they actually support.",
    stats: [
      evidenceStat("profiles", researcherRows.length),
      evidenceStat("with sources", connectedResearchers),
      evidenceStat("research notes", researchNoteRows.length, "/research/notes/"),
    ],
    links: [
      `<a href="/research/notes/">Open notes</a>`,
      `<a href="/research/timeline/">Open timeline</a>`,
    ],
  });
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Research base</div>
          <h1>Researchers</h1>
          <p class="lead">Recurring scientists, theorists and research groups behind the journal's essays.</p>
          <p class="thesis">Profiles stay concise and point back to research notes, research areas and source candidates.</p>
        </div>
        ${panel}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head"><h2>People</h2><p>${researcherRows.length} researcher records are currently seeded.</p></div>
        <div class="article-grid">${researcherRows.map(researcherCard).join("")}</div>
      </div>
    </section>
  </main>`;
  return layout({ title: "Researchers", description: "Researcher profiles for Sansara.", body, current: "Research base" });
}

function researcherPage(row) {
  const sourceIds = splitValues(row.key_source_ids);
  const notes = researchNoteRows.filter((note) => {
    const noteSourceIds = splitValues(note.source_ids);
    return sourceIds.some((sourceId) => noteSourceIds.includes(sourceId));
  });
  const themes = [...new Set(notes.flatMap((note) => splitValues(note.related_tags)))];
  const verifiedSources = sourceIds.filter((sourceId) => referencesById.has(sourceId));
  const panel = evidencePanel({
    title: "Researcher Links",
    eyebrow: "Profile evidence",
    note: row.notes,
    stats: [
      evidenceStat("objects", notes.length, "#research-objects"),
      evidenceStat("verified sources", verifiedSources.length, "#sources"),
      evidenceStat("areas", themes.length),
    ],
    links: themes.slice(0, 4).map((tag) => `<a href="${tagLink(tag)}">${escapeHtml(tag)}</a>`),
  });
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Researcher</div>
          <h1>${escapeHtml(row.name)}</h1>
          <p class="lead">${escapeHtml(row.known_for)}</p>
          <p class="thesis">${escapeHtml(row.field)}</p>
        </div>
        ${panel}
      </div>
    </section>
    <div class="article-layout">
      <article class="article-body">
        <section class="article-research-objects" aria-label="Research objects related to ${escapeHtml(row.name)}">
          <h2 id="research-objects">Research Objects</h2>
          <p>Concept objects connected to this researcher through verified sources.</p>
          <div class="research-object-grid">${notes.map((note) => researcherResearchObjectCard(note, sourceIds)).join("") || "<p>No research objects connected yet.</p>"}</div>
        </section>
        <h2 id="sources">Sources</h2>
        <ul class="source-list">${sourceIds.map(sourceCitation).join("")}</ul>
        <h2>Editorial Note</h2>
        <p>${escapeHtml(row.notes)}</p>
      </article>
      <aside class="side-rail" aria-label="Researcher context">
        <div class="rail-block"><h2>Field</h2><p>${escapeHtml(row.field)}</p></div>
        <div class="rail-block"><h2>Profile</h2><p>${row.website_or_profile ? `<a href="${escapeHtml(row.website_or_profile)}">External profile</a>` : "Profile link not verified yet."}</p></div>
      </aside>
    </div>
  </main>`;
  return layout({ title: row.name, description: row.known_for, body, current: "Researcher" });
}

function articlePage(article) {
  const previous = article.previousRoute ? articlesByRoute.get(article.previousRoute) : null;
  const next = article.nextRoute ? articlesByRoute.get(article.nextRoute) : null;
  const relatedArticles = article.related.length ? article.related : allArticles
    .filter((item) => item.route !== article.route)
    .map((item) => ({
      article: item,
      score: item.tags.filter((tag) => article.tags.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(a.article.article_number || 99) - Number(b.article.article_number || 99))
    .map((item) => item.article);
  const related = relatedArticles.slice(0, 6).map((item) => `<li><a href="${item.route}">${escapeHtml(item.title)}</a></li>`).join("");
  const sensoryNodes = sensoryNodesForArticle(article);
  const researchObjects = researchObjectsForArticle(article);
  const researchers = [...new Map(researchObjects.flatMap((object) => object.researchers).map((researcher) => [researcher.researcher_id, researcher])).values()];
  const articleBody = markdownToHtml(articleBodyMarkdown(article.markdown, article.title));
  const body = `<main>
      <section class="hero article-hero">
        <div class="hero-inner">
          <div>
            <div class="eyebrow">${article.article_number ? `Essay ${article.article_number} of ${canonical.length}` : "Companion Essay"}</div>
            <h1>${escapeHtml(article.title)}</h1>
            <p class="lead">${escapeHtml(article.thesis)}</p>
            <div class="article-hero-meta">
              <span>${article.minutes} min read</span>
              <span>${escapeHtml(article.status.replaceAll("_", " "))}</span>
              <button class="mini-button" type="button" data-bookmark="${escapeHtml(article.route)}">Save article</button>
              <button class="mini-button" type="button" data-read-flag="${escapeHtml(article.route)}" data-read-label="Read already" data-read-saved-label="Read">Read already</button>
            </div>
            <div class="tag-row" style="margin-top:24px">${article.tags.map((tag) => `<a class="tag" href="${tagLink(tag)}">${escapeHtml(tag)}</a>`).join("")}</div>
          </div>
          ${artifact(artifactMap[article.slug], article.title)}
        </div>
      </section>
      <div class="article-layout">
        <article class="article-body">${articleBody}
          ${articleResearchObjectSection(researchObjects)}
          <div class="prev-next">
            ${previous ? `<a href="${previous.route}">Previous<strong>${escapeHtml(previous.title)}</strong></a>` : "<span></span>"}
            ${next ? `<a href="${next.route}">Next<strong>${escapeHtml(next.title)}</strong></a>` : "<span></span>"}
          </div>
        </article>
        <aside class="side-rail" aria-label="Essay context">
          <div class="rail-block">
            <h2>Reading</h2>
            <p><strong>${article.minutes} min</strong> · ${escapeHtml(article.status.replaceAll("_", " "))}</p>
          </div>
          <div class="rail-block">
            <h2>Research Areas</h2>
            <div class="tag-row">${article.tags.map((tag) => `<a class="tag" href="${tagLink(tag)}">${escapeHtml(tag)}</a>`).join("")}</div>
          </div>
          <div class="rail-block">
            <h2>Sensory Map</h2>
            <div class="tag-row">${sensoryNodes.slice(0, 5).map(sensoryNodeLink).join("") || `<a class="tag" href="/research/sensory-map/">Open map</a>`}</div>
          </div>
          <div class="rail-block">
            <h2>Linked Notes</h2>
            <ul>${researchObjects.slice(0, 6).map((object) => `<li><a href="#${escapeHtml(object.id)}">${escapeHtml(object.note.concept)}</a></li>`).join("") || "<li>No research notes connected yet.</li>"}</ul>
          </div>
          <div class="rail-block">
            <h2>Researchers</h2>
            <ul>${researchers.slice(0, 6).map((researcher) => `<li><a href="${researcherRoute(researcher)}">${escapeHtml(researcher.name)}</a></li>`).join("") || "<li>No connected profiles yet.</li>"}</ul>
          </div>
          <div class="rail-block">
            <h2>Related</h2>
            <ul>${related}</ul>
          </div>
        </aside>
      </div>
    </main>`;
  return layout({
    title: article.title,
    description: article.thesis,
    body,
    current: article.article_number ? "Issue essay" : "Companion essay",
    brandSub: article.article_number ? "Research Journal Issue 1" : "Companion Essays",
  });
}

function themesPage() {
  const themeCards = [...tagSlugs.keys()].map((tag) => {
    const tagged = themeArticlesFor(tag);
    const nodes = sensoryNodesForTag(tag);
    const themeEssays = tagged.map((article) => `<a href="${article.route}"><span>${escapeHtml(essayLabel(article))}</span> <strong>${escapeHtml(article.title)}</strong></a>`).join("");
    return `<article class="connection-card">
      <div class="card-top"><span>Theme</span><span class="status">${tagged.length} essays</span></div>
      <h3><a href="${tagLink(tag)}">${escapeHtml(tag)}</a></h3>
      <p>${escapeHtml(tagDescriptions[tag] || "A pathway through the Sansara research journal.")}</p>
      <div class="connection-links">${themeEssays}</div>
      <div class="tag-row">${nodes.slice(0, 4).map(sensoryNodeLink).join("")}</div>
    </article>`;
  }).join("");
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Reader pathways</div>
          <h1>Themes</h1>
          <p class="lead">Five broad ways into Issue 1 and its companion essays.</p>
          <p class="thesis">Themes are the clean reader-facing layer. The sensory map is the deeper connected layer underneath them, not a separate set of categories.</p>
          <div class="hero-actions">
            <a class="button primary" href="/research/issue-1/">Open Issue 1</a>
            <a class="button" href="/research/sensory-map/">Open sensory map</a>
          </div>
        </div>
        ${artifact("system-map", "Research themes")}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head">
          <h2>Theme Index</h2>
          <p>Use these as entry points by question, body system, or experience design lever.</p>
        </div>
        <div class="connection-grid">${themeCards}</div>
      </div>
    </section>
  </main>`;
  return layout({ title: "Themes", description: "Reader pathways through Sansara Research Journal Issue 1.", body, current: "Themes" });
}

function tagPage(tag) {
  const tagged = themeArticlesFor(tag);
  const nodes = sensoryNodesForTag(tag);
  const profile = themeProfileFor(tag);
  const body = `<main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Research theme</div>
          <h1>${escapeHtml(tag)}</h1>
          <p class="lead">${escapeHtml(tagDescriptions[tag] || "A pathway through the Sansara research journal.")}</p>
          <p class="thesis">${escapeHtml(profile.question)} The page below turns this theme into a reading path rather than a loose filter.</p>
        </div>
        ${artifact(artifactMap[tagged[0]?.slug] || "curve", tag)}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head"><h2>Theme Logic</h2><p>The theme is the readable doorway. The sensory map underneath shows the mechanisms, systems and designed outcomes.</p></div>
        ${themeBrief(tag, nodes, tagged)}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head"><h2>Essays In This Theme</h2><p>${escapeHtml(profile.startNote || "The complete curated essay set for this theme.")}</p></div>
        <div class="reading-path">${tagged.map((article, index) => `<article class="reading-step">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3><a href="${article.route}">${escapeHtml(article.title)}</a></h3>
          <p>${escapeHtml(article.thesis)}</p>
          <small>${escapeHtml(essayLabel(article))}${primaryTheme(article) !== tag ? ` · Primary theme: ${escapeHtml(primaryTheme(article))}` : ""}</small>
        </article>`).join("")}</div>
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head"><h2>Sensory Fingerprint</h2><p>These map nodes sit underneath the theme and link it back to the sensory map.</p></div>
        ${sensoryFingerprint(nodes)}
      </div>
    </section>
  </main>`;
  return layout({ title: tag, description: tagDescriptions[tag], body, current: "Theme page" });
}

const perspectiveSections = [
  {
    label: "I",
    title: "The Environmental Turn",
    description: "Performance is reframed as something that happens inside light, sound, space, rhythm, expectation and social context.",
  },
  {
    label: "II",
    title: "The Predictive Nervous System",
    description: "The nervous system is treated as embodied, predictive and continuously shaped by sensory information.",
  },
  {
    label: "III",
    title: "Rhythm, Movement, and Collective State",
    description: "Rhythm becomes temporal infrastructure for movement timing, synchrony, motivation and group attention.",
  },
  {
    label: "IV",
    title: "From Exercise to State Design",
    description: "The research translates into studios, platforms and environments designed around psychophysiological state.",
  },
];

function journalPage() {
  const issueGroups = articleActs.map((act) => {
    const issues = canonical.filter((article) => article.act === act.source).map((article) => `<article class="issue-card" data-issue-card data-content-card data-tags="${escapeHtml(article.tags.join("|"))}" tabindex="0">
      <div class="card-top"><span>${escapeHtml(essayLabel(article))}</span><span>${article.minutes} min</span></div>
      <h3><a href="${article.route}">${escapeHtml(article.title)}</a></h3>
      <p>${escapeHtml(article.thesis)}</p>
      ${contentActions({ href: article.route, readLabel: "Read", bookmarkLabel: "Bookmark", savedLabel: "Bookmarked" })}
    </article>`).join("");
    return `<section class="issue-act" id="${act.id}">
      <a class="act-link" href="${actLink(act)}">
        <span>${act.label}</span>
        <strong>${escapeHtml(act.title)}</strong>
      </a>
      <div class="issue-list">${issues}</div>
    </section>`;
  }).join("");
  const body = `${issueJourneyDock()}
  <main>
    <section class="hero">
      <div class="hero-inner">
        <div>
          <div class="eyebrow">Sansara Research Journal · Issue 1</div>
          <h1>Designing Human States</h1>
          <p class="lead">Environment, rhythm, perception, and the future of performance.</p>
          <p class="thesis">A manifesto on Environmental State Design: how sensory, spatial, temporal, social and technological conditions shape attention, movement, regulation, recovery, synchrony and flow.</p>
        </div>
        ${artifact("state-design", "Issue arc", "Research sequence / state arc")}
      </div>
    </section>
    <section class="band">
      <div class="band-inner">
        <div class="section-head"><h2>Issue Essays</h2><p>Each essay can stand alone, but together they read as the first Sansara manifesto.</p></div>
        <div class="issue-act-list">${issueGroups}</div>
      </div>
    </section>
  </main>`;
  return layout({ title: "Designing Human States", description: "Issue 1 of the Sansara Research Journal.", body, current: "Research Journal Issue 1" });
}

const webMap = readCsv("articles/web-link-map.csv");
const tagRows = readCsv("articles/article-tags.csv");
const articleThesisRows = readCsv("articles/article-theses.csv");
const articleThesesBySlug = new Map(articleThesisRows.map((row) => [row.slug, row.thesis]));
const researchNoteRows = readCsv("content/library/research-notes.csv");
const researcherRows = readCsv("content/library/researchers.csv");
const sensoryRows = readCsv("articles/sensory-map.csv");
const referenceRows = readCsv("content/library/references.csv");
const referencesById = new Map(referenceRows.map((row) => [row.source_id, row]));
const sourceCandidateRows = readCsv("content/library/source-candidates.csv");
const sourceCandidatesById = new Map(sourceCandidateRows.map((row) => [row.source_id, row]));
const timelineRows = readCsv("content/library/timeline.csv")
  .sort((a, b) => Number.parseInt(a.year, 10) - Number.parseInt(b.year, 10));
const tagDescriptions = {
  "Rhythm & Entrainment": "Movement synchronising with rhythm.",
  "Flow State": "Challenge, attention and immersion.",
  "Breath & Nervous System": "State regulation.",
  "Light & Perception": "Light, circadian rhythm, recovery and visual atmosphere.",
  "Music & Emotion": "How music shapes experience.",
};
const themeProfiles = {
  "Rhythm & Entrainment": {
    question: "How does timing organise movement, attention and group state?",
    why: "Rhythm is treated as infrastructure: a temporal scaffold that helps bodies coordinate action, anticipate change and enter shared attention.",
    startSlugs: ["rhythm-infrastructure", "collective-flow", "elite-athletes-yoga-teachers", "when-teaching-replaces-practice"],
    startNote: "Start with rhythm as infrastructure, then follow it into group synchrony, teaching attention and teacher workload.",
  },
  "Flow State": {
    question: "What conditions make immersion more likely without trying to force it?",
    why: "Flow is framed as an emergent state of skill, attention, challenge, reduced friction and feedback, not a mood that can be switched on directly.",
    startSlugs: ["where-do-ideas-come-from", "collective-flow", "state-engineering", "measure-flow", "state-design-promise-problem-middle-path"],
    startNote: "Start with creative flow, then move into collective flow, state design, measurement and the ethics of shared states.",
  },
  "Breath & Nervous System": {
    question: "How does the body know it is safe, ready, recovering or under demand?",
    why: "Breath is not treated as a standalone technique. It is part of a wider regulation system involving interoception, prediction, autonomic state, recovery and learning.",
    startSlugs: ["light-performance-variable", "predictive-brain-yoga-studio", "beyond-homeostasis", "sensory-coherence", "measure-flow"],
    startNote: "Start with regulation, then follow breath into prediction, sensory coherence and the problem of measuring state without interrupting it.",
  },
  "Light & Perception": {
    question: "How do light, visual atmosphere and space change attention and recovery?",
    why: "Light and perception are treated as biological design variables: they shape circadian timing, arousal, visual comfort, mood and the felt intelligence of a room.",
    startSlugs: ["environmental-architecture", "light-performance-variable", "sensory-coherence", "environmental-performance", "can-technology-become-invisible"],
    startNote: "Start with the room, then move into light, sensory coherence and the environmental-performance thesis.",
  },
  "Music & Emotion": {
    question: "How does sound change the emotional and social texture of practice?",
    why: "Music is treated as more than motivation. It shapes timing, atmosphere, awe, memory, shared attention and the arc of a class.",
    startSlugs: ["rhythm-infrastructure", "where-do-ideas-come-from", "the-neuroscience-of-awe", "why-beauty-matters"],
    startNote: "Start with rhythm, then follow sound into creative flow, awe and beauty.",
  },
};

const canonical = webMap.map((row) => {
  const markdown = fs.readFileSync(path.join(root, row.source_markdown), "utf8");
  const articleExcerpt = excerpt(markdown);
  return {
    ...row,
    type: "canonical",
    title: row.title,
    route: routeFromPublic(row.public_url),
    previousRoute: row.previous ? routeFromPublic(row.previous) : "",
    nextRoute: row.next ? routeFromPublic(row.next) : "",
    tags: splitValues(row.public_tags),
    markdown,
    excerpt: articleExcerpt,
    thesis: thesisFor(row.slug, articleExcerpt),
    minutes: readingTime(markdown),
  };
});

const canonicalByMarkdown = new Map(canonical.map((item) => [path.normalize(item.source_markdown), item]));
const sideArticles = tagRows
  .filter((row) => row.article_type === "side")
  .map((row) => {
    const markdown = fs.readFileSync(path.join(root, row.source_markdown), "utf8");
    const articleExcerpt = excerpt(markdown);
    return {
      ...row,
      type: "side",
      article_number: "",
      act: "Companion essay",
      route: companionEssayRoute(row.slug),
      public_url: companionEssayRoute(row.slug).replace(/\/$/, ""),
      tags: [row.primary_tag, ...splitValues(row.secondary_tags)].filter(Boolean),
      markdown,
      title: articleTitle(markdown, row.title),
      excerpt: articleExcerpt,
      thesis: thesisFor(row.slug, articleExcerpt),
      minutes: readingTime(markdown),
    };
  });

const allArticles = [...canonical, ...sideArticles];
const articlesByRoute = new Map(allArticles.map((item) => [item.route, item]));
const routeByMarkdown = new Map(allArticles.map((item) => [path.normalize(item.source_markdown), item.route]));
const routeAliases = [
  {
    title: "Beyond Homeostasis",
    from: "/research/side-essays/beyond-homeostasis/",
    to: "/research/designing-human-states/beyond-homeostasis/",
  },
  {
    title: "Where Do Ideas Come From?",
    from: "/research/side-essays/where-do-ideas-come-from/",
    to: "/research/designing-human-states/where-do-ideas-come-from/",
  },
  ...sideArticles.map((article) => ({
    title: article.title,
    from: `/research/side-essays/${article.slug}/`,
    to: article.route,
  })),
];

for (const article of allArticles) {
  const relatedRoutes = new Set();
  for (const match of article.markdown.matchAll(/\[[^\]]+\]\((\.\/[^)]+)\)/g)) {
    const markdownPath = path.normalize(path.join("articles/readable/markdown", match[1].replace("./", "")));
    const route = routeByMarkdown.get(markdownPath);
    if (route && route !== article.route) relatedRoutes.add(route);
  }
  article.related = [...relatedRoutes].map((route) => articlesByRoute.get(route)).filter(Boolean);
}

resetDir(outDir);
ensureDir(path.join(outDir, "assets"));
copyDirContents(path.join(srcDir, "assets"), path.join(outDir, "assets"));
fs.copyFileSync(path.join(srcDir, "styles.css"), path.join(outDir, "assets/styles.css"));
fs.copyFileSync(path.join(srcDir, "app.js"), path.join(outDir, "assets/app.js"));

fs.writeFileSync(path.join(outDir, "index.html"), siteHomePage());
writePage("/training/", trainingProgramPage());
writePage("/interactive-flow/", placeholderPage({
  title: "Interactive Flow",
  eyebrow: "Build",
  lead: "A future-facing class design surface for composing breath, movement, rhythm, energy and atmosphere.",
  thesis: "This sits at the Sansara website level as a product/tool direction. Research can support it, but the tool itself should not live inside the research journal.",
}));
writePage("/instruction-manual/", placeholderPage({
  title: "Instruction Manual",
  eyebrow: "Learn",
  lead: "The practical operating language for teachers, studios and collaborators using the Sansara method.",
  thesis: "This belongs beside training and product guidance. It can cite research, but it should be structured as a manual rather than a journal issue.",
}));
writePage("/research/", journalPage());
writePage("/research/home/", researchHomePage());
writePage("/research/designing-human-states/", aliasPage({ title: "Designing Human States", target: "/research/issue-1/" }));
writePage("/research/issue-1/", journalPage());
writePage("/journal/", aliasPage({ title: "Designing Human States", target: "/research/issue-1/" }));
writePage("/research/themes/", themesPage());
writePage("/research/timeline/", timelinePage());
writePage("/research/sensory-map/", sensoryMapPage());
writePage("/research/notes/", researchNotesPage());
writePage("/research/researchers/", researchersPage());

for (const article of allArticles) {
  writePage(article.route, articlePage(article));
}

for (const alias of routeAliases) {
  writePage(alias.from, aliasPage({ title: alias.title, target: alias.to }));
}

for (const tag of tagSlugs.keys()) {
  writePage(tagLink(tag), tagPage(tag));
  writePage(`/research/tags/${tagSlugs.get(tag)}/`, aliasPage({ title: tag, target: tagLink(tag) }));
}

for (const note of researchNoteRows) {
  writePage(researchNoteRoute(note), researchNotePage(note));
}

for (const researcher of researcherRows) {
  writePage(researcherRoute(researcher), researcherPage(researcher));
}

console.log(`Built ${allArticles.length} articles, ${tagSlugs.size} theme pages, ${sensoryRows.length} sensory nodes, ${researchNoteRows.length} research notes, ${researcherRows.length} researchers, timeline, research journal, and the research hub in ${path.relative(root, outDir)}/`);
