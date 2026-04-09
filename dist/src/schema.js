import { z } from "zod";
export const RecipeOutputSchema = z.object({
    title: z.string().min(1, "Title is required").describe("The title of the recipe."),
    description: z.string().nullable().describe("Short summary of the recipe. Null if missing."),
    image: z.string().url().nullable().describe("URL to the main recipe image. Null if missing."),
    ingredients: z.array(z.string()).min(1, "At least one ingredient is required").describe("List of exact ingredients including measurements."),
    high_level_steps: z.array(z.string()).min(1, "At least one instruction step is required").describe("Concise, high-level instruction steps summarizing the recipe preparation process.")
});
