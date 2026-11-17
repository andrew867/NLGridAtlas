import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "index.html");
const source = await readFile(sourcePath, "utf8");

function extractSection(id) {
  const startPattern = new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>`, "i");
  const startMatch = startPattern.exec(source);
  if (!startMatch) throw new Error(`Missing section ${id}`);
  const tokenPattern = /<section\b[^>]*>|<\/section\s*>/gi;
  tokenPattern.lastIndex = startMatch.index;
  let depth = 0;
  let token;
  while ((token = tokenPattern.exec(source))) {
    if (/^<section\b/i.test(token[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) return source.slice(startMatch.index, tokenPattern.lastIndex);
  }
  throw new Error(`Unclosed section ${id}`);
}

const pages = {
  index: {
    title: "NL Grid Atlas | Island Interconnected System",
    heading: null,
    intro: null,
    sections: ["top"]
  },
  network: {
    title: "Networks | NL Grid Atlas",
    heading: "Networks",
    intro: "Island transmission, converter systems, geographic references and Newfoundland Power network registers.",
    sections: ["handbook"]
  },
  stations: {
    title: "Stations | NL Grid Atlas",
    heading: "Stations",
    intro: "Hydro terminal stations and Newfoundland Power substations remain separate, collection-specific records.",
    sections: ["network", "substations"]
  },
  transmission: {
    title: "Transmission work | NL Grid Atlas",
    heading: "Transmission work",
    intro: "Dated transmission-line projects, conductor records, route drawings and completed work.",
    sections: ["transmission"]
  },
  loads: {
    title: "Loads and reliability | NL Grid Atlas",
    heading: "Loads and reliability",
    intro: "Measured load, forecasts, equipment ratings, interruptions and reliability records retain their original basis and units.",
    sections: ["loads"]
  },
  history: {
    title: "System history | NL Grid Atlas",
    heading: "System history",
    intro: "Dated changes in generation, transmission, communications and public infrastructure.",
    sections: ["timeline"]
  },
  telephone: {
    title: "Telephone history | NL Grid Atlas",
    heading: "Telephone",
    intro: "Public telephone companies, carrier succession, switching, transport and host-and-remote architecture.",
    sections: ["telephone"]
  },
  telecom: {
    title: "Utility radio | NL Grid Atlas",
    heading: "Utility radio",
    intro: "Dated VHF, microwave, P25, satellite and vehicle communications records.",
    sections: ["telecom"]
  },
  sources: {
    title: "Sources | NL Grid Atlas",
    heading: "Sources",
    intro: "Source records preserve document identity, exact cited locators and recorded provenance.",
    sections: ["evidence"]
  }
};

const sectionHtml = new Map();
const targetPage = new Map();
for (const [page, config] of Object.entries(pages)) {
  for (const section of config.sections) {
    const html = extractSection(section);
    sectionHtml.set(section, html);
    for (const match of html.matchAll(/\bid="([^"]+)"/g)) targetPage.set(match[1], page);
  }
}

const navItems = [
  ["index", "Home"],
  ["network", "Networks"],
  ["stations", "Stations"],
  ["transmission", "Transmission"],
  ["loads", "Loads"],
  ["history", "History"]
];

function shell(page) {
  const config = pages[page];
  const navigation = navItems.map(([id, label]) =>
    `<a href="./${id}.html"${id === page ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("\n          ");
  const communicationsCurrent = ["telephone", "telecom"].includes(page) ? ' data-current="true"' : "";
  return `<!doctype html>
<html lang="en-CA">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="An unofficial, source-cited engineering atlas of Newfoundland and Labrador electrical and communications infrastructure." />
    <meta name="theme-color" content="#eee8dc" />
    <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
    <title>${config.title}</title>
  </head>
  <body data-page="${page}">
    <a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header" data-site-header>
      <a class="wordmark" href="./index.html" aria-label="NL Grid Atlas home">
        <span class="wordmark-mark" aria-hidden="true">NL</span>
        <span>GRID ATLAS</span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation" hidden>Menu</button>
      <nav id="site-navigation" class="site-navigation" aria-label="Main navigation">
          ${navigation}
          <details class="communications-menu"${communicationsCurrent}>
            <summary>Communications</summary>
            <div>
              <a href="./telephone.html"${page === "telephone" ? ' aria-current="page"' : ""}>Telephone</a>
              <a href="./telecom.html"${page === "telecom" ? ' aria-current="page"' : ""}>Utility radio</a>
            </div>
          </details>
          <a href="./sources.html"${page === "sources" ? ' aria-current="page"' : ""}>Sources</a>
      </nav>
      <span class="edition">FIELD EDITION 0.1</span>
    </header>

    <main id="main">
${config.heading ? `      <header class="page-masthead">
        <p class="eyebrow">NL Grid Atlas</p>
        <h1>${config.heading}</h1>
        <p>${config.intro}</p>
      </header>
` : ""}__CONTENT__
    </main>

    <footer class="site-footer">
      <div><strong>NL GRID ATLAS</strong><p>Unofficial engineering reference based on public records.</p></div>
      <p>Not affiliated with the PUB, Newfoundland and Labrador Hydro, or Newfoundland Power.</p>
      <a href="https://github.com/andrew867/NLGridAtlas">GitHub repository</a>
    </footer>
    <script type="module" src="/src/pages/${page}.js"></script>
  </body>
</html>
`;
}

function rewriteLinks(html, currentPage) {
  return html.replace(/href="#([^"]+)"/g, (full, target) => {
    const destination = targetPage.get(target);
    if (!destination || destination === currentPage) return full;
    return `href="./${destination}.html#${target}"`;
  });
}

