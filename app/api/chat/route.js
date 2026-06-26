import { NextResponse } from 'next/server';
import { createAI, generateWithRetry, parseGeminiError } from '@/lib/gemini';

export async function POST(req) {
  try {
    const { message, problemData, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ai = createAI(apiKey);

    const prompt = `You are an AI assistant helping a problem setter refine a technical assessment question.

Current problem title: ${problemData?.title || 'None'}

Current problem statement:
${problemData?.markdown || 'None'}

User: "${message}"

First, write your conversational response to the user. Answer their questions normally. If they ask you to modify the problem, tell them what you are changing.
IF you are modifying the problem, after your conversational response, add the exact string "---UPDATE---" followed by a JSON object with:
{
  "title": "updated title",
  "markdown": "updated markdown"
}

Do not use markdown code blocks for the JSON. Just output it directly after ---UPDATE---.`;

    const response = await generateWithRetry(ai, prompt, false);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(response.text);
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: parseGeminiError(error) }, { status: 500 });
  }
}
