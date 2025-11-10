const { chromium } = require('@playwright/test');
import { test, expect } from '@playwright/test';

test('record demo', async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://jbreece.github.io/');
  await page.getByRole('link', { name: 'Resources' }).click();
  await page.getByRole('link', { name: '© 2025 Joshua Breece. All' }).click();
  await page.getByRole('textbox', { name: 'Restaurant name' }).click();
  await page.getByRole('textbox', { name: 'Restaurant name' }).fill('Testaurant');
  await page.getByRole('textbox', { name: 'Tags (comma-separated)' }).click();
  await page.getByRole('textbox', { name: 'Tags (comma-separated)' }).fill('Sandwich,Fast Casual');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Sandwich', exact: true }).click();
  await page.getByRole('button', { name: 'Fast Casual', exact: true }).click();
  await page.getByRole('button', { name: 'Spin!' }).click();

  // ---------------------
  await context.close();
  await browser.close();
});