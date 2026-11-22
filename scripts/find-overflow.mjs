// Dev helper: reports elements wider than a 360px viewport for each persona result.
import { chromium } from '@playwright/test';
const base = process.argv[2] ?? 'http://localhost:4173';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 360, height: 780 } });
p.setDefaultTimeout(15000);
for (const persona of ['welcome', 'A', 'B', 'J', 'G', 'F', 'E']) {
  await p.goto(base, { waitUntil: 'domcontentloaded' });
  if (persona !== 'welcome') await p.locator(`[data-persona="${persona}"]`).click();
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll('main *, header *')) {
      const rect = el.getBoundingClientRect();
      if (rect.right > W + 1 && rect.width > 0 && bad.length < 5) bad.push(`${el.tagName}.${String(el.className).slice(0, 50)} r=${Math.round(rect.right)} "${(el.textContent || '').slice(0, 30)}"`);
    }
    return { sw: document.documentElement.scrollWidth, W, bad };
  });
  console.log(persona, JSON.stringify(r));
}
await b.close();
