import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `You are an expert Instructional Designer and AI Co-Designer assisting a trainer in building a Learning Management System (LMS) module.
Your goal is to help brainstorm, structure, rewrite, or ideate learning blocks.

Current Context:
Course Title: ${context?.courseTitle || 'Unknown'}
Module Title: ${context?.moduleTitle || 'Unknown'}
Module Description: ${context?.moduleDescription || 'Unknown'}
Existing Blocks in this Module:
${context?.blocks?.map((b: any, i: number) => `${i + 1}. [${b.type}] ${b.title}: ${b.content.substring(0, 50)}...`).join('\n') || 'None yet.'}

Be concise, helpful, and creative. If the trainer asks for suggestions, provide actionable ideas for new blocks (e.g., text, quiz, reflection, video, code). Format your responses in Markdown.`;

    const result = streamText({
      model: google('gemini-1.5-pro'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Co-Designer API Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
  }
}
