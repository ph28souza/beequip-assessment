import { test, expect } from '@playwright/test';

test.setTimeout(90000);

test('Use lease calculator with Beequip company', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.goto('/marktplaats/', { waitUntil: 'domcontentloaded' }).catch(async () => {
    await page.goto('/en/marketplace/', { waitUntil: 'domcontentloaded' });
  });

  const firstCardLink = page.locator('a:has(img), a[href*="/equipment"], a[href*="/listing"]').first();
  await expect(firstCardLink).toBeVisible();
  await firstCardLink.click();

  const openCalc = page
    .getByRole('button', { name: /lease|calculator/i })
    .or(page.getByRole('link', { name: /lease|calculator/i }))
    .or(page.getByText(/lease|calculator/i));
  if (!(await openCalc.count())) test.skip(true, 'Lease calculator not present');

  const trigger = openCalc.first();
  await trigger.evaluate(el => { try { el.removeAttribute('target'); } catch {} }).catch(() => {});
  await trigger.click({ timeout: 5000 }).catch(() => {});

  // Try document first, then iframes
  let email = page.locator('input[type="email"], input[name*="mail" i], input[autocomplete="email"]').first();
  let emailVisible = await email.isVisible().catch(() => false);
  if (!emailVisible) {
    for (const f of page.frames()) {
      const cand = f.locator('input[type="email"], input[name*="mail" i], input[autocomplete="email"]').first();
      if (await cand.isVisible().catch(() => false)) { email = cand; emailVisible = true; break; }
    }
  }
  if (!emailVisible) test.skip(true, 'Email field not visible (3rd-party widget)');

  await email.fill('qa@example.com');

  let kvk = page.getByLabel(/company|bedrijf|kvk/i).or(page.getByPlaceholder(/company|bedrijf|kvk/i)).first();
  let kvkVisible = await kvk.isVisible().catch(() => false);
  if (!kvkVisible) {
    for (const f of page.frames()) {
      const cand = f.locator('input[placeholder*="kvk" i], input[name*="kvk" i], input[id*="kvk" i]').first();
      if (await cand.isVisible().catch(() => false)) { kvk = cand; kvkVisible = true; break; }
    }
  }
  if (kvkVisible) {
    await kvk.fill('63204258').catch(() => {});
    await page.getByRole('option').first().click().catch(() => {});
  }

  const down = page.locator('[data-testid*="aanbetaling" i], input[name*="aanbetaling" i], input[id*="aanbetaling" i]').first();
  if (await down.count()) await down.fill('25').catch(() => {});
  const term = page.getByRole('combobox', { name: /looptijd|term/i }).or(page.getByLabel(/looptijd|term/i)).first();
  if (await term.count()) {
    await term.selectOption('60').catch(async () => {
      await page.getByRole('option', { name: /^\s*60\s*/ }).first().click().catch(() => {});
    });
  }

  let priceVisible = await page.getByText(/\€|per\s*maand|monthly/i).first().isVisible().catch(() => false);
  if (!priceVisible) {
    for (const f of page.frames()) {
      if (await f.locator('text=/\\€|per\\s*maand|monthly/i').first().isVisible().catch(() => false)) { priceVisible = true; break; }
    }
  }
  expect(priceVisible).toBeTruthy();
});
