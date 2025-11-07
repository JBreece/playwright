import { expect, request} from '@playwright/test';

const config = {
    site: 'https://jbreece.github.io/',
}

const functions = {

    async testInternalLinks(page, site) {
        await page.goto(site);
        // get all internal links on the page
        const hrefs = await page.$$eval('a[href]', links => links.map(link => link.getAttribute('href')));
        const internalLinks = hrefs.filter(href => {
            if (!href) return false;
            if (href.startsWith('http') && !href.startsWith(site)) return false;
            if (href.startsWith('#')) return false;
            return true;
        });

        // log internal links
        console.log(`Found ${internalLinks.length} internal links.`);
        internalLinks.forEach(href => console.log(href));

        // check that each internal link loads successfully
        for (const href of internalLinks) {
            const target = href.startsWith('http') ? href : `${site}/${href.replace(/^\/+/, '')}`;
            console.log(`Checking link: ${target}`);
            const response = await page.goto(target);
            expect(response?.status(), `Failed to load link: ${target}`).toBeLessThan(400);
        }
    },

    async testExternalLinks(page, site) {
        await page.goto(site);
        // get all external links on the page
        const hrefs = await page.$$eval('a[href]', links => links.map(link => link.getAttribute('href')));
        const externalLinks = hrefs.filter(href => 
            href && href.startsWith('http') && !href.startsWith(site)
        );

        // log external links
        console.log(`Found ${externalLinks.length} external links.`);
        externalLinks.forEach(href => console.log(href));

        // check that each external link loads successfully
        const apiRequestContext = await request.newContext();
        for (const href of externalLinks) {
            console.log(`Checking link: ${href}`);
            const response = await apiRequestContext.head(href);
            expect(response.status(), `Failed to load link: ${href}`).toBeLessThan(400);
        }
    }

}

export default { functions, config };