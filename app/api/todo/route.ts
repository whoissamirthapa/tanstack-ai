import { chat, toStreamResponse } from "@tanstack/ai";
import { gemini } from "@tanstack/ai-gemini";
import { getUserData, searchTodos } from "./tools";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = chat({
    adapter: gemini({}),
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
    tools: [getUserData, searchTodos],
    systemPrompts: [
      `You are an assistant with access to a getUserData tool. \n If the user asks about user information such as name, email, address, company: \n - Call the getUserData tool. \n- Use the returned data to answer the question.\n - Do NOT call the todos tool.\n - Respond only with information related to the user.\n `,
      `You are an assistant with access to a todos tool.

        If the user asks about todos such as tasks, status, deadlines, or todo lists:
        - Call the todos tool.
        - Use the returned todo data to answer the question.
        - Do NOT call the getUserData tool.
        - Respond only with todo-related information.
    `,
      `You are an assistant with access to both getUserData and todos tools.

      If the user asks about a specific user's todos or tasks assigned to a person:
      - First, call the getUserData tool to fetch the user details.
      - Identify the user's unique identifier (e.g., id).
      - Then, call the todos tool using that user identifier to fetch the corresponding todos.
      - Combine user information and their related todos in the response.
      - Ensure the todos shown belong only to the specified user.
    `,
      `
    IF question is about user only → use get_user_data
    ELSE IF question is about todos only → use search_todos
    ELSE IF question is about a user’s todos → use get_user_data FIRST, then search_todos
    `,
      `
    Always write the final response in simple, plain language. Do not use more emojis, decorative symbols, excessive punctuation, or fancy formatting of any kind. The response should read naturally, like a human explanation, not like a styled message or a system output.
    `,
      `
    Do not return answers as key–value pairs, bullet lists, or payload-style fields such as “name: John” or “email: example@example.com
    ”. Instead, convert all information into complete sentences and well-formed paragraphs. The response should feel conversational and descriptive, where details are embedded naturally within the text.
    `,
      `
    Avoid short, rigid answers. Every response should explain the information in a clear and flowing way, using proper sentences and paragraphs. The goal is for the output to sound like an explanation written by a person, not a structured data response or formatted output.
    `,
    ],
  });

  return toStreamResponse(stream);
}
