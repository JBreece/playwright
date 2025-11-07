import { expect, request} from '@playwright/test';

const config = {
    site: 'https://jbreece.github.io/',
    recursionDepth: 10,
}

function normalizeUrl(base, href) {
  const url = new URL(href, base).href;
  return url
    .replace(/index\.html$/, '')   // remove "index.html"
    .replace(/\/+$/, '')           // remove trailing slashes
    .replace(/([^:]\/)\/+/g, '$1'); // fix double slashes
}

const functions = {

    async testInternalLinks(page, site, visited = new Set(), depth = 0, maxDepth = config.recursionDepth) {
        if (depth > maxDepth) return;
        const current = new URL(site, await page.url() || site).href;  // normalize URL
        // console.log(`Visiting: ${current} at depth ${depth}`);
        const normalized = normalizeUrl(site, current);
        if (visited.has(normalized)) return;
        visited.add(normalized);
        // if (visited.has(current)) return;
        // visited.add(current);
        // console.log(`Visited ${visited.size} pages so far.  Added ${current}`);

        await page.goto(current);

        // get all internal links on the page
        const hrefs = await page.$$eval('a[href]', links => links.map(link => link.getAttribute('href')));
        const internalLinks = hrefs.filter(href => {
            if (!href) return false;
            const normalizedHref = normalizeUrl(current, href);
            if (normalizedHref.startsWith('http') && !normalizedHref.startsWith(config.site)) return false;
            if (normalizedHref.startsWith('#')) return false;
            if (/^(mailto:|tel:|javascript:)/i.test(normalizedHref)) return false; // skip non-http schemes
            // if (normalizedHref === current) return false; // skip self-links
            return true;
        });

        // log internal links
        // console.log(`Found ${internalLinks.length} internal links.`);
        // internalLinks.forEach(href => console.log(href));

        // check that each internal link loads successfully
        for (const href of internalLinks) {
            // const target = href.startsWith('http') ? href : `${site}/${href.replace(/^\/+/, '')}`;
            const target = new URL(href, current).href;  // normalize URL
            const normalizedTarget = normalizeUrl(current, target);
            // console.log(`Checking link: ${target}`);
            const response = await page.goto(normalizedTarget);
            expect(response?.status(), `Failed to load link: ${normalizedTarget}`).toBeLessThan(400);
            const newPage = await page.context().newPage();
            await this.testInternalLinks(newPage, normalizedTarget, visited, depth + 1);  // recursive check - go to each internal link and do the same test
            await newPage.close();
        }
        if (depth === 0) {
            console.log(`Completed checking internal links. Total unique pages visited: ${visited.size}.  Visited:`);
            for(const url of visited) {
                console.log(`•${url}`);
            }
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