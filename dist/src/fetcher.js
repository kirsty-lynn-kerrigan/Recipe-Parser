"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHtmlWithUserAgent = fetchHtmlWithUserAgent;
const ofetch_1 = require("ofetch");
async function fetchHtmlWithUserAgent(url) {
    try {
        const html = await (0, ofetch_1.ofetch)(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000,
            retry: 2,
        });
        if (typeof html === 'string') {
            return html;
        }
        throw new Error('Response is not text/html');
    }
    catch (error) {
        throw new Error(`Failed to fetch URL ${url}. Error: ${error.message}`);
    }
}
