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
exports.RecipeOutputSchema = void 0;
exports.parseRecipe = parseRecipe;
const cheerio = __importStar(require("cheerio"));
const schema_1 = require("./schema");
Object.defineProperty(exports, "RecipeOutputSchema", { enumerable: true, get: function () { return schema_1.RecipeOutputSchema; } });
const fetcher_1 = require("./fetcher");
const extractor_1 = require("./extractor");
const ai_1 = require("./ai");
function validateAndSanitize(data) {
    // Basic deduplication for ingredients
    if (Array.isArray(data.ingredients)) {
        data.ingredients = [...new Set(data.ingredients.map((i) => i.trim()).filter((i) => i.length > 0))];
    }
    if (Array.isArray(data.high_level_steps)) {
        data.high_level_steps = [...new Set(data.high_level_steps.map((s) => s.trim()).filter((s) => s.length > 0))];
    }
    // Strict schema parse
    return schema_1.RecipeOutputSchema.parse(data);
}
async function parseRecipe(url, forceAiFallback = false) {
    // 1. Fetching
    const html = await (0, fetcher_1.fetchHtmlWithUserAgent)(url);
    const $ = cheerio.load(html);
    // 2. Deterministic Extraction
    const { partialRecipe, isComplete } = (0, extractor_1.extractMetadata)($);
    // 3. Completeness Check
    if (isComplete && !forceAiFallback) {
        console.log("Extracted deterministically from HTML/JSON-LD.");
        return validateAndSanitize(partialRecipe);
    }
    console.log("Incomplete layout or force AI applied. Using AI fallback...");
    // 4. Extract Text Payload for AI
    const rawTextContent = (0, extractor_1.extractTextContent)(html);
    // 5. AI Normalization
    const aiExtractedData = await (0, ai_1.normalizeRecipeWithAi)(rawTextContent, partialRecipe);
    // 6. Final Validation & Sanitize
    return validateAndSanitize(aiExtractedData);
}
//# sourceMappingURL=index.js.map