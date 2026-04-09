"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRecipeWithAi = normalizeRecipeWithAi;
const ai_1 = require("ai");
const openai_1 = require("@ai-sdk/openai");
const schema_1 = require("./schema");
async function normalizeRecipeWithAi(text, partialData) {
    const rawContent = text.slice(0, 15000); // Truncate to limit tokens
    const systemPrompt = `You are a strict recipe extraction assistant. You have been provided with raw text and partial metadata extracted from a recipe web page.
Your task is to populate the required JSON schema with the recipe information.

STRICT RULES:
1. ONLY return valid JSON matching the schema.
2. DO NOT invent or hallucinate missing facts. If an image URL or description is missing in the source, return null.
3. Preserve ingredients exactly as written, including measurements.
4. Summarize long, chatty instruction paragraphs into concise, high-level steps.
5. Ignore promotional content, author backstories, and non-recipe text.
6. Flatten multi-part recipes (e.g., 'For the cake:', 'For the frosting:') into a single logical sequence of high-level steps.`;
    const prompt = `Extracted Partial Data:
${JSON.stringify(partialData, null, 2)}

Raw Page Text Context:
${rawContent}
`;
    try {
        const { object } = await (0, ai_1.generateObject)({
            model: (0, openai_1.openai)('gpt-4o-mini'), // Suitable model for structure extraction
            schema: schema_1.RecipeOutputSchema,
            system: systemPrompt,
            prompt: prompt,
            temperature: 0.1, // Low temp for more deterministic output
        });
        return object;
    }
    catch (error) {
        throw new Error(`AI Normalization Failed: ${error.message}`);
    }
}
//# sourceMappingURL=ai.js.map