import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { normalizeMaterials } from './utils.js';

interface AnalysisResponse {
  name: string;
  creativityScore: number;
  materials: {
    metal: number;
    synthetic: number;
    stone: number;
    organic: number;
    fabric: number;
    [key: string]: number;
  };
  prompt_for_image_generation?: string;
}

interface AnalyzeImageOptions {
  image: string; // base64 string or file path
  modelName?: string;
  thinkingLevel?: ThinkingLevel;
  apiKey?: string;
  analysisPrompt: string;
}

/**
 * Analyzes an image using Google Gemini AI
 * @param options - Configuration options
 * @param options.image - Either a base64 encoded image string or a file path
 * @param options.modelName - Gemini model name (default: 'gemini-3-pro-preview')
 * @param options.thinkingLevel - Thinking level for the model (default: ThinkingLevel.LOW)
 * @param options.apiKey - Google API key (falls back to GEMINI_API_KEY env var)
 * @param options.analysisPrompt - The prompt to use for analysis
 * @returns Analyzed image data with normalized materials
 */
export async function analyzeImage(options: AnalyzeImageOptions): Promise<AnalysisResponse> {
  const {
    image,
    modelName = 'gemini-3-pro-preview',
    thinkingLevel = ThinkingLevel.LOW,
    apiKey = process.env.GEMINI_API_KEY,
    analysisPrompt
  } = options;

  if (!image) {
    throw new Error('Image is required');
  }

  if (!apiKey) {
    throw new Error('API key is required. Provide it via options.apiKey or GEMINI_API_KEY environment variable');
  }

  // Determine if input is base64 or file path
  let base64Data: string;
  let mimeType = 'image/jpeg';

  if (image.startsWith('data:image/')) {
    // Already base64 with data URL prefix
    base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  } else if (image.includes(';base64,')) {
    // Base64 with prefix but not data URL
    base64Data = image.split(';base64,')[1];
  } else if (image.length > 500 && !image.includes('/') && !image.includes('\\')) {
    // Likely raw base64 string (long string without path separators)
    base64Data = image;
  } else {
    // Assume it's a file path
    try {
      const fileBuffer = await fs.readFile(image);
      base64Data = fileBuffer.toString('base64');
      
      // Determine mime type from file extension
      const ext = path.extname(image).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
      };
      mimeType = mimeTypes[ext] || 'image/jpeg';
    } catch (error) {
      throw new Error(`Failed to read image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        parts: [
          { text: analysisPrompt },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      ...(modelName.toLowerCase().includes('flash') ? {} : {
        thinkingConfig: {
          thinkingLevel
        }
      })
    }
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.[0];
  const text = textPart?.text;

  if (!text) {
    throw new Error('No text in response from AI model');
  }

  let data: AnalysisResponse;
  try {
    data = JSON.parse(text) as AnalysisResponse;
  } catch (e) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Invalid AI response: Failed to parse JSON');
  }

  // Normalize materials
  data.materials = normalizeMaterials(data.materials || {}) as AnalysisResponse['materials'];

  return data;
}

export default analyzeImage;
