import { promises as fs } from "fs";
import path from "path";

// Topic fallback helper in case Gemini image generation is rate-limited or fails
function getFallbackTopicImage(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("tastatur") || p.includes("steuerung") || p.includes("key")) {
    return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80";
  }
  if (p.includes("holz") || p.includes("crafting") || p.includes("ressource")) {
    return "https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=1200&auto=format&fit=crop&q=80";
  }
  if (p.includes("nacht") || p.includes("überleben") || p.includes("zombie")) {
    return "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=80";
  }
  if (p.includes("befehl") || p.includes("cheat") || p.includes("code")) {
    return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80";
}

/**
 * Generates an AI image using Gemini 3.1 Flash Image API, saves it permanently to disk (/uploads),
 * and returns the static public URL path (/uploads/ai-img-[timestamp]-[hash].jpg).
 */
export async function generateAndSaveAIImage(
  prompt: string,
  filenamePrefix: string = "ai-img"
): Promise<string> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (key) {
    try {
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 äöüÄÖÜß\-_,.]/g, " ").trim();
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a high quality, detailed, professional educational illustration for a course block: ${cleanPrompt}. Clean lighting, vivid colors, no text inside the image.`
                  }
                ]
              }
            ]
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: any) => p.inlineData);

        if (imagePart?.inlineData?.data) {
          const base64Data = imagePart.inlineData.data;
          const ext = imagePart.inlineData.mimeType?.includes("png") ? "png" : "jpg";
          const filename = `${filenamePrefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;

          // Resolve upload directory
          const uploadDir = process.env.UPLOAD_DIR
            ? path.resolve(process.env.UPLOAD_DIR)
            : path.join(process.cwd(), "public", "uploads");

          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, filename);

          const buffer = Buffer.from(base64Data, "base64");
          await fs.writeFile(filePath, buffer);

          console.log(`[AI Image Generator] Saved permanent image to ${filePath}`);
          return `/uploads/${filename}`;
        }
      } else {
        const errText = await res.text();
        console.warn(`[AI Image Generator] Gemini API returned status ${res.status}: ${errText}`);
      }
    } catch (err: any) {
      console.error("[AI Image Generator] Failed to generate AI image via Gemini API:", err?.message || err);
    }
  } else {
    console.warn("[AI Image Generator] GOOGLE_GENERATIVE_AI_API_KEY is missing. Using topic fallback.");
  }

  // Fallback to topic image URL if Gemini API is unavailable or failed
  return getFallbackTopicImage(prompt);
}
