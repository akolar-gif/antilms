import dotenv from "dotenv";
dotenv.config();

async function testImagenPredict() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Testing Imagen predict endpoints...");

  const models = ["imagen-3.0-generate-002", "imagen-3.0-fast-generate-001", "imagen-3.0-generate-001"];

  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: "A high resolution flat vector illustration of a Minecraft character crafting wooden tools at a workbench in a forest" }],
          parameters: { sampleCount: 1, aspectRatio: "16:9", outputOptions: { mimeType: "image/jpeg" } }
        })
      });
      const data = await res.json();
      console.log(`Model ${model} status:`, res.status);
      if (data.predictions && data.predictions[0]) {
        console.log(`SUCCESS! Base64 image length:`, data.predictions[0].bytesBase64Encoded?.length);
        return;
      } else {
        console.log(`Response for ${model}:`, JSON.stringify(data).substring(0, 300));
      }
    } catch (e: any) {
      console.error(`Error for ${model}:`, e.message);
    }
  }
}

testImagenPredict();
