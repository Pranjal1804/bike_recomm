// End-to-end smoke test: serves the site and drives it in headless Chromium.
import { chromium } from "playwright";
import { start } from "../tools/serve.mjs";

const PORT = 5199;
const server = await start(PORT);
const browser = await chromium.launch();
const errors = [];
let failed = 0;
const check = (name, ok, detail = "") => { console.log(`${ok ? "✔" : "✘"} ${name}${detail ? " — " + detail : ""}`); if (!ok) failed++; };

try {
  for (const [label, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    console.log(`\n[${label} ${viewport.width}×${viewport.height}]`);
    const page = await browser.newPage({ viewport });
    page.on("pageerror", e => errors.push(`${label}: ${e.message}`));
    page.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(`${label}: ${m.text()}`); });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#board .lead");

    check("dataset count rendered", (await page.textContent("[data-count]")) === "36");
    check("hero readout filled", (await page.locator("#heroReadout dd").count()) === 6);
    check("lineup shows all bikes", (await page.locator("#lineupGrid .card").count()) === 36);
    check("brand filter buttons generated", (await page.locator("#brandGroup .seg__b").count()) > 5);
    check("teardown selector populated", (await page.locator("#tdBike option").count()) === 36);
    check("teardown SVG parts drawn", (await page.locator("#tdParts > *").count()) > 0);
    check("spec table rows", (await page.locator("#specTable tbody tr").count()) === 36);
    check("compare auto-filled with top 3", (await page.locator("#cmpWrap table.cmp thead th").count()) === 4);

    const top1 = await page.textContent(".lead__name");
    check("recommendation rendered", !!top1, top1);
    check("decision section matches #1", (await page.textContent("#decTitle")) === top1);

    // Change the brief → ranking must update
    await page.click('#purposeGroup [data-value="sports"]');
    await page.click('#experienceGroup [data-value="3"]');
    await page.$eval("#budget", el => { el.value = 400000; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.$eval("#power", el => { el.value = 40; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.waitForTimeout(150);
    const top2 = await page.textContent(".lead__name");
    check("ranking reacts to preferences", top2 !== top1, `${top1} → ${top2}`);
    check("budget output formatted", (await page.textContent("#budgetVal")) === "₹4.00L");

    // Segment filter
    await page.click('#segmentGroup [data-value="cruiser"]');
    await page.waitForTimeout(150);
    const leadSeg = await page.evaluate(() => BikeEngine.BIKES.find(b => b.name === document.querySelector(".lead__name").textContent).segment);
    check("segment filter respected", leadSeg === "cruiser", leadSeg);

    // Lineup tabs
    await page.click('#lineupTabs [data-seg="adventure"]');
    const adv = await page.evaluate(() => BikeEngine.BIKES.filter(b => b.segment === "adventure").length);
    check("lineup tab filters", (await page.locator("#lineupGrid .card").count()) === adv);

    // Spec sort
    await page.click('#specTable button[data-sort="power"]');
    const powers = await page.$$eval("#specTable tbody tr td:nth-child(4)", tds => tds.map(t => +t.textContent));
    check("spec table sorts by power", powers.every((v, i) => i === 0 || powers[i - 1] <= v));

    // Compare toggle via a lineup card (clear one slot first)
    await page.selectOption('#cmpPick select[data-slot="2"]', "");
    const before = await page.locator("#cmpWrap thead th").count();
    await page.locator("#lineupGrid [data-cmp]").first().click();
    check("add to compare from lineup", (await page.locator("#cmpWrap thead th").count()) === before + 1);

    // Teardown bike switch
    await page.selectOption("#tdBike", "13");
    check("teardown switches bike", (await page.textContent("#tdName")) === "KTM Duke 390");

    // Engine sanity across many random briefs
    const engineOk = await page.evaluate(() => {
      const purposes = ["commuting", "touring", "sports", "adventure", "cruiser"];
      for (let i = 0; i < 200; i++) {
        const p = purposes[i % 5];
        const r = BikeEngine.runEnsemble(BikeEngine.BIKES, { budget: 60000 + Math.random() * 1.4e6, power: 7 + Math.random() * 93, mileageImp: 1 + (i % 5), comfort: 1 + (i % 5), experience: 1 + (i % 3), maxWeight: 100 + Math.random() * 200, purpose: p, relatedPurposes: [p], segment: "any", brand: "any" });
        if (!r.ensemble.length || r.ensemble.some(x => !Number.isFinite(x.ensembleScore))) return false;
      }
      return true;
    });
    check("engine returns finite scores for 200 random briefs", engineOk);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check("no horizontal page overflow", overflow <= 1, `${overflow}px`);
    await page.screenshot({ path: `tests/screenshot-${label}.png` });
    await page.close();
  }
  check("no JavaScript errors", errors.length === 0, errors.join(" | "));
} finally {
  await browser.close();
  server.close();
}
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
