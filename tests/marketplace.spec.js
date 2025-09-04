import { test, expect } from '@playwright/test';

test('Search marketplace and open listing', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Go straight to marketplace to avoid header overlap
  await page.goto('/marktplaats/', { waitUntil: 'domcontentloaded' }).catch(async () => {
    await page.goto('/en/marketplace/', { waitUntil: 'domcontentloaded' });
  });

  const main = page.getByRole('main').first();
  await expect(main).toBeVisible();

  const truck = page.getByRole('button', { name: /vrachtwagen/i })
    .or(page.getByRole('checkbox', { name: /vrachtwagen/i }))
    .or(page.getByRole('link', { name: /vrachtwagen/i }))
    .or(main.getByText(/vrachtwagen/i));
  if (await truck.count()) await truck.first().click();

  const schuifzeilen = page.getByRole('button', { name: /schuifzeilen/i })
    .or(page.getByRole('checkbox', { name: /schuifzeilen/i }))
    .or(main.getByText(/schuifzeilen/i));
  if (await schuifzeilen.count()) await schuifzeilen.first().click();

  const yearMin = page.getByLabel(/(min|from).*(year|bouwjaar)/i)
    .or(page.getByPlaceholder(/(min|from).*(year|bouwjaar)/i)).first();
  const yearMax = page.getByLabel(/(max|to).*(year|bouwjaar)/i)
    .or(page.getByPlaceholder(/(max|to).*(year|bouwjaar)/i)).first();
  if (await yearMin.count()) await yearMin.fill('2018').catch(() => {});
  if (await yearMax.count()) await yearMax.fill('2023').catch(() => {});

  const kmInputs = page.getByLabel(/kilometer|mileage/i).or(page.getByPlaceholder(/kilometer|mileage/i));
  if (await kmInputs.count()) {
    const maxKm = (await kmInputs.count()) >= 2 ? kmInputs.nth(1) : kmInputs.first();
    await maxKm.fill('300000').catch(() => {});
  }

  const cilSel = page.getByRole('combobox', { name: /cilinders|cylinders/i })
    .or(page.getByLabel(/cilinders|cylinders/i));
  if (await cilSel.count()) {
    await cilSel.first().selectOption('6').catch(async () => {
      await page.getByRole('option', { name: /^\s*6\s*$/ }).first().click().catch(() => {});
    });
  } else {
    const cilCheck = page.getByRole('checkbox', { name: /(^|\b)6\b.*cilinders/i });
    if (await cilCheck.count()) await cilCheck.first().check().catch(() => {});
  }

  const apply = page.getByRole('button', { name: /apply|toepassen|filter/i });
  if (await apply.count()) await apply.first().click().catch(() => {});

  const firstCardLink = page.locator('a:has(img), a[href*="/equipment"], a[href*="/listing"]').first();
  await expect(firstCardLink).toBeVisible();
  await firstCardLink.click();

  await expect(page.getByRole('main').first()).toBeVisible();
  await expect(page.locator('h1, h2').first()).toBeVisible();
});
