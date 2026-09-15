import dotenv from "dotenv";
dotenv.config();

async function testNanoBanana() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Testing exact model IDs from Google AI Studio screenshot...");

  const candidateModels = [
    "gemini-2.5-flash-preview-image",
    "gemini-2.5-flash-image-preview",
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-image-preview",
    "gemini-3-pro-image",
    "gemini-3-pro-image-preview"
  ];

  for (const model of candidateModels) {
    try {
      console.log(`Testing ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Generate an image of a red block in Minecraft" }] }]
        })
      });
      const data = await res.json();
      console.log(`Status for ${model}:`, res.status);
      if (res.status === 200) {
        console.log(`SUCCESS WITH MODEL: ${model}!`);
        console.log("Parts:", JSON.stringify(data.candidates?.[0]?.content?.parts).substring(0, 400));
        return;
      } else {
        console.log(`Error body for ${model}:`, JSON.stringify(data).substring(0, 300));
      }
    } catch (e: any) {
      console.error(`Fetch exception for ${model}:`, e.message);
    }
  }
}

testNanoBanana();
