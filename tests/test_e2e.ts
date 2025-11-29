import analyzeImage from '../src/lib/analyzer.ts';
import { readFileSync } from 'fs';
import { generateImage } from '../src/lib/image_generator.ts';
import { join } from 'path';

function readPrompt(filePath: string): string {
    return readFileSync(filePath, 'utf-8');
}

export const ANALYSIS_PROMPT = readPrompt('tests/system_prompt.txt');

// With file path
const result = await analyzeImage({
    image: 'tests/assets/photo_2025-11-29 12.45.24.jpeg',
    // modelName: 'gemini-3-pro-preview',
    modelName: 'gemini-flash-latest',
    //   thinkingLevel: ThinkingLevel.MEDIUM,
    analysisPrompt: ANALYSIS_PROMPT
});

console.log('Analysis Result:', result);

const template_prompt = `
Create an animated creative gaming card from the attached image
and put it into attached frame, add this name "${result.name}" at the top and replace "LVL" with creativity-score "${result.creativityScore}".
Output should be a high-quality gaming card image, hearthstone-like.
Also use this suggestion prompt for animating object: ${result.prompt_for_image_generation};
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