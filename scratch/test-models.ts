import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Fetching models from Google AI API...");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach((m: any) => {
      if (m.name.includes("imagen") || m.name.includes("image") || m.name.includes("flash") || m.supportedGenerationMethods?.includes("generateImages")) {
        console.log("- ", m.name, m.supportedGenerationMethods);
      }
    });
  } else {
    console.log("Response:", JSON.stringify(data));
  }
}

listModels();
