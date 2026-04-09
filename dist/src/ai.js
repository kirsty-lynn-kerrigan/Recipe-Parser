import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { RecipeOutputSchema } from './schema';
export async function normalizeRecipeWithAi(text, partialData) {
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
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'), // Suitable model for structure extraction
            schema: RecipeOutputSchema,
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
