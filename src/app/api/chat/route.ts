export const runtime = "edge";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { messages, habits } = await req.json();

    // Validate inputs
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;

    // Check if API key is available
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "API key not configured. Please add GOOGLE_AI_API_KEY to your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Initialize the Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    // Create system prompt that includes habits
    const systemPrompt = `You are a helpful AI assistant that provides personalized advice based on the user's habits. 
The user has the following habits:
${habits?.map((habit: string) => `- ${habit}`).join("\n") || "No habits provided yet"}

Your goal is to assist the user in maintaining and improving these habits. Provide encouraging, practical advice 
that aligns with their existing habit goals. Keep responses supportive, concise, and focused on their habits.

When asked about "what habits should I do today", "today's habits", or similar questions, provide a specific list of their 
actual habits with practical tips on how to complete them today. If the user asks about habit tracking, progress, or completion status,
refer to their specific habits by name.

Remember to reference the user's specific habits by name in your responses rather than giving generic habit advice.
If they don't have any habits yet, encourage them to create some in the app.

If they ask about topics unrelated to habits or personal development, you can still be helpful, but try to 
connect your response back to habit formation or maintenance when possible.`;

    try {
      // Single content generation approach for simplicity
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
        ],
        generationConfig: {
          maxOutputTokens: 800,
        },
      });

      // Create a streaming response
      const text = result.response.text();
      return new Response(text, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch (genError) {
      console.error("Error with Gemini model:", genError);
      return new Response(
        JSON.stringify({
          error: "Error generating content with Gemini model",
          details:
            genError instanceof Error ? genError.message : String(genError),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
