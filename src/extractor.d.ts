import * as cheerio from 'cheerio';
import { RecipeOutput } from './schema';
export declare function extractMetadata($: cheerio.CheerioAPI): {
    partialRecipe: Partial<RecipeOutput>;
    isComplete: boolean;
};
export declare function extractTextContent(html: string): string;
//# sourceMappingURL=extractor.d.ts.map