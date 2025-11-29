import analyzeImage from '../src/lib/analyzer.ts';
import { ThinkingLevel } from '@google/genai';
import { readFileSync } from 'fs';
import { join } from 'path';

function readPrompt(fileName: string): string {
    const filePath = join(__dirname, fileName);
    return readFileSync(filePath, 'utf-8');
}

export const ANALYSIS_PROMPT = readPrompt('system_prompt.txt');

// With file path
const result = await analyzeImage({
    image: 'tests/assets/photo_2025-11-29 12.45.24.jpeg',
    modelName: 'gemini-flash-latest',
//   thinkingLevel: ThinkingLevel.MEDIUM,
    analysisPrompt: ANALYSIS_PROMPT
});

console.log('Analysis Result:', result);