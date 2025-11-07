import { test, expect} from '@playwright/test';
import utils from '../utils/utils.js';

const site = utils.config.site;

test('My GitHub Pages site loads', async ({ page }) => {
    await page.goto(site);
    await expect(page).toHaveTitle('Josh Breece Dev Portfolio');
});

test('Checking all links', async ({ page }) => {
    await utils.functions.testInternalLinks(page, site);
    await utils.functions.testExternalLinks(page, site);
});