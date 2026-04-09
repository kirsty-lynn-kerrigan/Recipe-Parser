"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const node_1 = require("@vercel/node");
const index_1 = require("../src/index");
async function handler(req, res) {
    // Only allow GET or POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use GET or POST.' });
    }
    try {
        // Extract URL from query string (GET) or body (POST)
        const url = req.query.url || (req.body && req.body.url);
        const forceAiFallback = req.query.forceAi === 'true' || (req.body && req.body.forceAi === true);
        if (!url) {
            return res.status(400).json({ error: 'Missing "url" parameter in query string or body.' });
        }
        // Basic URL validation
        try {
            new URL(url);
        }
        catch (e) {
            return res.status(400).json({ error: 'Invalid URL format provided.' });
        }
        const recipe = await (0, index_1.parseRecipe)(url, forceAiFallback);
        return res.status(200).json(recipe);
    }
    catch (error) {
        console.error("Recipe Parsing Error:", error);
        return res.status(500).json({
            error: 'Failed to parse recipe.',
            details: error.message
        });
    }
}
//# sourceMappingURL=parse.js.map