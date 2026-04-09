import * as cheerio from 'cheerio';
import { RecipeOutput } from './schema';

function extractPlainText(html: string): string {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, aside').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
}

function parseJsonLd($: cheerio.CheerioAPI): any | null {
    let recipeData = null;
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const content = $(el).html();
            if (!content) return;
            const parsed = JSON.parse(content);
            
            // JSON-LD can be an array of objects or an object containing a @graph array
            const searchGraph = (data: any) => {
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
                            recipeData = item;
                            return;
                        }
                    }
                } else if (data['@graph'] && Array.isArray(data['@graph'])) {
                    searchGraph(data['@graph']);
                } else if (data && (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe')))) {
                    recipeData = data;
                }
            };

            searchGraph(parsed);
        } catch (e) {
            // Ignore parse errors on individual scripts
        }
    });
    return recipeData;
}

export function extractMetadata($: cheerio.CheerioAPI): { partialRecipe: Partial<RecipeOutput>, isComplete: boolean } {
    const ld = parseJsonLd($);
    
    let title: string | undefined = undefined;
    let description: string | undefined = undefined;
    let image: string | undefined = undefined;
    let ingredients: string[] = [];
    let high_level_steps: string[] = [];

    if (ld) {
        title = ld.name;
        description = ld.description;
        
        if (ld.image) {
            if (typeof ld.image === 'string') image = ld.image;
            else if (Array.isArray(ld.image) && ld.image.length > 0) image = typeof ld.image[0] === 'string' ? ld.image[0] : ld.image[0].url;
            else if (ld.image.url) image = ld.image.url;
        }

        if (Array.isArray(ld.recipeIngredient)) {
            ingredients = ld.recipeIngredient;
        }

        if (Array.isArray(ld.recipeInstructions)) {
            high_level_steps = ld.recipeInstructions.map((step: any) => {
                if (typeof step === 'string') return step;
                if (step.text) return step.text;
                return '';
            }).filter((s: string) => s.trim().length > 0);
        }
    } else {
        // Fallback to meta tags & basic HTML scraping
        title = $('meta[property="og:title"]').attr('content') || $('title').text();
        description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        image = $('meta[property="og:image"]').attr('content');
    }

    const partialRecipe: Partial<RecipeOutput> = {
        title,
        description: description || null,
        image: image || null,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        high_level_steps: high_level_steps.length > 0 ? high_level_steps : undefined
    };

    const isComplete = Boolean(
        partialRecipe.title &&
        partialRecipe.ingredients && partialRecipe.ingredients.length > 0 &&
        partialRecipe.high_level_steps && partialRecipe.high_level_steps.length > 0
    );

    return { partialRecipe, isComplete };
}

export function extractTextContent(html: string): string {
    return extractPlainText(html);
}
