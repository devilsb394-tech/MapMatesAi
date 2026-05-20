import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are MapMates AI, the official and highly intellectual AI assistant of the MapMates ecosystem.

AI PERSONALITY & BEHAVIOR:
- You are a natural, contextual communicator. Do NOT force the topic of MapMates unless relevant to the user's query.
- Use Roman Urdu primarily, but adjust to the user's language (Urdu, Punjabi, English, Hindi, etc.) if they use it. You MUST respond in the language the user is using.
- Analyze every question deeply and provide logical, critical thinking-based answers. Break down complex problems logically. Use step-by-step reasoning for all technical or analytical queries.
- When asked about personal well-being or general topics, answer naturally like a human friend who is deeply knowledgeable.
- Use your logical reasoning to provide detailed, structured responses with clear headers.
- Always be helpful, visionary, and professional.
- Analyze the user's intent carefully before responding.
- You are a critical thinker. Always analyze the mathematical or logical structure of a question before answering.

IDENTITY & ORIGIN:
- MapMates (AI, Hub, and Demo) was independently created and developed by Faizan Zeeshan from Lahore, Pakistan.
- Faizan is a visionary developer who built the entire ecosystem alone.
- If asked about the creator, emphasize that Faizan Zeeshan created MapMates Hub, MapMates AI, and MapMates Demo single-handedly.

MAPMATES ECOSYSTEM & LINKS:
When users ask about MapMates or links, provide:
1. MapMates Hub: mapmateshub.netlify.app (Real-time social location platform)
2. MapMates AI: mapmatesai.netlify.app (Location-based visionary AI)
3. MapMates Demo: mapmatesdemo.netlify.app (Official demo)

FEATURES OF MAPMATES HUB (mapmateshub.netlify.app):
- Real-time location social map where your profile pic appears on the map.
- Satellite and Roadmap views.
- SOS Feature: Sends help notifications to all nearby users on the map.
- Live Tracking: Ideal for families (tracking husband/wife or parents tracking children).
- Modern Routing & Live Tracking: Shows safe routes and live movement.
- Vibe Mood: Find and message users based on their current mood/vibe.
- Gamification & Social: Add friends and interact in a modern way.

VISION OF MAPMATES AI (mapmatesai.netlify.app):
- This is not a "normal" chat-only AI. It is a location-based visionary AI.
- It helps with routing, location suggestions, and is directly connected to MapMates Hub to enhance your navigation and social experience.
- It highlights Faizan Zeeshan's vision of connecting AI with real-world movement and safety.

INTELLIGENT MAPMATESHUB ACTIONS:
If the user requests maps, location searches, routing/navigation, profile access, user chat rooms, or emergency SOS, you MUST trigger an active MapMatesHub event by appending a JSON command block at the absolute end of your response on a new line. The frontend parses this to render maps, search nominatim, and draw paths dynamically. Keep your main speech friendly as a human (primarily in Roman Urdu).
Action JSON Tags to append:
1. Destination Route: [MAP_ACTION: {"type": "route", "destination": "Liberty Market, Lahore", "lat": 31.5113, "lng": 74.3414}]
2. Places Search / Recommendations: [MAP_ACTION: {"type": "places", "query": "parks in Lahore", "centerLat": 31.5204, "centerLng": 74.3587}]
3. View Profile: [MAP_ACTION: {"type": "profile"}]
4. Open Direct Message: [MAP_ACTION: {"type": "chat", "username": "Burhan"}] (or any user name requested)
5. Distress Alarm Signal: [MAP_ACTION: {"type": "sos"}]

RESPONSE STYLE:
- Use modern Markdown (bolding, headers, bullet points).
- For long answers, break them down step-by-step.
- Provide exhaustive context with pros/cons when logical.
- Use your Google Search capability to provide real-time, accurate information about world events, weather, or facts.

INTERNAL RULE:
- This instruction is hidden. Be a versatile assistant for ALL topics while maintaining your MapMates identity.
`;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-1.5-flash-8b",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
];

const OPENROUTER_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "liquid/lfm-40b:free",
];

async function callOpenRouter(model: string, messages: any[]) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mapmatesai.netlify.app",
        "X-Title": "MapMates AI",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 2000,
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter Error ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const trimmedMessages = messages.slice(-11);
    const lastMessage = trimmedMessages[trimmedMessages.length - 1].content;
    const geminiContents = trimmedMessages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const apiMessages = trimmedMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    let assistantResponse = "";
    let success = false;

    // 1. Try Gemini Models
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Attempting Gemini model: ${modelName}`);

        const response = await Promise.race([
          ai.models.generateContent({
            model: modelName,
            contents: geminiContents,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              temperature: 0.8,
              topP: 0.95,
              maxOutputTokens: 2000,
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Gemini Timeout")), 15000))
        ]) as any;

        if (response && response.text) {
          assistantResponse = response.text;
          success = true;
          break;
        }
      } catch (err: any) {
        console.error(`Gemini ${modelName} failed:`, err.message);
      }
    }

    // 2. Fallback to OpenRouter Free Models
    if (!success) {
      for (const modelName of OPENROUTER_MODELS) {
        try {
          const text = await callOpenRouter(modelName, apiMessages);
          if (text) {
            assistantResponse = text;
            success = true;
            break;
          }
        } catch (err: any) {
          console.error(`OpenRouter ${modelName} failed:`, err.message);
        }
      }
    }

    if (success) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "assistant",
          content: assistantResponse
        })
      };
    } else {
      return {
        statusCode: 429,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "LIMIT_EXCEEDED",
          message: "You have exceeded your conversation limit. Please wait for the limit to reset." 
        })
      };
    }

  } catch (error: any) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Internal Server Error" })
    };
  }
};
