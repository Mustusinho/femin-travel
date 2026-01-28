"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import Globe3D from "./Globe3D";

export default function GlobeHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-pink-200/50 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-200/60 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-5 pt-10 pb-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white/60 backdrop-blur">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-xs text-gray-700">
                Safety-first planning for women + friends
              </span>
            </div>

            <h1 className="font-serif text-4xl leading-tight text-gray-900">
              Explore the world{" "}
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                safely & confidently
              </span>
            </h1>

            <p className="text-gray-600 text-lg">
              Tap the globe, get a smart travel brief, then plan your trip with safety tips + booking links.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/globe" className="btn-primary inline-flex items-center justify-center gap-2">
                Explore the Globe <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="#kit" className="btn-secondary inline-flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Get Free Travel Kit
              </Link>
            </div>

            <p className="text-xs text-gray-500">
              No fear-mongering — just practical, respectful safety guidance.
            </p>
          </div>

          {/* Globe glass frame */}
          <div className="relative">
            <div
              className="relative w-full max-w-[560px] mx-auto aspect-square rounded-[44px] overflow-hidden
                         bg-white/20 backdrop-blur-2xl border border-white/40 shadow-2xl"
            >
              {/* inner highlights */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/30 blur-2xl rounded-full" />
                <div className="absolute bottom-0 right-0 w-56 h-56 bg-pink-200/20 blur-2xl rounded-full" />
              </div>

              <Globe3D
                className="w-full h-full"
                // keep textures light here; your /globe page can use higher quality
                globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
                atmosphereColor="rgba(255, 182, 193, 0.28)"
                atmosphereAltitude={0.24}
                rendererConfig={{ antialias: true, alpha: true, powerPreference: "low-power" }}
              />
            </div>

            <div className="mt-3 text-center text-xs text-gray-500">
              Tip: Open the globe page and tap anywhere 🌍
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
