import { useEffect, useRef, useState } from "react";
import { Navigation, Loader2, ExternalLink } from "lucide-react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { auth, hubDb } from "../lib/firebase";

interface Option {
  id: number;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  distance: string;
}

interface ChatMapProps {
  userLat?: number;
  userLng?: number;
  options: Option[];
  activeOptionId?: number;
  onMapClick?: (lat: number, lng: number) => void;
}

// Global script load states to prevent double injections
let leafletStylesLoaded = false;
let leafletScriptLoaded = false;

export default function ChatMap({ userLat, userLng, options, activeOptionId, onMapClick }: ChatMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLineRef = useRef<any>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [mapMode, setMapMode] = useState<"satellite" | "roadmap">("satellite");
  const [selectedDestId, setSelectedDestId] = useState<number | null>(activeOptionId || (options.length > 0 ? options[0].id : null));
  const [routeInfo, setRouteInfo] = useState<{ durationMin: number; distanceKm: number } | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [hubUsers, setHubUsers] = useState<any[]>([]);

  // Fetch registered active mapmateshub users to overlay near tactical routes
  useEffect(() => {
    let active = true;
    const fetchHubUsers = async () => {
      try {
        const usersSnapshot = await getDocs(query(collection(hubDb, "users"), limit(45)));
        const list: any[] = [];
        usersSnapshot.forEach((docSnap) => {
          const udata = docSnap.data();
          if (udata && udata.userId !== auth.currentUser?.uid) {
            list.push({
              userId: udata.userId || docSnap.id,
              username: udata.username || udata.displayName || "MapMates Mate",
              email: udata.email || "",
              location: udata.location || null,
              status: udata.status || udata.vibe || "Active",
              isOnline: udata.isOnline !== undefined ? udata.isOnline : true
            });
          }
        });
        if (active) {
          setHubUsers(list);
        }
      } catch (err) {
        console.error("Error fetching hub users in ChatMap:", err);
      }
    };
    fetchHubUsers();
    return () => {
      active = false;
    };
  }, []);

  // Sync selected destination when options or activeOptionId updates
  useEffect(() => {
    if (activeOptionId) {
      setSelectedDestId(activeOptionId);
    } else if (options.length > 0) {
      setSelectedDestId(options[0].id);
    } else {
      setSelectedDestId(null);
    }
  }, [options, activeOptionId]);

  // Default coordinate: Baghbanpura, Lahore fallback (to align perfectly with user's micro-location)
  const defaultLat = 31.5715;
  const defaultLng = 74.3820;
  let curLat = userLat && !isNaN(userLat) ? userLat : defaultLat;
  let curLng = userLng && !isNaN(userLng) ? userLng : defaultLng;

  // If coordinates match old generic default Lahore, bias them to Baghbanpura, Lahore
  if (Math.abs(curLat - 31.5204) < 0.001 && Math.abs(curLng - 74.3587) < 0.001) {
    curLat = 31.5715;
    curLng = 74.3820;
  }

  // Load Leaflet libraries dynamically from CDN
  useEffect(() => {
    let active = true;

    const loadLeaflet = async () => {
      // 1. Inject Leaflet CSS
      if (!leafletStylesLoaded) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        leafletStylesLoaded = true;
      }

      // 2. Inject Leaflet JS
      if (!leafletScriptLoaded) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          if (active) setIsReady(true);
        };
        document.body.appendChild(script);
        leafletScriptLoaded = true;
      } else {
        // Wait minor check tick in case it's in progress
        const checkInterval = setInterval(() => {
          if ((window as any).L) {
            clearInterval(checkInterval);
            if (active) setIsReady(true);
          }
        }, 100);
      }
    };

    if ((window as any).L) {
      setIsReady(true);
    } else {
      loadLeaflet();
    }

    return () => {
      active = false;
    };
  }, []);

  // Map Initialization
  useEffect(() => {
    if (!isReady || !mapContainerRef.current) return;

    // Destroy old instance if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = (window as any).L;
    if (!L) return;

    // Create custom Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([curLat, curLng], 14);

    mapInstanceRef.current = map;

    // Attach click listener callback for safe route markers
    map.on("click", (e: any) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Add Attribution/Zoom minimally in bottom corner
    L.control.zoom({ position: "bottomright" }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isReady]);

  // Handle Layer switching, Markers and Routing
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    if (!map || !L) return;

    // 1. Set Tile Layers based on MapMode
    map.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapMode === "satellite") {
      // Esri Satellite imagery
      const esriSatellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19
      });
      // Label annotation overlay
      const labels = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png", {
        maxZoom: 20
      });
      esriSatellite.addTo(map);
      labels.addTo(map);
    } else {
      // Standard OSM Roadmap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);
    }

    // 2. Refresh markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    // Setup Custom Marker Symbols
    const userIcon = L.divIcon({
      className: 'user-pulse-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-5 w-5 rounded-full bg-[#00f2ff]/30 animate-ping"></span>
          <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00f2ff] border-2 border-white shadow-lg"></span>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Option marker factory function
    const createOptionIcon = (index: number, isActive: boolean) => {
      const colorClass = isActive ? "bg-[#facc15] border-[#00f2ff]" : "bg-black border-[#facc15]";
      const textClass = isActive ? "text-black" : "text-[#facc15]";
      return L.divIcon({
        className: `custom-poi-marker-${index}`,
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-lg ${colorClass} border-2 flex items-center justify-center font-black text-[11px] ${textClass} hover:scale-115 transition-transform shadow-[0_0_10px_rgba(250,204,21,0.4)]">
              ${index}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    };

    // Add User position marker
    const userMarker = L.marker([curLat, curLng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup(`<strong style="font-family: monospace;">Aapka Coordinate Area Context</strong><br/>Lat: ${curLat.toFixed(4)}, Lng: ${curLng.toFixed(4)}`);
    markersRef.current.push(userMarker);

    // Add options markers
    options.forEach((opt) => {
      const isSelected = opt.id === selectedDestId;
      const optMarker = L.marker([opt.lat, opt.lng], {
        icon: createOptionIcon(opt.id, isSelected)
      }).addTo(map);
      
      const popupContent = `
        <div style="font-family: sans-serif; padding: 2px;">
          <h5 style="margin: 0; font-weight: 800; color: #000; font-size: 11px; text-transform: uppercase;">Option ${opt.id}: ${opt.name}</h5>
          <p style="margin: 3px 0 0; font-size: 10px; color: #444; line-height: 1.2;">${opt.desc}</p>
          <strong style="font-size: 9px; color: #10b981; display: block; margin-top: 3.5px;">Fasla: ${opt.distance}</strong>
        </div>
      `;
      optMarker.bindPopup(popupContent);
      markersRef.current.push(optMarker);
    });

    // 3. Clear existing Route Polyline
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    // 4. Draw route if we have a selected destination option
    const activeDest = options.find((opt) => opt.id === selectedDestId);
    const isSameCoords = activeDest && Math.abs(activeDest.lat - curLat) < 0.0001 && Math.abs(activeDest.lng - curLng) < 0.0001;
    
    if (activeDest && !isSameCoords) {
      setIsRouteLoading(true);
      
      const osmDeUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${curLng},${curLat};${activeDest.lng},${activeDest.lat}?overview=full&geometries=geojson`;
      const fallbackOsrmUrl = `https://router.projectosrm.org/route/v1/driving/${curLng},${curLat};${activeDest.lng},${activeDest.lat}?overview=full&geometries=geojson`;

      // Helper to try alternate URLs sequentially
      const fetchRoute = async () => {
        try {
          const res = await fetch(osmDeUrl);
          if (!res.ok) throw new Error("OSM DE fail");
          return await res.json();
        } catch (e) {
          console.warn("Primary OSM DE router failed, trying backup Project OSRM server...", e);
          const res = await fetch(fallbackOsrmUrl);
          if (!res.ok) throw new Error("OSRM backup router failed");
          return await res.json();
        }
      };

      fetchRoute()
        .then((data) => {
          if (data && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates; // Array of [lng, lat]
            
            // Map to LatLng for Leaflet
            const latLngs = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

            // Create Polyline geometry matching streets
            const polyline = L.polyline(latLngs, {
              color: "#00f2ff",
              weight: 5.5,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
              className: "laser-route"
            }).addTo(map);

            routeLineRef.current = polyline;

            // Save travel time info
            const durationMin = Math.round(route.duration / 60);
            const distanceKm = Number((route.distance / 1000).toFixed(1));
            setRouteInfo({ durationMin, distanceKm });

            // Fit map viewport beautifully around the curved route path itself
            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

            // Plot nearby MapMatesHub users along the calculated route path
            drawNearbyHubUsers(L, map, latLngs);
          } else {
            // Straight-line path fallback
            drawFallbackLine(L, map, curLat, curLng, activeDest);
          }
        })
        .catch((err) => {
          console.warn("All route engines failed, falling back to direct alignment line:", err);
          drawFallbackLine(L, map, curLat, curLng, activeDest);
        })
        .finally(() => {
          setIsRouteLoading(false);
        });
    } else {
      setRouteInfo(null);
      // If no option chosen or same coordinates, center elegantly
      if (options.length > 0) {
        if (options.length === 1) {
          map.setView([curLat, curLng], 15);
        } else {
          const bounds = L.latLngBounds([[curLat, curLng]]);
          options.forEach(opt => bounds.extend([opt.lat, opt.lng]));
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      }
    }

  }, [isReady, mapMode, selectedDestId, userLat, userLng, options, hubUsers]);

  // Haversine formula to find distance between coordinates in km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Helper to draw MapMatesHub users that are located near the route path
  const drawNearbyHubUsers = (L: any, map: any, pathCoordinates: any[]) => {
    if (!hubUsers || hubUsers.length === 0) return;

    // Define custom icon for MapMatesHub users
    const mateIcon = L.divIcon({
      className: "mate-pulse-marker",
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-5 w-5 rounded-full bg-emerald-400/35 animate-ping"></span>
          <div class="relative w-5.5 h-5.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)] hover:scale-125 transition-transform cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="w-3.5 h-3.5 text-white">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    hubUsers.forEach((user) => {
      if (!user.location) return;
      const uLat = typeof user.location.lat === "string" ? parseFloat(user.location.lat) : user.location.lat;
      const uLng = typeof user.location.lng === "string" ? parseFloat(user.location.lng) : user.location.lng;

      if (isNaN(uLat) || isNaN(uLng)) return;

      // Check if this user is near the route path (within 1.2km of any path point or route nodes)
      const isNear = pathCoordinates.some((pt) => {
        const dist = getDistanceKm(uLat, uLng, pt[0], pt[1]);
        return dist <= 1.2;
      });

      if (isNear) {
        const marker = L.marker([uLat, uLng], { icon: mateIcon }).addTo(map);
        
        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; text-align: center; max-width: 170px;">
            <strong style="color: #10b981; font-size: 10.5px; display: block; margin-bottom: 2px; text-transform: uppercase; font-family: monospace;">🟢 ACTIVE MEMBER</strong>
            <span style="font-size: 10px; font-weight: 800; color: #000; display: block; margin-bottom: 4px;">\${user.username}</span>
            <p style="margin: 4px 0; font-size: 9.5px; color: #444; line-height: 1.35; font-family: sans-serif;">
              "Pyare dost, is user se connect karne ke liye aur live safe circle coordinate karne ke liye, please <strong>MapMatesHub</strong> par jao!"
            </p>
            <a href="https://mapmateshub.netlify.app" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #10b981; color: white; border-radius: 4px; padding: 4px 8px; font-size: 9px; font-weight: 850; text-decoration: none; text-transform: uppercase; margin-top: 5px; box-shadow: 0 2px 4px rgba(16,185,129,0.25);">
              Open MapMatesHub 🚀
            </a>
          </div>
        `;
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      }
    });
  };

  // Fallback direct path builder
  const drawFallbackLine = (L: any, map: any, uLat: number, uLng: number, dest: Option) => {
    const latLngs = [
      [uLat, uLng],
      [dest.lat, dest.lng]
    ];
    const polyline = L.polyline(latLngs, {
      color: "#facc15",
      weight: 4,
      dashArray: "6, 6",
      opacity: 0.85
    }).addTo(map);

    routeLineRef.current = polyline;

    // Direct geometric estimation
    const distanceEstimateKm = Math.sqrt(
      Math.pow((dest.lat - uLat) * 111, 2) + Math.pow((dest.lng - uLng) * 111 * Math.cos(uLat * Math.PI / 180), 2)
    );
    // Rough estimate travel duration based on direct km
    const estDuration = Math.round(distanceEstimateKm * 2.5 + 2);

    setRouteInfo({
      durationMin: estDuration,
      distanceKm: Number(distanceEstimateKm.toFixed(1))
    });

    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [40, 40] });

    // Draw MapMatesHub users near this fallback direct path
    drawNearbyHubUsers(L, map, latLngs);
  };

  const activeDest = options.find((opt) => opt.id === selectedDestId);

  const getMapMatesUrl = () => {
    const baseUrl = "https://mapmateshub.netlify.app";
    if (!activeDest) return baseUrl;
    const params = new URLSearchParams();
    params.set("utm_source", "mapmatesai");
    params.set("action", "route");
    params.set("destination", activeDest.name);
    params.set("lat", String(activeDest.lat));
    params.set("lng", String(activeDest.lng));
    return `${baseUrl}/?${params.toString()}`;
  };

  return (
    <div className="mt-4 flex flex-col rounded-xl overflow-hidden bg-[#050516] border border-[#00f2ff]/20">
      {/* Map Control Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/50 border-b border-[#00f2ff]/15">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#00f2ff]" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-white/90">
            TACTICAL ROUTING COMPASS
          </span>
        </div>
        
        {/* Sat / Roadmap Toggles */}
        <div className="flex bg-white/5 border border-white/10 rounded overflow-hidden">
          <button
            onClick={() => setMapMode("satellite")}
            className={`px-2 py-1 text-[9px] font-bold font-mono tracking-wider transition-all uppercase ${
              mapMode === "satellite" 
                ? "bg-[#00f2ff] text-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapMode("roadmap")}
            className={`px-2 py-1 text-[9px] font-bold font-mono tracking-wider transition-all uppercase ${
              mapMode === "roadmap" 
                ? "bg-[#00f2ff] text-black" 
                : "text-white/60 hover:text-white"
            }`}
          >
            Roadmap
          </button>
        </div>
      </div>

      {/* Actual Map Area */}
      <div className="relative w-full h-[220px] md:h-[260px] bg-[#02020a]">
        {!isReady && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 gap-2">
            <Loader2 className="w-6 h-6 text-[#00f2ff] animate-spin" />
            <span className="text-[10px] font-mono tracking-widest text-[#00f2ff] uppercase">
              Booting Satellite Coordinates...
            </span>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" style={{ outline: "none" }} />

        {/* Floating selected metadata summary card inside map */}
        {routeInfo && activeDest && (
          <div className="absolute top-2.5 left-2.5 z-[400] max-w-[210px] bg-black/85 backdrop-blur border border-[#00f2ff]/30 p-2 rounded-lg text-left shadow-lg">
            <span className="text-[7.5px] font-mono text-[#00f2ff] uppercase tracking-wide block">
              Active Target Route:
            </span>
            <span className="text-[10px] font-extrabold text-white uppercase tracking-tight block truncate mt-0.5">
              {activeDest.name}
            </span>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5 border-t border-white/5 pt-1">
              <div>
                <span className="text-[7px] text-white/40 uppercase font-mono block">Travel Time</span>
                <span className="text-[11px] font-black text-emerald-400 mt-0.5 block">
                  ~ {routeInfo.durationMin} mins
                </span>
              </div>
              <div>
                <span className="text-[7px] text-white/40 uppercase font-mono block">Distance</span>
                <span className="text-[11px] font-black text-white mt-0.5 block">
                  {routeInfo.distanceKm} km
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Destination Option Tabs Picker bottom footer */}
      {options.length > 0 && (
        <div className="p-2.5 bg-black/40 border-t border-white/5 flex flex-col gap-2">
          <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedDestId(opt.id)}
                className={`py-1.5 px-3 rounded-md text-[10px] font-extrabold uppercase tracking-wide flex-shrink-0 transition-all flex items-center gap-1.5 ${
                  selectedDestId === opt.id
                    ? "bg-[#facc15] text-black border border-[#facc15]"
                    : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-black text-[8px] ${
                  selectedDestId === opt.id ? "bg-black text-[#facc15]" : "bg-[#facc15] text-black"
                }`}>
                  {opt.id}
                </span>
                {opt.name.split(',')[0].slice(0, 15)}
              </button>
            ))}
          </div>
          
          {/* Quick confirmation description panel of currently selected tab */}
          {activeDest && (
            <div className="px-1 text-left">
              <span className="text-[8px] font-mono text-white/40 block leading-tight uppercase">
                DETAILS Option {activeDest.id}:
              </span>
              <p className="text-[10px] text-white/60 leading-tight mt-0.5">
                {activeDest.desc} · <span className="text-[#00f2ff] font-bold font-mono">{activeDest.distance} dur</span>
              </p>
            </div>
          )}

          {activeDest && (
            <a
              href={getMapMatesUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 py-2 w-full bg-[#00f2ff] hover:brightness-110 text-black font-black text-[9.5px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,242,255,0.25)] select-none"
            >
              Open Route on MapMatesHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Styled custom CSS inlining inside react */}
      <style>{`
        .user-pulse-marker, .mate-pulse-marker {
          background: transparent !important;
          border: none !important;
        }
        .laser-route {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: laserRouteAnim 2.5s linear forwards;
          filter: drop-shadow(0px 0px 4px rgba(0, 242, 255, 0.6));
        }
        @keyframes laserRouteAnim {
          to {
            stroke-dashoffset: 0;
          }
        }
        /* Increased Map Contrast and Clarity */
        .leaflet-container {
          filter: contrast(1.15) brightness(1.05) saturate(1.3) hue-rotate(-5deg);
        }
        .leaflet-tile {
          filter: contrast(1.05) saturate(1.1);
        }
      `}</style>
    </div>
  );
}
