import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const contents = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));

// Names Next.js/the framework consumes implicitly, not via import.
const FRAMEWORK = new Set([
  "default", "metadata", "generateMetadata", "generateStaticParams",
  "dynamic", "revalidate", "dynamicParams", "runtime", "preferredRegion",
  "viewport", "generateViewport", "GET", "POST", "PUT", "PATCH", "DELETE",
  "HEAD", "OPTIONS", "config", "maxDuration",
]);

const declRe =
  /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g;

const unused = [];
let declCount = 0;

for (const [file, text] of contents) {
  const base = file.replace(/\\/g, "/").split("/").pop();
  const isRouteOrPage =
    /^(page|layout|route|middleware|error|not-found|loading|template|opengraph-image|icon|apple-icon|sitemap|robots|manifest)\.(ts|tsx)$/.test(base);

  for (const m of text.matchAll(declRe)) {
    declCount++;
    const name = m[1];
    if (FRAMEWORK.has(name)) continue;

    const nameRe = new RegExp(`\\b${name.replace(/\$/g, "\\$")}\\b`, "g");
    let uses = 0;

    for (const [other, otherText] of contents) {
      let haystack = otherText;
      if (other === file) {
        // Blank out THIS declaration at its exact offset so it cannot
        // count as a reference to itself. Matching by trimmed string is
        // unreliable because the line carries its initializer.
        haystack =
          otherText.slice(0, m.index) +
          " ".repeat(m[0].length) +
          otherText.slice(m.index + m[0].length);
      }
      const hits = haystack.match(nameRe);
      if (hits) uses += hits.length;
    }

    if (uses === 0) {
      unused.push({
        file: relative(ROOT, file).replace(/\\/g, "/"),
        name,
        kind: isRouteOrPage ? "route-page" : "normal",
      });
    }
  }
}

unused.sort((a, b) => a.file.localeCompare(b.file) || a.name.localeCompare(b.name));
console.log(`scanned ${files.length} files, ${declCount} exported declarations under src/`);
console.log(`=== UNUSED EXPORTS (${unused.length}) ===`);
for (const u of unused) console.log(`${u.file}  ->  ${u.name}`);