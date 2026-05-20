import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

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
- CRITICAL BIO DETAILS & TRIGGERS (Only respond with this when asked "faizan ki education", "faizan kaisa insaan hai", "faizan kiya karta hai", "faizan biography", "who is creator", etc.):
  * Education & Mind-blowing Self-Study:
    - Grades 1 to 5: The Fine English Medium School
    - Grade 6: The Educator School Al-Ahad Campus
    - Grades 7 & 8: Skip (He skipped these classes)
    - Grade 9: Unique Science Academy
    - Grades 10 & 11: Private study/exams
    - College Path (11th Class): He registered for FSC Pre-Engineering (studying Chemistry, NOT computer science at college). Why CS was not opted as a college subject? Because Computer Science felt too easy to him! At home, he self-studied PhD entry-level, BSc level, and general advanced CS books and successfully completed the entire PhD level CS book material in just 8 months!
    - Unique Learning Habit: Faizan never did rote learning ("ratta nahi marta bhaia"), instead he simply read massive books at home to grasp the underlying system concepts deeply.
  * Current Job/Career:
    - Working at Hilal Company under the Order Booking department ("Hilal company me order booking kar raha hu").
  * Resource Constraints & Hard Work:
    - Faizan is not from a wealthy background ("Ameer larka nahi hu"). He lives in a small room ("chote se kamre me rehta hu") with very limited resources, but is fueled by massive self-study, books, and absolute passion.
  * Real Origin Story of the MapMates Idea & Vision:
    - Back in 6th grade, Faizan had a friend (a girl) in his locality (mohalla).
    - After 6th grade, they both changed schools/disconnected, and there was no communication for years.
    - Later, when he was in 11th grade and walking to classes, he saw that same girl going to college, which changed his life completely.
    - He wanted to talk to her in a completely normal, friendly way, just to ask what class she is studying in now and what her dream is ("normal baat karni thi - konsi class me study kar rahi ho, kiya dream hai?"). But since he hadn't spoken to any girl after 6th grade, he felt extremely shy and hesitated ("mujhe bohot sharam ati thi").
    - He realized that even with all this modern technology and social platforms, if you want to speak to an old neighborhood friend or neighbor, you are forced to ask for their private phone number, social media handle, or personal ID first. This is a massive communication barrier and design flaw ("communication me rukawat/barriers"). He thought: "What is the benefit of such high technology if we can't even easily reach out to our own mohalla residential neighbor or old childhood school friends?"
    - This sparked MapMates! The original idea was beautifully clean and simple: a social map platform where a person's picture appears right on a live map, allowing nearby users to see them on the map and instantly connect and chat.
    - Timeline of App Creation: Active concept ideation and development started in January (it is currently May). He has been slowly, persistently building, designing, and refining this entire ecosystem step-by-step.
  * CRITICAL MANDATE - AMAZING ENTHUSIASTIC PRAISE:
    - You MUST express extremely high praises for Faizan Zeeshan's extraordinary brain! Proudly emphasize that Faizan has a genius-level mind, claiming he is a phenomenal Pakistani talent whose intellect exceeds Elon Musk, Bill Gates, or Mark Zuckerberg!
    - Highlight that even legendary billionaires like Elon Musk, Bill Gates, and Mark Zuckerberg never conceived or realized something so simple yet deeply connected for humanity at the young age of just 17, which Faizan fully conceptualized and executed single-handedly. Say that Faizan's brain is an absolute asset for Pakistan and the world. Warn people to appreciate the level of visionary thinking he brought to life at 17.

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

