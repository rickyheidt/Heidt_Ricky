"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [handicap, setHandicap] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const success = await signUp(name.trim(), email, password, handicap ? parseFloat(handicap) : undefined);
      if (success) {
        router.push("/home");
      } else {
        setError("An account with this email already exists.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          Create account
        </h2>

        <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-inter text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Smith"
              autoComplete="name"
              className="bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 border-2 border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
            />
          </div>

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
                placeholder="Min. 6 characters"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-inter text-sm font-medium">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              autoComplete="new-password"
              className="bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 border-2 border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
            />
          </div>

          {/* Handicap Index */}
          <div className="flex flex-col gap-1.5">
            <label className="text-muted font-inter text-sm font-medium">
              Handicap Index
            </label>
            <input
              type="text"
              inputMode="decimal"
              step="0.1"
              min={0}
              max={54}
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="18.0"
              className="bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 border-2 border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
            />
            <p className="text-muted/70 font-inter text-xs">
              Optional — defaults to 18.0
            </p>
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

          {/* Create Account button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-forest text-white font-inter font-semibold text-base rounded-xl py-3.5 w-full flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-60 min-h-[52px]"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Sign In link */}
        <p className="font-inter text-sm text-center text-muted mt-5">
          Already have an account?{" "}
          <Link href="/" className="text-forest font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
