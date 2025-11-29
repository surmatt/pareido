import express, { Request, Response } from 'express';
import { mergeEntities } from '../src/lib/merger.js';
import { MERGE_PROMPT } from '../prompts.js';

const router = express.Router();

router.post('/merge', async (req: Request, res: Response) => {
  try {
    const { image1, name1, image2, name2 } = req.body;
    
    // Validation is handled in mergeEntities, but good to check basic params here too
    if (!image1 || !image2 || !name1 || !name2) {
      res.status(400).json({ error: 'Two images and two names are required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server configuration error: Missing API Key' });
      return;
    }

    const data = await mergeEntities({
        image1,
        name1,
        image2,
        name2,
        apiKey,
        mergePrompt: MERGE_PROMPT,
        modelName: 'gemini-3-pro-image-preview'
    });

    res.json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
