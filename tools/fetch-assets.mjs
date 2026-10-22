#!/usr/bin/env node
/**
 * Localise the bike photography.
 * ------------------------------
 * By default the site loads its licensed photos straight from Wikimedia Commons
 * (upload.wikimedia.org permits hotlinking). Run this once to download every
 * image into assets/bikes/ and point the site at the local copies instead:
 *
 *     node tools/fetch-assets.mjs
 *
 * Requires Node 18+. No dependencies. Re-running is safe (existing files are kept).
 * Attribution stays intact: data/media.js keeps each file's Commons page + licence.
 */
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const mediaPath = path.join(root, "data/media.js");
const indexPath = path.join(root, "index.html");
const outDir = path.join(root, "assets/bikes");
const UA = "MotoMatchIndia-asset-fetch/1.0 (local build script)";

const src = await fs.readFile(mediaPath, "utf8");
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const media = ctx.window.BIKE_MEDIA;
await fs.mkdir(outDir, { recursive: true });

async function get(url, file) {
  try { await fs.access(file); return "kept"; } catch {}
  // Commons rate-limits bursts (HTTP 429/503): back off and retry, honouring Retry-After
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) {
      await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
      return "saved";
    }
    if (![429, 503].includes(res.status) || attempt >= 6) throw new Error(`${res.status} ${url}`);
    const wait = (+res.headers.get("retry-after") || 5 * 2 ** attempt) * 1000;
    console.log(`  rate-limited, retrying in ${wait / 1000}s…`);
    await new Promise(r => setTimeout(r, wait));
  }
}

let html = await fs.readFile(indexPath, "utf8");
let out = src;
for (const [id, m] of Object.entries(media)) {
  if (!m.src.startsWith("http")) continue;
  const ext = path.extname(m.local);
  const small = `assets/bikes/${id}${ext}`, large = `assets/bikes/${id}@large${ext}`;
  try {
    const a = await get(m.src, path.join(root, small));
    const b = m.large === m.src ? a : await get(m.large, path.join(root, large));
    out = out.split(JSON.stringify(m.src)).join(JSON.stringify(small));
    out = out.split(JSON.stringify(m.large)).join(JSON.stringify(m.large === m.src ? small : large));
    html = html.split(m.src).join(small).split(m.large).join(m.large === m.src ? small : large);
    console.log(`#${id} ${m.file}: ${a}${m.large !== m.src ? ", large " + b : ""}`);
    await new Promise(r => setTimeout(r, 1500)); // be polite to Commons
  } catch (e) {
    console.warn(`#${id} failed (${e.message}) — keeping the remote URL`);
  }
}
// hero <img> also references the 960px thumbnail of #29 in its srcset
await fs.writeFile(mediaPath, out);
await fs.writeFile(indexPath, html);
console.log("Done. data/media.js and index.html now reference local files where downloads succeeded.");
