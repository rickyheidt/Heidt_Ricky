"use client";

import { motion } from "framer-motion";
import { Trophy, Calendar, Flag } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";

export default function RoundsPage() {
  return (
    <div className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-forest px-4 pt-safe pb-6">
        <div className="pt-4">
          <h1 className="font-fraunces text-2xl font-bold text-white">
            Your Rounds
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Round history coming soon
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center px-8 mt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center mb-6"
        >
          <Trophy size={40} className="text-muted" />
        </motion.div>
        <h2 className="font-fraunces text-xl font-bold text-ink text-center mb-2">
          No rounds yet
        </h2>
        <p className="text-muted text-sm text-center leading-relaxed">
          Your completed rounds will appear here. Start a game to begin
          tracking your bets and scores.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
