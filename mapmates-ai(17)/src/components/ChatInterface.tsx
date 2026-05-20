import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Sparkles, Download, Volume2, VolumeX, Map, Compass, MapPin, Navigation, MessageSquare, AlertTriangle, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/src/lib/utils";
import VoiceMic from "./VoiceMic";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, limit } from "firebase/firestore";
import { auth, hubDb } from "../lib/firebase";
import ChatMap from "./ChatMap";

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: {
    type: string;
    destination?: string;
    lat?: number;
    lng?: number;
    query?: string;
    username?: string;
  };
  options?: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    desc: string;
    distance: string;
  }>;
}

export function buildHubUrl(action: any) {
  const baseUrl = "https://mapmateshub.netlify.app";
  if (!action) return baseUrl;
  
  const params = new URLSearchParams();
  params.set("utm_source", "mapmatesai");
  
  if (action.type === "route") {
    params.set("action", "route");
    params.set("destination", action.destination || "");
    if (action.lat) params.set("lat", String(action.lat));
    if (action.lng) params.set("lng", String(action.lng));
  } else if (action.type === "places") {
    params.set("action", "places");
    params.set("query", action.query || "");
  } else if (action.type === "profile") {
    params.set("action", "profile");
  } else if (action.type === "chat") {
    params.set("action", "chat");
    params.set("username", action.username || "Burhan");
  } else if (action.type === "sos") {
    params.set("action", "sos");
  }
  
  return `${baseUrl}/?${params.toString()}`;
}

