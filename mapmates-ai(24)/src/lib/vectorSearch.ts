export interface VectorSearchResult {
  term: string;
  definition: string;
  score: number;
  guideSteps: string[];
  actionLink?: string;
  category: "navigation" | "social" | "creator" | "telemetry" | "help";
}

export interface VectorNode {
  term: string;
  keywords: string[];
  definition: string;
  guideSteps: string[];
  actionLink?: string;
  category: "navigation" | "social" | "creator" | "telemetry" | "help";
}

export const VECTOR_DATABASE: VectorNode[] = [
  {
    term: "car",
    keywords: ["car", "vehicle", "ride", "gari", "motorcycle", "bike", "transport"],
    definition: "MapMates Hub has modern real-time vehicle route tracking. This lets friends or family track your vehicle movement live on the map for optimal road safety.",
    guideSteps: [
      "Open mapmateshub.netlify.app",
      "Tap on 'Live Tracking' in the sidebar options",
      "Click on 'Start Journey' as a driver, copy your tracking token, and share it with friends!"
    ],
    actionLink: "https://mapmateshub.netlify.app",
    category: "navigation"
  },
  {
    term: "map",
    keywords: ["map", "nasha", "satellite", "terrain", "leaflet", "openstreetmap", "nominatim"],
    definition: "An interactive, beautiful high-contrast map with support for direct point-and-click navigation, landmark searches, and satellite views.",
    guideSteps: [
      "Click on the map on MapMates AI and the system will automatically pin your coordinates.",
      "Toggle the satellite imagery layer to see direct building contours and neighborhood streets."
    ],
    category: "navigation"
  },
  {
    term: "weather",
    keywords: ["weather", "mosam", "mausam", "rain", "barish", "temperature", "garmi", "sardi", "feelslike"],
    definition: "Street-level climate indicators in Pakistan, specifically Lahore, tracking feels-like temperature values and calculating rain probabilities to keep you dry.",
    guideSteps: [
      "Type 'Lahore Mausam' or 'Mausam kaisa hai' in the chat box.",
      "The AI checks real-time satellite meteorology and warns you if there is an active rainfall alert!"
    ],
    category: "telemetry"
  },
  {
    term: "voice call",
    keywords: ["voice", "call", "mic", "microphone", "sound", "speak", "listening", "awaz", "baat"],
    definition: "Hands-free cellular dialogue link built for mobile users with automatic real-time speech-to-text recognition.",
    guideSteps: [
      "Click the green 'Phone Dial' button in the navigation header bar.",
      "Unmute mic, say anything like 'Hi kaisa hai MapMates', and the assistant will answer you instantly out-loud!"
    ],
    category: "help"
  },
  {
    term: "video call",
    keywords: ["video", "camera", "webcam", "face", "avatar", "robot", "dancing", "emotion", "deepface"],
    definition: "An immersive, high-end 3D robot video companion utilizing your device webcam for facial emotion scanning and automatic speech chat.",
    guideSteps: [
      "Click the purple 'Video' button in the navbar.",
      "Look directly at the camera. The AI inspects your expression (happy, sad, neutral, angry) and responds to your spoken voice synchronously."
    ],
    category: "help"
  },
  {
    term: "faizan zeeshan",
    keywords: ["faizan", "zeeshan", "creator", "founder", "baghbanpura", "lahore", "developer"],
    definition: "The brilliant 17-year-old self-taught genius developer from Lahore, Pakistan, who conceptualized and built MapMates single-handedly from a small room.",
    guideSteps: [
      "Ask MapMates AI 'Who is Faizan Zeeshan?' or choose 'Creator Biography' from AI suggestions.",
      "Learn and appreciate his incredible self-study path, having completed an entire PhD-level CS book in 8 months at college!"
    ],
    category: "creator"
  },
  {
    term: "secure data",
    keywords: ["privacy", "security", "secure", "safe", "data", "database", "firebase", "firestore", "history", "lock"],
    definition: "Highest grade end-to-end sandbox privacy architecture ensuring your historical chat logs and private profile tracking details are never exposed.",
    guideSteps: [
      "All persistent chats are stored securely under encrypted collection blocks in Firebase.",
      "Your data remains strictly secure and is never shared, sold, or processed for third-party analytics."
    ],
    category: "telemetry"
  },
  {
    term: "sos signal",
    keywords: ["sos", "emergency", "danger", "safety", "help", "save", "accident", "mushkil"],
    definition: "One-click distress rescue protocol on the map coordinates grid to notify registered active neighbors within your local area.",
    guideSteps: [
      "Type 'SOS' or 'Mujhe bachao' in the conversational AI chat.",
      "The system appends the structural alarm command block [MAP_ACTION: {\"type\": \"sos\"}] to flag coordinates immediately."
    ],
    category: "navigation"
  }
];

// Helper to compute a simple text fuzzy-matching score (0 to 1) based on keyword overlaps and character ratios
export function searchVectorDatabase(query: string): VectorSearchResult[] {
  if (!query || query.trim() === "") return [];
  
  const qClean = query.toLowerCase().trim();
  const results: VectorSearchResult[] = [];

  for (const node of VECTOR_DATABASE) {
    let maxMatchScore = 0;

    // Check direct matching with term
    if (node.term.toLowerCase() === qClean) {
      maxMatchScore = 1.0;
    } else if (node.term.toLowerCase().includes(qClean) || qClean.includes(node.term.toLowerCase())) {
      maxMatchScore = 0.85;
    } else {
      // Check keywords
      for (const kw of node.keywords) {
        if (kw === qClean) {
          maxMatchScore = Math.max(maxMatchScore, 0.95);
        } else if (kw.includes(qClean) || qClean.includes(kw)) {
          // calculate ratio
          const overlapRatio = Math.min(kw.length, qClean.length) / Math.max(kw.length, qClean.length);
          maxMatchScore = Math.max(maxMatchScore, 0.5 + overlapRatio * 0.4);
        }
      }
    }

    if (maxMatchScore > 0.15) {
      results.push({
        term: node.term,
        definition: node.definition,
        score: parseFloat(maxMatchScore.toFixed(3)),
        guideSteps: node.guideSteps,
        actionLink: node.actionLink,
        category: node.category
      });
    }
  }

  // Sort descending by similarity score
  return results.sort((a, b) => b.score - a.score);
}
