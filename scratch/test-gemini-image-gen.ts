import dotenv from "dotenv";
dotenv.config();

async function testGeminiImageGen() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Testing gemini image models...");

  const models = ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3-pro-image"];

  for (const model of models) {
    try {
      console.log(`Testing model ${model}...`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Generate an image of a Minecraft wooden shelter in a forest" }] }]
        })
      });
      const data = await res.json();
      console.log(`Model ${model} status:`, res.status);
      if (data.candidates && data.candidates[0]?.content?.parts) {
        console.log(`Parts for ${model}:`, JSON.stringify(data.candidates[0].content.parts).substring(0, 400));
      } else {
        console.log(`Response for ${model}:`, JSON.stringify(data).substring(0, 400));
      }
    } catch (e: any) {
      console.error(`Error for ${model}:`, e.message);
    }
  }
}

testGeminiImageGen();