const homeContents = `
      <section class="home-directory" id="atlas-contents" aria-labelledby="atlas-contents-title">
        <header><span class="section-number">CONTENTS</span><h2 id="atlas-contents-title">Atlas contents</h2></header>
        <nav aria-label="Atlas subjects">
          <a href="./network.html"><strong>Networks</strong><span>Island backbone, maps and registers</span></a>
          <a href="./stations.html"><strong>Stations</strong><span>Terminal stations and substations</span></a>
          <a href="./transmission.html"><strong>Transmission work</strong><span>Dated line projects and route records</span></a>
          <a href="./loads.html"><strong>Loads and reliability</strong><span>Measured, forecast and interruption records</span></a>
          <a href="./history.html"><strong>History</strong><span>Dated system chronology</span></a>
          <a href="./telephone.html"><strong>Telephone</strong><span>Carriers, switching and transport</span></a>
          <a href="./telecom.html"><strong>Utility radio</strong><span>VHF, microwave and later systems</span></a>
          <a href="./sources.html"><strong>Sources</strong><span>Documents, locators and provenance</span></a>
        </nav>
      </section>
      <noscript>
        <nav class="legacy-contents" aria-label="Legacy link destinations">
          <a href="./network.html#handbook">System one-lines</a>
          <a href="./stations.html#network">Terminal stations</a>
          <a href="./stations.html#substations">Substations</a>
          <a href="./history.html#timeline">Timeline</a>
          <a href="./loads.html#loads">Loads</a>
          <a href="./telephone.html#telephone">Telephone</a>
          <a href="./telecom.html#telecom">Utility radio</a>
          <a href="./sources.html#evidence">Sources</a>
        </nav>
      </noscript>`;

for (const [page, config] of Object.entries(pages)) {
  let content = config.sections.map((id) => sectionHtml.get(id)).join("\n\n");
  if (page === "index") content += homeContents;
  content = rewriteLinks(content, page);
  await writeFile(path.join(root, `${page}.html`), shell(page).replace("__CONTENT__", content), "utf8");
}

console.log(`Wrote ${Object.keys(pages).length} static page entries.`);
