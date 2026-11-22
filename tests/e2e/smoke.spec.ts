import { expect, test } from '@playwright/test';

const OFFICIAL = [
  'santaclara.courts.ca.gov',
  'portal.scscourt.org',
  'pro.santaclaracounty.gov',
  'pdo.santaclaracounty.gov',
  'selfhelp.courts.ca.gov',
  'courts.ca.gov',
  'oag.ca.gov',
  'fbi.gov',
  'edo.cjis.gov',
  'cand.uscourts.gov',
  'ndcalfpd.org',
  'justice.gov',
  'sf.courts.ca.gov',
  'alameda.courts.ca.gov',
];

test.describe('Rap Sheet Finder smoke', () => {
  test('loads with no console errors and makes no third-party requests', async ({ page }) => {
    const errors: string[] = [];
    const foreign: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('request', (r) => {
      const host = new URL(r.url()).hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') foreign.push(r.url());
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Let's find the easiest practical next step.");
    await page.locator('[data-persona="A"]').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your plan');
    expect(errors).toEqual([]);
    expect(foreign).toEqual([]);
  });

  test('keyboard-only: Example 1 reaches the index route', async ({ page }) => {
    await page.goto('/');
    const tabUntil = async (pred: () => Promise<boolean>) => {
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab');
        if (await pred()) return;
      }
      throw new Error('not reachable by keyboard');
    };
    const focusedText = () => page.evaluate(() => document.activeElement?.textContent ?? '');
    await tabUntil(async () => (await focusedText()).includes("Start — it's my own record"));
    await page.keyboard.press('Enter');

    const pick = async (label: string) => {
      await tabUntil(async () => page.evaluate(() => (document.activeElement as HTMLInputElement)?.type === 'radio'));
      for (let i = 0; i < 10; i++) {
        const current = await page.evaluate(() => (document.activeElement as HTMLInputElement).closest('label')?.textContent ?? '');
        if (current.startsWith(label)) break;
        await page.keyboard.press('ArrowDown');
      }
      await page.keyboard.press('Space');
      await page.keyboard.press('Enter');
    };
    await pick('Find my case number');
    // jurisdiction is a checkbox group
    await tabUntil(async () => page.evaluate(() => (document.activeElement as HTMLInputElement)?.value === 'santa_clara'));
    await page.keyboard.press('Space');
    await page.keyboard.press('Enter');
    await pick('One case');
    await pick('No');
    await pick('2004 or later');
    await pick('Not yet');
    await tabUntil(async () => (await focusedText()) === 'Skip this question');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your plan');
    await expect(page.locator('[data-primary="true"]')).toHaveAttribute('data-outcome', 'SC_INDEX_LOOKUP');
  });

  test('every external link on every example plan is an official site', async ({ page }) => {
    for (const persona of 'ABCDEFGHIJKL'.split('')) {
      await page.goto('/');
      await page.locator(`[data-persona="${persona}"]`).click();
      const hrefs = await page.locator('main a[href^="http"]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const h of hrefs) {
        const host = new URL(h).hostname.replace(/^www\./, '');
        if (host === 'openstreetmap.org') continue; // plain map search link for an address card
        expect(OFFICIAL.some((d) => host === d || host.endsWith(`.${d}`)), `${persona}: ${h}`).toBe(true);
      }
    }
  });

  test('print view hides answers and controls, keeps steps and the legal notice', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-persona="K"]').click();
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByRole('button', { name: /Print/ })).toBeHidden();
    await expect(page.getByRole('progressbar')).toBeHidden(); // answers sidebar
    await expect(page.getByText(/not legal advice/).first()).toBeVisible();
    await expect(page.locator('[data-primary="true"] [data-step]').first()).toBeVisible();
    const printed = await page.locator('main').innerText();
    expect(printed).not.toMatch(/sc_case_number|whose_record|practical=/);
  });

  test('no horizontal scrolling at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 });
    await page.goto('/');
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: /Start — it's my own record/ }).click();
    expect(await overflow()).toBeLessThanOrEqual(0);
    for (const persona of ['A', 'F', 'J']) {
      await page.goto('/');
      await page.locator(`[data-persona="${persona}"]`).click();
      expect(await overflow(), persona).toBeLessThanOrEqual(0);
    }
  });

  test('glossary dialog opens and closes with Escape', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Words to know/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('high contrast and larger text toggles apply', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /High contrast/ }).click();
    await page.getByRole('button', { name: /Larger text/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
    await expect(page.locator('html')).toHaveAttribute('data-text', 'large');
  });

  test('refresh discards answers (no persistence)', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-persona="B"]').click();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Let's find the easiest practical next step.");
  });
});
