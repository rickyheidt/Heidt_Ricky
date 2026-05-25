"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import type { User } from "@/lib/types";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const success = await signIn(email, password);
      if (success) {
        router.push("/home");
      } else {
        setError("Invalid email or password. Try signing up first.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    const guestUser: User = {
      id: generateId(),
      name: "Guest",
      email: `guest-${Date.now()}@skinz.app`,
      handicap: 18.0,
      ghinLinked: false,
      stats: { roundsPlayed: 0, lifetimeWinnings: 0, wins: 0 },
    };
    setUser(guestUser);
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex flex-col bg-forest">
      {/* Top half — forest green with logo */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="font-fraunces text-white text-7xl font-bold tracking-tight leading-none mb-3">
            SKINZ
          </h1>
          <p className="text-white/70 font-inter text-base tracking-wide">
            Golf betting, elevated.
          </p>
        </motion.div>
      </motion.div>

      {/* Bottom half — cream with form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        className="bg-cream rounded-t-3xl px-6 pt-8 pb-10"
      >
        <h2 className="font-fraunces text-ink text-2xl font-semibold mb-6">
          Welcome back
        </h2>

        <form onSubmit={handleSignIn} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-inter text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 border-2 border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-inter text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 pr-12 border-2 border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 font-inter text-sm"
            >
              {error}
            </motion.p>
          )}

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-forest text-white font-inter font-semibold text-base rounded-xl py-3.5 w-full flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60 min-h-[52px]"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Sign Up link */}
        <p className="font-inter text-sm text-center text-muted mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-forest font-semibold">
            Sign Up
          </Link>
        </p>

        {/* Guest */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleGuest}
            disabled={guestLoading}
            className="font-inter text-xs text-muted flex items-center gap-1.5 active:opacity-70 transition-opacity min-h-[44px] px-2"
          >
            {guestLoading && <Loader2 size={13} className="animate-spin" />}
            Continue as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
