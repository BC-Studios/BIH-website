import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

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

function companionEssayRoute(slug) {
  return `/research/companion-essays/${slug}/`;
}

const webMap = readCsv("articles/web-link-map.csv");
const tagRows = readCsv("articles/article-tags.csv");
const canonical = webMap.map((row) => ({
  type: "canonical",
  slug: row.slug,
  route: row.public_url.endsWith("/") ? row.public_url : `${row.public_url}/`,
}));
const companion = tagRows
  .filter((row) => row.article_type === "side")
  .map((row) => ({
    type: "companion",
    slug: row.slug,
    route: companionEssayRoute(row.slug),
  }));

const checks = [
  ["research objects", (html) => (html.match(/class="research-object"/g) || []).length],
  ["sensory links", (html) => (html.match(/\/research\/sensory-map\/#/g) || []).length],
  ["researcher links", (html) => (html.match(/\/research\/researchers\//g) || []).length],
  ["research note anchors", (html) => (html.match(/#research-object-note-/g) || []).length],
  ["theme links", (html) => (html.match(/\/research\/themes\//g) || []).length],
  ["related links", (html) => ((html.match(/<h2>Related<\/h2>[\s\S]*?<\/div>/) || [""])[0].match(/<li><a /g) || []).length],
];

const gaps = [];
for (const article of [...canonical, ...companion]) {
  const filePath = path.join(root, "site", article.route.replace(/^\/+/, ""), "index.html");
  const html = fs.readFileSync(filePath, "utf8");
  const missing = checks
    .map(([label, count]) => [label, count(html)])
    .filter(([, count]) => count === 0);
  if (missing.length) {
    gaps.push({ article, missing: missing.map(([label]) => label) });
  }
}

if (gaps.length) {
  for (const gap of gaps) {
    console.error(`${gap.article.type}/${gap.article.slug}: missing ${gap.missing.join(", ")}`);
  }
  process.exit(1);
}

console.log(`All ${canonical.length + companion.length} article pages have research objects, sensory links, researcher links, note anchors, theme links, and related links.`);

