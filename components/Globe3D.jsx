"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// This wrapper prevents iOS Safari from crashing by polyfilling WebGPU enums
// BEFORE react-globe.gl/globe.gl code runs (they reference GPUShaderStage.*).
function ensureWebGpuEnums() {
  if (typeof window === "undefined") return;

  // minimal enum polyfills (safe; does NOT enable WebGPU, just prevents reference crash)
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

// WebGL check (if WebGL missing, show fallback)
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function Globe3D({
  className = "",
  loadingClassName = "",
  fallback = null,
  ...props
}) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState(0);
  const [Globe, setGlobe] = useState(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!wrapRef.current) return;

    // ResizeObserver prevents clientWidth null crashes
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      setSize(w);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If no WebGL, skip loading globe
    if (!hasWebGL()) {
      setBlocked(true);
      return;
    }

    // Prevent iOS Safari crash
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

  const Fallback = useMemo(() => {
    if (fallback) return fallback;
    return (
      <div className="w-full aspect-square rounded-[32px] bg-white/40 border border-white/50 backdrop-blur flex items-center justify-center text-center p-6">
        <div>
          <div className="font-serif text-lg text-gray-900">Globe preview</div>
          <p className="text-sm text-gray-600 mt-2">
            Your browser is blocking 3D rendering. Try opening in Chrome or desktop.
          </p>
        </div>
      </div>
    );
  }, [fallback]);

  return (
    <div ref={wrapRef} className={className}>
      {blocked ? (
        Fallback
      ) : Globe && size > 0 ? (
        <Globe width={size} height={size} {...props} />
      ) : (
        <div
          className={
            loadingClassName ||
            "w-full aspect-square rounded-[32px] bg-white/30 border border-white/40 backdrop-blur flex items-center justify-center"
          }
        >
          <div className="w-10 h-10 border-4 border-pink-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
