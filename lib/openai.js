import "server-only";
import OpenAI from "openai";

let openaiClient = null;

// -----------------------------
// SERVER CACHE (memory) + TTL
// -----------------------------
const briefCache = new Map(); // key -> { data, expiresAt }
const inflightBrief = new Map(); // key -> Promise
const TTL_MS = 1000 * 60 * 60 * 24; // 24h

function now() {
  return Date.now();
}

function getCached(key) {
  const v = briefCache.get(key);
  if (!v) return null;
  if (now() > v.expiresAt) {
    briefCache.delete(key);
    return null;
  }
  return v.data;
}

function setCached(key, data) {
  briefCache.set(key, { data, expiresAt: now() + TTL_MS });
}

function normalizeKey(part) {
  return String(part ?? "").trim().toLowerCase();
}

function makeBriefKey(placeName, country, lat, lng) {
  // keep stable, avoid too many keys from tiny coordinate changes
  const rLat = typeof lat === "number" ? lat.toFixed(3) : "";
  const rLng = typeof lng === "number" ? lng.toFixed(3) : "";
  return `brief|${normalizeKey(placeName)}|${normalizeKey(country)}|${rLat}|${rLng}`;
}

// -----------------------------
// OpenAI client
// -----------------------------
export function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// -----------------------------
// JSON extraction (safer)
// -----------------------------
function extractFirstJsonObject(text) {
  if (!text) throw new Error("Empty model output");

  const cleaned = String(text)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 1) direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 2) find first {...} block by scanning
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object found");

  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) {
      const candidate = cleaned.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        break;
      }
    }
  }

  // 3) last resort: last {...}
  const match = cleaned.match(/\{[\s\S]*\}$/);
  if (match) return JSON.parse(match[0]);

  throw new Error("Invalid JSON from model");
}

// minimal shape guard (keeps app stable)
function ensureBriefShape(obj, placeName, country) {
  const safe = (v, fallback) => (typeof v === "string" && v.trim() ? v : fallback);
  const arr = (v) => (Array.isArray(v) ? v.filter(Boolean).slice(0, 12) : []);
  const budget = obj?.budget_ranges && typeof obj.budget_ranges === "object" ? obj.budget_ranges : {};

  return {
    overview: safe(obj?.overview, `${placeName} in ${country} is a wonderful destination offering a blend of culture and local charm.`),
    best_time_to_visit: safe(obj?.best_time_to_visit, "Spring and fall are often ideal for weather and crowd levels."),
    safety_tips: arr(obj?.safety_tips).slice(0, 8),
    neighborhoods_to_stay: arr(obj?.neighborhoods_to_stay).slice(0, 8),
    things_to_do: arr(obj?.things_to_do).slice(0, 10),
    packing_list: arr(obj?.packing_list).slice(0, 15),
    budget_ranges: {
      low: safe(budget?.low, "$50–80 per day"),
      mid: safe(budget?.mid, "$100–150 per day"),
      high: safe(budget?.high, "$200+ per day"),
    },
    transport_tips: arr(obj?.transport_tips).slice(0, 8),
    cultural_tips: arr(obj?.cultural_tips).slice(0, 8),
    quick_faq: {
      visa: safe(obj?.quick_faq?.visa, "Verify official government sources for current requirements."),
      sim: safe(obj?.quick_faq?.sim, "Check airport kiosks and local carriers for best value."),
      plugs: safe(obj?.quick_faq?.plugs, "Check plug type/voltage and bring an adapter if needed."),
      airport_to_city: safe(obj?.quick_faq?.airport_to_city, "Compare train, shuttle, official taxi, or rideshare depending on arrival time."),
    },
  };
}

