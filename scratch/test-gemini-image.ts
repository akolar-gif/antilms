import dotenv from "dotenv";
dotenv.config();

async function testGeminiImage() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Testing gemini-2.5-flash-image endpoint...");

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Generate an image: A high resolution illustration of a Minecraft character crafting wooden tools at a workbench in a forest" }] }],
      generationConfig: {
        responseMimeType: "image/jpeg"
      }
    })
  });

  const data = await res.json();
  console.log("Status:", res.status);
  if (data.candidates && data.candidates[0]?.content?.parts) {
    console.log("Parts received:", data.candidates[0].content.parts.length);
    const imgPart = data.candidates[0].content.parts.find((p: any) => p.inlineData);
    if (imgPart) {
      console.log("Inline image mimeType:", imgPart.inlineData.mimeType);
      console.log("Inline image base64 length:", imgPart.inlineData.data?.length);
    } else {
      console.log("No inlineData found in parts:", JSON.stringify(data.candidates[0].content.parts).substring(0, 300));
    }
  } else {
    console.log("Response data:", JSON.stringify(data).substring(0, 500));
  }
}

testGeminiImage();
