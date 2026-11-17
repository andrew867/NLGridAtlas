import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const prefix = "/NLGridAtlas";
const port = Number.parseInt(process.env.PORT || "4176", 10);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".geojson": "application/geo+json; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
    if (url.pathname === prefix || url.pathname === `${prefix}/`) {
      response.writeHead(302, { Location: `${prefix}/index.html` });
      response.end();
      return;
    }
    if (!url.pathname.startsWith(`${prefix}/`)) {
      response.writeHead(404).end("Not found");
      return;
    }
    const relative = decodeURIComponent(url.pathname.slice(prefix.length + 1));
    const filePath = path.resolve(root, relative);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(400).end("Invalid path");
      return;
    }
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(await readFile(filePath));
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`NL Grid Atlas test server listening on http://127.0.0.1:${port}${prefix}/`));
