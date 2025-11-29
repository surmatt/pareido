import analyzeImage from '../src/lib/analyzer.ts';
import { readFileSync, readdirSync } from 'fs';
import { generateImage } from '../src/lib/image_generator.ts';
import { join } from 'path';

function readPrompt(filePath: string): string {
    return readFileSync(filePath, 'utf-8');
}

export const ANALYSIS_PROMPT = readPrompt('tests/system_prompt.txt');

const folder_w_images = 'tests/assets/';
const output_folder = 'tests/output/';

// Get all image files from tests/assets
const imageFiles = readdirSync(folder_w_images).filter(file => 
    /\.(jpeg|jpg|png|gif)$/i.test(file)
);

console.log(`Found ${imageFiles.length} images to process`);

// Loop through all images
for (let i = 0; i < imageFiles.length; i++) {
    const imageName = imageFiles[i];
    const imagePath = join(folder_w_images, imageName);
    const outputPath = join(output_folder, `generated_image_${i + 1}.jpg`);
    
    console.log(`\n--- Processing image ${i + 1}/${imageFiles.length}: ${imageName} ---`);
    
    try {
        // Analyze the image
        const result = await analyzeImage({
            image: imagePath,
            modelName: 'gemini-flash-latest',
            analysisPrompt: ANALYSIS_PROMPT
        });

        console.log('Analysis Result:', result);

        // Generate creative gaming card
        const template_prompt = `
Create an animated creative gaming card from the attached image
and put it into attached frame, add this name "${result.name}" at the top and replace "LVL" with this number "${result.creativityScore}".
Output should be a high-quality gaming card image, hearthstone-like. DO not add description below image.
Also use this suggestion prompt for animating object: ${result.prompt_for_image_generation};
`;

        const image = await generateImage({
            generationPrompt: template_prompt,
            imageInput: imagePath,
            templateImageInput: 'assets/template.png',
            modelName: 'gemini-3-pro-image-preview',
            outputPath: outputPath,
        });

        console.log(`Image saved to: ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${imageName}:`, error);
    }
}