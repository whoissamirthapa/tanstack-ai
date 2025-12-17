import { chat, toStreamResponse } from "@tanstack/ai";
import { gemini } from "@tanstack/ai-gemini";

export async function POST(request: Request) {
  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "GEMINI_API_KEY not configured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { messages, conversationId } = await request.json();

  try {
    // Create a streaming chat response
    const stream = chat({
      adapter: gemini(),
      messages,
      model: process.env.GEMINI_MODEL as
        | "gemini-3-pro-preview"
        | "gemini-2.5-pro"
        | "gemini-2.5-flash"
        | "gemini-2.5-flash-preview-09-2025"
        | "gemini-2.5-flash-lite"
        | "gemini-2.5-flash-lite-preview-09-2025"
        | "gemini-2.0-flash"
        | "gemini-2.0-flash-lite",
      conversationId,
    });

    // Convert stream to HTTP response
    return toStreamResponse(stream);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
