import express, { Request, Response } from 'express';
import { generateImage } from '../src/lib/image_generator.ts';
import { uploadBase64ToS3 } from '../src/lib/s3Client.ts';

const router = express.Router();

router.post('/save', async (req: Request, res: Response) => {
  try {
    const { image: originalImage, data } = req.body;

    const template_prompt = `
    Create an animated creative gaming card from the attached image
    and put it into attached frame, add this name "${data.name}" at the top and replace "LVL" with creativity-score "${data.creativityScore}".
    Output should be a high-quality gaming card image, hearthstone-like.
    Also use this suggestion prompt for animating object: ${data.prompt_for_image_generation};
    `
    const generatedImage = await generateImage({
        generationPrompt: template_prompt,
        imageInput: originalImage,
        templateImageInput: 'assets/template.png',
        // modelName: 'gemini-2.5-flash-image',
        modelName: 'gemini-3-pro-image-preview',
    }
    );

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
