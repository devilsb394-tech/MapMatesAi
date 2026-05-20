import { motion } from "motion/react";
import { Mic } from "lucide-react";

interface VoiceMicProps {
  isListening: boolean;
  onClick: () => void;
}

export default function VoiceMic({ isListening, onClick }: VoiceMicProps) {
  return (
    <button
      onClick={onClick}
      className="relative group p-3 transition-all active:scale-95"
      aria-label="Voice input"
    >
      {/* Glowing ripples when listening */}
      {isListening && (
        <>
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-[#00f2ff]"
          />
          <motion.div
            initial={{ scale: 1, opacity: 0.3 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0 rounded-full bg-[#00f2ff]/50"
          />
        </>
      )}

      <div
        className={`relative z-10 p-3 rounded-full transition-all duration-300 ${
          isListening
            ? "bg-[#00f2ff] text-[#050505] shadow-[0_0_20px_rgba(0,242,255,0.8)] scale-110"
            : "bg-white/5 hover:bg-white/10 text-white hover:text-[#00f2ff]"
        }`}
      >
        <Mic className={isListening ? "w-5 h-5 animate-pulse" : "w-5 h-5"} />
      </div>
    </button>
  );
}
