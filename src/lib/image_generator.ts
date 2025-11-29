import { GoogleGenAI } from "@google/genai";

interface ImageGeneratorOptions {
    generationPrompt: string;
    imageInput?: string;
    modelName?: string;
    apiKey?: string;
    outputPath?: string;
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
        if (options.imageInput.startsWith("data:image") || options.imageInput.startsWith("/9j/") || options.imageInput.includes("base64")) {
            // Base64 encoded image
            const base64Data = options.imageInput.includes("base64,")
                ? options.imageInput.split("base64,")[1]
                : options.imageInput;

            contentParts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data,
                },
            });
        } else {
            // File path - read and convert to base64
            const fs = await import("fs");
            const path = await import("path");
            const resolvedPath = path.resolve(options.imageInput);
            const fileBuffer = fs.readFileSync(resolvedPath);
            const base64Data = fileBuffer.toString("base64");

            contentParts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data,
                },
            });
        }
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

    console.log("API Response:", JSON.stringify(response, null, 2));

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
