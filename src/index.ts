import * as cheerio from 'cheerio';
import { RecipeOutputSchema } from './schema.js';
import type { RecipeOutput } from './schema.js';
import { fetchHtmlWithUserAgent } from './fetcher.js';
import { extractMetadata, extractTextContent } from './extractor.js';
import { normalizeRecipeWithAi } from './ai.js';

function validateAndSanitize(data: any): RecipeOutput {
    // Basic deduplication for ingredients
    if (Array.isArray(data.ingredients)) {
        data.ingredients = [...new Set(data.ingredients.map((i: string) => i.trim()).filter((i: string) => i.length > 0))];
    }
    
    if (Array.isArray(data.high_level_steps)) {
        data.high_level_steps = [...new Set(data.high_level_steps.map((s: string) => s.trim()).filter((s: string) => s.length > 0))];
    }

    // Strict schema parse
    return RecipeOutputSchema.parse(data);
}

export async function parseRecipe(url: string, forceAiFallback: boolean = false): Promise<RecipeOutput> {
    // 1. Fetching
    const html = await fetchHtmlWithUserAgent(url);
    const $ = cheerio.load(html);

    // 2. Deterministic Extraction
    const { partialRecipe, isComplete } = extractMetadata($);

    // 3. Completeness Check
    if (isComplete && !forceAiFallback) {
        console.log("Extracted deterministically from HTML/JSON-LD.");
        return validateAndSanitize(partialRecipe);
    }

    console.log("Incomplete layout or force AI applied. Using AI fallback...");

    // 4. Extract Text Payload for AI
    const rawTextContent = extractTextContent(html);

    // 5. AI Normalization
    const aiExtractedData = await normalizeRecipeWithAi(rawTextContent, partialRecipe);

    // 6. Final Validation & Sanitize
    return validateAndSanitize(aiExtractedData);
}

export { RecipeOutputSchema };
export type { RecipeOutput };
