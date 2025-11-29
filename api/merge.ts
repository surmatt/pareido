import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { MERGE_PROMPT } from '../prompts.js';

const router = express.Router();

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

router.post('/merge', async (req: Request, res: Response) => {
  try {
    const { image1, name1, image2, name2 } = req.body;
    if (!image1 || !image2 || !name1 || !name2) {
      res.status(400).json({ error: 'Two images and two names are required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server configuration error: Missing API Key' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data1 = image1.replace(/^data:image\/\w+;base64,/, "");
    const base64Data2 = image2.replace(/^data:image\/\w+;base64,/, "");

    console.log(`Merging ${name1} and ${name2}... on model gemini-3-pro-image-preview`);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [
        {
          parts: [
            { text: MERGE_PROMPT },
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
      res.status(500).json({ error: 'Invalid AI response' });
      return;
    }

    // Normalization logic (same as analyze.ts)
    let materials = data.materials || {};
    const keys = ["metal", "synthetic", "stone", "organic", "fabric"];
    
    // Ensure all keys exist and are numbers
    keys.forEach(k => { 
        if (typeof materials[k] !== 'number') materials[k] = 0; 
    });

    // 1. Calculate current sum
    let total = keys.reduce((sum, k) => sum + materials[k], 0);

    const MIN_TOTAL = 10;
    const MAX_TOTAL = 20;

    // 2. Scale if out of bounds
    if (total < MIN_TOTAL) {
        if (total === 0) {
            // Distribute evenly if 0
            keys.forEach(k => materials[k] = 2);
        } else {
            const factor = MIN_TOTAL / total;
            keys.forEach(k => materials[k] = Math.ceil(materials[k] * factor));
        }
    } else if (total > MAX_TOTAL) {
        const factor = MAX_TOTAL / total;
        keys.forEach(k => materials[k] = Math.floor(materials[k] * factor));
    }

    // 3. Force sum to be within [MIN, MAX]
    total = keys.reduce((sum, k) => sum + materials[k], 0);
    
    if (total < MIN_TOTAL) {
        const diff = MIN_TOTAL - total;
        let maxKey = keys[0];
        keys.forEach(k => { if (materials[k] > materials[maxKey]) maxKey = k; });
        materials[maxKey] += diff;
    } else if (total > MAX_TOTAL) {
        const diff = total - MAX_TOTAL;
        let remainingDiff = diff;
        while (remainingDiff > 0) {
            let maxKey = keys[0];
            keys.forEach(k => { if (materials[k] > materials[maxKey]) maxKey = k; });
            if (materials[maxKey] > 0) {
                materials[maxKey]--;
                remainingDiff--;
            } else {
                break; 
            }
        }
    }

    data.materials = materials;
    res.json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;

