import analyzeImage from '../src/lib/analyzer.ts';
import { readFileSync } from 'fs';
import { generateImage } from '../src/lib/image_generator.ts';
import { join } from 'path';

function readPrompt(filePath: string): string {
    return readFileSync(filePath, 'utf-8');
}

export const ANALYSIS_PROMPT = readPrompt('tests/system_prompt.txt');

const template_prompt = `
Merge this two cards into a single card, create a new unique personage that combines elements from both cards.
Replace the number at the top left corner with 87.

`


const image = await generateImage({
    generationPrompt: template_prompt,
    imageInput: 'tests/assets/photo_2025-11-29 12.45.24.jpeg',
    templateImageInput: 'assets/template.png',
    // modelName: 'gemini-2.5-flash-image',
    modelName: 'gemini-3-pro-image-preview',
    outputPath: join('tests', 'output', 'generated_image.jpg'),
}
);

console.log('Generated Image (base64):', image);