// -----------------------------
// BRIEF GENERATION (cached + deduped)
// -----------------------------
export async function generateTravelBrief(placeName, country, lat, lng) {
  const client = getOpenAIClient();
  if (!client) return getFallbackBrief(placeName, country);

  const key = makeBriefKey(placeName, country, lat, lng);

  // 1) cache hit
  const cached = getCached(key);
  if (cached) return cached;

  // 2) in-flight dedupe (avoid multiple OpenAI calls for same place)
  const inflight = inflightBrief.get(key);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly, knowledgeable travel expert specializing in solo female travel. " +
              "Provide practical, safety-conscious advice with a warm tone. " +
              "Avoid hyper-specific street-level danger claims. " +
              "Respond with valid JSON only (no markdown).",
          },
          {
            role: "user",
            content: `Generate a comprehensive travel brief for solo female travelers visiting ${placeName}, ${country} (coordinates: ${lat}, ${lng}). 
Return ONLY JSON in this schema:
{
  "overview": "2-3 sentences about the destination",
  "best_time_to_visit": "Best months and why",
  "safety_tips": ["tip1","tip2","tip3","tip4","tip5"],
  "neighborhoods_to_stay": ["area1 - why","area2 - why","area3 - why"],
  "things_to_do": ["activity1","activity2","activity3","activity4","activity5"],
  "packing_list": ["item1","item2","item3","item4","item5","portable door lock","personal alarm"],
  "budget_ranges": { "low": "$X-Y per day", "mid": "$X-Y per day", "high": "$X-Y per day" },
  "transport_tips": ["tip1","tip2","tip3"],
  "cultural_tips": ["tip1","tip2","tip3"],
  "quick_faq": {
    "visa": "...",
    "sim": "...",
    "plugs": "...",
    "airport_to_city": "..."
  }
}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const raw = response?.choices?.[0]?.message?.content || "";
      const parsed = extractFirstJsonObject(raw);
      const normalized = ensureBriefShape(parsed, placeName, country);

      setCached(key, normalized);
      return normalized;
    } catch (error) {
      console.error("OpenAI brief error:", error);
      const fallback = getFallbackBrief(placeName, country);
      setCached(key, fallback); // cache fallback too (prevents repeated fails)
      return fallback;
    } finally {
      inflightBrief.delete(key);
    }
  })();

  inflightBrief.set(key, promise);
  return promise;
}

// -----------------------------
// TRIP PLAN (optional: you can add caching later)
// -----------------------------
export async function generateTripPlan(input) {
  const client = getOpenAIClient();
  if (!client) return null;

  const { destination, dates, budget, style, companions, safetyPrefs, interests, visaConstraints } = input || {};

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are FeminTravel — a premium safety-first itinerary planner for women + friends. " +
            "Be specific and actionable. Avoid street-level danger claims. " +
            "Return VALID JSON only (no markdown).",
        },
        {
          role: "user",
          content: `Create a day-by-day travel itinerary.

Inputs:
- destination: ${destination || "unknown"}
- dates: ${dates || "flexible"}
- budget: ${budget || "mid"}
- style: ${style || "balanced"}
- companions: ${companions || "solo"}
- safety preferences: ${safetyPrefs || "general"}
- interests: ${interests || "mixed"}
- visa constraints: ${visaConstraints || "none"}

Return ONLY JSON in this schema:
{
  "summary": "1-2 sentence vibe summary",
  "days": [
    {
      "day": 1,
      "title": "Short day theme",
      "morning": ["..."],
      "afternoon": ["..."],
      "evening": ["..."],
      "food_notes": ["..."],
      "safety_notes": ["..."]
    }
  ],
  "safety_checklist": {
    "before_you_go": ["..."],
    "getting_around": ["..."],
    "night_safety": ["..."],
    "scams_common": ["..."],
    "emergency": ["..."]
  },
  "booking_intents": {
    "flights": "Short suggestion",
    "hotels": "What to look for",
    "tours": "Best tour types",
    "insurance": "Why + what coverage"
  }
}`,
        },
      ],
      temperature: 0.65,
      max_tokens: 1600,
    });

    const raw = response?.choices?.[0]?.message?.content || "";
    return extractFirstJsonObject(raw);
  } catch (error) {
    console.error("OpenAI plan error:", error);
    return null;
  }
}

// -----------------------------
// CHAT
// -----------------------------
export async function generateChatResponse(messages, destinationContext = null) {
  const client = getOpenAIClient();
  if (!client) {
    return "I'm unable to connect right now. Add your OPENAI_API_KEY in .env.local and try again.";
  }

  try {
    const systemMessage = destinationContext?.name
      ? `You are a friendly AI travel assistant for solo female travelers. You're helping with ${destinationContext.name}, ${destinationContext.country}. Be safety-conscious and encouraging. Keep responses concise.`
      : "You are a friendly AI travel assistant for solo female travelers. Help with destinations, safety, packing, budgets. Be safety-conscious and encouraging. Keep responses concise.";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemMessage }, ...(messages || [])],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response?.choices?.[0]?.message?.content || "Sorry—try again.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment!";
  }
}

// -----------------------------
// FALLBACK
// -----------------------------
function getFallbackBrief(placeName, country) {
  return {
    overview: `${placeName} in ${country} is a wonderful destination offering a blend of culture, history, and modern amenities.`,
    best_time_to_visit: "Spring and fall typically offer the best weather and fewer crowds.",
    safety_tips: [
      "Stay aware of your surroundings, especially at night",
      "Keep valuables secure and out of sight",
      "Share your itinerary with trusted contacts",
      "Use reputable transportation services",
      "Trust your instincts — if something feels off, leave",
    ],
    neighborhoods_to_stay: [
      "Central areas near main attractions — convenient and well-lit",
      "Tourist districts — familiar services and support",
      "Near public transport — reduce late-night walking",
    ],
    things_to_do: [
      "Explore local markets and food scenes",
      "Visit museums and cultural sites",
      "Join small-group walking tours",
      "Try local cuisine at recommended restaurants",
      "Enjoy parks and outdoor spaces",
    ],
    packing_list: [
      "Comfortable walking shoes",
      "Weather-appropriate layers",
      "Universal power adapter",
      "Small daypack",
      "First aid basics",
      "Portable door lock",
      "Personal safety alarm",
    ],
    budget_ranges: { low: "$50-80 per day", mid: "$100-150 per day", high: "$200+ per day" },
    transport_tips: ["Research local transport apps before arrival", "Consider day passes", "Keep offline maps downloaded"],
    cultural_tips: ["Learn a few basic phrases", "Research customs and dress codes", "Be respectful of traditions"],
    quick_faq: {
      visa: "Verify official government websites for current requirements",
      sim: "Local SIM cards are often available at airports and convenience stores",
      plugs: "Check plug type/voltage and bring adapters",
      airport_to_city: "Compare: train, shuttle, official taxi, or rideshare based on arrival time",
    },
  };
}
