"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeOutputSchema = void 0;
const zod_1 = require("zod");
exports.RecipeOutputSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").describe("The title of the recipe."),
    description: zod_1.z.string().nullable().describe("Short summary of the recipe. Null if missing."),
    image: zod_1.z.string().url().nullable().describe("URL to the main recipe image. Null if missing."),
    ingredients: zod_1.z.array(zod_1.z.string()).min(1, "At least one ingredient is required").describe("List of exact ingredients including measurements."),
    high_level_steps: zod_1.z.array(zod_1.z.string()).min(1, "At least one instruction step is required").describe("Concise, high-level instruction steps summarizing the recipe preparation process.")
});
//# sourceMappingURL=schema.js.map