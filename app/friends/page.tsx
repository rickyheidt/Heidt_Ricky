"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore, useFriendsStore } from "@/lib/store";
import { formatHandicap } from "@/lib/utils";
import type { Friend } from "@/lib/types";
import BottomNav from "@/components/ui/BottomNav";
import Avatar from "@/components/ui/Avatar";
import Sheet from "@/components/ui/Sheet";

// ── Mock search result ────────────────────────────────────────────────────────

const MOCK_RESULT: Friend = {
  id: "mock-search-1",
  name: "James Thompson",
  handicap: 12.6,
  ghin: "8823451",
  online: false,
  email: "jthompson@example.com",
};

// ── Add Friend Sheet content ──────────────────────────────────────────────────

interface AddFriendSheetProps {
  onAdded: (friend: Friend) => void;
}

function AddFriendSheetContent({ onAdded }: AddFriendSheetProps) {
  const [ghinInput, setGhinInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<Friend | null>(null);
  const [added, setAdded] = useState(false);

  const handleSearch = async () => {
    if (!ghinInput.trim() && !emailInput.trim()) return;
    setSearching(true);
    setResult(null);
    setAdded(false);
    await new Promise((r) => setTimeout(r, 1000));
    setResult(MOCK_RESULT);
    setSearching(false);
  };

  const handleAdd = () => {
    if (!result) return;
    onAdded(result);
    setAdded(true);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Find by GHIN */}
      <div className="flex flex-col gap-1.5">
        <label className="font-inter text-sm font-medium text-muted">
          Find by GHIN #
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={ghinInput}
          onChange={(e) => setGhinInput(e.target.value)}
          placeholder="1234567"
          className="bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 border border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Find by Email */}
      <div className="flex flex-col gap-1.5">
        <label className="font-inter text-sm font-medium text-muted">
          Find by Email
        </label>
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="friend@example.com"
          className="bg-cream-dark text-ink font-inter text-base rounded-xl px-4 py-3 border border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
        />
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        disabled={searching || (!ghinInput.trim() && !emailInput.trim())}
        className="w-full bg-forest text-white font-inter font-semibold text-base rounded-xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {searching ? (
          <>
            <Loader2 size={18} className="animate-spin shrink-0" />
            Searching...
          </>
        ) : (
          <>
            <Search size={18} />
            Search
          </>
        )}
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="bg-cream-dark rounded-2xl p-4 flex items-center gap-4"
          >
            <Avatar name={result.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-inter text-ink text-sm font-semibold truncate">
                {result.name}
              </p>
              <p className="font-inter text-muted text-xs">
                HCP {formatHandicap(result.handicap)}
                {result.ghin ? ` · GHIN #${result.ghin}` : ""}
              </p>
            </div>
            {added ? (
              <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest font-inter text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0">
                <CheckCircle2 size={13} />
                Added
              </span>
            ) : (
              <button
                onClick={handleAdd}
                className="bg-forest text-white font-inter font-semibold text-xs px-3 py-1.5 rounded-xl shrink-0 active:bg-forest-light transition-colors"
              >
                Add Friend
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { friends, addFriend } = useFriendsStore();
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Filter friends by query
  const filtered =
    query.trim().length === 0
      ? friends
      : friends.filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.email?.toLowerCase().includes(query.toLowerCase()) ||
            f.ghin?.includes(query)
        );

  const onlineFriends = friends.filter((f) => f.online);

  const handleFriendAdded = (friend: Friend) => {
    // Only add if not already in list
    if (!friends.find((f) => f.id === friend.id)) {
      addFriend(friend);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="font-fraunces text-ink text-3xl font-semibold">
          Friends
        </h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Search Bar ────────────────────────────────────────── */}
        <div className="px-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full bg-cream-dark text-ink font-inter text-sm rounded-full pl-11 pr-4 py-3 border border-transparent outline-none focus:border-forest transition-colors placeholder:text-muted/60"
            />
          </div>
        </div>

        {/* ── Online Now ────────────────────────────────────────── */}
        {onlineFriends.length > 0 && (
          <div>
            <p className="font-inter text-muted text-xs font-semibold uppercase tracking-wider px-5 mb-3">
              Online Now
            </p>
            <div className="flex gap-4 overflow-x-auto px-5 pb-1 scrollbar-none">
              {onlineFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <Avatar name={friend.name} size="md" online={true} />
                  <p className="font-inter text-ink text-xs font-medium w-14 text-center truncate">
                    {friend.name.split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Friends List ──────────────────────────────────────── */}
        <div className="px-5">
          <p className="font-inter text-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Your Friends ({filtered.length})
          </p>

          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {filtered.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="bg-cream-dark rounded-2xl p-4 shadow-card flex items-center gap-4"
                >
                  <Avatar name={friend.name} size="md" online={friend.online} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-inter text-ink text-sm font-semibold truncate">
                        {friend.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="font-inter text-muted text-xs">
                        HCP {formatHandicap(friend.handicap)}
                      </p>
                      {friend.ghin && (
                        <p className="font-inter text-muted/70 text-xs">
                          GHIN #{friend.ghin}
                        </p>
                      )}
                    </div>
                    <p
                      className={`font-inter text-xs mt-0.5 ${
                        friend.online ? "text-green-600" : "text-muted/60"
                      }`}
                    >
                      {friend.online ? "Online" : "Offline"}
                    </p>
                  </div>

                  <button className="border border-forest text-forest font-inter font-semibold text-xs px-3 py-1.5 rounded-xl shrink-0 active:bg-forest/5 transition-colors">
                    Invite
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-10">
                <p className="font-inter text-muted text-sm">
                  {query.trim()
                    ? `No friends matching "${query}"`
                    : "No friends yet"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Add Friend Button ─────────────────────────────────── */}
        <div className="px-5">
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-forest text-white font-inter font-semibold text-base rounded-2xl py-4 flex items-center justify-center gap-2.5 shadow-card active:bg-forest-light transition-colors active:scale-[0.98]"
          >
            <UserPlus size={20} />
            Add Friend
          </button>
        </div>
      </div>

      {/* ── Add Friend Sheet ──────────────────────────────────────── */}
      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add Friend"
      >
        <AddFriendSheetContent onAdded={handleFriendAdded} />
      </Sheet>

      {/* ── Bottom Nav ────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
