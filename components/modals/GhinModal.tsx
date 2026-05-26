"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface GhinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = "idle" | "loading" | "success" | "no_token" | "manual";

export default function GhinModal({ isOpen, onClose }: GhinModalProps) {
  const { linkGhin, updateUser } = useAuthStore();
  const [ghin, setGhin] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState<ModalState>("idle");
  const [error, setError] = useState("");
  const [syncedHandicap, setSyncedHandicap] = useState<number | null>(null);
  const [manualHandicap, setManualHandicap] = useState("");

  const handleLink = async () => {
    if (!ghin.trim() || !lastName.trim()) {
      setError("Please enter your GHIN number and last name.");
      return;
    }
    if (!/^\d{7,8}$/.test(ghin.trim())) {
      setError("GHIN number must be 7–8 digits.");
      return;
    }
    setError("");
    setStatus("loading");

    try {
      // Call the API route directly so we can inspect the response before updating state
      const res = await fetch("/api/ghin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ghinNumber: ghin.trim(), lastName: lastName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.configRequired) {
          // GHIN_API_TOKEN not set in Vercel — show setup instructions
          setStatus("no_token");
          return;
        }
        // Golfer not found or bad data
        setStatus("idle");
        setError(data.error ?? "Could not verify your GHIN. Please check your details.");
        return;
      }

      // We got a real result — call linkGhin to update the store
      setSyncedHandicap(data.handicapIndex);
      const ok = await linkGhin(ghin.trim(), lastName.trim());

      if (ok) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          setGhin("");
          setLastName("");
          setSyncedHandicap(null);
          onClose();
        }, 2000);
      } else {
        setStatus("idle");
        setError("Something went wrong saving your data. Please try again.");
      }
    } catch {
      setStatus("idle");
      setError("Network error. Please check your connection and try again.");
    }
  };

  const handleClose = () => {
    if (status === "loading") return;
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink/50 z-50"
            onClick={handleClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-cream rounded-t-3xl z-50 px-6 pt-4 pb-10 shadow-[0_-4px_32px_rgba(26,26,26,0.15)]"
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-5">
              <div className="w-10 h-1 rounded-full bg-ink/20" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              disabled={status === "loading"}
              className="absolute top-5 right-5 text-muted p-1 active:opacity-60 transition-opacity disabled:opacity-30"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <AnimatePresence mode="wait">
              {/* ── No token configured ─────────────────────────────────────── */}
              {status === "no_token" ? (
                <motion.div
                  key="no_token"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4 gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center">
                    <AlertCircle size={32} className="text-gold" />
                  </div>
                  <div>
                    <p className="font-fraunces text-ink text-xl font-semibold mb-1">
                      Get Your GHIN Token
                    </p>
                    <p className="text-muted text-sm leading-relaxed">
                      The GHIN token lives in ghin.com&apos;s own network traffic — grab it in ~60 seconds.
                    </p>
                  </div>

                  <div className="w-full bg-cream-dark rounded-2xl p-4 text-left space-y-3">
                    <p className="text-xs font-bold text-ink uppercase tracking-widest">
                      How to get the token
                    </p>
                    <div className="space-y-2">
                      <Step n={1}>
                        Open{" "}
                        <span className="text-forest font-semibold">ghin.com</span>
                        {" "}in Chrome or Safari
                      </Step>
                      <Step n={2}>
                        Open <span className="font-semibold">DevTools</span> (F12) →{" "}
                        <span className="font-semibold">Network</span> tab
                      </Step>
                      <Step n={3}>
                        Search for any GHIN number on the site — watch for a request to{" "}
                        <code className="bg-cream text-forest text-[11px] px-1 py-0.5 rounded font-mono">
                          api2.ghin.com
                        </code>
                      </Step>
                      <Step n={4}>
                        Copy the{" "}
                        <code className="bg-cream text-forest text-[11px] px-1 py-0.5 rounded font-mono">
                          token=
                        </code>
                        {" "}value from that URL
                      </Step>
                      <Step n={5}>
                        In Vercel: Settings → Environment Variables → add{" "}
                        <code className="bg-cream text-forest text-[11px] px-1 py-0.5 rounded font-mono">
                          GHIN_API_TOKEN
                        </code>
                        {" "}→ Redeploy
                      </Step>
                    </div>
                    <p className="text-[11px] text-muted/70 pt-1 leading-relaxed">
                      ghin.com uses this same token publicly — it works fine for personal apps.
                    </p>
                  </div>

                  <button
                    onClick={() => setStatus("idle")}
                    className="w-full bg-forest text-white font-semibold rounded-xl py-3.5 active:scale-[0.97] transition-transform"
                  >
                    Got It
                  </button>

                  <button
                    onClick={() => setStatus("manual")}
                    className="w-full font-inter text-muted text-sm py-2 active:opacity-60 transition-opacity"
                  >
                    Enter Manually Instead
                  </button>
                </motion.div>

              ) : status === "manual" ? (
                /* ── Manual handicap entry ──────────────────────────────── */
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  <h2 className="font-fraunces text-ink text-2xl font-semibold pr-8">
                    Enter Handicap Manually
                  </h2>

                  <p className="font-inter text-muted text-sm leading-relaxed">
                    Enter your handicap index. You can always link GHIN later.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-inter text-sm font-medium text-muted">
                        Handicap Index
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={manualHandicap}
                        onChange={(e) => setManualHandicap(e.target.value)}
                        placeholder="18.0"
                        className={cn(
                          "bg-cream-dark text-ink font-inter text-base",
                          "rounded-xl px-4 py-3",
                          "border border-transparent outline-none",
                          "focus:border-forest transition-colors",
                          "placeholder:text-muted/60"
                        )}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const val = parseFloat(manualHandicap);
                      if (isNaN(val) || val < 0 || val > 54) return;
                      updateUser({ handicap: val });
                      setStatus("success");
                    }}
                    className="w-full bg-forest text-white font-inter font-semibold text-base rounded-xl py-3.5 active:scale-[0.97] transition-transform"
                  >
                    Save Handicap
                  </button>

                  <button
                    onClick={() => setStatus("idle")}
                    className="w-full font-inter text-muted text-sm py-2 active:opacity-60 transition-opacity"
                  >
                    Back
                  </button>
                </motion.div>

              ) : status === "success" ? (
                /* ── Success ──────────────────────────────────────────────── */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center py-8 gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-forest flex items-center justify-center">
                    <CheckCircle size={40} className="text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-fraunces text-ink text-2xl font-semibold">
                      GHIN Linked!
                    </p>
                    {syncedHandicap !== null && (
                      <p className="font-fraunces text-forest text-4xl font-bold mt-2">
                        {syncedHandicap < 0
                          ? `+${Math.abs(syncedHandicap).toFixed(1)}`
                          : syncedHandicap.toFixed(1)}
                      </p>
                    )}
                    <p className="font-inter text-muted text-sm mt-1">
                      {syncedHandicap !== null
                        ? "Your official handicap index"
                        : "Your handicap has been synced."}
                    </p>
                  </div>
                </motion.div>

              ) : (
                /* ── Form ─────────────────────────────────────────────────── */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  <h2 className="font-fraunces text-ink text-2xl font-semibold pr-8">
                    Link Your GHIN Account
                  </h2>

                  {/* GHIN logo area */}
                  <div className="bg-forest rounded-2xl py-5 flex flex-col items-center justify-center gap-1">
                    <span className="font-fraunces text-white text-5xl font-bold tracking-wider">
                      GHIN
                    </span>
                    <span className="text-white/50 text-xs font-medium tracking-widest uppercase">
                      USGA · Official Handicap
                    </span>
                  </div>

                  <p className="font-inter text-muted text-sm leading-relaxed">
                    Enter your GHIN number and last name to sync your official
                    handicap index from the USGA.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-inter text-sm font-medium text-muted">
                        GHIN Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={ghin}
                        onChange={(e) => {
                          setGhin(e.target.value.replace(/\D/g, ""));
                          setError("");
                        }}
                        placeholder="1234567"
                        maxLength={8}
                        disabled={status === "loading"}
                        className={cn(
                          "bg-cream-dark text-ink font-inter text-base",
                          "rounded-xl px-4 py-3",
                          "border border-transparent outline-none",
                          "focus:border-forest transition-colors",
                          "placeholder:text-muted/60",
                          "disabled:opacity-50",
                          error && "border-red-400"
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-inter text-sm font-medium text-muted">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setError("");
                        }}
                        placeholder="Last name for verification"
                        disabled={status === "loading"}
                        autoCapitalize="words"
                        className={cn(
                          "bg-cream-dark text-ink font-inter text-base",
                          "rounded-xl px-4 py-3",
                          "border border-transparent outline-none",
                          "focus:border-forest transition-colors",
                          "placeholder:text-muted/60",
                          "disabled:opacity-50",
                          error && "border-red-400"
                        )}
                      />
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-inter text-red-600 text-sm"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <button
                    onClick={handleLink}
                    disabled={status === "loading"}
                    className={cn(
                      "w-full bg-forest text-white font-inter font-semibold text-base",
                      "rounded-xl py-3.5 flex items-center justify-center gap-2",
                      "active:scale-[0.97] transition-all",
                      "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 size={18} className="animate-spin shrink-0" />
                        Syncing from USGA...
                      </>
                    ) : (
                      "Link Account"
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={status === "loading"}
                    className="w-full font-inter text-muted text-sm py-2 active:opacity-60 transition-opacity disabled:opacity-30"
                  >
                    Maybe Later
                  </button>

                  <button
                    onClick={() => setStatus("manual")}
                    className="w-full font-inter text-muted text-sm py-2 active:opacity-60 transition-opacity"
                  >
                    Enter Handicap Manually
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-5 h-5 rounded-full bg-forest/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-forest text-xs font-bold">{n}</span>
      </div>
      <p className="text-sm text-ink leading-snug">{children}</p>
    </div>
  );
}
