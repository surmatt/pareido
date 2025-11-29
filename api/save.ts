import express, { Request, Response } from 'express';
import { generateImage } from '../src/lib/image_generator.ts';
import { uploadBase64ToS3 } from '../src/lib/s3Client.ts';

const router = express.Router();

router.post('/save', async (req: Request, res: Response) => {
  try {
    const { image, data } = req.body;

    const template_prompt = "Create an animated creative gaming card from the attached image and this suggestion prompt: " + data.prompt_for_image_generation;

    const generatedImage = await generateImage({
        generationPrompt: template_prompt,
        imageInput: image,
        modelName: 'gemini-2.5-flash-image',
    });

    if (!generatedImage) {
        throw new Error("Failed to generate image");
    }

    const timestamp = Date.now();
    const filename = `generated-cards/${timestamp}.jpg`;
    const s3Url = await uploadBase64ToS3(generatedImage, filename, 'image/jpeg');

    res.json({
      success: true,
      image: s3Url
    });

  } catch (error: any) {
    console.error('Save Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
