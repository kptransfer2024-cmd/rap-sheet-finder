// Captures UI screenshots into docs/screenshots. Usage: node scripts/screenshots.mjs [baseUrl]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const base = process.argv[2] ?? 'http://localhost:4173';
const out = 'docs/screenshots';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
async function shot(name, viewport, fn) {
  const page = await browser.newPage({ viewport });
  await page.goto(base);
  await page.waitForLoadState('networkidle');
  if (fn) await fn(page);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await page.close();
}
await shot('01-welcome-desktop', { width: 1280, height: 900 });
await shot('02-question-desktop', { width: 1280, height: 900 }, async (p) => {
  await p.getByRole('button', { name: /Start — it's my own record/ }).click();
  await p.getByText('Find my case number').click();
  await p.getByRole('button', { name: /Continue/ }).click();
  await p.getByText('Santa Clara County court', { exact: true }).click();
});
await shot('03-result-persona-B-desktop', { width: 1280, height: 900 }, async (p) => {
  await p.locator('[data-persona="B"]').click();
});
await shot('04-result-persona-J-desktop', { width: 1280, height: 900 }, async (p) => {
  await p.locator('[data-persona="J"]').click();
});
await shot('05-welcome-mobile', { width: 360, height: 780 });
await shot('06-question-mobile', { width: 360, height: 780 }, async (p) => {
  await p.getByRole('button', { name: /Start — it's my own record/ }).click();
});
await shot('07-result-persona-A-mobile', { width: 360, height: 780 }, async (p) => {
  await p.locator('[data-persona="A"]').click();
});
await shot('08-result-spanish-high-contrast', { width: 1280, height: 900 }, async (p) => {
  await p.getByRole('button', { name: 'Español' }).click();
  await p.getByRole('button', { name: /Alto contraste/ }).click();
  await p.locator('[data-persona="K"]').click();
});
await browser.close();
console.log('screenshots written to', out);
