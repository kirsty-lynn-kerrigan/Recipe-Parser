import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseRecipe } from '../src/index.js';

// Increase maximum duration to 60 seconds (Hobby Tier Max) to prevent AI and scraped timeouts from crashing the lambda
export const maxDuration = 60; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET or POST
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use GET or POST.' });
    }

    try {
        // Extract URL from query string (GET) or body (POST)
        const url = (req.query.url as string) || (req.body && req.body.url);
        const forceAiFallback = req.query.forceAi === 'true' || (req.body && req.body.forceAi === true);

        if (!url) {
            return res.status(400).json({ error: 'Missing "url" parameter in query string or body.' });
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format provided.' });
        }

        const recipe = await parseRecipe(url, forceAiFallback);
        return res.status(200).json(recipe);
    } catch (error: any) {
        console.error("Recipe Parsing Error:", error);
        return res.status(500).json({ 
            error: 'Failed to parse recipe.', 
            details: error.message 
        });
    }
}