function MapActionCard({ action, userLat, userLng }: { action: any; userLat?: number; userLng?: number }) {
  if (!action) return null;
  const url = buildHubUrl(action);

  switch (action.type) {
    case "route": {
      const pathOptions = [
        {
          id: 1,
          name: action.destination || "Target Destination",
          lat: action.lat,
          lng: action.lng,
          desc: "Tactical target segment snapped to available OpenStreetMap roadway networks.",
          distance: "Active Path"
        }
      ];

      return (
        <div className="mt-4 p-4 rounded-xl bg-[#08081a] border border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.05)] text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-[#00f2ff] uppercase tracking-widest block">TACTICAL NAVIGATION ROUTE</span>
              <h4 className="font-extrabold text-sm text-white mt-1 uppercase tracking-tight">{action.destination || "Target Destination"}</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Coords: {action.lat?.toFixed(4)}°N, {action.lng?.toFixed(4)}°E</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] flex-shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[8px] text-white/30 uppercase block font-medium">OSRM Lane</span>
              <span className="text-xs font-bold text-teal-400 mt-0.5 block">Curve Snapped</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[8px] text-white/30 uppercase block font-medium">Est Distance</span>
              <span className="text-xs font-extrabold text-white mt-0.5 block">~12.4 km</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-center">
              <span className="text-[8px] text-white/30 uppercase block font-medium">Glow Theme</span>
              <span className="text-xs font-bold text-[#00f2ff] mt-0.5 block">Neon Laser</span>
            </div>
          </div>

          {/* Fully Interactive Navigation Map embedded here */}
          <ChatMap 
            options={pathOptions} 
            userLat={userLat} 
            userLng={userLng} 
            activeOptionId={1} 
          />

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-2.5 bg-[#00f2ff] hover:brightness-110 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,242,255,0.3)] select-none"
          >
            Draw Route on MapMatesHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );
    }

    case "places":
      return (
        <div className="mt-4 p-4 rounded-xl bg-[#0d0903] border border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.05)] text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-yellow-400 uppercase tracking-widest block">NOMINATIM POI RECOMMENDATION</span>
              <h4 className="font-extrabold text-sm text-white mt-1 uppercase tracking-tight">Search: {action.query || "Nearby Places"}</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Engine: OpenStreetMap free-tier data</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <Compass className="w-4 h-4" />
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-2.5 bg-[#facc15] hover:brightness-110 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(250,204,21,0.3)] select-none"
          >
            View Spots on MapMatesHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );

    case "profile":
      return (
        <div className="mt-4 p-4 rounded-xl bg-[#08080c] border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.05)] text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-widest block">PRIMARY ENCRYPTED PROFILE</span>
              <h4 className="font-extrabold text-sm text-white mt-1 uppercase tracking-tight">Faizan Zeeshan</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Role: Single-Handed Ecosystem Developer</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] select-none border border-purple-400/30"
          >
            Open Developer Profile <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );

    case "chat":
      return (
        <div className="mt-4 p-4 rounded-xl bg-[#030c05] border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)] text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block">SECURE ENCRYPTED DM CHAT</span>
              <h4 className="font-extrabold text-sm text-white mt-1 uppercase tracking-tight">Chat with {action.username || "Burhan"}</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Status: Online • Ready to connect</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-2.5 bg-emerald-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] select-none"
          >
            Start Chat on MapMatesHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );

    case "sos":
      return (
        <div className="mt-4 p-4 rounded-xl bg-[#1c0808] border border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.1)] text-left animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[9px] font-mono font-black text-red-500 uppercase tracking-widest block">EMERGENCY SOS BEACON</span>
              <h4 className="font-extrabold text-sm text-white mt-1 uppercase tracking-tight">Active Distress Rescue Alert</h4>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">Broadcasting live GPS location</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)] select-none"
          >
            Launch Emergency SOS Map <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );

    default:
      return null;
  }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shouldSpeak, setShouldSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [userProfileState, setUserProfileState] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a matching voice for the language
    const voices = window.speechSynthesis.getVoices();
    // Simple heuristic: if text contains Urdu/Arabic characters or common Roman Urdu words
    const isHindiUrdu = /[\u0600-\u06FF]|[\u0900-\u097F]/.test(text) || (text.length > 20 && messages[messages.length-1]?.content.toLowerCase().match(/kaisa|hal|rahay|hain|aur/));
    
    // 1. Find all potential male voices across all languages first
    const maleKeywords = ['male', 'guy', 'man', 'david', 'mark', 'stefan', 'ravi', 'prakash', 'narendra', 'thomas', 'daniel', 'ziru', 'tony', 'google uk english male', 'microsoft david'];
    const maleVoices = voices.filter(v => {
      const name = v.name.toLowerCase();
      return maleKeywords.some(keyword => name.includes(keyword)) && !name.includes('female');
    });

    // 2. Try to find a male voice in the preferred language
    let targetVoice = maleVoices.find(v => isHindiUrdu ? (v.lang.startsWith('hi') || v.lang.startsWith('ur')) : v.lang.startsWith('en'));
    
    // 3. Fallback to any male voice regardless of language (better a male voice in another lang for tone than a female voice)
    if (!targetVoice) targetVoice = maleVoices[0];
    
    // 4. Last resort: standard language filter
    if (!targetVoice) {
      const langVoices = voices.filter(v => isHindiUrdu ? (v.lang.startsWith('hi') || v.lang.startsWith('ur')) : v.lang.startsWith('en'));
      targetVoice = langVoices[0];
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    // Optimized settings for a deep, natural, masculine "GPT-like" voice
    utterance.rate = 0.85; // Clear, measured pace
    utterance.pitch = 0.70; // Even deeper masculine tone to ensure it doesn't sound like a woman
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Automatically speak assistant response if it came from voice input
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && shouldSpeak) {
      speakText(lastMessage.content);
      setShouldSpeak(false);
    }
  }, [messages, shouldSpeak]);

  useEffect(() => {
    // Reset limit exceeded state on component mount/reload
    setIsLimitExceeded(false);
    localStorage.removeItem("mm_limit_time");
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(hubDb, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserProfileState(userDoc.data());
          }
        } catch (err) {
          console.error("Error fetching user profile active context:", err);
        }
      }
    };

    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProfile();
      } else {
        setUserProfileState(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Reload voices when they are changed/loaded (Chrome/Edge need this)
    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isLoading) return; // Prevent listening while processing
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Use a language that understands English and can adapt to Urdu/Hindi accents
    recognition.lang = "en-IN"; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        setIsListening(false);
        setShouldSpeak(true);
        handleInstantSend(transcript);
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleInstantSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (isSpeaking) stopSpeaking();

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let userProfile = null;
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(hubDb, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            userProfile = userDoc.data();
            setUserProfileState(userProfile);
          }
        } catch (profileErr) {
          console.error("Error loading user profile context for AI assistant:", profileErr);
        }
      }

      // Check if user is asking about other surrounding users/mates
      const lowerText = text.toLowerCase();
      const isNearbyUsersQuery = 
        lowerText.includes("user") ||
        lowerText.includes("online") ||
        lowerText.includes("offline") ||
        lowerText.includes("mere pass") ||
        lowerText.includes("mere paas") ||
        lowerText.includes("kon hai") ||
        lowerText.includes("kaun hai") ||
        lowerText.includes("kitne log") ||
        lowerText.includes("kitne user") ||
        lowerText.includes("surrounding user") ||
        lowerText.includes("nearby user") ||
        lowerText.includes("active mates") ||
        lowerText.includes("local user") ||
        lowerText.includes("aas paas") ||
        lowerText.includes("as pas") ||
        lowerText.includes("meree pass") ||
        lowerText.includes("kisne") ||
        lowerText.includes("kine online") ||
        lowerText.includes("kitne offline") ||
        lowerText.includes("meter dur") ||
        lowerText.includes("kitne meter") ||
        lowerText.includes("fasla");

      const isSafeRouteQuery = 
        lowerText.includes("safe route") ||
        lowerText.includes("safest") ||
        lowerText.includes("safe rasta") ||
        lowerText.includes("safe rastay") ||
        lowerText.includes("raat ko ghar") ||
        lowerText.includes("sunsaan") ||
        lowerText.includes("isolated") ||
        lowerText.includes("crowded") ||
        lowerText.includes("traffic") ||
        lowerText.includes("apna rasta") ||
        lowerText.includes("gali avoid") ||
        lowerText.includes("safe score") ||
        lowerText.includes("guzarna") ||
        lowerText.includes("safe track") ||
        lowerText.includes("map par click") ||
        lowerText.includes("clicked point") ||
        lowerText.includes("target destination") ||
        lowerText.includes("ghar jana") ||
        lowerText.includes("gahr jana") ||
        lowerText.includes("kahin jana") ||
        lowerText.includes("kahi jana") ||
        lowerText.includes("mujhe jana") ||
        lowerText.includes("jana hai") ||
        lowerText.includes("route dikhao") ||
        lowerText.includes("direction");

      const isWeatherQuery = 
        lowerText.includes("weather") ||
        lowerText.includes("mausam") ||
        lowerText.includes("mousam") ||
        lowerText.includes("sardi") ||
        lowerText.includes("garmi") ||
        lowerText.includes("temperature") ||
        lowerText.includes("thand") ||
        lowerText.includes("barish");

      const isLocationQuery = 
        lowerText.includes("kaha hu") || 
        lowerText.includes("kahan hu") || 
        lowerText.includes("kahan hoon") || 
        lowerText.includes("meri location") || 
        lowerText.includes("where am i") || 
        lowerText.includes("mari location") ||
        lowerText.includes("kaha hoon");

      // Gate check for unregistered users/guests
      const isFeatureProtected = isNearbyUsersQuery || isSafeRouteQuery || isWeatherQuery || isLocationQuery;
      
      if (isFeatureProtected && (!auth.currentUser || !userProfile)) {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: `Pyare dost! In high-tech map and weather features (Live Satellite Map, Weather apparent sensations, Surrounding check-ins, or AI Safe Neon Routes) ko check karne ke liye, aapko **https://mapmateshub.netlify.app** par account banana/login karna hoga coordinate sharing validation ke liye.\n\n👉 Niche click karein account banane ke liye:\n[Sign up for mapmateshub.netlify.app 🚀](https://mapmateshub.netlify.app)\n\n*(Note: Jab tak aap login nahi karte, tab tak interactive map and live weather features active nahi ho sakte!)*`
          }
        ]);
        return;
      }

      let mapMatesHubUsers: any[] = [];
      if (isNearbyUsersQuery || isSafeRouteQuery) {
        try {
          const usersSnapshot = await getDocs(query(collection(hubDb, "users"), limit(45)));
          usersSnapshot.forEach((docSnap) => {
            const udata = docSnap.data();
            if (udata && udata.userId !== auth.currentUser?.uid) {
              mapMatesHubUsers.push({
                username: udata.username || udata.displayName || "MapMates Mate",
                email: udata.email || "",
                location: udata.location || null,
                status: udata.status || udata.vibe || "Active",
                isOnline: udata.isOnline !== undefined ? udata.isOnline : true
              });
            }
          });
        } catch (usersErr) {
          console.error("Error fetching genuine mapmateshub users:", usersErr);
        }
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          userProfile: userProfile,
          mapMatesHubUsers: mapMatesHubUsers
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === "LIMIT_EXCEEDED") {
          setIsLimitExceeded(true);
          throw new Error("You have exceeded your conversation limit.");
        }
        if (response.status === 429) {
          throw new Error("AI is currently busy with high demand. Please wait a moment.");
        }
        throw new Error(data.error || "Failed to get response");
      }
      
      let finalContent = data.content;
      let parsedAction = null;
      let parsedOptions = null;

      // Intercept special intent tags [MAP_ACTION: {"type": ...}]
      const actionRegex = /\[MAP_ACTION:\s*({.*?})\]/s;
      const match = finalContent.match(actionRegex);
      if (match) {
        try {
          parsedAction = JSON.parse(match[1]);
          finalContent = finalContent.replace(actionRegex, "").trim();
        } catch (e) {
          console.error("Failed to parse map action JSON:", e);
        }
      }

      // Intercept options recommendations tag [OPTIONS: [{"id": 1, ...}]]
      const optionsRegex = /\[OPTIONS:\s*(\[.*?\])\]/s;
      const optionsMatch = finalContent.match(optionsRegex);
      if (optionsMatch) {
        try {
          parsedOptions = JSON.parse(optionsMatch[1]);
          finalContent = finalContent.replace(optionsRegex, "").trim();
        } catch (e) {
          console.error("Failed to parse options JSON:", e);
        }
      }

      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          content: finalContent, 
          action: parsedAction || undefined,
          options: parsedOptions || undefined
        }
      ]);

      if (parsedAction) {
        if (auth.currentUser) {
          try {
            await addDoc(collection(hubDb, "ai_sync"), {
              uid: auth.currentUser.uid,
              action: parsedAction,
              timestamp: serverTimestamp(),
            });
            console.log("SUCCESS-SYNC: Synchronized AI Action to Hub Firestore Db.");
          } catch (syncErr) {
            console.error("Failed to write to Hub db sync collection:", syncErr);
          }
        }

        try {
          const url = buildHubUrl(parsedAction);
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.error("Popup window open blocked or failed", e);
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `${error.message || "I encountered an error. Please try again in a few seconds."}` 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    await handleInstantSend(currentInput);
  };

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-[var(--deep-black)]">
      {/* Standard Conversational Chat */}
      <div className="flex flex-col h-full w-full relative overflow-hidden">
        {/* Header / Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00f2ff] flex items-center justify-center font-bold text-black text-sm shadow-[0_0_15px_rgba(0,242,255,0.3)]">
            MM
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-white uppercase text-xs sm:text-sm">Mapmates Ai</span>
            <span className="text-[10px] text-[#00f2ff]/70 font-medium tracking-widest hidden sm:block">FOUNDER FAIZAN ZEESHAN</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href="https://mapmateshub.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none bg-[var(--neon-yellow)] text-black font-black hover:brightness-110 shadow-[0_0_12px_rgba(250,204,21,0.3)]"
            title="Open MapMatesHub Map Platform"
          >
            <Map className="w-3.5 h-3.5" /> 
            <span className="hidden sm:inline">MapMates Hub 🚀</span>
          </a>

          {isSpeaking && (
            <button 
              onClick={stopSpeaking}
              className="p-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
              title="Stop Speaking"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}

          {deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleInstall}
              className="p-2.5 bg-[#00f2ff] text-black rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,242,255,0.4)] border border-[#00f2ff]/50"
              title="Install App"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          )}
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 px-4 md:px-0" ref={scrollRef}>
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center min-h-[45vh] text-center pt-4"
              >
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute -inset-4 rounded-full border border-[#00f2ff]/20"
                  />
                  <div className="w-20 h-20 rounded-3xl bg-[#00f2ff]/10 flex items-center justify-center neon-border">
                    <Sparkles className="w-10 h-10 text-[#00f2ff]" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tighter">
                  Mapmates <span className="text-[var(--neon-yellow)] neon-text-yellow">Ai</span>
                </h2>
                <p className="text-white/60 text-lg md:text-xl font-medium">
                  What can I help you <span className="text-[#00f2ff]">discover</span> today?
                </p>
                <p className="mt-8 text-white/30 text-xs font-mono uppercase tracking-[0.2em]">
                  Visionary Intelligence by Faizan Zeeshan
                </p>
              </motion.div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" 
                        ? "max-w-[85%] md:max-w-[75%] flex-row-reverse" 
                        : "max-w-[95%] md:max-w-[90%] flex-row w-full"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                      msg.role === "user" ? "bg-white/10" : "bg-[#00f2ff]/20 neon-border"
                    )}>
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-[#00f2ff]" />
                      )}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-[13px] md:text-sm leading-relaxed w-full overflow-x-auto scrollbar-thin",
                      msg.role === "user" 
                        ? "bg-white/5 border border-white/10 rounded-tr-none text-white" 
                        : "bg-[#0a0a20] border border-[#00f2ff]/20 rounded-tl-none text-white/95 shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                    )}>
                      {msg.role === "assistant" ? (
                        <>
                          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-[#00f2ff] prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#00f2ff] prose-strong:text-white prose-p:mb-3 prose-li:mb-1">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          
                          {msg.options && msg.options.length > 0 && (
                            <div className="mt-4 p-3 rounded-xl bg-black/40 border border-[#00f2ff]/10">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-[#00f2ff] font-bold block mb-2">MAPMATES RECOMMENDATIONS:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {msg.options.map((opt) => (
                                  <div 
                                    key={opt.id}
                                    className="p-3 rounded-lg bg-[#040412]/90 border border-[#00f2ff]/20 hover:border-[#00f2ff]/50 transition-all flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1.5">
                                        <h5 className="font-extrabold text-[#00f2ff] text-xs uppercase tracking-tight">{opt.name}</h5>
                                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded flex-shrink-0">{opt.distance}</span>
                                      </div>
                                      <p className="text-[10px] text-white/50 mt-1.5 line-clamp-3 leading-snug">{opt.desc}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        handleInstantSend(`Navigate to Option ${opt.id}: ${opt.name} at coordinates ${opt.lat}, ${opt.lng}`);
                                      }}
                                      className="mt-3 w-full py-1.5 bg-[#00f2ff] hover:brightness-110 text-black font-black text-[9px] uppercase tracking-wider rounded transition-all shadow-[0_0_8px_rgba(0,242,255,0.2)]"
                                    >
                                      DRAW ROUTE NOW 🚀
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Modern interactive map matching current selection route */}
                              <ChatMap 
                                options={msg.options} 
                                userLat={userProfileState?.location?.lat ? parseFloat(userProfileState.location.lat) : undefined} 
                                userLng={userProfileState?.location?.lng ? parseFloat(userProfileState.location.lng) : undefined} 
                                onMapClick={(clickedLat, clickedLng) => {
                                  handleInstantSend(`Target destination clicked at coordinates lat: ${clickedLat.toFixed(5)}, lng: ${clickedLng.toFixed(5)}. Please calculate safest route from my current geography to there!`);
                                }}
                              />
                            </div>
                          )}

                          {msg.action && (
                            <MapActionCard 
                              action={msg.action} 
                              userLat={userProfileState?.location?.lat ? parseFloat(userProfileState.location.lat) : undefined} 
                              userLng={userProfileState?.location?.lng ? parseFloat(userProfileState.location.lng) : undefined} 
                            />
                          )}
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#00f2ff] animate-pulse" />
                </div>
                <div className="flex gap-1.5 p-4 rounded-2xl bg-[#0a0a20] border border-[#00f2ff]/10">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2 h-2 rounded-full bg-[#00f2ff]"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-[#00f2ff]"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-[#00f2ff]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-none z-50">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          {isLimitExceeded ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morphism rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] border border-red-500/20 bg-black/80 backdrop-blur-2xl"
            >
              <h3 className="text-red-400 font-black text-lg mb-2 uppercase tracking-tighter">Your Daily Limit is Over</h3>
              <p className="text-white/40 text-xs sm:text-sm font-medium">Chat auto reset hone ka intezar karein. Phir aap mazed chat kar saktay hain. JazakAllah.</p>
            </motion.div>
          ) : (
            <div className="glass-morphism rounded-3xl p-1.5 flex items-center shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border border-white/5 bg-black/60 backdrop-blur-xl">
              <div className="flex-shrink-0">
                <VoiceMic isListening={isListening} onClick={toggleListening} />
              </div>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Mapmates Ai..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-sm py-3 px-3 min-w-0"
              />
              
              <div className="flex-shrink-0">
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-3.5 rounded-2xl transition-all active:scale-95",
                    input.trim() && !isLoading 
                      ? "bg-[#00f2ff] text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                      : "bg-white/5 text-white/20"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          <p className="text-center text-[9px] text-white/20 mt-3 uppercase tracking-[0.4em] font-medium px-4">
            Independent Platform • Lahore Pakistan
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
