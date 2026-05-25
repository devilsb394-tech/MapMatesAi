import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, BarChart3, TrendingUp, Clock, MousePointer, 
  AlertTriangle, ArrowLeft, RefreshCw, Trash2, Sparkles, 
  User, Calendar, MessageSquare, Heart, ShieldCheck, Search, ChevronRight
} from "lucide-react";
import { collection, query, getDocs, orderBy, doc, deleteDoc, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

interface AnalyticsSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  referrer: string;
  deviceInfo: string;
  totalClicks: number;
  rageClicks: number;
  timeSpentSeconds: number;
  clickedItems: string;
  mostUsedFeatures: string;
  timestamp: any;
}

interface SignUpUser {
  id: string;
  userId?: string;
  displayName?: string;
  email?: string;
  createdAt?: any;
}

interface UserChatLog {
  question: string;
  response: string;
  timestamp: any;
}

interface UserFeedback {
  id: string;
  userId: string;
  userName: string;
  userLocation: string;
  text: string;
  timestamp: any;
}

interface AdminAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminAnalytics({ isOpen, onClose }: AdminAnalyticsProps) {
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [signUpUsers, setSignUpUsers] = useState<SignUpUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserChats, setSelectedUserChats] = useState<UserChatLog[]>([]);
  const [selectedUserFeedbacks, setSelectedUserFeedbacks] = useState<UserFeedback[]>([]);
  const [allIdeas, setAllIdeas] = useState<any[]>([]);
  const [isChildLoading, setIsChildLoading] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<"all" | "active24h" | "over1h">("all");
  const [adminSubTab, setAdminSubTab] = useState<"recent" | "past" | "ideas">("recent");

  const fetchPrimaryData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const analyticsRef = collection(db, "analytics");
      const q = query(analyticsRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const loadedSessions: AnalyticsSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedSessions.push({
          id: docSnap.id,
          userId: data.userId || "guest",
          userName: data.userName || "Anonymous Guest",
          userEmail: data.userEmail || "guest@mapmates.ai",
          referrer: data.referrer || "Direct Link",
          deviceInfo: data.deviceInfo || "Unknown Device",
          totalClicks: parseInt(data.totalClicks || "0", 10),
          rageClicks: parseInt(data.rageClicks || "0", 10),
          timeSpentSeconds: parseInt(data.timeSpentSeconds || "0", 10),
          clickedItems: data.clickedItems || "{}",
          mostUsedFeatures: data.mostUsedFeatures || "{}",
          timestamp: data.timestamp
        });
      });
      setSessions(loadedSessions);

      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const loadedUsers: SignUpUser[] = [];
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        loadedUsers.push({
          id: docSnap.id,
          userId: data.userId || docSnap.id,
          displayName: data.displayName || data.name || "Signed Up User",
          email: data.email || "no-email@mapmates.ai",
          createdAt: data.createdAt
        });
      });
      setSignUpUsers(loadedUsers);

      const ideasRef = collection(db, "ideas");
      const ideasSnap = await getDocs(ideasRef);
      const loadedIdeas: any[] = [];
      ideasSnap.forEach((docSnap) => {
        const data = docSnap.data();
        loadedIdeas.push({
          id: docSnap.id,
          ...data
        });
      });
      setAllIdeas(loadedIdeas);
    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
      setErrorMsg(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const analyticsRef = collection(db, "analytics");
    const qAnalytics = query(analyticsRef, orderBy("timestamp", "desc"));
    const unsubscribeAnalytics = onSnapshot(qAnalytics, (snapshot) => {
      const loadedSessions: AnalyticsSession[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedSessions.push({
          id: docSnap.id,
          userId: data.userId || "guest",
          userName: data.userName || "Anonymous Guest",
          userEmail: data.userEmail || "guest@mapmates.ai",
          referrer: data.referrer || "Direct Link",
          deviceInfo: data.deviceInfo || "Unknown Device",
          totalClicks: parseInt(data.totalClicks || "0", 10),
          rageClicks: parseInt(data.rageClicks || "0", 10),
          timeSpentSeconds: parseInt(data.timeSpentSeconds || "0", 10),
          clickedItems: data.clickedItems || "{}",
          mostUsedFeatures: data.mostUsedFeatures || "{}",
          timestamp: data.timestamp
        });
      });
      setSessions(loadedSessions);
    }, (err: any) => {
      console.error("Telemetry real-time listener failed:", err);
      setErrorMsg(err?.message || "Permissions missing on analytics.");
    });

    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (usersSnap) => {
      const loadedUsers: SignUpUser[] = [];
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        loadedUsers.push({
          id: docSnap.id,
          userId: data.userId || docSnap.id,
          displayName: data.displayName || data.name || "Signed Up User",
          email: data.email || "no-email@mapmates.ai",
          createdAt: data.createdAt
        });
      });
      setSignUpUsers(loadedUsers);
    });

    return () => {
      unsubscribeAnalytics();
      unsubscribeUsers();
    };
  }, [isOpen]);

  const getTimestampMillis = (ts: any): number => {
    if (!ts) return Date.now();
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000;
    return new Date(ts).getTime();
  };

  const getParsedMap = (jsonStr: string): Record<string, number> => {
    try {
      return JSON.parse(jsonStr || "{}");
    } catch {
      return {};
    }
  };

  const groupedUsers: Record<string, any> = {};
  signUpUsers.forEach((user) => {
    const k = user.userId || user.email || user.id;
    groupedUsers[k] = {
      key: k,
      email: user.email || "no-email@mapmates.ai",
      userId: user.userId || user.id,
      name: user.displayName || "Signed Up User",
      totalClicks: 0,
      rageClicks: 0,
      totalTimeSpent: 0,
      firstSeen: user.createdAt || null,
      lastSeen: user.createdAt || null,
      deviceInfo: "No session recorded yet",
      referrer: "Signed Up User",
      mostUsedFeatures: {},
      sessions: [],
    };
  });

  sessions.forEach((session) => {
    let key = session.userId && session.userId !== "guest" && groupedUsers[session.userId] ? session.userId : null;
    if (!key && session.userEmail && session.userEmail !== "guest@mapmates.ai" && session.userEmail !== "no-email@mapmates.ai") {
      const foundKey = Object.keys(groupedUsers).find(
        (chkKey) => groupedUsers[chkKey].email.toLowerCase() === session.userEmail.toLowerCase()
      );
      if (foundKey) key = foundKey;
    }

    if (!key) {
      key = (session.userId && session.userId !== "guest") ? session.userId : (session.userEmail || session.id);
      if (!groupedUsers[key]) {
        groupedUsers[key] = {
          key: key,
          email: session.userEmail || "guest@mapmates.ai",
          userId: session.userId || "guest",
          name: session.userName || "Anonymous Guest",
          totalClicks: 0,
          rageClicks: 0,
          totalTimeSpent: 0,
          firstSeen: session.timestamp,
          lastSeen: session.timestamp,
          deviceInfo: session.deviceInfo,
          referrer: session.referrer,
          mostUsedFeatures: {},
          sessions: [],
        };
      }
    }

    const u = groupedUsers[key];
    u.totalClicks += session.totalClicks;
    u.rageClicks += session.rageClicks;
    u.totalTimeSpent += session.timeSpentSeconds;
    u.sessions.push(session);

    if (session.deviceInfo && session.deviceInfo !== "Unknown Device" && u.deviceInfo === "No session recorded yet") {
      u.deviceInfo = session.deviceInfo;
    }
    if (session.referrer && session.referrer !== "Direct Link" && u.referrer === "Signed Up User") {
      u.referrer = session.referrer;
    }
    if (session.userName && session.userName !== "Anonymous Guest" && (u.name === "Signed Up User" || u.name === "Anonymous Guest")) {
      u.name = session.userName;
    }

    const feats = getParsedMap(session.mostUsedFeatures);
    Object.entries(feats).forEach(([feat, count]) => {
      u.mostUsedFeatures[feat] = (u.mostUsedFeatures[feat] || 0) + count;
    });

    const sTime = getTimestampMillis(session.timestamp);
    const firstTime = u.firstSeen ? getTimestampMillis(u.firstSeen) : sTime;
    const lastTime = u.lastSeen ? getTimestampMillis(u.lastSeen) : sTime;

    if (!u.firstSeen || sTime <= firstTime) u.firstSeen = session.timestamp;
    if (!u.lastSeen || sTime >= lastTime) u.lastSeen = session.timestamp;
  });

  const now = Date.now();
  const index24hAgo = now - 24 * 60 * 60 * 1000;
  const index48hAgo = now - 48 * 60 * 60 * 1000;

  const activeUsersTodayList = Object.values(groupedUsers).filter((u) => {
    const lastTime = getTimestampMillis(u.lastSeen);
    return lastTime >= index24hAgo;
  });
  const activeUsers24hCount = activeUsersTodayList.length;

  const activeUsersYesterdayCount = Object.values(groupedUsers).filter((u) => {
    const lastTime = getTimestampMillis(u.lastSeen);
    return lastTime >= index48hAgo && lastTime < index24hAgo;
  }).length;

  let activeImprovementPercent = 0;
  if (activeUsersYesterdayCount === 0) {
    activeImprovementPercent = activeUsers24hCount > 0 ? 100 : 0;
  } else {
    activeImprovementPercent = Math.round(((activeUsers24hCount - activeUsersYesterdayCount) / activeUsersYesterdayCount) * 100);
  }

  const powerUsersOver1h = Object.values(groupedUsers).filter((u) => u.totalTimeSpent >= 3600);

  const liveActiveUsersList = Object.values(groupedUsers).filter((u) => {
    const lastTime = getTimestampMillis(u.lastSeen);
    return (Date.now() - lastTime) <= 5 * 60 * 1000;
  });
  const liveActiveCount = liveActiveUsersList.length;

  const recentIdleUsersList = Object.values(groupedUsers).filter((u) => {
    const lastTime = getTimestampMillis(u.lastSeen);
    const diff = Date.now() - lastTime;
    return diff > 5 * 60 * 1000 && diff <= 30 * 60 * 1000;
  });

  const recentSignUpsCount = signUpUsers.filter((user) => {
    const created = getTimestampMillis(user.createdAt);
    return (Date.now() - created) <= 24 * 60 * 60 * 1000;
  }).length;

  const overallFeaturesCount: Record<string, number> = {};
  Object.values(groupedUsers).forEach((u) => {
    Object.entries(u.mostUsedFeatures).forEach(([feat, count]) => {
      overallFeaturesCount[feat] = (overallFeaturesCount[feat] || 0) + count;
    });
  });

  let globalTopFeature = "None";
  let globalTopCount = 0;
  Object.entries(overallFeaturesCount).forEach(([feat, count]) => {
    if (count > globalTopCount) {
      globalTopCount = count;
      globalTopFeature = feat;
    }
  });

  const dailySnapshots: Record<string, any> = {};
  sessions.forEach((s) => {
    const sTime = getTimestampMillis(s.timestamp);
    const dateStr = new Date(sTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    if (!dailySnapshots[dateStr]) {
      dailySnapshots[dateStr] = {
        dateStr, totalClicks: 0, rageClicks: 0, totalTimeSpent: 0, usersCount: 0,
        featureClicks: {}, mostUsedFeature: "None", mostUsedFeatureClicks: 0, percentageMap: {}
      };
    }
    const snap = dailySnapshots[dateStr];
    snap.totalClicks += s.totalClicks;
    snap.rageClicks += s.rageClicks;
    snap.totalTimeSpent += s.timeSpentSeconds;
    snap.usersCount += 1;
    const featsObj = getParsedMap(s.mostUsedFeatures);
    Object.entries(featsObj).forEach(([feat, count]) => {
      snap.featureClicks[feat] = (snap.featureClicks[feat] || 0) + count;
    });
  });

  Object.values(dailySnapshots).forEach((snap: any) => {
    let topFeat = "None", topCount = 0, totalFeatClicksSum = 0;
    Object.entries(snap.featureClicks).forEach(([feat, count]: any) => {
      totalFeatClicksSum += count;
      if (count > topCount) { topCount = count; topFeat = feat; }
    });
    snap.mostUsedFeature = topFeat;
    snap.mostUsedFeatureClicks = topCount;
    if (totalFeatClicksSum > 0) {
      Object.entries(snap.featureClicks).forEach(([feat, count]: any) => {
        snap.percentageMap[feat] = Math.round((count / totalFeatClicksSum) * 100);
      });
    }
  });

  const sortedDays = Object.values(dailySnapshots).sort((a: any, b: any) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  const selectedUserKey = selectedUserEmail || (Object.keys(groupedUsers).length > 0 ? Object.keys(groupedUsers)[0] : null);
  const selectedUser = selectedUserKey ? groupedUsers[selectedUserKey] : null;

  useEffect(() => {
    if (!selectedUser) { setSelectedUserChats([]); setSelectedUserFeedbacks([]); return; }
    setIsChildLoading(true);
    let unsubscribeChats = () => {};
    let unsubscribeFeedbacks = () => {};

    if (selectedUser.userId && selectedUser.userId !== "guest") {
      const chatsRef = collection(db, `users/${selectedUser.userId}/chats`);
      unsubscribeChats = onSnapshot(chatsRef, (chatsSnap) => {
        const chats: UserChatLog[] = [];
        chatsSnap.forEach((docSnap) => {
          const data = docSnap.data();
          chats.push({ question: data.question || "N/A", response: data.response || "N/A", timestamp: data.timestamp });
        });
        chats.sort((a, b) => getTimestampMillis(b.timestamp) - getTimestampMillis(a.timestamp));
        setSelectedUserChats(chats);
        setIsChildLoading(false);
      });
    } else {
      setSelectedUserChats([]);
      setIsChildLoading(false);
    }

    const feedbackRef = collection(db, "feedback");
    unsubscribeFeedbacks = onSnapshot(feedbackRef, (fbSnap) => {
      const fbList: UserFeedback[] = [];
      fbSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const matchesId = data.userId === selectedUser.userId;
        const matchesEmailOrName = (data.userEmail && data.userEmail.toLowerCase() === selectedUser.email.toLowerCase()) || 
                                     (data.userName && data.userName.toLowerCase() === selectedUser.name.toLowerCase());
        if (matchesId || matchesEmailOrName) {
          fbList.push({ id: docSnap.id, userId: data.userId || "N/A", userName: data.userName || "Anonymous Guest", userLocation: data.userLocation || "Unknown Location", text: data.text || "", timestamp: data.timestamp });
        }
      });
      fbList.sort((a, b) => getTimestampMillis(b.timestamp) - getTimestampMillis(a.timestamp));
      setSelectedUserFeedbacks(fbList);
    });

    return () => { unsubscribeChats(); unsubscribeFeedbacks(); };
  }, [selectedUserKey]);

  const handleDeleteUserTraces = async (userKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const uObj = groupedUsers[userKey];
    if (!uObj) return;
    if (!confirm(`Delete user ${uObj.name}?`)) return;
    try {
      setIsLoading(true);
      for (const s of uObj.sessions) { await deleteDoc(doc(db, "analytics", s.id)); }
      setSessions((prev) => prev.filter((s) => s.userEmail !== uObj.email && s.userId !== uObj.userId));
      if (selectedUserEmail === userKey) setSelectedUserEmail(null);
    } catch (err: any) { alert("Error: " + err.message); } finally { setIsLoading(false); }
  };

  const getFilteredUsersGroup = () => {
    let sourceList = Object.values(groupedUsers);
    if (activeFilterTab === "active24h") sourceList = activeUsersTodayList;
    else if (activeFilterTab === "over1h") sourceList = powerUsersOver1h;
    const filtered = sourceList.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered;
  };

  const formatTimeMinutesValue = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    if (hrs > 0) return `${hrs} hr ${mins} min ${remainingSecs}s`;
    if (mins > 0) return `${mins} min ${remainingSecs}s`;
    return `${remainingSecs} seconds`;
  };

  const getCustomDynamicAIReview = (user: any): string[] => {
    if (!user) return ["No user selected."];
    const insightsList = [];
    if (user.rageClicks > 0) insightsList.push(`⚠️ Rage clicks detected: ${user.rageClicks}`);
    if (user.totalTimeSpent > 180) insightsList.push(`⏰ High engagement: ${Math.floor(user.totalTimeSpent / 60)} mins`);
    return insightsList;
  };

  const filteredUsersList = getFilteredUsersGroup();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-white text-black font-sans flex flex-col overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 flex flex-col flex-1 min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-5 mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Admin Analytics</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchPrimaryData} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold border border-gray-300">Refresh</button>
            <button onClick={onClose} className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold">Close</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border border-gray-300 p-1.5 rounded-xl bg-gray-50 mb-7">
          <button onClick={() => setAdminSubTab("recent")} className={`flex-1 py-3 text-center rounded-lg text-xs font-black ${adminSubTab === "recent" ? "bg-black text-white" : "text-gray-600"}`}>RECENT</button>
          <button onClick={() => setAdminSubTab("past")} className={`flex-1 py-3 text-center rounded-lg text-xs font-black ${adminSubTab === "past" ? "bg-black text-white" : "text-gray-600"}`}>PAST TRENDS</button>
        </div>

        {adminSubTab === "recent" && (
          <div className="space-y-6">
            {/* Top Web Users */}
            <div className="bg-white p-4 rounded-xl border border-blue-200">
               <h3 className="text-xs font-black text-blue-900 uppercase mb-3">Top Web Users (Time Spent)</h3>
               <div className="space-y-2">
                 {[...Object.values(groupedUsers)].sort((a,b) => b.totalTimeSpent - a.totalTimeSpent).slice(0, 5).map(u => (
                   <div key={u.key} className="flex justify-between text-xs p-2 bg-blue-50/50 rounded">
                     <span>{u.name}</span>
                     <span className="font-mono">{formatTimeMinutesValue(u.totalTimeSpent)}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Ideas */}
            <div className="bg-white p-4 rounded-xl border border-yellow-200">
               <h3 className="text-xs font-black text-yellow-900 uppercase mb-3">User Ideas</h3>
               <div className="space-y-2 max-h-40 overflow-y-auto">
                 {allIdeas.map(idea => (
                   <div key={idea.id} className="p-2 bg-yellow-50/50 rounded text-xs border border-yellow-100">
                     <p className="font-bold">{idea.userName}</p>
                     <p className="text-gray-600">{idea.ideaText}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-xl bg-white"><span className="text-[10px] uppercase font-bold text-gray-500">Active (24H)</span><div className="text-2xl font-black">{activeUsers24hCount}</div></div>
              <div className="p-4 border rounded-xl bg-white"><span className="text-[10px] uppercase font-bold text-gray-500">Total Users</span><div className="text-2xl font-black">{signUpUsers.length}</div></div>
              <div className="p-4 border rounded-xl bg-white"><span className="text-[10px] uppercase font-bold text-gray-500">Growth (24H)</span><div className={`text-2xl font-black ${activeImprovementPercent >= 0 ? "text-green-600" : "text-red-500"}`}>{activeImprovementPercent}%</div></div>
              <div className="p-4 border rounded-xl bg-white"><span className="text-[10px] uppercase font-bold text-gray-500">Power Users</span><div className="text-2xl font-black">{powerUsersOver1h.length}</div></div>
            </div>

            {/* Live Users Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
               {/* User selection left list panel */}
               <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex flex-col flex-shrink-0">
                  <div className="mb-4">
                    <h2 className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 mb-2 font-mono">
                      <User className="w-4 h-4 text-black" />
                      Tracked Users ({getFilteredUsersGroup().length})
                    </h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {getFilteredUsersGroup().map((userObj) => {
                      const isSelected = userObj.key === selectedUserKey;
                      const lastActiveTime = getTimestampMillis(userObj.lastSeen);
                      const isUserOnline = (Date.now() - lastActiveTime) <= 5 * 1000 * 60;
                      
                      return (
                        <button 
                          key={userObj.key}
                          onClick={() => setSelectedUserEmail(userObj.key)}
                          className={"w-full p-2.5 border rounded-xl text-left transition-all " + (isSelected ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:border-gray-500")}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className={"w-1.5 h-1.5 rounded-full " + (isUserOnline ? "bg-green-500 animate-pulse" : "bg-gray-300")} />
                            <span className="text-[10px] font-black uppercase truncate">{userObj.name}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                             <span className="truncate max-w-[100px]">{userObj.email}</span>
                             <span className={isSelected ? "text-white font-bold" : "text-black font-bold"}>{userObj.totalClicks} clicks</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
               </div>
               
               <div className="lg:col-span-3 space-y-6">
                 {/* Online Now */}
                 <div className="p-4 border border-zinc-200 rounded-xl bg-white">
                    <h3 className="text-xs font-black uppercase mb-3 text-green-700">Live Active Online ({liveActiveCount})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {liveActiveUsersList.map(u => (
                        <div key={u.key} className="p-2 border rounded-lg text-xs bg-green-50/20 flex justify-between items-center border-green-100">
                          <span className="font-bold text-green-900">{u.name}</span>
                          <span className="text-[8px] px-1.2 py-0.5 bg-green-500 text-white rounded font-bold uppercase">Online</span>
                        </div>
                      ))}
                    </div>
                 </div>
                 
                 {/* User Details */}
                 <div className="p-5 border border-zinc-200 rounded-xl bg-white">
                    <h3 className="text-xs font-black uppercase mb-4 tracking-widest text-gray-500">Diagnostic Details</h3>
                    {selectedUser ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start border-b pb-4">
                          <div>
                            <h4 className="font-black text-lg tracking-tight uppercase">{selectedUser.name}</h4>
                            <p className="text-[10px] text-gray-500 font-mono">{selectedUser.email}</p>
                            <p className="text-[9px] text-gray-400 mt-1 max-w-sm truncate">{selectedUser.deviceInfo}</p>
                          </div>
                          <button onClick={() => handleDeleteUserTraces(selectedUser.key)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Total Time</span>
                              <div className="text-lg font-black">{formatTimeMinutesValue(selectedUser.totalTimeSpent)}</div>
                           </div>
                           <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Interaction</span>
                              <div className="text-lg font-black">{selectedUser.totalClicks} clicks</div>
                           </div>
                           <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
                              <span className="text-[9px] font-bold text-gray-400 uppercase">Frustration</span>
                              <div className={"text-lg font-black " + (selectedUser.rageClicks > 0 ? "text-red-500" : "")}>{selectedUser.rageClicks} rage</div>
                           </div>
                        </div>

                        {/* Features distribution */}
                        <div className="space-y-3">
                           <h5 className="text-[10px] font-black uppercase text-gray-500">Feature Engagement Map</h5>
                           {Object.entries(selectedUser.mostUsedFeatures).map(([feat, clicks]) => (
                             <div key={feat} className="space-y-1">
                               <div className="flex justify-between text-[10px] uppercase font-bold"><span>{feat}</span><span>{clicks}</span></div>
                               <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                 <div style={{ width: (clicks / (selectedUser.totalClicks || 1) * 100) + "%" }} className="h-full bg-black" />
                               </div>
                             </div>
                           ))}
                        </div>

                        {/* AI Summary */}
                        <div className="p-4 bg-zinc-950 text-white rounded-xl">
                          <h5 className="text-[10px] font-bold uppercase mb-3 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> AI Diagnostic Summary</h5>
                          <div className="space-y-2">
                             {getCustomDynamicAIReview(selectedUser).map((r, i) => (
                               <div key={i} className="text-xs border-l border-zinc-700 pl-3 leading-relaxed text-zinc-300">{r}</div>
                             ))}
                          </div>
                        </div>

                        {/* Recent Chats */}
                        {selectedUserChats.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Recent Direct Chats</h5>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                               {selectedUserChats.map((c, i) => (
                                 <div key={i} className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg text-xs space-y-1">
                                    <p className="font-bold">Q: {c.question}</p>
                                    <p className="text-gray-600">A: {c.response}</p>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}
                        {/* User Feedbacks */}
                        {selectedUserFeedbacks.length > 0 && (
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Feedback Form Submissions</h5>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                               {selectedUserFeedbacks.map((f) => (
                                 <div key={f.id} className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg text-xs space-y-1">
                                    <div className="flex justify-between text-[8px] font-mono text-gray-400">
                                       <span>{f.userLocation}</span>
                                       <span>{f.timestamp ? new Date(getTimestampMillis(f.timestamp)).toLocaleString() : ""}</span>
                                    </div>
                                    <p className="italic">"{f.text}"</p>
                                 </div>
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-300">
                        <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-xs font-mono">Bhai Jan Faizan! Select a user record from the sidebar.</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        )}

        {adminSubTab === "past" && (
           <div className="space-y-6">
              <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl">
                 <h2 className="text-xl font-black uppercase">Historical Snapshots</h2>
                 <p className="text-xs text-gray-500">Day-by-day feature distribution tracking.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {sortedDays.map((snap: any) => (
                  <div key={snap.dateStr} className="p-4 border rounded-xl bg-white space-y-3 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-sm font-black uppercase tracking-wide">{snap.dateStr}</span>
                       <span className="text-xs font-bold text-gray-500">{snap.totalClicks} clicks</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(snap.featureClicks).map(([feat, count]: any) => {
                        const pct = snap.percentageMap[feat] || 0;
                        return (
                          <div key={feat} className="text-xs space-y-1">
                            <div className="flex justify-between font-bold uppercase text-[10px]"><span>{feat}</span><span>{count} ({pct}%)</span></div>
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-100">
                              <div style={{ width: pct + "%" }} className="h-full bg-black rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        )}

        <div className="mt-auto pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] font-mono text-gray-400">
           <span>Total Sessions: {sessions.length}</span>
           <span>MapMates Admin Console</span>
        </div>
      </div>
    </div>
  );
}
