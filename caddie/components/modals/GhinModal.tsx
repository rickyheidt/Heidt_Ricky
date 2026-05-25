"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface GhinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = "idle" | "loading" | "success";

export default function GhinModal({ isOpen, onClose }: GhinModalProps) {
  const { linkGhin } = useAuthStore();
  const [ghin, setGhin] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState<ModalState>("idle");
  const [error, setError] = useState("");

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
      const ok = await linkGhin(ghin.trim(), lastName.trim());
      if (ok) {
        setStatus("success");
        setTimeout(() => {
          setStatus("idle");
          setGhin("");
          setLastName("");
          onClose();
        }, 1200);
      } else {
        setStatus("idle");
        setError("Could not verify GHIN. Please check your details.");
      }
    } catch {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
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
              {status === "success" ? (
                /* Success state */
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
                    <p className="font-inter text-muted text-sm mt-1">
                      Your handicap has been synced.
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Form state */
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  {/* Title */}
                  <h2 className="font-fraunces text-ink text-2xl font-semibold pr-8">
                    Link Your GHIN Account
                  </h2>

                  {/* GHIN logo area */}
                  <div className="bg-forest rounded-2xl py-6 flex items-center justify-center">
                    <span className="font-fraunces text-white text-5xl font-bold tracking-wider">
                      GHIN
                    </span>
                  </div>

                  {/* Description */}
                  <p className="font-inter text-muted text-sm leading-relaxed">
                    Enter your GHIN number and last name to sync your official
                    handicap index from the USGA.
                  </p>

                  {/* Inputs */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-inter text-sm font-medium text-muted">
                        GHIN Number
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={ghin}
                        onChange={(e) => {
                          setGhin(e.target.value);
                          setError("");
                        }}
                        placeholder="1234567"
                        disabled={status === "loading"}
                        className={cn(
                          "bg-cream-dark text-ink font-inter text-base",
                          "rounded-xl px-4 py-3",
                          "border border-transparent outline-none",
                          "focus:border-forest transition-colors",
                          "placeholder:text-muted/60",
                          "disabled:opacity-50",
                          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
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

                    {/* Error */}
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

                  {/* Link Account button */}
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

                  {/* Maybe Later */}
                  <button
                    onClick={handleClose}
                    disabled={status === "loading"}
                    className="w-full font-inter text-muted text-sm py-2 active:opacity-60 transition-opacity disabled:opacity-30"
                  >
                    Maybe Later
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
