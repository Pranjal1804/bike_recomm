// Minimal static file server for local development: `npm start`
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = +process.env.PORT || 5173;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".pdf": "application/pdf", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon" };

export function start(port = PORT) {
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    if (path.split(/[/\\]/).includes("..")) { res.writeHead(403).end(); return; }
    let file = join(ROOT, path || "index.html");
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    }
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start().then(() => console.log(`MotoMatch India → http://localhost:${PORT}`));
}
