"use client";

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Globe as GlobeIcon,
  MapPin,
  Shield,
  Luggage,
  DollarSign,
  HelpCircle,
  MessageCircle,
  Send,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import BookingCTAs from "../../components/BookingCTAs";

// -----------------------------
// 0) iOS SAFARI FIX (WebGPU enum polyfill)
// -----------------------------
function ensureWebGpuEnums() {
  if (typeof window === "undefined") return;

  window.GPUShaderStage ??= { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };
  window.GPUBufferUsage ??= {
    MAP_READ: 1,
    MAP_WRITE: 2,
    COPY_SRC: 4,
    COPY_DST: 8,
    INDEX: 16,
    VERTEX: 32,
    UNIFORM: 64,
    STORAGE: 128,
    INDIRECT: 256,
    QUERY_RESOLVE: 512,
  };
  window.GPUMapMode ??= { READ: 1, WRITE: 2 };
  window.GPUTextureUsage ??= {
    COPY_SRC: 1,
    COPY_DST: 2,
    TEXTURE_BINDING: 4,
    STORAGE_BINDING: 8,
    RENDER_ATTACHMENT: 16,
  };
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function fallbackBrief(placeName = "this place", country = "") {
  return {
    overview: `${placeName}${country ? `, ${country}` : ""} can be a great destination. Here are safe, practical ideas while we load your full brief.`,
    best_time_to_visit: "Generally: spring and fall are comfortable with fewer crowds (depends on the region).",
    safety_tips: [
      "Stick to well-lit areas at night and plan routes in advance.",
      "Use official taxis/rideshare and verify license/plate before entering.",
      "Keep valuables close; avoid displaying expensive items in crowded areas.",
      "Share your live location or itinerary with a trusted contact.",
      "Trust your instincts — if something feels off, leave.",
    ],
    neighborhoods_to_stay: [
      "Central areas near main attractions — convenient and lively",
      "Near transit hubs — fewer late walks",
      "Well-reviewed areas with good lighting and activity",
    ],
    things_to_do: [
      "Try a small-group walking tour",
      "Explore local markets",
      "Visit top museums/cultural sights",
      "Book a day trip with reviews",
      "Enjoy parks/scenic viewpoints",
    ],
    packing_list: [
      "Comfortable shoes",
      "Layers",
      "Portable charger",
      "Universal adapter",
      "Small crossbody bag",
      "Portable door lock",
      "Personal alarm",
    ],
    budget_ranges: { low: "$50–80/day", mid: "$100–160/day", high: "$220+/day" },
    transport_tips: ["Download offline maps", "Use day passes if available", "Avoid empty stations late; choose busier routes"],
    cultural_tips: ["Learn a few key phrases", "Check local dress norms for religious sites", "Be mindful of photos in sensitive areas"],
    quick_faq: {
      visa: "Visa rules change often — verify official government sources.",
      sim: "Airport kiosks or local carriers usually offer tourist eSIM/SIM.",
      plugs: "Check plug type + voltage and bring an adapter.",
      airport_to_city: "Compare: train, shuttle, official taxi, or rideshare based on time of arrival.",
    },
  };
}

// -----------------------------
// Featured destinations
// -----------------------------
const featuredDestinations = [
  { id: "1", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, slug: "tokyo" },
  { id: "2", name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, slug: "paris" },
  { id: "3", name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964, slug: "rome" },
  { id: "4", name: "Bali", country: "Indonesia", lat: -8.4095, lng: 115.1889, slug: "bali" },
  { id: "5", name: "Lisbon", country: "Portugal", lat: 38.7223, lng: -9.1393, slug: "lisbon" },
  { id: "6", name: "New York", country: "USA", lat: 40.7128, lng: -74.006, slug: "new-york" },
  { id: "7", name: "Barcelona", country: "Spain", lat: 41.3851, lng: 2.1734, slug: "barcelona" },
  { id: "8", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, slug: "sydney" },
  { id: "9", name: "Cape Town", country: "South Africa", lat: -33.9249, lng: 18.4241, slug: "cape-town" },
  { id: "10", name: "Reykjavik", country: "Iceland", lat: 64.1466, lng: -21.9426, slug: "reykjavik" },
];

// -----------------------------
// -----------------------------
// Chat Widget (FIXED: mobile sheet + desktop panel overlap)
// -----------------------------
function ChatWidget({ destinationContext, isMobile, panelOpen, panelHeightPx }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [vh, setVh] = useState(800);
  useEffect(() => {
    const upd = () => setVh(window.innerHeight || 800);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const quickSuggestions = ["Is it safe?", "What to pack?", "Budget tips?", "Best time?"];

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, destinationContext }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data?.response || "Sorry—try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Positioning: never block CTAs (mobile + desktop) ----
  const baseRight = 24; // px (matches right-6)
  const desktopPanelW = 420; // your desktop panel width (w-[420px])
  const dynamicRight = !isMobile && panelOpen ? desktopPanelW + baseRight : baseRight;

  let dynamicBottom = 24; // default "bottom-6"
  if (isMobile && panelOpen) {
    const raw = (panelHeightPx || 0) + 16; // above the sheet
    const maxBottom = vh - 180;
    dynamicBottom = clamp(raw, 16, maxBottom);
  }

  // Chat window should follow the bubble
  const chatWindowBottom = clamp(dynamicBottom + 72, 96, vh - 120);

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{ right: dynamicRight, bottom: dynamicBottom }}
        className="fixed z-[110] w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-400
        rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {isOpen && (
        <div
          style={{ right: dynamicRight, bottom: chatWindowBottom }}
          className="fixed z-[110] w-[calc(100vw-48px)] max-w-sm
          bg-white rounded-3xl shadow-2xl max-h-[60vh] flex flex-col overflow-hidden"
        >
          <div className="bg-gradient-to-r from-pink-300 to-purple-300 p-4">
            <h3 className="font-serif text-lg font-semibold">Travel Assistant</h3>
            <p className="text-sm text-gray-700">
              {destinationContext?.name ? `Helping with ${destinationContext.name}` : "Ask me anything!"}
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px] max-h-[280px] overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                <p className="text-sm">Ask about safety, packing, budgets, and best times to visit.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-pink-200 text-pink-900 rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-full border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center hover:bg-pink-500 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


// -----------------------------
// Panel + content
// -----------------------------
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
      <div className="h-20 bg-gray-200 rounded mt-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}

function TabContent({ tab, brief, destination }) {
  switch (tab) {
    case "overview":
      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">About {destination?.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{brief?.overview}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🌤️ Best Time to Visit</h3>
            <p className="text-gray-600 text-sm">{brief?.best_time_to_visit}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🏨 Where to Stay</h3>
            <ul className="space-y-2">
              {brief?.neighborhoods_to_stay?.map((n, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">✨ Things to Do</h3>
            <ul className="space-y-2">
              {brief?.things_to_do?.map((t, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 italic mt-4">
            ⚠️ General guidance. For entry/visa rules and advisories, verify official sources.
          </p>
        </div>
      );

    case "safety":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-pink-500" />
            Safety Tips
          </h3>
          <ul className="space-y-3">
            {brief?.safety_tips?.map((tip, i) => (
              <li key={i} className="text-sm text-gray-600 bg-pink-50 p-3 rounded-xl">
                {tip}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">🌍 Cultural Tips</h3>
            <ul className="space-y-2">
              {brief?.cultural_tips?.map((tip, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "packing":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Luggage className="w-5 h-5 text-pink-500" />
            Packing Checklist
          </h3>
          <ul className="grid grid-cols-1 gap-2">
            {brief?.packing_list?.map((item, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <input type="checkbox" className="w-4 h-4 accent-pink-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "budget":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-pink-500" />
            Budget Ranges (per day)
          </h3>

          <div className="grid gap-3">
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="font-medium text-green-800">💚 Budget</p>
              <p className="text-sm text-green-600">{brief?.budget_ranges?.low}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="font-medium text-blue-800">💙 Mid-range</p>
              <p className="text-sm text-blue-600">{brief?.budget_ranges?.mid}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <p className="font-medium text-purple-800">💜 Luxury</p>
              <p className="text-sm text-purple-600">{brief?.budget_ranges?.high}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">🚌 Getting Around</h3>
            <ul className="space-y-2">
              {brief?.transport_tips?.map((tip, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-pink-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

    case "faq":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-pink-500" />
            Quick FAQs
          </h3>

          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-medium text-sm">🛂 Visa & Entry</p>
              <p className="text-sm text-gray-600 mt-1">{brief?.quick_faq?.visa}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-medium text-sm">📱 SIM Card</p>
              <p className="text-sm text-gray-600 mt-1">{brief?.quick_faq?.sim}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-medium text-sm">🔌 Plugs & Power</p>
              <p className="text-sm text-gray-600 mt-1">{brief?.quick_faq?.plugs}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="font-medium text-sm">✈️ Airport to City</p>
              <p className="text-sm text-gray-600 mt-1">{brief?.quick_faq?.airport_to_city}</p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function DestinationPanel({ destination, brief, isLoading, onClose, isMobile, onHeightPxChange }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [vh, setVh] = useState(800);
  const [heightPx, setHeightPx] = useState(0);
  const draggingRef = useRef(false);
  const startY = useRef(0);
  const startH = useRef(0);

  useEffect(() => {
    const upd = () => setVh(window.innerHeight || 800);
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const snapPx = useMemo(() => [Math.round(vh * 0.4), Math.round(vh * 0.65), Math.round(vh * 0.9)], [vh]);

  useEffect(() => {
    if (isMobile) setHeightPx(snapPx[0]);
  }, [isMobile, snapPx]);

  useEffect(() => {
    if (!isMobile) return;
    onHeightPxChange?.(heightPx);
  }, [heightPx, isMobile, onHeightPxChange]);

  const tabs = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: GlobeIcon },
      { id: "safety", label: "Safety", icon: Shield },
      { id: "packing", label: "Packing", icon: Luggage },
      { id: "budget", label: "Budget", icon: DollarSign },
      { id: "faq", label: "FAQs", icon: HelpCircle },
    ],
    []
  );

  if (!isMobile) {
    return (
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-[90] overflow-hidden flex flex-col">
        <div className="relative bg-gradient-to-r from-pink-300 to-purple-300 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/50"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {isLoading ? (
            <div className="h-16 animate-pulse">
              <div className="h-6 bg-white/30 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/30 rounded w-1/2" />
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-bold text-white">{destination?.name}</h2>
              <p className="text-white/90">{destination?.country}</p>
            </>
          )}
        </div>

        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === tab.id ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          {isLoading ? <LoadingSkeleton /> : brief ? <TabContent tab={activeTab} brief={brief} destination={destination} /> : (
            <p className="text-gray-500 text-center py-8">Failed to load travel brief. Please try again.</p>
          )}
        </div>

        <div className="border-t p-4 bg-gray-50">
          <p className="text-xs text-gray-500 mb-3 text-center">Plan your trip</p>
          <BookingCTAs destination={destination} compact />
        </div>
      </div>
    );
  }

  const onHandlePointerDown = (e) => {
    draggingRef.current = true;
    startY.current = e.clientY;
    startH.current = heightPx;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onHandlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const delta = startY.current - e.clientY;
    const next = clamp(startH.current + delta, 240, snapPx[2]);
    setHeightPx(next);
  };

  const onHandlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const nearest = snapPx.reduce((best, v) => (Math.abs(v - heightPx) < Math.abs(best - heightPx) ? v : best), snapPx[0]);
    setHeightPx(nearest);
  };

  return (
    <div
      style={{ height: heightPx }}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[90]
      flex flex-col overflow-hidden transition-[height] duration-200 ease-out"
    >
      <div
        className="py-4"
        style={{ touchAction: "none" }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 right-4 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
        aria-label="Close panel"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="px-4 pb-3">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ) : (
          <>
            <h2 className="font-serif text-xl font-bold">{destination?.name}</h2>
            <p className="text-gray-500 text-sm">{destination?.country}</p>
          </>
        )}
      </div>

      <div className="flex border-b overflow-x-auto px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit px-3 py-2 text-xs font-medium transition-colors flex flex-col items-center gap-1 ${
              activeTab === tab.id ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-400"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        {isLoading ? <LoadingSkeleton /> : brief ? <TabContent tab={activeTab} brief={brief} destination={destination} /> : (
          <p className="text-gray-500 text-center py-4">Failed to load. Try again.</p>
        )}
      </div>

      <div className="border-t p-3 bg-gray-50" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
        <BookingCTAs destination={destination} compact />
      </div>
    </div>
  );
}

// -----------------------------
// Main content
// -----------------------------
function GlobePageContent() {
  const searchParams = useSearchParams();

  const containerRef = useRef(null);
  const globeRef = useRef(null);

  const [Globe, setGlobe] = useState(null);
  const [blocked, setBlocked] = useState(false);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const [showMarkers, setShowMarkers] = useState(true);
  const [tapAnywhere, setTapAnywhere] = useState(true);

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [brief, setBrief] = useState(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState(false);

  const [globeReady, setGlobeReady] = useState(false);

  // for ChatWidget positioning
  const [panelHeightPx, setPanelHeightPx] = useState(0);

  // cache for briefs: memory + localStorage
  const briefCacheRef = useRef(new Map());
  const inflightBriefRef = useRef(new Map());
  const briefAbortRef = useRef(null);

  // reverse geocode cache
  const geoCacheRef = useRef(new Map());
  const geoAbortRef = useRef(null);

  const TTL_MS = 1000 * 60 * 60 * 24;

  const getLs = (k) => {
    try {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const setLs = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  };

  const briefKey = (d) => {
    const name = normalize(d?.name);
    const country = normalize(d?.country);
    if (!name || name === "finding place…" || name === "finding place...") return null;
    return `brief:${name}|${country}`;
  };

  const geoKey = (lat, lng) => {
    const la = Math.round(lat * 100) / 100;
    const lo = Math.round(lng * 100) / 100;
    return `geo:${la}|${lo}`;
  };

  const getCachedBrief = (key) => {
    const mem = briefCacheRef.current.get(key);
    if (mem && Date.now() - mem.ts < TTL_MS) return mem.data;

    const ls = getLs(key);
    if (ls && Date.now() - ls.ts < TTL_MS) {
      briefCacheRef.current.set(key, ls);
      return ls.data;
    }
    return null;
  };

  const setCachedBrief = (key, data) => {
    const payload = { data, ts: Date.now() };
    briefCacheRef.current.set(key, payload);
    setLs(key, payload);
  };

  const getCachedGeo = (key) => {
    const mem = geoCacheRef.current.get(key);
    if (mem && Date.now() - mem.ts < TTL_MS) return mem.data;

    const ls = getLs(key);
    if (ls && Date.now() - ls.ts < TTL_MS) {
      geoCacheRef.current.set(key, ls);
      return ls.data;
    }
    return null;
  };

  const setCachedGeo = (key, data) => {
    const payload = { data, ts: Date.now() };
    geoCacheRef.current.set(key, payload);
    setLs(key, payload);
  };

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      const h = Math.floor(entry.contentRect.height);
      setViewport({ w, h });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!hasWebGL()) {
      setBlocked(true);
      return;
    }

    ensureWebGpuEnums();

    let mounted = true;
    import("react-globe.gl")
      .then((m) => {
        if (!mounted) return;
        setGlobe(() => m.default);
      })
      .catch(() => {
        if (!mounted) return;
        setBlocked(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const flyToLocation = useCallback((lat, lng, altitude = 1.5) => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat, lng, altitude }, 900);
  }, []);

  const trackEvent = useCallback((event_type, event_data) => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type, event_data }),
    }).catch(() => {});
  }, []);

  // Higher quality: set pixel ratio + optional controls tweaks
  const onGlobeReady = useCallback(() => {
    setGlobeReady(true);
    try {
      const renderer = globeRef.current?.renderer?.();
      if (renderer && typeof window !== "undefined") {
        const maxDpr = isMobile ? 1.5 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      }
      const controls = globeRef.current?.controls?.();
      if (controls) {
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
      }
    } catch {}
  }, [isMobile]);

  const rendererConfig = useMemo(
    () => ({
      antialias: true,
      alpha: true,
      powerPreference: isMobile ? "low-power" : "high-performance",
    }),
    [isMobile]
  );

  const loadBrief = useCallback(async (destination) => {
    if (!destination?.name) return;

    setIsLoadingBrief(true);
    setBrief((prev) => prev ?? fallbackBrief(destination?.name, destination?.country));

    const key = briefKey(destination);
    if (!key) {
      setIsLoadingBrief(false);
      return;
    }

    const cached = getCachedBrief(key);
    if (cached) {
      setBrief(cached);
      setIsLoadingBrief(false);
      return;
    }

    if (inflightBriefRef.current.has(key)) {
      try {
        const data = await inflightBriefRef.current.get(key);
        setBrief(data);
      } finally {
        setIsLoadingBrief(false);
      }
      return;
    }

    if (briefAbortRef.current) briefAbortRef.current.abort();
    const controller = new AbortController();
    briefAbortRef.current = controller;

    const p = (async () => {
      const response = await fetch("/api/ai/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          placeName: destination.name,
          country: destination.country,
          lat: destination.lat,
          lng: destination.lng,
        }),
      });

      if (!response.ok) throw new Error("brief failed");
      const data = await response.json();
      setCachedBrief(key, data);
      return data;
    })();

    inflightBriefRef.current.set(key, p);

    try {
      const data = await p;
      setBrief(data);
    } catch {
      // keep fallback
    } finally {
      inflightBriefRef.current.delete(key);
      setIsLoadingBrief(false);
    }
  }, []);

  const selectDestination = useCallback(
    (destination, { track = true } = {}) => {
      setSelectedDestination(destination);
      loadBrief(destination);
      if (track) trackEvent("destination_clicked", { name: destination?.name, country: destination?.country });
    },
    [loadBrief, trackEvent]
  );

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (!focus || !globeReady) return;

    const dest = featuredDestinations.find((d) => d.slug === focus);
    if (!dest) return;

    setTimeout(() => {
      flyToLocation(dest.lat, dest.lng);
      selectDestination(dest, { track: true });
    }, 350);
  }, [searchParams, globeReady, flyToLocation, selectDestination]);

  const handleMarkerClick = (point) => {
    flyToLocation(point.lat, point.lng);
    selectDestination(point, { track: true });
  };

  const handleGlobeClick = async ({ lat, lng }) => {
    if (!tapAnywhere) return;

    const placeholder = { id: "custom", name: "Finding place…", country: "", lat, lng, slug: "custom" };

    setSelectedDestination(placeholder);
    setBrief(fallbackBrief("this location", ""));
    setIsLoadingBrief(true);

    const gk = geoKey(lat, lng);
    const cachedGeo = getCachedGeo(gk);
    if (cachedGeo?.name) {
      const destination = {
        id: "custom",
        name: cachedGeo.name,
        country: cachedGeo.country || "Unknown",
        lat: cachedGeo.lat ?? lat,
        lng: cachedGeo.lng ?? lng,
        slug: "custom",
      };
      flyToLocation(destination.lat, destination.lng);
      selectDestination(destination, { track: true });
      return;
    }

    if (geoAbortRef.current) geoAbortRef.current.abort();
    const controller = new AbortController();
    geoAbortRef.current = controller;

    try {
      const response = await fetch("/api/geocode/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ lat, lng }),
      });

      let destination;
      if (response.ok) {
        const data = await response.json();
        const payload = {
          name: data?.name || `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
          country: data?.country || "Unknown",
          lat: data?.lat ?? lat,
          lng: data?.lng ?? lng,
        };
        setCachedGeo(gk, payload);
        destination = { id: "custom", ...payload, slug: "custom" };
      } else {
        destination = { id: "custom", name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`, country: "Unknown", lat, lng, slug: "custom" };
      }

      flyToLocation(destination.lat, destination.lng);
      selectDestination(destination, { track: true });
    } catch (e) {
      if (e?.name !== "AbortError") {
        const fallbackDest = { id: "custom", name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`, country: "Unknown", lat, lng, slug: "custom" };
        flyToLocation(lat, lng);
        selectDestination(fallbackDest, { track: true });
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch("/api/geocode/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) throw new Error("search failed");
      const data = await response.json();

      const destination = {
        id: "search",
        name: data?.name || searchQuery,
        country: data?.country || "",
        lat: data?.lat,
        lng: data?.lng,
        slug: "search",
      };

      flyToLocation(destination.lat, destination.lng);
      selectDestination(destination, { track: true });
      setSearchQuery("");
    } catch (e2) {
      console.error("Search failed:", e2);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#0a0a1a]">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 pointer-events-none">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center
                       hover:bg-white/20 transition-colors pointer-events-auto"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md pointer-events-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city or country..."
                className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-md text-white placeholder-gray-400
                           rounded-full border border-white/20 focus:border-pink-400 focus:outline-none"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </form>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setTapAnywhere((v) => !v)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors pointer-events-auto ${
              tapAnywhere ? "bg-pink-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1" />
            Tap Anywhere {tapAnywhere ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setShowMarkers((v) => !v)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors pointer-events-auto ${
              showMarkers ? "bg-purple-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            Featured Markers {showMarkers ? "ON" : "OFF"}
          </button>
        </div>

        {tapAnywhere && (
          <p className="text-white/60 text-sm mt-2 bg-black/30 backdrop-blur-sm inline-block px-3 py-1 rounded-full">
            👆 Tap anywhere on the globe to explore
          </p>
        )}
      </div>

      {/* Globe */}
      <div className="absolute inset-0">
        {blocked ? (
          <div className="w-full h-full flex items-center justify-center text-center text-white px-6">
            <div className="max-w-md">
              <div className="font-serif text-2xl mb-2">Globe preview</div>
              <p className="text-white/70">Your browser blocks 3D rendering. Try Chrome or desktop for the interactive globe.</p>
            </div>
          </div>
        ) : !Globe || viewport.w === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Loading Globe…</p>
            </div>
          </div>
        ) : (
          <Globe
            ref={globeRef}
            onGlobeReady={onGlobeReady}
            width={viewport.w}
            height={viewport.h}
            rendererConfig={rendererConfig}
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
            atmosphereColor="rgba(255, 182, 193, 0.30)"
            atmosphereAltitude={0.25}
            pointsData={showMarkers ? featuredDestinations : []}
            pointLat={(d) => d.lat}
            pointLng={(d) => d.lng}
            pointColor={() => "#ff69b4"}
            pointAltitude={0.02}
            pointRadius={0.45}
            pointsMerge={false}
            onPointClick={handleMarkerClick}
            onGlobeClick={handleGlobeClick}
            enablePointerInteraction={true}
          />
        )}
      </div>

      {/* Panel */}
      {selectedDestination && (
       <DestinationPanel
         destination={selectedDestination}
          brief={brief}
           isLoading={isLoadingBrief}
            onClose={() => {
              setSelectedDestination(null);
              setBrief(null);
              setPanelHeightPx(0);
         }}
        isMobile={isMobile}
        onHeightPxChange={setPanelHeightPx}
/>

      )}

    <ChatWidget
      destinationContext={selectedDestination}
      isMobile={isMobile}
      panelOpen={!!selectedDestination}
      panelHeightPx={panelHeightPx}
     />  
    </div>
  );
}

export default function GlobePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading Globe…</p>
          </div>
        </div>
      }
    >
      <GlobePageContent />
    </Suspense>
  );
}
