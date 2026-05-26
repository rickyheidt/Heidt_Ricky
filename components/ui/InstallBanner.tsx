"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, Plus } from "lucide-react";

// Detects iOS Safari (where Add to Home Screen is available)
function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // Safari has no "Chrome" or "CriOS" in its UA on iOS
  const isSafari = /safari/i.test(ua) && !/crios|fxios|opios|chrome/i.test(ua);
  return isIos && isSafari;
}

// Detects if the app is already running in standalone mode (already installed)
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

const DISMISSED_KEY = "skinz-install-dismissed";

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, not already installed, not already dismissed
    const shouldShow =
      isIosSafari() &&
      !isStandalone() &&
      !sessionStorage.getItem(DISMISSED_KEY);

    if (shouldShow) {
      // Small delay so the app can load first
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[430px] px-4 pb-6"
        >
          <div className="bg-ink rounded-2xl p-4 shadow-xl">
            {/* Header row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* App icon preview */}
                <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl" style={{ fontFamily: "serif" }}>
                    S
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Add SKINZ to your Home Screen</p>
                  <p className="text-white/50 text-xs mt-0.5">Play faster, like a real app</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/40 hover:text-white/80 transition-colors p-1 -mr-1 -mt-1"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-2.5">
              <Step number={1} icon={<Share size={14} />}>
                Tap the <strong className="text-white">Share</strong> button in Safari&apos;s toolbar
              </Step>
              <Step number={2} icon={<Plus size={14} />}>
                Tap <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>
              </Step>
              <Step number={3}>
                Tap <strong className="text-white">Add</strong> — done! ⛳
              </Step>
            </div>

            {/* Pointer arrow to bottom bar */}
            <div className="flex justify-center mt-3">
              <div className="flex items-center gap-1 text-white/30 text-xs">
                <span>↓</span>
                <span>Share button is in the bottom bar</span>
                <span>↓</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Step({
  number,
  icon,
  children,
}: {
  number: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon ? (
          <span className="text-white">{icon}</span>
        ) : (
          <span className="text-white text-xs font-bold">{number}</span>
        )}
      </div>
      <p className="text-white/70 text-sm leading-snug">{children}</p>
    </div>
  );
}
