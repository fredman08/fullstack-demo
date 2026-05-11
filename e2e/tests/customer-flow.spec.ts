import { test, expect } from '@playwright/test';

test('full customer lifecycle: create → view detail → delete', async ({ page }) => {
  const uniqueId = Date.now();
  const name = `Playwright User ${uniqueId}`;
  const email = `playwright-${uniqueId}@example.com`;

  await page.goto('/');

  await expect(page).toHaveURL(/\/customers$/);
  await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();

  await page.getByTestId('new-customer-btn').click();
  await expect(page).toHaveURL(/\/customers\/new$/);

  await page.getByTestId('name-input').fill(name);
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('submit-btn').click();

  await expect(page).toHaveURL(/\/customers$/);
  const createdRow = page
    .getByTestId('customer-row')
    .filter({ hasText: email });
  await expect(createdRow).toBeVisible({ timeout: 10000 });

  await createdRow.getByTestId('customer-name-link').click();
  await expect(page).toHaveURL(/\/customers\/\d+$/);
  await expect(page.getByTestId('customer-detail')).toBeVisible();
  await expect(page.getByTestId('customer-name')).toHaveText(name);
  await expect(page.getByTestId('customer-email')).toHaveText(email);

  await expect(page.getByTestId('audit-entry').first()).toBeVisible({ timeout: 5000 });

  await page.goBack();
  await expect(page).toHaveURL(/\/customers$/);

  page.once('dialog', (dialog) => dialog.accept());
  await createdRow.getByTestId('delete-btn').click();

  await expect(
    page.getByTestId('customer-row').filter({ hasText: email }),
  ).toHaveCount(0, { timeout: 10000 });
});

test('form validation blocks invalid input', async ({ page }) => {
  await page.goto('/customers/new');

  await page.getByTestId('submit-btn').click();

  await expect(page.getByTestId('form-error')).toBeVisible();
});
