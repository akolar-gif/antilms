import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");

  if (!prompt) {
    return NextResponse.json({ error: "Prompt parameter is required" }, { status: 400 });
  }

  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key is missing in environment" }, { status: 500 });
  }

  try {
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
                  text: `Generate a high quality, detailed, professional educational illustration for a course topic: ${prompt}. Clean lighting, vivid colors, no text inside the image.`
                }
              ]
            }
          ]
        })
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Gemini image generation API error:", res.status, errBody);
      return NextResponse.json({ error: "Gemini image generation failed" }, { status: res.status });
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData);

    if (imagePart?.inlineData?.data) {
      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/jpeg";
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable"
        }
      });
    }

    return NextResponse.json({ error: "No image data returned from Gemini" }, { status: 500 });
  } catch (error: any) {
    console.error("Internal error in /api/generate-image:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