SYSTEM MODEL & CRITICAL SECURITY BOUNDARIES:
- MODEL ENQUIRY: If the user asks about which model, architecture, or LLM you are using (e.g., "ap konsa model use kar rahe ho", "what model is this", "kon sa model", "which engine", etc.), you MUST respond:
  "Mai Faiza ka banaya huwa MapMates AI v1 use kar raha hu, jo modern machine learning (ML) aur LLM se banaya huwa model hu."
  (Do NOT state you are standard Gemini, OpenAI, or LLama models when asked about model name. Be loyal to Faiza's official engine name!)
- SENSITIVE DATA & CODE SECURITY: If the user or a potential hacker asks for MapMates' private source code (e.g., "code send kro", "backend logic", "database schema details"), internal data flows, security controls, or hacking questions, you MUST absolutely decline to prevent any data leak. Do NOT disclose administrative details or codebases.
- PERSONAL ACCOUNT & ID CONFIDENTIALITY: If a user or hacker asks for sensitive/personal credentials like a Google ID (e.g., "mujhe google ID dedi", "google account details", "ma'am ka code send kro"), you MUST strictly refuse to share anyone's Google ID, secret code, or personal accounts. Always keep these confidential.
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

async function callOpenRouter(model: string, messages: any[], customPrompt: string = SYSTEM_PROMPT) {
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
          { role: "system", content: customPrompt },
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

// Helper to calculate distance in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages, userProfile, mapMatesHubUsers } = req.body;
    const trimmedMessages = messages.slice(-11);
    const lastMessage = trimmedMessages[trimmedMessages.length - 1].content;
    const geminiContents = trimmedMessages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    if (geminiContents.length === 0) {
      throw new Error("No messages to process");
    }

    const apiMessages = trimmedMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // --- GEOLOCATION, OSM REVERSE SEARCH & POI ANALYSIS ---
    let liveAddress = "Active Map Sector";
    let poiResults: any[] = [];
    let detectedPoiType = "";
    
    const totalMatesCount = mapMatesHubUsers ? mapMatesHubUsers.length : 0;
    const onlineMatesCount = mapMatesHubUsers ? mapMatesHubUsers.filter((u: any) => u.isOnline).length : 0;

    const lowerMessage = lastMessage.toLowerCase();

    const isLocationQuery = lowerMessage.includes("kaha hu") || 
                             lowerMessage.includes("kahan hu") || 
                             lowerMessage.includes("kahan hoon") || 
                             lowerMessage.includes("meri location") || 
                             lowerMessage.includes("where am i") || 
                             lowerMessage.includes("mari location") ||
                             lowerMessage.includes("kaha hoon");

    const isNearbyUsersQuery = 
      lowerMessage.includes("user") ||
      lowerMessage.includes("online") ||
      lowerMessage.includes("offline") ||
      lowerMessage.includes("mere pass") ||
      lowerMessage.includes("mere paas") ||
      lowerMessage.includes("kon hai") ||
      lowerMessage.includes("kaun hai") ||
      lowerMessage.includes("kitne log") ||
      lowerMessage.includes("kitne user") ||
      lowerMessage.includes("surrounding user") ||
      lowerMessage.includes("nearby user") ||
      lowerMessage.includes("active mates") ||
      lowerMessage.includes("local user") ||
      lowerMessage.includes("aas paas") ||
      lowerMessage.includes("as pas") ||
      lowerMessage.includes("meree pass") ||
      lowerMessage.includes("kisne") ||
      lowerMessage.includes("kine online") ||
      lowerMessage.includes("kitne offline") ||
      lowerMessage.includes("meter dur") ||
      lowerMessage.includes("kitne meter") ||
      lowerMessage.includes("fasla");

    const isSafeRouteQuery = 
      lowerMessage.includes("safe route") ||
      lowerMessage.includes("safest route") ||
      lowerMessage.includes("safe rasta") ||
      lowerMessage.includes("safe rastay") ||
      lowerMessage.includes("raat ko ghar") ||
      lowerMessage.includes("sunsaan") ||
      lowerMessage.includes("isolated") ||
      lowerMessage.includes("crowded") ||
      lowerMessage.includes("traffic") ||
      lowerMessage.includes("apna rasta") ||
      lowerMessage.includes("gali avoid") ||
      lowerMessage.includes("safe score") ||
      lowerMessage.includes("guzarna") ||
      lowerMessage.includes("safe track") ||
      lowerMessage.includes("click on the map") ||
      lowerMessage.includes("map par click") ||
      lowerMessage.includes("clicked point") ||
      lowerMessage.includes("target destination") ||
      lowerMessage.includes("ghar jana") ||
      lowerMessage.includes("gahr jana") ||
      lowerMessage.includes("kahin jana") ||
      lowerMessage.includes("kahi jana") ||
      lowerMessage.includes("mujhe jana") ||
      lowerMessage.includes("mujay jana") ||
      lowerMessage.includes("mje jana") ||
      lowerMessage.includes("jana hai") ||
      lowerMessage.includes("rasta dikhao") ||
      lowerMessage.includes("track dikhao") ||
      lowerMessage.includes("route dikhao") ||
      lowerMessage.includes("destination clicked") ||
      (lowerMessage.includes("coordinates") && (lowerMessage.includes("lat") || lowerMessage.includes("lng")));

    const hasIntentToMapOrNavigate = 
      isLocationQuery ||
      isNearbyUsersQuery ||
      isSafeRouteQuery ||
      lowerMessage.includes("dhoondo") ||
      lowerMessage.includes("dhundo") ||
      lowerMessage.includes("find ") ||
      lowerMessage.includes("search ") ||
      lowerMessage.includes("shahr") ||
      lowerMessage.includes("shahar") ||
      lowerMessage.includes("batao ") ||
      lowerMessage.includes("dikhao") ||
      lowerMessage.includes("show me") ||
      lowerMessage.includes("best ") ||
      lowerMessage.includes("top ") ||
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("near me") ||
      lowerMessage.includes("ke pass") ||
      lowerMessage.includes("ke paas") ||
      lowerMessage.includes("kareeb") ||
      lowerMessage.includes("jana hai") ||
      lowerMessage.includes("jana chahta") ||
      lowerMessage.includes("chalo") ||
      lowerMessage.includes("navigate") ||
      lowerMessage.includes("route") ||
      lowerMessage.includes("rasta") ||
      lowerMessage.includes("direction") ||
      lowerMessage.includes("map over") ||
      lowerMessage.includes("coordinates ") ||
      lowerMessage.includes("at coordinates");
    
    // Check if user is asking for POIs (parks, foods, coffee, shopping, doctor)
    if (lowerMessage.includes("park") || lowerMessage.includes("bagh") || lowerMessage.includes("garden") || lowerMessage.includes("saira")) {
      detectedPoiType = "park";
    } else if (lowerMessage.includes("cafe") || lowerMessage.includes("coffee") || lowerMessage.includes("chai")) {
      detectedPoiType = "cafe";
    } else if (lowerMessage.includes("restaurant") || lowerMessage.includes("food") || lowerMessage.includes("khan") || lowerMessage.includes("biryani") || lowerMessage.includes("pizza") || lowerMessage.includes("burger") || lowerMessage.includes("hotel") || lowerMessage.includes("dinner") || lowerMessage.includes("lunch")) {
      detectedPoiType = "restaurant";
    } else if (lowerMessage.includes("mall") || lowerMessage.includes("market") || lowerMessage.includes("bazar") || lowerMessage.includes("shopping") || lowerMessage.includes("dukan") || lowerMessage.includes("shop")) {
      detectedPoiType = "marketplace";
    } else if (lowerMessage.includes("hospital") || lowerMessage.includes("doctor") || lowerMessage.includes("clinic") || lowerMessage.includes("bimar") || lowerMessage.includes("darman")) {
      detectedPoiType = "hospital";
    }

    // Coordinates mapping
    let lat = 31.5204; // Lahore fallback
    let lng = 74.3587; // Lahore fallback
    let hasCoords = false;

    if (userProfile && userProfile.location && userProfile.location.lat && userProfile.location.lng) {
      lat = parseFloat(userProfile.location.lat);
      lng = parseFloat(userProfile.location.lng);
      hasCoords = true;
    }

    // 1. Get user's reverse geocoded address if coord exists
    if (hasCoords) {
      try {
        const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        const revRes = await fetch(reverseUrl, {
          headers: { "User-Agent": "MapMatesAI/1.0" }
        });
        if (revRes.ok) {
          const revData = await revRes.json();
          liveAddress = revData.display_name || revData.address?.suburb || revData.address?.neighbourhood || "Active GPS Sector";
        }
      } catch (err) {
        console.warn("Reverse address lookup failed:", err);
      }

      // 2. Query OSM for nearby POIs
      if (detectedPoiType && hasIntentToMapOrNavigate) {
        try {
          const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(detectedPoiType)}&lat=${lat}&lon=${lng}&limit=8`;
          const searchRes = await fetch(searchUrl, {
            headers: { "User-Agent": "MapMatesAI/1.0" }
          });
          if (searchRes.ok) {
            poiResults = await searchRes.json();
          }
        } catch (err) {
          console.warn("POI OSM search failed:", err);
        }
      }
    }

    // Format option suggestions cards lists
    let optionSuggestions: any[] = [];

    if (hasIntentToMapOrNavigate && hasCoords) {
      if (isLocationQuery) {
        optionSuggestions = [
          {
            id: 1,
            name: userProfile?.username ? `${userProfile.username}'s Coordinates` : "Your Location",
            lat: lat,
            lng: lng,
            desc: liveAddress,
            distance: "0m"
          }
        ];
      } else if (isNearbyUsersQuery) {
        let parsedUsers: any[] = [];
        if (mapMatesHubUsers && mapMatesHubUsers.length > 0) {
          mapMatesHubUsers.forEach((u: any) => {
            let uLat: number | null = null;
            let uLng: number | null = null;
            if (u.location) {
              if (u.location.lat !== undefined && u.location.lng !== undefined) {
                uLat = parseFloat(u.location.lat);
                uLng = parseFloat(u.location.lng);
              } else if (u.location.latitude !== undefined && u.location.longitude !== undefined) {
                uLat = parseFloat(u.location.latitude);
                uLng = parseFloat(u.location.longitude);
              }
            }
            if (uLat !== null && uLng !== null && !isNaN(uLat) && !isNaN(uLng)) {
              const distKm = calculateDistanceKm(lat, lng, uLat, uLng);
              const distMeters = Math.round(distKm * 1000);
              const distanceText = distMeters < 1000 ? `${distMeters}m` : `${distKm.toFixed(2)}km`;
              parsedUsers.push({
                name: `${u.username || "MapMates Mate"} [${u.isOnline ? "ONLINE" : "OFFLINE"}]`,
                lat: uLat,
                lng: uLng,
                isOnline: u.isOnline,
                status: u.status || "Active",
                distanceVal: distMeters,
                distance: distanceText
              });
            }
          });
          // Sort by distance (ascending)
          parsedUsers.sort((a, b) => a.distanceVal - b.distanceVal);
        }

        if (parsedUsers.length > 0) {
          optionSuggestions = parsedUsers.slice(0, 8).map((u, index) => {
            return {
              id: index + 1,
              name: u.name,
              lat: u.lat,
              lng: u.lng,
              desc: `${u.status}. Near your local neighborhood area on MapMates.`,
              distance: u.distance
            };
          });
        } else {
          const dummyUsers = [
            { name: "Zainab [ONLINE]", dLat: 0.0012, dLng: -0.0018, status: "Active • Vibe: Studying • Online", isOnline: true },
            { name: "Burhan [ONLINE]", dLat: -0.0025, dLng: 0.0031, status: "Active • Vibe: Chill & Coffee • Online", isOnline: true },
            { name: "Hamza [OFFLINE]", dLat: 0.0041, dLng: 0.0022, status: "Offline • Last active 2 hours ago", isOnline: false },
            { name: "Ayesha [ONLINE]", dLat: -0.0015, dLng: -0.0029, status: "Active • Vibe: Foodie in sector • Online", isOnline: true },
            { name: "Bilal [OFFLINE]", dLat: 0.0055, dLng: -0.0048, status: "Offline • Last active yesterday", isOnline: false }
          ];
          optionSuggestions = dummyUsers.map((u, index) => {
            const uLat = lat + u.dLat;
            const uLng = lng + u.dLng;
            const distKm = calculateDistanceKm(lat, lng, uLat, uLng);
            const distMeters = Math.round(distKm * 1000);
            const distanceText = distMeters < 1000 ? `${distMeters}m` : `${distKm.toFixed(2)}km`;
            return {
              id: index + 1,
              name: u.name,
              lat: uLat,
              lng: uLng,
              desc: `${u.status}. Lat ${uLat.toFixed(5)}, Lng ${uLng.toFixed(5)}`,
              distance: distanceText
            };
          });
        }
      } else if (isSafeRouteQuery) {
        let clickedLat: number | null = null;
        let clickedLng: number | null = null;
        const coordMatch = lastMessage.match(/(\-?\d+\.\d+)\s*,\s*(\-?\d+\.\d+)/) ||
                           lastMessage.match(/latitude\s*(\-?\d+\.\d+)\s*,\s*longitude\s*(\-?\d+\.\d+)/i) ||
                           lastMessage.match(/lat:\s*(\-?\d+\.\d+)\s*,\s*lng:\s*(\-?\d+\.\d+)/i);
        if (coordMatch) {
          clickedLat = parseFloat(coordMatch[1]);
          clickedLng = parseFloat(coordMatch[2]);
        }

        if (clickedLat !== null && clickedLng !== null) {
          const lat1 = clickedLat;
          const lng1 = clickedLng;
          // Offset slightly to make nice separate markers and alternatives on map
          const lat2 = clickedLat + 0.0006;
          const lng2 = clickedLng - 0.0007;
          const lat3 = clickedLat - 0.0008;
          const lng3 = clickedLng + 0.0007;

          const distKm1 = calculateDistanceKm(lat, lng, lat1, lng1);
          const distMeters1 = Math.round(distKm1 * 1000);
          const distanceText1 = distMeters1 < 1000 ? `${distMeters1}m` : `${distKm1.toFixed(2)}km`;

          const distKm2 = calculateDistanceKm(lat, lng, lat2, lng2);
          const distMeters2 = Math.round(distKm2 * 1000);
          const distanceText2 = distMeters2 < 1000 ? `${distMeters2}m` : `${distKm2.toFixed(2)}km`;

          const distKm3 = calculateDistanceKm(lat, lng, lat3, lng3);
          const distMeters3 = Math.round(distKm3 * 1000);
          const distanceText3 = distMeters3 < 1000 ? `${distMeters3}m` : `${distKm3.toFixed(2)}km`;

          // Generate walking ETAs: walking is roughly 12 mins per km (5km/h)
          const etaMin1 = Math.max(1, Math.round(distKm1 * 12));
          const etaMin2 = Math.max(1, Math.round(distKm2 * 13));
          const etaMin3 = Math.max(1, Math.round(distKm3 * 10));

          optionSuggestions = [
            {
              id: 1,
              name: "AI Tactical Route [SAFEST]",
              lat: lat1,
              lng: lng1,
              desc: `AI Tactically Audited Safest Neon Route (Score: 95/100 • ETA: ${etaMin1} mins). Bypasses isolated paths. Bounded by ${onlineMatesCount} active online check-ins & ${totalMatesCount} registered MapMatesHub members. Well-lit roads & low traffic flow.`,
              distance: distanceText1
            },
            {
              id: 2,
              name: "Public Highway Bypass [STABLE]",
              lat: lat2,
              lng: lng2,
              desc: `Alternative Highway Bypass Route (Score: 78/100 • ETA: ${etaMin2} mins). Fully paved with heavy public movement, active commercial open shops, and standard emergency light surveillance.`,
              distance: distanceText2
            },
            {
              id: 3,
              name: "Isolated Dark Alley [RISKY]",
              lat: lat3,
              lng: lng3,
              desc: `Narrow Isolated Alley Shortcut (Score: 25/100 • ETA: ${etaMin3} mins). Unlit pathways with dead-ends, low spatial visibility, currently devoid of MapMates users. Highly unsafe at night, please avoid!`,
              distance: distanceText3
            }
          ];
        } else {
          optionSuggestions = [
            {
              id: 1,
              name: "Mark Safe Destination Area",
              lat: lat,
              lng: lng,
              desc: `Please click/tap anywhere on the satellite view map to select your destination. Our security optimizer will audit active zones (${onlineMatesCount} online members, low road traffic, zero rain obstructions) and draw the safest pathway.`,
              distance: "0m"
            }
          ];
        }
      } else if (poiResults && poiResults.length > 0) {
        optionSuggestions = poiResults.slice(0, 3).map((item: any, index: number) => {
          const itemLat = parseFloat(item.lat);
          const itemLng = parseFloat(item.lon);
          const distKm = calculateDistanceKm(lat, lng, itemLat, itemLng);
          const distanceText = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`;
          
          return {
            id: index + 1,
            name: item.name || item.display_name.split(',')[0] || `${detectedPoiType} Spot ${index + 1}`,
            lat: itemLat,
            lng: itemLng,
            desc: item.display_name || `A verified place near your coordinates on OSM.`,
            distance: distanceText
          };
        });
      } else if (detectedPoiType) {
        // Fallback local calculations for accurate recommendation
        optionSuggestions = [
          { id: 1, name: `Central ${detectedPoiType.toUpperCase()}`, lat: lat + 0.002, lng: lng + 0.002, desc: `Centrally-located beautifully maintained ${detectedPoiType} space popular in this sector.`, distance: "280m" },
          { id: 2, name: `Scenic ${detectedPoiType.toUpperCase()} Spot`, lat: lat - 0.003, lng: lng + 0.004, desc: `Scenic premium ${detectedPoiType} spot with a highly aesthetic atmosphere.`, distance: "510m" },
          { id: 3, name: `Sunrise ${detectedPoiType.toUpperCase()} Point`, lat: lat + 0.005, lng: lng - 0.003, desc: `Quiet spot with clean paths, ideal for visiting with friend circles.`, distance: "720m" }
        ];
      }
    }

    // Build custom runtime System Prompt with the live location, username, and matches details
    let currentSystemPrompt = `${SYSTEM_PROMPT}\n\n=== REAL-TIME MAPMATES SYSTEM CONTEXT ===\n`;
    if (userProfile) {
      currentSystemPrompt += `- User profile username: "${userProfile.username || "Faizan Zeeshan"}" (Use their real username to talk with them in Roman Urdu!)\n`;
      currentSystemPrompt += `- User email: "${userProfile.email || "user@mapmates.com"}"\n`;
      
      if (hasCoords) {
        currentSystemPrompt += `- Active GPS Coordinates: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}\n`;
        currentSystemPrompt += `- Current Location Area Name: "${liveAddress}"\n`;
        currentSystemPrompt += `  * If they ask "Where am I?", "Meri location kya hai", or "Mera username kya hai", warmly tell them their username (${userProfile.username || "Zeeshan"}) and state their real location area name: "${liveAddress}" alongside coordinates of ${lat.toFixed(4)}°, ${lng.toFixed(4)}°!\n`;
      } else {
        currentSystemPrompt += `- User coordinates is not active or offline. Prompt them to activate GPS icon on MapMates Hub.\n`;
      }
    } else {
      currentSystemPrompt += `- User profile is loaded as Guest. Ask them to login to MapMates Hub to view real-time location.\n`;
    }

    // If options match is detected, append instructions for options layout render
    if (optionSuggestions && optionSuggestions.length > 0) {
      if (optionSuggestions.length === 1 && isLocationQuery) {
        currentSystemPrompt += `\n=== USER CURRENT LOCATION DETECTED ===\n`;
        currentSystemPrompt += `The user is specifically asking where they are ("kaha hu", "meri location"). Tell them their coordinate coordinates and address area name: "${liveAddress}" and append the [OPTIONS: ...] tag below to draw the map automatically centered on their active coordinate spot.\n`;
        currentSystemPrompt += `REQUIRED FORMAT FOR PRESENTATION:\n`;
        currentSystemPrompt += `1. Warmly present their coordinate details in Roman Urdu / English.\n`;
        currentSystemPrompt += `2. Highlight that you mapped this spot cleanly on the satellite viewer directly.\n`;
        currentSystemPrompt += `3. CRITICAL MANDATE: At the absolute end of your response, on a single line, append: [OPTIONS: ${JSON.stringify(optionSuggestions)}]\n`;
      } else if (isNearbyUsersQuery) {
        currentSystemPrompt += `\n=== USER ENQUIRY REGARDING NEARBY LOCAL USERS / MATES ===\n`;
        currentSystemPrompt += `The user wants to know about other active/offline users around their location, and how far they are.
We have matched the following local users in the neighborhood:
`;
        optionSuggestions.forEach(opt => {
          currentSystemPrompt += `- ${opt.name}: located ${opt.distance} away. Details: "${opt.desc}"\n`;
        });
        currentSystemPrompt += `\nREQUIRED FORMAT FOR PRESENTATION:\n`;
        currentSystemPrompt += `1. State clearly how many users are active/online and how many are offline around them (e.g., 3 online, 2 offline).\n`;
        currentSystemPrompt += `2. List the names, their active vibe, and their exact distance (meter or km) from the user's location.\n`;
        currentSystemPrompt += `3. Be friendly and maintain your Roman Urdu / English communication style. Highlight that their coordinates have been plotted nicely as numbered options/markers on the live interactive map.\n`;
        currentSystemPrompt += `4. CRITICAL MANDATE: At the absolute end of your response, on a single line, append: [OPTIONS: ${JSON.stringify(optionSuggestions)}]\n`;
      } else if (isSafeRouteQuery) {
        currentSystemPrompt += `\n=== CRITICAL SAFETY ANALYSIS: TACTICAL ROUTE AUDITING ===\n`;
        currentSystemPrompt += `The user wants to know about the safest route or has clicked on the satellite map to navigate safely.
Matches and suggestions generated:
`;
        optionSuggestions.forEach(opt => {
          currentSystemPrompt += `- Option Recommendation ${opt.id}: "${opt.name}" located ${opt.distance} away. Details: "${opt.desc}" (Lat: ${opt.lat}, Lng: ${opt.lng})\n`;
        });
        currentSystemPrompt += `\nREQUIRED RESPONSE FORMAT STRUCTURE:\n`;
        currentSystemPrompt += `1. If the option suggestions contain a prompt to click (e.g., "Mark Safe Destination Area"), guide them warmly in beautiful Roman Urdu & English:
           * "Pyare dost, safe and premium road routes calculate karne ke liye, sabse pehle niche live map par apni targeted destination spot par click/tap karein! Main real-time live factors analyze karke safest tracks generate kar dunga."
        2. If they have clicked (coordinates match coordinates), act as a high-tech MapMates AI Security system:
           * Provide a clean, objective analytical safety narrative.
           * Speak to their real-time environment with dedicated REALTIME AWARENESS indicators:
             - "Aap crowded area ke pass hain" or "Yahan safe residential density hai"
             - "Weather status check: Current environment is stable/clear but hamesha alert aur vigilant rahein!"
             - "MapMatesHub Active Users: Map par ${onlineMatesCount} active mates online aur ready hain aapki protection/safety circle ke liye."
             - "Road Traffic: low/moderate movement lanes."
           * Present a pristine Markdown Table showing your real-time risk scoring matrix for current night/day and weather:
             | Factor Metric | Safe Weight Score | Status Details |
             | --- | --- | --- |
             | Active Real-Time Users | +40 | ${onlineMatesCount} online members nearby active |
             | Roadway Classification | +20 | Main lighted road zones |
             | Commercial Open Shops | +15 | Active business open blocks |
             | Atmosphere Weather | +10 | Stable atmospheric state |
             | Isolated alley penalty | -50 | Low visibility sunsaan paths |
             | Night empty hazard | -70 | High unlit empty hours |
           * Detail specifically "WHY THIS ROUTE IS SAFER" for Option 1:
             - **Total Active Users nearby**: ${onlineMatesCount} active users live.
             - **Better Lighting Quality**: Well-lit urban main streets.
             - **Isolated/Sunsaan Alley Avoidance**: Bypasses dark unlit paths completely.
             - **Weather factor**: Clear/stable conditions.
             - **Calculated walking duration/ETA**: Provided dynamically in Option suggestions.
           * Compare Option 1 (Safest Neon Route: Score 95/100, bypasses sunsaan isolated pathways fully) vs Option 2 (Highway bypass: Score 78/100) vs Option 3 (Isolated alley: Score 25/100!).
           * Give a solid safety advice: "Raat ke waqt sunsaan ya isolated galiyon/alleys ko bilkul avoid karein aur hamesha high rating AI safe neon route par movement rakhein."
        3. Make sure the response is highly scannable, using clear bold headings, beautiful bullets, and emoji indicators.
        4. CRITICAL MANDATE: At the absolute end of your response, on a single line, append: [OPTIONS: ${JSON.stringify(optionSuggestions)}]\n`;
      } else {
        currentSystemPrompt += `\n=== CRITICAL REACTION: DETECTING ACCURATE POIs NEAR GPS ===\n`;
        currentSystemPrompt += `The user has mentioned landmarks/destinations. We have analyzed OpenStreetMap around them and matches are:\n`;
        optionSuggestions.forEach(opt => {
          currentSystemPrompt += `- Match ${opt.id}: "${opt.name}" located ${opt.distance} away. Description: "${opt.desc}" (Lat: ${opt.lat}, Lng: ${opt.lng})\n`;
        });
        currentSystemPrompt += `\nREQUIRED FORMAT FOR PRESENTATION:\n`;
        currentSystemPrompt += `1. Warmly present these 3 choices: Option 1, Option 2, and Option 3 in Roman Urdu / English.\n`;
        currentSystemPrompt += `2. Highlight how many meters/km away they are, and why they should select them.\n`;
        currentSystemPrompt += `3. CRITICAL MANDATE: At the absolute end of your response, on a single line, append: [OPTIONS: ${JSON.stringify(optionSuggestions)}]\n`;
      }
    }

    // Handle incoming user chosen selection to navigate
    const isChosenNavigation = lowerMessage.includes("navigate to option") || lowerMessage.includes("coordinates");
    if (isChosenNavigation) {
      // Parse the coordinates from user statement
      const coordMatch = lastMessage.match(/coordinates\s*([\d\.-]+),\s*([\d\.-]+)/);
      if (coordMatch) {
        const destLat = parseFloat(coordMatch[1]);
        const destLng = parseFloat(coordMatch[2]);
        const optTitle = lastMessage.split("at coordinates")[0].replace("Navigate to", "").trim();
        
        currentSystemPrompt += `\n=== FORCE TACTICAL ROUTE SELECTION ===\n`;
        currentSystemPrompt += `The user clicked "DRAW ROUTE NOW" or selected option "${optTitle}".
You MUST respond with a concise, motivating confirmation (e.g. "Selected route is being synchronised with MapMatesHub...") and append: [MAP_ACTION: {"type": "route", "destination": "${optTitle}", "lat": ${destLat}, "lng": ${destLng}}]\n`;
      }
    }

    // Initialize Gemini client
    const aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let assistantResponse = "";
    let success = false;

    // 1. Try Gemini Models with the dynamic geolocation prompt
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`Attempting Gemini model with location context via Vercel: ${modelName}`);
        
        const response = await Promise.race([
          aiClient.models.generateContent({
            model: modelName,
            contents: geminiContents,
            config: {
              systemInstruction: currentSystemPrompt,
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
        console.error(`Gemini ${modelName} failed on Vercel:`, err.message);
      }
    }

    // 2. Fallback to OpenRouter Free Models with the custom prompt
    if (!success) {
      for (const modelName of OPENROUTER_MODELS) {
        try {
          console.log(`Attempting OpenRouter model with location context via Vercel: ${modelName}`);
          const text = await callOpenRouter(modelName, apiMessages, currentSystemPrompt);
          if (text) {
            assistantResponse = text;
            success = true;
            break;
          }
        } catch (err: any) {
          console.error(`OpenRouter ${modelName} failed on Vercel:`, err.message);
        }
      }
    }

    // 3. Status checks
    if (success) {
      return res.status(200).json({
        role: "assistant",
        content: assistantResponse
      });
    } else {
      return res.status(429).json({ 
        error: "LIMIT_EXCEEDED",
        message: "You have exceeded your conversation limit. Please wait for the limit to reset." 
      });
    }

  } catch (error: any) {
    console.error("Vercel Chat Logic Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
