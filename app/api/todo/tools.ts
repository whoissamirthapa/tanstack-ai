import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import axios from "axios";
// Step 1: Define the tool schema
const getUserDataDef = toolDefinition({
  name: "get_user_data",
  description: "Fetch user information from the api",
  inputSchema: z.object({
    name: z
      .string()
      .describe(
        "The name of a user which should retrieve the user information"
      ),
  }),
  outputSchema: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    company: z.string(),
    address: z.object({
      street: z.string(),
      suite: z.string(),
      city: z.string(),
      zipcode: z.string(),
      geo: z.object({
        lat: z.string(),
        lng: z.string(),
      }),
    }),
    website: z.string(),
  }),
});

// Step 2: Create server implementation
const getUserData = getUserDataDef.server(async ({ name }) => {
  // This runs on the server - can access database, APIs, etc.
  console.log(name);
  const {
    data: [user],
  } = await axios.get(
    "https://jsonplaceholder.typicode.com/users?name=" + name
  );
  console.log(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user?.company?.name ?? "",
    address: user.address,
    website: user.website,
  };
});

// Example: API call tool
const searchTodosDef = toolDefinition({
  name: "search_todos",
  description: "Search for todos with provided user id in the given api",
  inputSchema: z.object({
    userId: z.number().describe(
      `You are an assistant with access to getUserData and todos tools.

If a userId is directly provided in the request:
- Use the provided userId as a query parameter.
- Call the todos tool with this userId(i.e user's id).
- Return the todos related to that userId.

If the userId is NOT directly provided:
- First, call the get_user_data tool to fetch user information.
- Extract the id from the returned user data.
- Use that id as a query parameter for userId.
- Call the seach_todo tool with the extracted user's id(id).
- Return the todos related to that user.

Important rules:
- Always ensure the todos returned belong to the identified user's id.
- Do not return todos without a valid user's  id.
- Do not assume a userId without fetching or receiving it.
`
    ),
  }),
});

const searchTodos = searchTodosDef.server(async ({ userId }) => {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/todos?userId=${userId}`
  );
  return response.data;
});

export { getUserData, searchTodos };
