import { z } from "zod";
export declare const RecipeOutputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    image: z.ZodNullable<z.ZodString>;
    ingredients: z.ZodArray<z.ZodString>;
    high_level_steps: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type RecipeOutput = z.infer<typeof RecipeOutputSchema>;
//# sourceMappingURL=schema.d.ts.map