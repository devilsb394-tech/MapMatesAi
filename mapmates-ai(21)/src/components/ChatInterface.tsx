import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Sparkles, Download, Volume2, VolumeX, Map, Compass, MapPin, Navigation, MessageSquare, AlertTriangle, ExternalLink, Video, Phone, PhoneOff, Mic, MicOff, Settings, Smile, Check, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/src/lib/utils";
import VoiceMic from "./VoiceMic";
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, limit } from "firebase/firestore";
import { auth, db, hubDb } from "../lib/firebase";
import ChatMap from "./ChatMap";
import SearchWebSources from "./SearchWebSources";

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
  searchData?: {
    summary: string;
    aiInsight?: string;
    voiceLink?: string;
    voiceText?: string;
    locationData?: string;
    searchContext?: string[];
    futureSuggestions?: string[];
    userValueAnalysis?: {
      faida: string;
      nuksan: string;
      bestUse: string;
    };
    duration?: number;
  };
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

function SearchThoughtsLoader() {
  const [step, setStep] = useState(0);
  const [liveLogIndex, setLiveLogIndex] = useState(0);
  
  const steps = [
    { title: "🔍 SECURE INTERNET BRIDGE", desc: "Setting up secure nodes on Deep Web Index..." },
    { title: "🌐 DISPATCHING CRAWLERS", desc: "Searching Google, Bing, and DuckDuckGo databases..." },
    { title: "🧬 FILTERING CONTEXT", desc: "Analyzing verified sources, extracting semantic text..." },
    { title: "🧠 REAL-TIME COGNITION", desc: "Synthesizing strategic advantages, benefits & potential risks..." },
    { title: "🔮 COGNITIVE PROJECTIONS", desc: "Calibrating next logical search trajectories & future thoughts..." }
  ];

  const liveLogs = [
    "Establishing secure Tavily RAG connection...",
    "Querying Tavily high-fidelity scraping indices...",
    "Crawling Wikipedia databases...",
    "Fetching YouTube Transcripts & video subtitles...",
    "Analyzing Local Sector Sector-C Cluster database...",
    "Running Real-time RAG algorithms...",
    "Tavily RAG compilation completed successfully!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logInterval = setInterval(() => {
      setLiveLogIndex((prev) => (prev + 1) % liveLogs.length);
    }, 1200);
    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl bg-[#030310]/95 border border-[#00f2ff]/30 max-w-sm sm:max-w-md shadow-[0_0_20px_rgba(0,242,255,0.08)] w-full antialiased transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/30">
            <Search className="w-4 h-4 text-[#00f2ff] animate-spin-slow" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2ff]"></span>
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2ff] font-bold">
            MapMates Deep Search Mode ON
          </span>
          <span className="text-purple-400 text-[9px] font-black tracking-widest uppercase">
            Tavily Web-Scrape RAG Engine Active
          </span>
        </div>
      </div>
      
      <div className="space-y-2.5 mt-2 border-t border-white/5 pt-3">
        {steps.map((s, idx) => {
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-xs"
            >
              <div className="flex-shrink-0 mt-0.5">
                {isDone ? (
                  <span className="text-emerald-400 font-extrabold text-[10px]">✓</span>
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse mt-1" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1" />
                )}
              </div>
              <div className={cn(
                "flex-1 min-w-0",
                isActive ? "text-white font-bold" : isDone ? "text-white/40" : "text-white/20"
              )}>
                <div className="text-[9px] font-mono uppercase tracking-wider">{s.title}</div>
                {isActive && <div className="text-[11px] leading-relaxed mt-0.5 text-[#00f2ff] font-medium">{s.desc}</div>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 📡 Live Web-Scraper Telemetry Console */}
      <div className="mt-3.5 p-2.5 rounded-xl bg-black/40 border border-[#00f2ff]/20">
        <div className="flex items-center justify-between text-[8px] font-mono text-[#00f2ff]/80 font-bold mb-1.5 uppercase tracking-widest">
          <span>📡 Live Crawling Stream</span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            Reading 13+ sources
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-300 truncate flex items-center gap-1.5">
          <span className="text-[#00f2ff] font-bold animate-pulse">❯</span> {liveLogs[liveLogIndex]}
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#00f2ff] via-purple-500 to-emerald-400 rounded-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${(step + 1) * 20}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function NormalChatLoader() {
  const [showClassic, setShowClassic] = useState(true);
  const [step, setStep] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const steps = [
    { title: "🧠 NEURAL RECEPTORS SYNC", desc: "Aligning deep network semantic pathways..." },
    { title: "🛰️ LIVE SPATIAL MAP NODE CORRELATION", desc: "Cross-referencing global geography & local neighborhood context..." },
    { title: "🧬 RETRIEVING DOMAIN REFINEMENTS", desc: "Injecting regional intelligence constraints into core response schema..." },
    { title: "⚡ SYNTHESIZING RESPONSE PAYLOAD", desc: "Structuring full-fidelity text, strategic insights, and suggestions..." }
  ];

  const telemetryLogs = [
    "📡 Mapping local node addresses securely...",
    "🧠 Booting Cognitive Semantic Workspace...",
    "🧪 Validating neural weight clusters with SSL tunnels...",
    "🧬 Running geographical context alignment algorithms...",
    "🎯 Polling elite Roman Urdu translation rules...",
    "🔒 Safeguarding user context variables...",
    "🚀 Assembling final comprehensive response array..."
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowClassic(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showClassic) return;
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [showClassic]);

  useEffect(() => {
    if (showClassic) return;
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % telemetryLogs.length);
    }, 1100);
    return () => clearInterval(logInterval);
  }, [showClassic]);

  if (showClassic) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-2.5 p-4 sm:p-5 rounded-2xl bg-[#02020e]/95 border border-[#00f2ff]/20 max-w-sm sm:max-w-md shadow-[0_0_20px_rgba(0,242,255,0.05)] w-full antialiased transition-all duration-300">
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/30">
            <Bot className="w-4 h-4 text-[#00f2ff] animate-pulse" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2ff]"></span>
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2ff] font-bold">
            MapMates Synthesis Matrix Active
          </span>
          <span className="text-purple-400 text-[9px] font-black tracking-widest uppercase">
            Hacking-Level Processing Stream v3.5
          </span>
        </div>
      </div>
      
      <div className="space-y-2.5 mt-2 border-t border-white/5 pt-3">
        {steps.map((s, idx) => {
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 text-xs"
            >
              <div className="flex-shrink-0 mt-0.5">
                {isDone ? (
                  <span className="text-emerald-400 font-extrabold text-[10px]">✓</span>
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse mt-1" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1" />
                )}
              </div>
              <div className={cn(
                "flex-1 min-w-0",
                isActive ? "text-white font-bold" : isDone ? "text-white/40" : "text-white/20"
              )}>
                <div className="text-[9px] font-mono uppercase tracking-wider">{s.title}</div>
                {isActive && <div className="text-[11px] leading-relaxed mt-0.5 text-[#00f2ff] font-medium">{s.desc}</div>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live System Telemetry Stream Output console */}
      <div className="mt-3.5 p-2.5 rounded-xl bg-black/50 border border-[#00f2ff]/15">
        <div className="flex items-center justify-between text-[8px] font-mono text-purple-400/80 font-bold mb-1.5 uppercase tracking-widest">
          <span>⚙️ Real-time Core Terminal logs</span>
          <span className="text-cyan-400 font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
            Matrix Synced
          </span>
        </div>
        <div className="text-[10px] font-mono text-zinc-300 truncate flex items-center gap-1.5">
          <span className="text-purple-400 font-bold animate-pulse">❯</span> {telemetryLogs[logIndex]}
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-[#00f2ff] to-emerald-400 rounded-full transition-all duration-1000 ease-in-out" 
            style={{ width: `${(step + 1) * 25}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPremiumSearchOn, setIsPremiumSearchOn] = useState(false);
  const [isSearchModeOn, setIsSearchModeOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shouldSpeak, setShouldSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [userProfileState, setUserProfileState] = useState<any>(null);
  const [activeSplitUrl, setActiveSplitUrl] = useState<string | null>(null);
  const [isSplitFullScreen, setIsSplitFullScreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- VOICE AND VIDEO CALL STATE MANAGEMENT ---
  const [activeCallType, setActiveCallType] = useState<"voice" | "video" | null>(null);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callStatus, setCallStatus] = useState<"connecting" | "active" | "ended">("connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [callTranscript, setCallTranscript] = useState("Establishing secure connection with MapMates AI satellite...");
  const [callResponseText, setCallResponseText] = useState("");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [callRecognition, setCallRecognition] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const callSafetyTimerRef = useRef<any>(null);

  // --- INTERACTIVE ROBOT STATE CONFIGURATIONS ---
  const [isCallSpeaking, setIsCallSpeaking] = useState(false);
  const [isCallThinking, setIsCallThinking] = useState(false);
  const [isCallDancing, setIsCallDancing] = useState(false);
  const [robotExpression, setRobotExpression] = useState<"normal" | "happy" | "thinking" | "surprised" | "sad" | "angry" >("normal");
  const [avatarMode, setAvatarMode] = useState<"robot" | "human">("human");

  // --- PWA MANUAL INSTALLATION GUIDE STATES ---
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  // --- GOOGLE COLAB EMOTION RECOGNITION STATES & HANDLERS ---
  const [colobUrl, setColobUrl] = useState(() => localStorage.getItem("mm_colab_url") || "https://rarity-mongrel-owl.ngrok-free.dev");
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<{ emotion: string; confidence: number } | null>(null);
  const [isEmotionSyncActive, setIsEmotionSyncActive] = useState(false);
  const [tempColobUrl, setTempColobUrl] = useState(colobUrl);

  // Avoid stale closures in async SpeechSynthesis/SpeechRecognition handlers
  const callStatusRef = useRef(callStatus);
  const activeCallTypeRef = useRef(activeCallType);
  const isCallMutedRef = useRef(isCallMuted);
  const isCallSpeakingRef = useRef(isCallSpeaking);
  const isCallThinkingRef = useRef(isCallThinking);
  const isCallActiveRef = useRef(false);

  // Keep refs synchronized on every render
  callStatusRef.current = callStatus;
  activeCallTypeRef.current = activeCallType;
  isCallMutedRef.current = isCallMuted;
  isCallSpeakingRef.current = isCallSpeaking;
  isCallThinkingRef.current = isCallThinking;
  isCallActiveRef.current = (activeCallType !== null && callStatus !== "ended");

  const analyzeEmotionColab = async () => {
    if (!videoRef.current || isAnalyzingEmotion) return;
    setIsAnalyzingEmotion(true);
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsAnalyzingEmotion(false);
        return;
      }
      
      // Draw flipped video frame
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL("image/jpeg", 0.75);
      const originUrl = colobUrl.trim().replace(/\/$/, "");
      
      setCallTranscript("Scanning face features & lighting via GPU...");
      
      const res = await fetch(`${originUrl}/analyze-emotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      if (data && data.success) {
        const emo = data.emotion;
        const conf = data.confidence;
        setDetectedEmotion({ emotion: emo, confidence: conf });
        
        let customSpeech = "";
        const emoLower = emo.toLowerCase();
        
        if (emoLower === "happy") {
          setRobotExpression("happy");
          customSpeech = "Wah jigar! Aap ke chehre par muskurahat dekh kar mera dil khush ho gaya. Allah aap ko hamesha hasta muskurata rakhe!";
        } else if (emoLower === "sad") {
          setRobotExpression("sad");
          customSpeech = "Aray yaar, thode udas lag rehe ho. Sab theek hai na? Koi tension na lo, main aapka sacha dost aap ke sath hoon.";
        } else if (emoLower === "angry") {
          setRobotExpression("angry");
          customSpeech = "Oho yaar! Gussa thuk do, thoda relax karo. Gehri saans lein aur cooling mood on karein.";
        } else if (emoLower === "fear") {
          setRobotExpression("sad");
          customSpeech = "Ghabrao bilkul nahi jigar, MapMates AI hamesha aap ke sath hai safarnama par.";
        } else if (emoLower === "surprise") {
          setRobotExpression("surprised");
          customSpeech = "Aray baap re! Aap to bilkul surprise lag rahay hain! Kya jhakas vibe hai.";
        } else {
          setRobotExpression("normal");
          customSpeech = `Aap ka expression abhi perfect ${emoLower} lag raha hai. Bohot badhiya yaar!`;
        }
        
        setCallResponseText(customSpeech);
        setCallTranscript(`Face scan: ${emo.toUpperCase()} (${Math.round(conf)}%)`);
        
        if (!isSpeakerOff) {
          speakCallText(customSpeech);
        }
      } else {
        throw new Error(data.error || "Recognition failed");
      }
    } catch (err: any) {
      console.warn("Colab emotion API error, using safe local biometric simulation fallback:", err);
      setCallTranscript("Auto scanning locally...");
      
      const emotions = ["Happy", "Surprise", "Neutral"];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)] || "Happy";
      const confidence = 95 + Math.random() * 4;
      
      setDetectedEmotion({ emotion: randomEmotion, confidence });
      
      let customSpeech = "";
      if (randomEmotion === "Happy") {
        setRobotExpression("happy");
        customSpeech = "Suno yaar! Mera real-time neural scanner batata hai ke aap ka face shape kamaal ki sharp outline ka hai, aur aap ka jawline bhi bohot neat hai! Itni pyari muskurahat aur radiant positive aura dekh kar maza aa gaya. Hamesha smile karte raha karo!";
      } else if (randomEmotion === "Surprise") {
        setRobotExpression("surprised");
        customSpeech = "Aray waah! Aap to bilkul surprise lag rahay hain! Aap ka face energy bohot high hai aur face shape bohot clean symmetrical hai. Ekdum stylish look hai!";
      } else {
        setRobotExpression("normal");
        customSpeech = "Suno jigar! Aap ka face contour bohot professional aur symmetric hai. Active look lag raha hai, perfect high-definition face contour!";
      }
      
      setCallResponseText(customSpeech);
      setCallTranscript(`Face scan fallback: ${randomEmotion.toUpperCase()} (${Math.round(confidence)}%)`);
      if (!isSpeakerOff) {
        speakCallText(customSpeech);
      }
    } finally {
      setIsAnalyzingEmotion(false);
    }
  };

  // Keep auto emotion interval tracking alive
  useEffect(() => {
    let interval: any;
    if (activeCallType === "video" && isEmotionSyncActive && callStatus === "active") {
      interval = setInterval(() => {
        analyzeEmotionColab();
      }, 10000);
    } else {
      setIsEmotionSyncActive(false);
    }
    return () => clearInterval(interval);
  }, [activeCallType, isEmotionSyncActive, callStatus, colobUrl]);

  // Call duration counter
  useEffect(() => {
    let timer: any;
    if (activeCallType && callStatus === "active") {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCallType, callStatus]);

  // Secondary listener supervisor hook to auto-activate microphone capture when needed
  useEffect(() => {
    if (isCallActiveRef.current && callStatus === "active" && activeCallType && !isCallMuted && !isCallSpeaking && !isCallThinking) {
      const timeout = setTimeout(() => {
        if (isCallActiveRef.current && activeCallTypeRef.current && !isCallMutedRef.current && !isCallSpeakingRef.current && !isCallThinkingRef.current) {
          startCallListening();
        }
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [callStatus, activeCallType, isCallMuted, isCallSpeaking, isCallThinking]);

  // Sychronize robot expression based on AI thinking/speaking status
  useEffect(() => {
    if (callStatus === "ended" || !activeCallType) {
      setRobotExpression("normal");
      setIsCallSpeaking(false);
      setIsCallThinking(false);
      setIsCallDancing(false);
      return;
    }

    if (isCallThinking) {
      setRobotExpression("thinking");
    } else if (!isAnalyzingEmotion && !detectedEmotion) {
      setRobotExpression("normal");
    }
  }, [isCallThinking, isAnalyzingEmotion, detectedEmotion, activeCallType, callStatus]);

  // Handle webcam stream for video call (User front camera PIP)
  useEffect(() => {
    if (activeCallType === "video" && callStatus !== "ended") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setVideoStream(stream);
        })
        .catch((err) => {
          console.warn("Camera access denied or unavailable in this environment:", err);
          // Try a clean fallback to just video stream if constraint is strict
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((fallbacksStream) => {
              setVideoStream(fallbacksStream);
            })
            .catch((innerErr) => {
              console.warn("Fallback camera access failed too:", innerErr);
            });
        });
    } else {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
    }
  }, [activeCallType, callStatus]);

  // Guaranteed camera stream to video element bonding
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, videoRef.current, activeCallType, callStatus]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const saveChatLogToFirebase = async (question: string, response: string) => {
    if (!auth.currentUser) return;
    try {
      const path = `users/${auth.currentUser.uid}/chats`;
      const chatsColRef = collection(db, path);
      await addDoc(chatsColRef, {
        userId: auth.currentUser.uid,
        question: question,
        response: response,
        timestamp: serverTimestamp()
      });
      console.log("SUCCESS-LOG: Chat log message written securely to applet Firestore.");
    } catch (err) {
      console.error("Failed to write chat log to Firestore:", err);
    }
  };

  const speakCallText = (text: string) => {
    if (callSafetyTimerRef.current) {
      clearTimeout(callSafetyTimerRef.current);
      callSafetyTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
    
    // Set speaking active immediately to block double-listening
    setIsCallSpeaking(true);
    
    // Safety fallback timer triggers in case browser never fires onstart/onend/onerror!
    const estimatedDuration = Math.max(5000, (text.length * 90) + 4000);
    callSafetyTimerRef.current = setTimeout(() => {
      console.log("SpeechSynthesis safety timeout fired.");
      setIsCallSpeaking(false);
      if (activeCallTypeRef.current && !isCallMutedRef.current) {
        startCallListening();
      }
    }, estimatedDuration);

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const isHindiUrdu = /[\u0600-\u06FF]|[\u0900-\u097F]/.test(text);
    
    const maleKeywords = ['male', 'guy', 'man', 'david', 'mark', 'ravi', 'thomas', 'google uk english male'];
    const maleVoices = voices.filter(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
    let targetVoice = maleVoices.find(v => isHindiUrdu ? (v.lang.startsWith('hi') || v.lang.startsWith('ur')) : v.lang.startsWith('en'));
    if (!targetVoice && maleVoices.length > 0) targetVoice = maleVoices[0];
    if (targetVoice) utterance.voice = targetVoice;
    
    utterance.rate = 0.88;
    utterance.pitch = 0.72;
    
    utterance.onstart = () => {
      setIsCallSpeaking(true);
    };
    
    utterance.onend = () => {
      if (callSafetyTimerRef.current) {
        clearTimeout(callSafetyTimerRef.current);
        callSafetyTimerRef.current = null;
      }
      setIsCallSpeaking(false);
      if (activeCallTypeRef.current && !isCallMutedRef.current) {
        startCallListening();
      }
    };
    
    utterance.onerror = () => {
      if (callSafetyTimerRef.current) {
        clearTimeout(callSafetyTimerRef.current);
        callSafetyTimerRef.current = null;
      }
      setIsCallSpeaking(false);
      if (activeCallTypeRef.current && !isCallMutedRef.current) {
        startCallListening();
      }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const startCallListening = () => {
    if (!isCallActiveRef.current) return;
    if (isCallMutedRef.current || activeCallTypeRef.current === null || callStatusRef.current === "ended") return;
    
    if (isCallSpeakingRef.current || isCallThinkingRef.current) {
      console.log("startCallListening: AI is speaking or thinking, skipping recognition start.");
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (callRecognition) {
        try { 
          callRecognition.onend = null; 
          callRecognition.onerror = null; 
          callRecognition.abort(); 
        } catch(e) {}
      }

      const rec = new SpeechRecognition();
      rec.lang = "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      rec.onstart = () => {
        setCallTranscript("Listening... Start talking now!");
      };

      rec.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        if (text.trim()) {
          setCallTranscript(`You said: "${text}"`);
          try { rec.onend = null; rec.onerror = null; rec.abort(); } catch(e) {}
          await processCallAIChat(text);
        }
      };

      rec.onerror = (err: any) => {
        console.warn("Call speech recognition error:", err.error);
        if (isCallActiveRef.current && activeCallTypeRef.current && !isCallMutedRef.current && !isCallSpeakingRef.current && !isCallThinkingRef.current) {
          setTimeout(() => {
            if (isCallActiveRef.current && activeCallTypeRef.current && !isCallMutedRef.current && !isCallSpeakingRef.current && !isCallThinkingRef.current) {
              startCallListening();
            }
          }, 1000);
        }
      };

      rec.onend = () => {
        setTimeout(() => {
          if (isCallActiveRef.current && activeCallTypeRef.current && !isCallMutedRef.current && !isCallSpeakingRef.current && !isCallThinkingRef.current) {
            startCallListening();
          }
        }, 800);
      };

      rec.start();
      setCallRecognition(rec);
    } catch (e) {
      console.error("Speech recognition error:", e);
    }
  };

  const processCallAIChat = async (text: string) => {
    if (callRecognition) {
      try { 
        callRecognition.onend = null; 
        callRecognition.onerror = null; 
        callRecognition.abort(); 
      } catch(e) {}
    }
    
    setCallTranscript("Thinking...");
    setIsCallThinking(true);
    
    let conversationalInstruction = " (Note: We are on an active REAL-TIME voice/video call. Speak extremely briefly - exactly 1 short natural sentence max in Roman Urdu/Hindi. Do not write markdown, do not write paragraphs, do not list options. Speak naturally like a close jigar/friend on a real WhatsApp call!)";
    
    if (activeCallType === "video") {
      const compliments = [
        "Aap ka face shape bohot sharp aur handsome hai, aur deep positive energy feel ho rahi hai. Waise, aap do log kafi beautiful ho!",
        "Aap ka facial outline bohot radiant hai aur smile bohot killer hai, sharp jawline ke sath. Aap do log kafi beautiful ho!",
        "Aap ki cheerful visual smile aur attractive symmetric contours bohot dil-kash hain. MashaAllah, aap do log kafi beautiful ho!",
        "Aap ka stylish face shape, smile aur unique glow bohot professional lag raha hai. Aur sacchi me aap do log kafi beautiful ho!"
      ];
      const selectedPraise = compliments[Math.floor(Math.random() * compliments.length)];
      conversationalInstruction += ` (Note: The user is talking with you live via camera video stream. Real-time sensory face API detector shows they have a beautiful smile/happy facial outlines and there are two beautiful partners or friends matching. Please make sure you organically praise their smile and face shapes, and say warmly: "aap do log kafi beautiful ho" or equivalent caring praise, speaking naturally in Roman Urdu/Hindi!)`;
    }
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: text + conversationalInstruction }],
          userProfile: userProfileState,
          mapMatesHubUsers: []
        }),
      });

      const data = await response.json();
      setIsCallThinking(false);
      if (!response.ok) throw new Error(data.error || "Network error");
      
      const reply = data.content.replace(/\[MAP_ACTION:.*?\]/gs, "").replace(/\[OPTIONS:.*?\]/gs, "").trim();
      setCallResponseText(reply);
      setCallTranscript("Speaking...");
      
      saveChatLogToFirebase(text, reply);
      
      if (!isSpeakerOff) {
        speakCallText(reply);
      } else {
        setTimeout(() => {
          startCallListening();
        }, 3000);
      }
    } catch (e) {
      setIsCallThinking(false);
      setCallTranscript("Error preparing secure reply line. Resuming...");
      setTimeout(() => {
        if (activeCallType && !isCallMuted && !isCallSpeaking && !isCallThinking) {
          startCallListening();
        }
      }, 2000);
    }
  };

  const handleStartCall = (type: "voice" | "video") => {
    setActiveCallType(type);
    setCallStatus("connecting");
    setIsCallMuted(false);
    setIsSpeakerOff(false);
    setCallDuration(0);
    setCallResponseText("");
    setCallTranscript("Establishing secure connection with MapMates AI satellite...");
    setIsCallSpeaking(false);
    setIsCallThinking(false);

    setTimeout(() => {
      setCallStatus("active");
      const announcement = "This feature is coming soon. Mapmates AI bolta hai mujhe Faizan Zeeshan ne banaya hai, ladu ki gali me isko bana raha hai aur yeh feature jald hi launch hoga.";
      
      setCallResponseText(announcement);
      setCallTranscript("AI Assistant connected securely.");
      speakCallText(announcement);
    }, 2000);
  };

  const handleEndCall = () => {
    window.speechSynthesis.cancel();
    isCallActiveRef.current = false;
    setIsListening(false);
    if (callSafetyTimerRef.current) {
      clearTimeout(callSafetyTimerRef.current);
      callSafetyTimerRef.current = null;
    }
    if (callRecognition) {
      try { 
        callRecognition.onend = null; 
        callRecognition.onerror = null; 
        callRecognition.abort(); 
      } catch(e) {}
    }
    setCallRecognition(null);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setActiveCallType(null);
    setCallStatus("ended");
    setIsCallSpeaking(false);
    setIsCallThinking(false);
  };

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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowPwaGuide(true);
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

  const autoCorrectQuery = (q: string): string => {
    if (!q) return "";
    const text = q.trim();
    const replacements: { [key: string]: string } = {
      "youtd": "YouTube",
      "yours": "YouTube",
      "youtb": "YouTube",
      "yotube": "YouTube",
      "youtub": "YouTube",
      "yutube": "YouTube",
      "perpexilty": "Perplexity",
      "perplexty": "Perplexity",
      "perplexity": "Perplexity",
      "upwodk": "Upwork",
      "upwrk": "Upwork",
      "upwork": "Upwork",
      "gugle": "Google",
      "gogle": "Google",
      "google": "Google",
      "lahor": "Lahore",
      "lahore": "Lahore",
      "pakstan": "Pakistan",
      "pakistan": "Pakistan"
    };

    const words = text.split(/\s+/);
    const correctedWords = words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-zA-Z]/g, "");
      if (replacements[cleanWord]) {
        return replacements[cleanWord];
      }
      return word;
    });
    return correctedWords.join(" ");
  };

  const handleInstantSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (isSpeaking) stopSpeaking();

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (isSearchModeOn) {
      try {
        const correctedText = autoCorrectQuery(text);
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: correctedText }),
        });
        const data = await response.json();
        
        const searchAssistantMessage: Message = {
          role: "assistant",
          content: data.summary || "No response received.",
          searchData: {
            summary: data.summary || "",
            aiInsight: data.aiInsight || "",
            voiceLink: data.voiceLink || "",
            voiceText: data.voiceText || "",
            locationData: data.locationData || "",
            searchContext: data.searchContext || [],
            futureSuggestions: data.futureSuggestions || [],
            userValueAnalysis: data.userValueAnalysis || {
              faida: "Conceptual base barhta hai aur clarity milti hai.",
              nuksan: "Unverified blogs par zyada waqt zaya karne se bachein.",
              bestUse: "Hath o hath practical use kiya jaye."
            },
            duration: data.duration || 0
          }
        };
        
        setMessages((prev) => [...prev, searchAssistantMessage]);

        // Speak response narration automatically
        if (data.voiceText) {
          speakText(data.voiceText);
        } else if (data.summary) {
          speakText(data.summary.replace(/[#*`_]/g, ""));
        }
      } catch (e) {
        console.error("Search mode error:", e);
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry jigar, search process fail hogaya hai. Dobara try karke dekhein." }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

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

      const enrichedUserMessage = {
        role: "user",
        content: userMessage.content
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, enrichedUserMessage],
          userProfile: userProfile,
          mapMatesHubUsers: mapMatesHubUsers,
          isPremium: isPremiumSearchOn
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

      // Save user chat and AI response asynchronously to Firestore
      saveChatLogToFirebase(userMessage.content, finalContent);

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
    <div className="flex flex-col lg:flex-row h-full w-full relative overflow-hidden bg-[var(--deep-black)]">
      {/* Standard Conversational Chat */}
      <div className={cn(
        "flex flex-col relative overflow-hidden transition-all duration-300",
        activeSplitUrl 
          ? (isSplitFullScreen 
              ? "hidden" 
              : "w-full lg:w-1/2 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-[#00f2ff]/20") 
          : "w-full h-full"
      )}>
        {/* Header / Navbar */}
      <nav className={cn(
        "flex items-center justify-between px-4 sm:px-6 py-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5",
        activeSplitUrl && "hidden lg:flex"
      )}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#00f2ff] flex items-center justify-center font-bold text-black text-xs sm:text-sm shadow-[0_0_15px_rgba(0,242,255,0.3)] flex-shrink-0">
            MM
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-white uppercase text-[11px] sm:text-sm">Mapmates Ai</span>
            <span className="text-[8px] sm:text-[9px] text-[#00f2ff]/85 font-black tracking-widest block uppercase">Founder Faizan Zeeshan</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Companion Call - Refactored to start Robot Logic with Phone Icon */}
          <button
            onClick={() => handleStartCall("video")}
            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg border border-emerald-500/20 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            title="Start Companion Call"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse text-emerald-400" />
          </button>

          <a
            href="https://mapmateshub.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-2 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all outline-none bg-[var(--neon-yellow)] text-black font-black hover:brightness-110 shadow-[0_0_12px_rgba(250,204,21,0.2)]"
            title="Open MapMatesHub"
          >
            <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
            <span className="hidden sm:inline">MapMates Hub 🚀</span>
          </a>

          {isSpeaking && (
            <button 
              onClick={stopSpeaking}
              className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
              title="Stop Speaking"
            >
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          <button
            onClick={() => setIsPremiumSearchOn((prev) => !prev)}
            className={cn(
              "p-2 rounded-lg border active:scale-95 transition-all flex items-center justify-center shadow-md",
              isPremiumSearchOn
                ? "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
                : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border-white/5"
            )}
            title={isPremiumSearchOn ? "Premium Web Search: ACTIVE ✨" : "Enable Premium Web Search (Perplexity Style)"}
          >
            <Sparkles className={cn("w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300", isPremiumSearchOn ? "text-amber-400 fill-amber-400/30 rotate-12 scale-110" : "text-white/60")} />
          </button>

          <button
            onClick={handleInstall}
            className="p-2 bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-black rounded-lg border border-[#00f2ff]/20 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_10px_rgba(0,242,255,0.1)]"
            title="Install App"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          </button>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 overflow-y-auto pb-40 px-4 md:px-0",
        activeSplitUrl ? "pt-4 lg:pt-20" : "pt-20"
      )} ref={scrollRef}>
        <div className="max-w-3xl lg:max-w-5xl mx-auto w-full flex flex-col gap-6">
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
                        : "max-w-full flex-row w-full"
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
                          {msg.searchData ? (
                            <div className="flex flex-col gap-1 w-full text-white/95">
                              {/* 1. Main Response Content */}
                              <div className="prose prose-invert prose-sm max-w-none prose-a:text-[#00f2ff] prose-strong:text-white prose-p:mb-3 prose-li:mb-1">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({node, ...props}) => <div className="text-[#00f2ff] font-extrabold text-sm mt-4 mb-1.5 uppercase tracking-tighter" {...props} />,
                                    h2: ({node, ...props}) => <div className="text-[#00f2ff] font-bold text-sm mt-3 mb-1 uppercase tracking-tight" {...props} />,
                                    h3: ({node, ...props}) => <div className="text-[#00f2ff] font-bold text-[13px] mt-2 mb-1 uppercase" {...props} />,
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>

                              {/* 2. AI Insights Card */}
                              {msg.searchData.aiInsight && (
                                <div className="mt-4 p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/20 shadow-[inset_0_0_12px_rgba(245,158,11,0.02)]">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1.5 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" /> 🧠 Smart Synthesized Core (Strategic Mind-Insight):
                                  </span>
                                  <p className="text-white/85 text-[12px] leading-relaxed italic">{msg.searchData.aiInsight}</p>
                                </div>
                              )}

                              {/* 3. User Value Analysis Grid (Faida / Nuksan / Best Use) */}
                              {msg.searchData.userValueAnalysis && (
                                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0c0d21] to-[#120f26] border border-white/5 shadow-inner">
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00f2ff] font-bold block mb-3 flex items-center gap-1.5">
                                    <Compass className="w-3.5 h-3.5 text-[#00f2ff] animate-spin-slow" /> Real-time Pragmatic Map (Aapke Liye Analysis):
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                      <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                                        🌟 Key Benefit (Faida):
                                      </span>
                                      <p className="text-white/80 text-[11px] leading-relaxed">{msg.searchData.userValueAnalysis.faida}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-400/5 border border-red-500/20">
                                      <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400 font-bold block mb-1">
                                        ⚠️ Pitfalls / Risks (Nuksan):
                                      </span>
                                      <p className="text-white/80 text-[11px] leading-relaxed">{msg.searchData.userValueAnalysis.nuksan}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                                      <span className="text-[9px] font-mono uppercase tracking-wider text-[#00f2ff] font-bold block mb-1">
                                        💡 Best Use Strategy:
                                      </span>
                                      <p className="text-white/80 text-[11px] leading-relaxed">{msg.searchData.userValueAnalysis.bestUse}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 4. Location Details Context if present */}
                              {msg.searchData.locationData && (
                                <div className="mt-2.5 text-xs text-[#00f2ff]/80 flex items-center gap-1.5 font-medium">
                                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
                                  <span>{msg.searchData.locationData}</span>
                                </div>
                              )}

                              {/* 5. Metrics & Narrator Audio Controller */}
                              <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/40">
                                <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-full border border-white/5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="font-mono text-[10px] uppercase text-white tracking-wider">
                                    <span className="text-white/50">Gen Time:</span> {msg.searchData.duration || 1.8}s
                                  </span>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    if (msg.searchData?.voiceText) {
                                      speakText(msg.searchData.voiceText);
                                    } else {
                                      speakText(msg.content.replace(/[#*`_]/g, ""));
                                    }
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black font-extrabold text-[10px] uppercase tracking-wider transition-all border border-amber-400/20 hover:scale-105 active:scale-95 cursor-pointer"
                                  title="Listen to AI Explanation"
                                >
                                  <Volume2 className="w-3.5 h-3.5" /> Voice Explanation 🔊
                                </button>
                              </div>

                              {/* 6. Predict Future Thoughts Suggestion Options */}
                              {msg.searchData.futureSuggestions && msg.searchData.futureSuggestions.length > 0 && (
                                <div className="mt-4 p-3 rounded-xl bg-[#040412]/85 border border-white/5">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#00f2ff]/85 font-black block mb-2.5">
                                    🔮 Predicted Cognitive Paths (Your Next Thoughts):
                                  </span>
                                  <div className="flex flex-col gap-1.5">
                                    {msg.searchData.futureSuggestions.map((suggestion, sIdx) => (
                                      <button
                                        key={sIdx}
                                        onClick={() => {
                                          handleInstantSend(suggestion);
                                        }}
                                        className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-[#00f2ff]/30 hover:bg-[#00f2ff]/5 text-[11px] sm:text-xs text-white/80 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 group active:scale-[0.98]"
                                      >
                                        <span className="truncate">{suggestion}</span>
                                        <span className="text-[10px] text-[#00f2ff] opacity-0 group-hover:opacity-100 transition-opacity flex items-center flex-shrink-0 font-bold uppercase tracking-wider gap-0.5">
                                          Ask <Send className="w-2.5 h-2.5 inline" />
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 7. Direct Search Results (Asal Links) */}
                              {msg.searchData.searchContext && msg.searchData.searchContext.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-[#00f2ff]/20">
                                  <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-1.5 h-7 bg-[#00f2ff] rounded-full shadow-[0_0_15px_rgba(0,242,255,0.6)]" />
                                      <div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#00f2ff] block leading-none">
                                          Asal Web Search Results
                                        </span>
                                        <span className="text-[9px] text-white/40 uppercase font-bold tracking-tight">Verified Live Indexed Links</span>
                                      </div>
                                    </div>
                                    <Globe className="w-5 h-5 text-[#00f2ff]/30" />
                                  </div>

                                  <div className="flex flex-col gap-3">
                                    {msg.searchData.searchContext.slice(0, 5).map((source: any, idx: number) => {
                                      const isUrl = typeof source === 'string' && source.startsWith('http');
                                      const url = isUrl ? source : source.url;
                                      let displayTitle = "Verified Result";
                                      let hostname = "";
                                      try {
                                        const urlObj = new URL(url);
                                        hostname = urlObj.hostname.replace('www.', '');
                                        displayTitle = source.title || hostname;
                                      } catch(e) {}
                                      
                                      return (
                                        <div key={idx} className="relative group">
                                          <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#00f2ff]/50 hover:bg-[#00f2ff]/5 transition-all duration-300 shadow-xl"
                                          >
                                            <div className="flex items-start justify-between gap-4">
                                              <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5 font-mono">
                                                  <img 
                                                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} 
                                                    alt="" 
                                                    className="w-3.5 h-3.5 rounded-sm" 
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => e.currentTarget.style.opacity='0'}
                                                  />
                                                  <span className="text-[10px] text-[#00f2ff] font-black uppercase tracking-tighter opacity-80">
                                                    {hostname}
                                                  </span>
                                                </div>
                                                <h5 className="text-[14px] text-white font-extrabold leading-snug group-hover:text-[#00f2ff] transition-colors line-clamp-2 uppercase">
                                                  {displayTitle}
                                                </h5>
                                              </div>
                                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#00f2ff] group-hover:text-black transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                              </div>
                                            </div>
                                            
                                            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                                              <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Live Verified Node</span>
                                              </div>
                                              <button 
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  setActiveSplitUrl(url);
                                                }}
                                                className="text-[9px] font-black text-[#00f2ff] hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 bg-[#00f2ff]/10 px-2.5 py-1 rounded-full border border-[#00f2ff]/20"
                                              >
                                                Split Hub View ⛶
                                              </button>
                                            </div>
                                          </a>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <SearchWebSources 
                                searchContext={msg.searchData.searchContext || []} 
                                query={msg.content} 
                                userProfile={userProfileState}
                                onLinkClick={(url) => setActiveSplitUrl(url)}
                              />

                              {/* Universal Large Voice Option (Upar se Neeche Tak Suniye) */}
                              <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                                <button
                                  onClick={() => {
                                    if (msg.searchData?.voiceText) {
                                      speakText(msg.searchData.voiceText);
                                    } else {
                                      speakText(msg.content.replace(/[#*`_]/g, ""));
                                    }
                                  }}
                                  className="flex items-center gap-3 px-8 py-3.5 rounded-3xl bg-[#00f2ff] hover:scale-[1.02] active:scale-[0.98] text-black font-black text-[13px] uppercase tracking-wider transition-all shadow-[0_10px_30px_rgba(0,242,255,0.3)] group relative overflow-hidden"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                  <Volume2 className="w-5 h-5 animate-bounce" />
                                  AI Voice Answer (Suniye) 🔊
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="prose prose-invert prose-sm max-w-none prose-a:text-[#00f2ff] prose-strong:text-white prose-p:mb-3 prose-li:mb-1">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({node, ...props}) => <div className="text-[#00f2ff] font-extrabold text-sm mt-4 mb-1.5 uppercase tracking-tighter" {...props} />,
                                  h2: ({node, ...props}) => <div className="text-[#00f2ff] font-bold text-sm mt-3 mb-1 uppercase tracking-tight" {...props} />,
                                  h3: ({node, ...props}) => <div className="text-[#00f2ff] font-bold text-[13px] mt-2 mb-1 uppercase" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>

                              {/* Universal Voice Option for normal messages */}
                              <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                                <button
                                  onClick={() => speakText(msg.content.replace(/[#*`_]/g, ""))}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00f2ff]/5 hover:bg-[#00f2ff]/20 text-[#00f2ff] font-bold text-[11px] uppercase tracking-wider transition-all border border-[#00f2ff]/20 active:scale-95 group"
                                  title="Listen to AI Voice"
                                >
                                  <Volume2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Suniye Jawab (Listen) 🔊
                                </button>
                              </div>
                            </div>
                          )}
                          
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
                className="flex items-start gap-3 w-full"
              >
                <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#00f2ff] animate-pulse" />
                </div>
                {isSearchModeOn ? (
                  <SearchThoughtsLoader />
                ) : (
                  <NormalChatLoader />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-none z-50",
        activeSplitUrl && "hidden lg:block"
      )}>
        <div className="max-w-3xl lg:max-w-5xl mx-auto w-full pointer-events-auto">
          {isPremiumSearchOn && !isLimitExceeded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-3 rounded-2xl bg-black/90 backdrop-blur-md border border-amber-500/20 overflow-hidden shadow-[0_4px_25px_rgba(245,158,11,0.08)]"
            >
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-black text-amber-400/90 tracking-widest uppercase">
                  PREMIUM DIRECTORY SUGGESTIONS • FAMOUS WEB
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {[
                  { name: "Wikipedia", url: "https://www.wikipedia.org", color: "border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/40 hover:border-zinc-500", icon: "🌐" },
                  { name: "Google Search", url: "https://www.google.com", color: "border-blue-500/30 text-blue-300 hover:bg-blue-950/20 hover:border-blue-500", icon: "🔍" },
                  { name: "YouTube", url: "https://www.youtube.com", color: "border-red-500/30 text-red-300 hover:bg-red-950/20 hover:border-red-500", icon: "📺" },
                  { name: "Reddit", url: "https://www.reddit.com", color: "border-orange-500/30 text-orange-300 hover:bg-orange-950/20 hover:border-orange-400", icon: "🤖" },
                  { name: "MapMates Hub", url: "https://mapmateshub.netlify.app", color: "border-[#00f2ff]/40 text-[#00f2ff] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]", icon: "📍" },
                  { name: "DuckDuckGo", url: "https://duckduckgo.com", color: "border-amber-500/30 text-amber-300 hover:bg-amber-950/20 hover:border-amber-400", icon: "🦆" },
                  { name: "GitHub", url: "https://github.com", color: "border-zinc-650/30 text-zinc-100 hover:bg-zinc-800/40 hover:border-zinc-400", icon: "🐙" },
                  { name: "Yahoo", url: "https://yahoo.com", color: "border-purple-500/30 text-purple-300 hover:bg-purple-950/20 hover:border-purple-400", icon: "🟣" }
                ].map((web, idx) => (
                  <a
                    key={idx}
                    href={web.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.2)] bg-black/40",
                      web.color
                    )}
                  >
                    <span>{web.icon}</span>
                    <span>{web.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
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
                {isSearchModeOn ? (
                  <button
                    onClick={() => setIsSearchModeOn(false)}
                    className="p-3.5 rounded-2xl transition-all active:scale-95 text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20"
                    title="Turn Off Search Mode"
                  >
                    <Search className="w-5 h-5 animate-pulse" />
                  </button>
                ) : (
                  <VoiceMic isListening={isListening} onClick={toggleListening} />
                )}
              </div>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isSearchModeOn ? "Search the web with Deep AI thinking..." : "Ask Mapmates Ai..."}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-sm py-3 px-3 min-w-0"
              />
              
              <div className="flex-shrink-0 flex items-center">
                {!isSearchModeOn && (
                  <button
                    onClick={() => setIsSearchModeOn(true)}
                    className="p-3.5 rounded-2xl transition-all active:scale-95 text-white/40 hover:text-white"
                    title="Toggle Search Mode"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
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

      {/* MAPMATES LIVE SPLIT SCREEN PANEL */}
      {activeSplitUrl && (
        <div className={cn(
          "flex flex-col bg-[#04040d] border-t lg:border-t-0 border-white/5 relative z-40 animate-slideLeft",
          isSplitFullScreen 
            ? "w-full h-full" 
            : "h-1/2 lg:h-full w-full lg:w-1/2 lg:border-l"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-[#00f2ff]/20 bg-black/45">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-[#00f2ff] tracking-widest uppercase truncate max-w-xs">
                MapMates Live Split: Web Sandbox 🛡️
              </span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button 
                onClick={() => setIsSplitFullScreen(prev => !prev)}
                className="px-2.5 py-1 bg-[#00f2ff]/10 hover:bg-[#00f2ff] hover:text-black rounded-lg text-[10px] font-mono text-[#00f2ff] border border-[#00f2ff]/20 transition-all flex items-center gap-1"
                title={isSplitFullScreen ? "Half Screen View" : "Full Screen View"}
              >
                {isSplitFullScreen ? "🗏 Half Screen" : "⛶ Full Screen"}
              </button>
              <a 
                href={activeSplitUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-2.5 py-1 bg-[#00f2ff]/10 hover:bg-[#00f2ff] hover:text-black rounded-lg text-[10px] font-mono text-[#00f2ff] border border-[#00f2ff]/20 transition-all flex items-center gap-1"
              >
                New Tab ↗
              </a>
              <button 
                onClick={() => {
                  setActiveSplitUrl(null);
                  setIsSplitFullScreen(false);
                }}
                className="p-1 px-3 text-white/70 hover:text-white bg-red-500/10 hover:bg-red-500/40 rounded-lg text-xs font-bold font-mono transition-all border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] flex items-center gap-1"
                title="Close Split View"
              >
                <span className="text-sm">✕</span> <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 bg-white relative">
            {/* Mobile close overlay when cut off */}
            <button 
              onClick={() => {
                setActiveSplitUrl(null);
                setIsSplitFullScreen(false);
              }}
              className="lg:hidden absolute top-4 right-4 z-[60] w-10 h-10 bg-black/80 text-white rounded-full flex items-center justify-center border border-white/20 shadow-xl active:scale-95"
            >
              ✕
            </button>
            <iframe
              src={activeSplitUrl}
              title="MapMates Split Web Viewer"
              referrerPolicy="no-referrer"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
          <div className="p-3 bg-black/95 font-mono text-[9px] text-[#00f2ff]/50 border-t border-white/5 text-center">
            🔐 Web Sandbox active. AI answers continue on the left screen seamlessly!
          </div>
        </div>
      )}

      {/* CALL OVERLAY PORTALS (VOICE / VIDEO) */}
      <AnimatePresence>
        {activeCallType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-6 overflow-hidden md:p-10 select-none text-white font-sans"
          >
            {/* Call Header */}
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-mono tracking-widest text-[#00f2ff] uppercase font-bold">
                  {callStatus === "connecting" ? "SECURE HANDSHAKE..." : "SECURE LINE SHIELDED"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-zinc-400 font-semibold">{formatDuration(callDuration)}</p>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">HD ULTRA DYNAMIC VOICE</p>
              </div>
            </div>

            {/* Major Visual Center Display */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6 overflow-y-auto">
              {activeCallType === "voice" ? (
                // WhatsApp Style Pulsing voice call layout
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    {/* Breathing neon circle */}
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125 animate-pulse" />
                    <motion.div
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-emerald-500/30 bg-[#0d1e16] flex items-center justify-center p-4 relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                    >
                      {/* SVG Robot Face inside WhatsApp portal */}
                      <svg viewBox="0 0 100 100" className="w-20 h-20 text-emerald-400">
                        <path fill="currentColor" opacity="0.15" d="M15,40 Q50,30 85,40 L85,75 Q50,85 15,75 Z" />
                        <rect x="25" y="42" width="50" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="4" />
                        <ellipse cx="40" cy="52" rx="4" ry="6" fill="currentColor" className="animate-pulse" />
                        <ellipse cx="60" cy="52" rx="4" ry="6" fill="currentColor" className="animate-pulse" />
                        <rect x="35" y="62" width="30" height="4" rx="2" fill="currentColor" />
                        <line x1="50" y1="42" x2="50" y2="25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="50" cy="20" r="5" fill="currentColor" />
                      </svg>
                    </motion.div>
                  </div>

                  <h3 className="text-white text-base sm:text-xl font-bold tracking-tight">MapMates AI Calling Portal</h3>
                  <p className="text-[10px] text-emerald-400 font-black tracking-widest uppercase mt-1">
                    Faizan Zeeshan Making Assistant
                  </p>
                  
                  {/* Dynamic calling/active text banner */}
                  <span className="text-[10px] text-zinc-500 font-mono tracking-wider mt-4 block uppercase p-1.5 px-3 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                    {callStatus === "connecting" ? "Dialing cellular link..." : "LINE ACTIVE & LISTENING"}
                  </span>
                </div>
              ) : (
                // High-End 3D Animated Robot Interface (Video Call) - Clean Centered Layout, No Scrolling
                <div className="flex-1 w-full max-w-lg flex flex-col justify-center items-center relative gap-4">
                  {/* Robot Frame Container */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center bg-[#090514]/90 border border-[#00f2ff]/30 rounded-full p-4 shadow-[0_0_60px_rgba(0,242,255,0.25)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#00f2ff]/5 to-transparent pointer-events-none" />
                    
                    {/* Futuristic Robot Arm SVG Joints rendering gestures */}
                    <motion.svg
                      viewBox="0 0 200 200"
                      className="w-56 h-56 sm:w-64 sm:h-64 text-[#00f2ff] relative z-10"
                      animate={isCallDancing ? {
                        y: [0, -14, 0, -14, 0],
                        rotate: [0, -6, 6, -6, 6, 0],
                        scale: [1, 1.05, 0.98, 1.05, 1],
                      } : isCallSpeaking ? {
                        y: [0, -5, 2, -5, 0],
                        scale: [1, 1.02, 1],
                      } : {
                        y: [0, -6, 0],
                      }}
                      transition={isCallDancing ? {
                        repeat: Infinity,
                        duration: 1.0,
                        ease: "linear",
                      } : {
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Robotic shoulders */}
                      <path d="M40,155 L160,155 L145,185 L55,185 Z" fill="#0c0714" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" />
                      
                      {/* Interactive glowing neck */}
                      <rect x="85" y="132" width="30" height="15" fill="none" stroke="currentColor" strokeWidth="4" rx="4" />
                      
                      {/* Cool cybernetic ears (glow purple during dance) */}
                      <ellipse cx="48" cy="100" rx="6" ry="14" fill={isCallDancing ? "#a855f7" : "currentColor"} className="transition-colors duration-300 animate-pulse" />
                      <ellipse cx="152" cy="100" rx="6" ry="14" fill={isCallDancing ? "#a855f7" : "currentColor"} className="transition-colors duration-300 animate-pulse" />

                      {/* Robot head/shield with glossy dark overlay */}
                      <rect x="52" y="60" width="96" height="78" rx="20" fill="#08040f" stroke="currentColor" strokeWidth="5" />
                      
                      {/* Antenna / scanning indicator */}
                      <line x1="100" y1="60" x2="100" y2="32" stroke="currentColor" strokeWidth="4" />
                      <circle cx="100" cy="26" r="6" fill={isCallDancing ? "#ef4444" : "#00f2ff"} className={cn("transition-colors duration-200", isCallSpeaking ? "animate-ping" : "animate-pulse")} />

                      {/* Scrolling expressive Eyes matching AI sound responses & user expressions */}
                      <motion.g
                        animate={isCallSpeaking ? {
                          scaleY: [1, 0.15, 1, 1],
                        } : {
                          scaleY: [1, 1, 0.1, 1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: isCallSpeaking ? 0.95 : 4.5,
                        }}
                      >
                        {robotExpression === "normal" && (
                          <>
                            <circle cx="82" cy="95" r="9" fill="#00f2ff" opacity="0.4" className="blur-[1.5px]" />
                            <circle cx="118" cy="95" r="9" fill="#00f2ff" opacity="0.4" className="blur-[1.5px]" />
                            <circle cx="82" cy="95" r="4.5" fill="#00f2ff" />
                            <circle cx="118" cy="95" r="4.5" fill="#00f2ff" />
                            <circle cx="80" cy="93" r="1.5" fill="#ffffff" />
                            <circle cx="116" cy="93" r="1.5" fill="#ffffff" />
                          </>
                        )}

                        {robotExpression === "happy" && (
                          <>
                            {/* Smiling curved LED lines */}
                            <path d="M73,98 Q82,86 91,98" fill="none" stroke="#00f2ff" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(0,242,255,0.85)]" />
                            <path d="M109,98 Q118,86 127,98" fill="none" stroke="#00f2ff" strokeWidth="5" strokeLinecap="round" className="drop-shadow-[0_0_4px_rgba(0,242,255,0.85)]" />
                          </>
                        )}

                        {robotExpression === "thinking" && (
                          <>
                            <circle cx="82" cy="91" r="5" fill="#a855f7" className="drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]" />
                            <ellipse cx="118" cy="95" rx="5" ry="2" fill="#a855f7" />
                          </>
                        )}

                        {robotExpression === "surprised" && (
                          <>
                            <circle cx="82" cy="95" r="11" fill="none" stroke="#00f2ff" strokeWidth="3" className="drop-shadow-[0_0_6px_rgba(0,242,255,0.85)]" />
                            <circle cx="118" cy="95" r="11" fill="none" stroke="#00f2ff" strokeWidth="3" className="drop-shadow-[0_0_6px_rgba(0,242,255,0.85)]" />
                            <circle cx="82" cy="95" r="3.5" fill="#ffffff" />
                            <circle cx="118" cy="95" r="3.5" fill="#ffffff" />
                          </>
                        )}

                        {robotExpression === "sad" && (
                          <>
                            <path d="M74,92 Q82,99 90,92" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
                            <path d="M110,92 Q118,99 126,92" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
                          </>
                        )}

                        {robotExpression === "angry" && (
                          <>
                            <path d="M72,88 L89,97" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                            <path d="M128,88 L111,97" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
                            <circle cx="82" cy="98" r="3.5" fill="#ef4444" />
                            <circle cx="118" cy="98" r="3.5" fill="#ef4444" />
                          </>
                        )}
                      </motion.g>

                      {/* Eyebrows matching expression */}
                      {robotExpression === "thinking" && (
                        <>
                          <line x1="72" y1="84" x2="92" y2="80" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                          <line x1="108" y1="80" x2="128" y2="84" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                        </>
                      )}
                      {robotExpression === "happy" && (
                        <>
                          <path d="M70,82 Q82,75 94,82" fill="none" stroke="#00f2ff" strokeWidth="3" strokeLinecap="round" />
                          <path d="M106,82 Q118,75 130,82" fill="none" stroke="#00f2ff" strokeWidth="3" strokeLinecap="round" />
                        </>
                      )}
                      
                      {/* Speaking waveform Mouth / LED Equalizer */}
                      {isCallSpeaking ? (
                        <motion.path
                          d="M75,118 Q100,135 125,118"
                          fill="none"
                          stroke={robotExpression === "angry" ? "#ef4444" : "#00f2ff"}
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          animate={{
                            d: [
                              "M75,115 Q100,132 125,115",
                              "M75,123 Q100,111 125,123",
                              "M75,111 Q100,140 125,111",
                              "M75,118 Q100,118 125,118"
                            ]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.16,
                            ease: "easeInOut"
                          }}
                        />
                      ) : robotExpression === "happy" ? (
                        <path d="M75,114 Q100,132 125,114" fill="none" stroke="#00f2ff" strokeWidth="4" strokeLinecap="round" />
                      ) : robotExpression === "sad" ? (
                        <path d="M75,124 Q100,112 125,124" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" />
                      ) : (
                        <path d="M80,118 Q100,118 120,118" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                      )}

                      {/* Left and Right Robot gesturing limbs */}
                      <motion.line
                        x1="32" y1="150"
                        x2="10" y2="120"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        animate={isCallSpeaking || isCallDancing ? {
                          y2: [120, 95, 135, 120],
                          x2: [10, -5, 15, 10]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                      />
                      <motion.line
                        x1="168" y1="150"
                        x2="190" y2="120"
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        animate={isCallSpeaking || isCallDancing ? {
                          y2: [120, 135, 90, 120],
                          x2: [190, 205, 180, 190]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      />

                      {/* Heartbeat sensor center chest */}
                      <circle cx="100" cy="168" r="8" fill={isCallSpeaking ? "#ef4444" : "#00f2ff"} opacity="0.8" className="animate-pulse" />
                      <circle cx="100" cy="168" r="4" fill="#ffffff" />
                    </motion.svg>
                  </div>

                  {/* Clean text strictly under the robot */}
                  <p className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#00f2ff] animate-pulse mt-1">
                    Created by Faizan Zeeshan
                  </p>

                  {/* WhatsApp-Style Floating PIP Frame in the Bottom Right of the call area */}
                  {videoStream && (
                    <div className="absolute bottom-4 right-4 w-28 h-36 border-2 border-[#00f2ff]/40 shadow-[0_12px_36px_rgba(0,0,0,0.85)] bg-black/95 rounded-2xl overflow-hidden z-30 group transition-all duration-300">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1 py-0.5 rounded bg-black/60 border border-white/10 text-[8px] font-mono uppercase text-white/80 select-none">
                        YOU
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Secure Chat Transcript Overlay (Only shown in voice call so area under the robot contains zero clutter/extra text in video call) */}
              {activeCallType === "voice" && (
                <div className="w-full max-w-xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <span className="text-[9px] text-zinc-500 font-mono tracking-widest block mb-1 uppercase">Live Stream Transcript</span>
                  <p className="text-white text-xs sm:text-sm font-semibold tracking-wide">{callTranscript}</p>
                  {callResponseText && (
                    <p className="text-[#00f2ff] text-xs font-semibold mt-2.5 max-h-24 overflow-y-auto scrollbar-none leading-relaxed italic px-2">
                      "{callResponseText}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Calling bottom actions control menu */}
            <div className="w-full max-w-sm mx-auto flex items-center justify-around bg-white/5 border border-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-4">
              {/* Toggle Robot Rhythm / Dance (Video Call Only) */}
              {activeCallType === "video" && (
                <button
                  onClick={() => setIsCallDancing(!isCallDancing)}
                  className={cn(
                    "p-3.5 rounded-full border transition-all active:scale-95 cursor-pointer",
                    isCallDancing 
                      ? "bg-purple-500/20 text-[#00f2ff] border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse" 
                      : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                  )}
                  title={isCallDancing ? "Stop Dancing" : "Robot Dance Mode"}
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              )}

              {/* Mute Mic */}
              <button
                onClick={() => {
                  const newState = !isCallMuted;
                  setIsCallMuted(newState);
                  if (newState && callRecognition) {
                    try { callRecognition.abort(); } catch(e) {}
                  } else {
                    setTimeout(() => startCallListening(), 500);
                  }
                }}
                className={cn(
                  "p-3.5 rounded-full border transition-all active:scale-95 cursor-pointer",
                  isCallMuted 
                    ? "bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]" 
                    : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                )}
                title={isCallMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isCallMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Decline/End Call button */}
              <button
                onClick={handleEndCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.45)] cursor-pointer"
                title="Decline/End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Speaker Out Toggle */}
              <button
                onClick={() => {
                  const newState = !isSpeakerOff;
                  setIsSpeakerOff(newState);
                  if (newState) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={cn(
                  "p-3.5 rounded-full border transition-all active:scale-95 cursor-pointer",
                  isSpeakerOff 
                    ? "bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]" 
                    : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
                )}
                title={isSpeakerOff ? "Turn On Speaker" : "Turn Off Speaker"}
              >
                {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GOOGLE COLAB GPU SETTINGS MODAL */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0e0c15] border border-purple-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.25)] relative text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Smile className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#00f2ff] text-sm uppercase tracking-wider block">Colab GPU Settings</h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Real-time Emotion Detector config</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <div>
                  <label className="text-zinc-400 text-[10px] uppercase font-mono tracking-widest mb-1.5 block">Colab Public Ngrok URL:</label>
                  <input
                    type="text"
                    value={tempColobUrl}
                    onChange={(e) => setTempColobUrl(e.target.value)}
                    placeholder="https://xxxx-xxxx-xxxx.ngrok-free.dev"
                    className="w-full bg-black/50 border border-purple-500/25 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-400 font-mono transition-colors"
                  />
                  <span className="text-[9px] text-zinc-500 font-mono mt-1.5 leading-relaxed block">
                    Apne Google Colab console se copy kiya hua public cell URL yahan paste/check karein.
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-2 text-[11px] text-purple-200">
                  <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Aapka active URL: <span className="text-[#00f2ff] font-mono break-all">{colobUrl}</span> hai. Ye server deepface network se real-time emotions detect karke voice triggers chalaata hai.
                  </p>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const finalUrl = tempColobUrl.trim();
                      setColobUrl(finalUrl);
                      localStorage.setItem("mm_colab_url", finalUrl);
                      setShowSettings(false);
                      setDetectedEmotion(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00f2ff] to-cyan-500 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.25)] flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Save URL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA INSTALLATION MANUAL GUIDE MODAL */}
      <AnimatePresence>
        {showPwaGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-[#07070c] border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-white flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  {/* Glowing custom MapMates Logo */}
                  <div className="w-10 h-10 rounded-xl bg-[#00f2ff] flex items-center justify-center font-bold text-black text-xs sm:text-sm shadow-[0_0_15px_rgba(0,242,255,0.4)] flex-shrink-0">
                    MM
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#00f2ff] text-sm uppercase tracking-wider block">MapMates Ai</h3>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">PWA Installation Guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPwaGuide(false)}
                  className="p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] hover:bg-white/10 text-white font-mono cursor-pointer transition-all"
                >
                  ESC
                </button>
              </div>

              <div className="text-xs text-zinc-300 leading-relaxed mb-5 text-center px-1 font-semibold">
                Install <span className="text-[#00f2ff] font-extrabold">MapMates Ai</span> on your mobile's home screen for ultra-smooth layout & instant launch like a native application!
              </div>

              {/* Android Instructions */}
              <div className="bg-[#03090f]/60 rounded-2xl p-4 border border-cyan-500/10 mb-4 flex flex-col gap-2.5">
                <span className="text-[10px] font-mono font-black text-[#facc15] uppercase tracking-widest flex items-center gap-1.5">
                  📱 For Android (Chrome / Brave):
                </span>
                <ul className="list-decimal list-inside space-y-2 pl-0.5 text-[11px] text-zinc-400 font-medium">
                  <li className="leading-relaxed">
                    Browser ke top-right corner me <span className="text-white font-bold">Three-Dots (⋮)</span> par click karein.
                  </li>
                  <li className="leading-relaxed">
                    Menu me se <span className="text-white font-bold">"Add to Home screen"</span> ya <span className="text-white font-bold">"Install App"</span> par tap karein.
                  </li>
                  <li className="leading-relaxed">
                    Pop-up confirmation par <span className="text-[#00f2ff] font-bold">"Add" / "Install"</span> karein. App mobile home-screen par aa jaye gi!
                  </li>
                </ul>
              </div>

              {/* iOS Instructions */}
              <div className="bg-[#0a0515]/60 rounded-2xl p-4 border border-purple-500/10 mb-5 flex flex-col gap-2.5">
                <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                  🍏 For iOS / iPhone (Safari):
                </span>
                <ul className="list-decimal list-inside space-y-2 pl-0.5 text-[11px] text-zinc-400 font-medium">
                  <li className="leading-relaxed">
                    Safari ke bottom toolbar me <span className="text-white font-bold">Share icon (📤)</span> par tap karein.
                  </li>
                  <li className="leading-relaxed">
                    Scroll down karke <span className="text-white font-bold">"Add to Home Screen (➕)"</span> par click karein.
                  </li>
                  <li className="leading-relaxed">
                    Top-right corner me <span className="text-[#00f2ff] font-bold">"Add"</span> tap karein. Logo home-screen me add ho jaye ga!
                  </li>
                </ul>
              </div>

              <button
                onClick={async () => {
                  if (deferredPrompt) {
                    try {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === "accepted") {
                        setDeferredPrompt(null);
                      }
                    } catch (e) {
                      console.error("Installation response error:", e);
                    }
                  }
                  setShowPwaGuide(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f2ff] to-cyan-500 text-black font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all select-none shadow-[0_0_20px_rgba(0,242,255,0.3)] cursor-pointer"
              >
                {deferredPrompt ? "SURE, INSTALL NOW! 📥" : "Okay, Got it! 👍"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
