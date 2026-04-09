import { parseRecipe } from './src/index';
async function main() {
    const url = process.argv[2] || 'https://www.simplyrecipes.com/recipes/banana_bread/';
    console.log(`Parsing URL: ${url}`);
    try {
        const recipe = await parseRecipe(url);
        console.log("\nRecipe Extracted Successfully:\n");
        console.log(JSON.stringify(recipe, null, 2));
    }
    catch (e) {
        console.error("Failed to parse recipe:", e.message);
    }
}
main();
