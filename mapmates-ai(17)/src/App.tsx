/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import ChatInterface from "./components/ChatInterface";
import { User } from "firebase/auth";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <main className="h-screen w-full overflow-hidden bg-[#050505]">
      {!user ? (
        <SplashScreen onComplete={(u) => setUser(u)} />
      ) : (
        <ChatInterface />
      )}
    </main>
  );
}

