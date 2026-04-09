"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMetadata = extractMetadata;
exports.extractTextContent = extractTextContent;
const cheerio = __importStar(require("cheerio"));
const schema_1 = require("./schema");
function extractPlainText(html) {
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, aside').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
}
function parseJsonLd($) {
    let recipeData = null;
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const content = $(el).html();
            if (!content)
                return;
            const parsed = JSON.parse(content);
            // JSON-LD can be an array of objects or an object containing a @graph array
            const searchGraph = (data) => {
                if (Array.isArray(data)) {
                    for (const item of data) {
                        if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
                            recipeData = item;
                            return;
                        }
                    }
                }
                else if (data['@graph'] && Array.isArray(data['@graph'])) {
                    searchGraph(data['@graph']);
                }
                else if (data && (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe')))) {
                    recipeData = data;
                }
            };
            searchGraph(parsed);
        }
        catch (e) {
            // Ignore parse errors on individual scripts
        }
    });
    return recipeData;
}
function extractMetadata($) {
    const ld = parseJsonLd($);
    let title = undefined;
    let description = undefined;
    let image = undefined;
    let ingredients = [];
    let high_level_steps = [];
    if (ld) {
        title = ld.name;
        description = ld.description;
        if (ld.image) {
            if (typeof ld.image === 'string')
                image = ld.image;
            else if (Array.isArray(ld.image) && ld.image.length > 0)
                image = typeof ld.image[0] === 'string' ? ld.image[0] : ld.image[0].url;
            else if (ld.image.url)
                image = ld.image.url;
        }
        if (Array.isArray(ld.recipeIngredient)) {
            ingredients = ld.recipeIngredient;
        }
        if (Array.isArray(ld.recipeInstructions)) {
            high_level_steps = ld.recipeInstructions.map((step) => {
                if (typeof step === 'string')
                    return step;
                if (step.text)
                    return step.text;
                return '';
            }).filter((s) => s.trim().length > 0);
        }
    }
    else {
        // Fallback to meta tags & basic HTML scraping
        title = $('meta[property="og:title"]').attr('content') || $('title').text();
        description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
        image = $('meta[property="og:image"]').attr('content');
    }
    const partialRecipe = {
        title,
        description: description || null,
        image: image || null,
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        high_level_steps: high_level_steps.length > 0 ? high_level_steps : undefined
    };
    const isComplete = Boolean(partialRecipe.title &&
        partialRecipe.ingredients && partialRecipe.ingredients.length > 0 &&
        partialRecipe.high_level_steps && partialRecipe.high_level_steps.length > 0);
    return { partialRecipe, isComplete };
}
function extractTextContent(html) {
    return extractPlainText(html);
}
//# sourceMappingURL=extractor.js.map