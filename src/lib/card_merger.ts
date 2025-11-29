import { GalleryItem } from "@/common/types"
import { generateImage } from "./image_generator"

/**
 * Merges two cards into a single new card with generated artwork
 * @param card1 - First card to merge
 * @param card2 - Second card to merge
 * @returns Promise resolving to the new merged GalleryItem
 */
export async function mergeCards(card1: GalleryItem, card2: GalleryItem): Promise<GalleryItem> {
    // Get the images from the cards
    const image1 = card1.image || card1.originalImage
    const image2 = card2.image || card2.originalImage

    if (!image1 || !image2) {
        throw new Error("Both cards must have valid images")
    }

    const name1 = card1.analysis.name
    const name2 = card2.analysis.name

    const new_creativity_score = Math.max(card1.analysis.creativityScore, card2.analysis.creativityScore) + Math.floor(Math.random() * 10) + 2;

    // Generate merge prompt for the image generation
    const mergeImagePrompt = `
Merge these two cards into a single unified gaming card. Create a new unique personage that combines elements from both cards.
Blend visual and conceptual traits of "${name1}" and "${name2}" into a cohesive Hearthstone-like character.
The card should have a diamond-shaped gem at the bottom and be high-quality with animated elements.
Do not add description text, only the animated personage on the card.
Replace number at the top left corner with ${new_creativity_score}.
`

    // Generate the merged image
    const mergedImageBase64 = await generateImage({
        generationPrompt: mergeImagePrompt,
        imageInput: image1,
        templateImageInput: image2,
        modelName: "gemini-3-pro-image-preview",
    })

    if (!mergedImageBase64) {
        throw new Error("Failed to generate merged image")
    }

    // Combine materials from both cards - average them
    const mergedMaterials = {
        metal: card1.analysis.materials.metal + card2.analysis.materials.metal,
        synthetic: card1.analysis.materials.synthetic + card2.analysis.materials.synthetic,
        stone: card1.analysis.materials.stone + card2.analysis.materials.stone,
        organic: card1.analysis.materials.organic + card2.analysis.materials.organic,
        fabric: card1.analysis.materials.fabric + card2.analysis.materials.fabric,
    }


    // Create merged name by combining elements
    const mergedName = `${name1.split(" ")[0]}-${name2.split(" ")[0]} Symbiote`

    // Create new merged card
    const mergedCard: GalleryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        image: mergedImageBase64,
        originalImage: undefined,
        analysis: {
            name: mergedName,
            creativityScore: new_creativity_score,
            materials: mergedMaterials,
        },
    }

    return mergedCard
}