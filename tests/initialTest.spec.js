import { test, expect} from '@playwright/test';
import utils from '../utils/utils.js';

test('My GitHub Pages site loads', async ({ page }) => {
    const site = 'https://jbreece.github.io/';

    await page.goto(site);
    await expect(page).toHaveTitle('Josh Breece Dev Portfolio');
    await utils.functions.testInternalLinks(page, site);
    await utils.functions.testExternalLinks(page, site);
});