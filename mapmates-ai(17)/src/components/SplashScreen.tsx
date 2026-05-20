import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { auth, loginWithGoogle } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { LogIn } from "lucide-react";

interface SplashScreenProps {
  onComplete: (user: User) => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authChecked && user) {
      const timer = setTimeout(() => {
        setLoading(false);
        setTimeout(() => onComplete(user), 500);
      }, 2000); // Give user at least 2s of splash if already logged in
      return () => clearTimeout(timer);
    }
  }, [authChecked, user, onComplete]);

  const handleLogin = async () => {
    try {
      const loggedInUser = await loginWithGoogle();
      setUser(loggedInUser);
    } catch (err) {
      setError("Failed to sign in. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
        >
          {/* Neon background effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,242,255,0.1)_0%,_transparent_70%)]" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo MM */}
            <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-2xl bg-[#00f2ff] shadow-[0_0_30px_rgba(0,242,255,0.6)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400 rotate-45 translate-x-4 -translate-y-4" />
              <span className="text-4xl font-extrabold text-[#050505] tracking-tighter relative z-10">MM</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
              MapMates <span className="text-[var(--neon-yellow)] neon-text-yellow">Ai</span>
            </h1>

            {/* Modern Loader or Login */}
            <div className="flex flex-col items-center mt-12">
              {!authChecked ? (
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-full h-full bg-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.8)]"
                  />
                </div>
              ) : !user ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 px-8 py-3 bg-[#00f2ff] text-black font-bold rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.5)] hover:scale-105 transition-transform active:scale-95"
                  >
                    <LogIn className="w-5 h-5" />
                    Sign in to Mapmates
                  </button>
                  {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1 }}
                      className="w-full h-full bg-[#00f2ff] origin-left"
                    />
                  </div>
                  <p className="text-[#00f2ff] text-xs font-mono uppercase tracking-[0.2em] mt-4 animator-pulse">
                    Identity Verified
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 text-center"
          >
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
              Independent created by <span className="text-[#00f2ff]">Faizan Zeeshan</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
