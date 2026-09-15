import dotenv from "dotenv";
dotenv.config();

import { experimental_generateImage as generateImage } from "ai";
import { google } from "@ai-sdk/google";

async function testImagen() {
  console.log("Testing Gemini Imagen 3 via AI SDK...");
  console.log("API Key present:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

  try {
    const { image } = await generateImage({
      model: google.image("imagen-3.0-generate-002"),
      prompt: "A high quality flat vector illustration of a Minecraft wooden shelter at night with torches",
      aspectRatio: "16:9",
    });

    console.log("Image generation SUCCESS!");
    console.log("Image type:", typeof image);
    console.log("Base64 length:", image.base64?.length);
  } catch (err: any) {
    console.error("Error with imagen-3.0-generate-002:", err.message);

    try {
      console.log("Trying imagen-3.0-fast-generate-001...");
      const { image } = await generateImage({
        model: google.image("imagen-3.0-fast-generate-001"),
        prompt: "A high quality flat vector illustration of a Minecraft wooden shelter at night with torches",
        aspectRatio: "16:9",
      });
      console.log("Fast Image generation SUCCESS!");
      console.log("Base64 length:", image.base64?.length);
    } catch (err2: any) {
      console.error("Error with imagen-3.0-fast-generate-001:", err2.message);
    }
  }
}

testImagen();
