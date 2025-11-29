import { GoogleGenAI } from '@google/genai';
import { normalizeMaterials } from './utils.js';

interface MergeResponse {
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
}

interface MergeEntitiesOptions {
  image1: string;
  name1: string;
  image2: string;
  name2: string;
  apiKey?: string;
  mergePrompt: string;
  modelName?: string;
}

/**
 * Merges two entities into a new one using Google Gemini AI
 */
export async function mergeEntities(options: MergeEntitiesOptions): Promise<MergeResponse> {
  const {
    image1,
    name1,
    image2,
    name2,
    apiKey = process.env.GEMINI_API_KEY,
    mergePrompt,
    modelName = 'gemini-3-pro-image-preview'
  } = options;

  if (!image1 || !image2 || !name1 || !name2) {
    throw new Error('Two images and two names are required');
  }

  if (!apiKey) {
    throw new Error('API key is required. Provide it via options.apiKey or GEMINI_API_KEY environment variable');
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data1 = image1.replace(/^data:image\/\w+;base64,/, "");
  const base64Data2 = image2.replace(/^data:image\/\w+;base64,/, "");

  console.log(`Merging ${name1} and ${name2}... on model ${modelName}`);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        parts: [
          { text: mergePrompt },
          { text: `Entity 1: ${name1}` },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data1 } },
          { text: `Entity 2: ${name2}` },
          { inlineData: { mimeType: 'image/jpeg', data: base64Data2 } }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
    }
  });

  const candidate = response.candidates?.[0];
  const textPart = candidate?.content?.parts?.[0];
  const text = textPart?.text;

  if (!text) {
    throw new Error('No text in response');
  }

  let data: MergeResponse;
  try {
    data = JSON.parse(text) as MergeResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error('Invalid AI response');
  }

  // Normalize materials
  data.materials = normalizeMaterials(data.materials || {}) as MergeResponse['materials'];

  return data;
}

export default mergeEntities;

