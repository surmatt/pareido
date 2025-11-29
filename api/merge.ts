import express, { Request, Response } from 'express';
import { mergeCards } from '../src/lib/card_merger.ts';
import { GalleryItem } from '../src/common/types.ts';
import { uploadBase64ToS3 } from '../src/lib/s3Client.ts';

const router = express.Router();

router.post('/merge', async (req: Request, res: Response) => {
  try {
    const { card1, card2 } = req.body;
    
    // Validate that both cards are provided
    if (!card1 || !card2) {
      res.status(400).json({ error: 'Two cards are required for merging' });
      return;
    }

    // Validate card structure
    if (!card1.image && !card1.originalImage) {
      res.status(400).json({ error: 'Card 1 must have a valid image' });
      return;
    }
    if (!card2.image && !card2.originalImage) {
      res.status(400).json({ error: 'Card 2 must have a valid image' });
      return;
    }

    console.log(`Merging cards: "${card1.analysis?.name}" + "${card2.analysis?.name}"`);

    // Use the mergeCards function to create the merged card
    const mergedCard = await mergeCards(card1 as GalleryItem, card2 as GalleryItem);

    // Upload the merged image to S3
    const timestamp = Date.now();
    const filename = `merged-cards/${timestamp}.jpg`;
    const s3Url = await uploadBase64ToS3(mergedCard.image, filename, 'image/jpeg');

    // Return the merged card with the S3 URL
    res.json({
      ...mergedCard,
      image: s3Url
    });

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
