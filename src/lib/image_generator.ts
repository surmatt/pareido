import { GoogleGenAI } from "@google/genai";

interface ImageGeneratorOptions {
    generationPrompt: string;
    imageInput?: string;
    templateImageInput?: string;
    modelName?: string;
    apiKey?: string;
    outputPath?: string;
}

/**
 * Reads an image from a file path or base64 string and returns inline data for API content
 * @param imageSource - Either a file path to an image or a base64-encoded image string
 * @returns Promise resolving to the inline data object for the image
 */
async function readImageToInlineData(imageSource: string): Promise<{ inlineData: { mimeType: string; data: string } }> {
    if (imageSource.startsWith("data:image") || imageSource.startsWith("/9j/") || imageSource.includes("base64")) {
        // Base64 encoded image
        const base64Data = imageSource.includes("base64,")
            ? imageSource.split("base64,")[1]
            : imageSource;

        return {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
            },
        };
    } else {
        // File path - read and convert to base64
        const fs = await import("fs");
        const path = await import("path");
        const resolvedPath = path.resolve(imageSource);
        const fileBuffer = fs.readFileSync(resolvedPath);
        const base64Data = fileBuffer.toString("base64");

        return {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
            },
        };
    }
}

/**
 * Generates an image using Google's Gemini 2.5 Flash model
 * @param generationPrompt - The text generationPrompt describing the image to generate
 * @param imageInput - Either a file path to an image or a base64-encoded image string
 * @returns Promise resolving to the raw base64-encoded generated image
 */
export async function generateImage(
    options: ImageGeneratorOptions
): Promise<string | void> {
    const client = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
    });

    console.log("Generating image with prompt:", options.generationPrompt);

    // Build the content parts
    const contentParts: any[] = [
        {
            text: options.generationPrompt,
        },
    ];

    // If an image is provided, add it to the content
    if (options.imageInput) {
        const imageData = await readImageToInlineData(options.imageInput);
        contentParts.push(imageData);
    }

    // If a template image is provided, add it to the content
    if (options.templateImageInput) {
        const templateImageData = await readImageToInlineData(options.templateImageInput);
        contentParts.push(templateImageData);
    }

    const response = await client.models.generateContent({
        model: options.modelName as string || "gemini-2.5-flash-image",
        contents: contentParts,
        config: {
            imageConfig: {
                aspectRatio: "4:5",
            },
            responseModalities: ['Image']
        },
    });

    // console.log("API Response:", JSON.stringify(response, null, 2));

    // Extract the generated image data
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
        throw new Error("No content in response from image generation");
    }

    const candidate = response.candidates[0] as any;
    for (const part of candidate.content.parts) {
        if (part.inlineData) {
            const imageData = part.inlineData.data;

            if (options.outputPath) {
                const fs = await import("fs");
                const buffer = Buffer.from(imageData, "base64");
                fs.writeFileSync(options.outputPath, buffer);
                console.log(`Image saved as ${options.outputPath}`);
            } else {
                return imageData;
            }
        } else {
            throw new Error("No image data found in response");

        }
    }

}
