import express, { Request, Response } from 'express';
import { analyzeImage } from '../src/lib/analyzer.ts';
import { ANALYSIS_PROMPT } from '../prompts.ts';

const router = express.Router();

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Image is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server configuration error: Missing API Key' });
      return;
    }

    console.log('Analyzing image... on model gemini-2.5-flash');

    const data = await analyzeImage({
        image,
        apiKey,
        analysisPrompt: ANALYSIS_PROMPT,
        modelName: 'gemini-2.5-flash'
    });

    res.json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
