/**
 * gen_pdf.mjs — Generate bike_recommendation_model.pdf from model_doc.html
 * Run with: node tools/gen_pdf.mjs
 * Requires: playwright (already a devDependency of this project)
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

const __dir = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dir, "model_doc.html");
const pdfOut   = join(__dir, "..", "bike_recommendation_model.pdf");

if (!existsSync(htmlPath)) {
  console.error("model_doc.html not found — run from the project root.");
  process.exit(1);
}

console.log("Launching browser…");
const browser = await chromium.launch();
const page    = await browser.newPage();

// Load the local HTML file
await page.goto("file://" + htmlPath, { waitUntil: "networkidle" });

// Extra wait so Google Fonts load (falls back gracefully if offline)
await page.waitForTimeout(2000);

console.log("Generating PDF…");
await page.pdf({
  path: pdfOut,
  format: "A4",
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await browser.close();
console.log("✓  PDF written to:", pdfOut);
