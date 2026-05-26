"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Friend, RoundState } from "./types";
import { DEFAULT_FRIENDS } from "./data";
import { generateId } from "./utils";

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  linkGhin: (ghin: string, lastName: string) => Promise<boolean>;
  unlinkGhin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      updateUser: (updates) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },

      signOut: () => set({ user: null, isAuthenticated: false }),

      signIn: async (email: string, _password: string) => {
        // Mock auth — load stored user or create new
        const stored = get().user;
        if (stored && stored.email === email) {
          set({ isAuthenticated: true });
          return true;
        }
        // Check localStorage for persisted users
        try {
          const savedUsers = JSON.parse(
            localStorage.getItem("caddie-users") || "[]"
          ) as User[];
          const found = savedUsers.find((u) => u.email === email);
          if (found) {
            set({ user: found, isAuthenticated: true });
            return true;
          }
        } catch {
          // ignore
        }
        return false;
      },

      signUp: async (name: string, email: string, _password: string) => {
        const newUser: User = {
          id: generateId(),
          name,
          email,
          handicap: 18.0,
          ghinLinked: false,
          stats: { roundsPlayed: 0, lifetimeWinnings: 0, wins: 0 },
        };
        // Persist to all-users list
        try {
          const savedUsers = JSON.parse(
            localStorage.getItem("caddie-users") || "[]"
          ) as User[];
          savedUsers.push(newUser);
          localStorage.setItem("caddie-users", JSON.stringify(savedUsers));
        } catch {
          // ignore
        }
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      linkGhin: async (ghin: string, _lastName: string) => {
        // Mock GHIN sync — fake 1.5s delay then update handicap
        await new Promise((r) => setTimeout(r, 1500));
        // Generate a mock handicap between 0-28
        const mockHandicap = parseFloat((Math.random() * 20 + 2).toFixed(1));
        const user = get().user;
        if (!user) return false;
        const updated: User = {
          ...user,
          ghin,
          ghinLinked: true,
          handicap: mockHandicap,
          ghinSyncedAt: new Date().toISOString(),
        };
        set({ user: updated });
        return true;
      },

      unlinkGhin: () => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            ghin: undefined,
            ghinLinked: false,
            ghinSyncedAt: undefined,
          },
        });
      },
    }),
    {
      name: "caddie-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Friends Store ────────────────────────────────────────────────────────────

interface FriendsState {
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  removeFriend: (id: string) => void;
  searchFriends: (query: string) => Friend[];
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: DEFAULT_FRIENDS,

      addFriend: (friend) =>
        set((state) => ({ friends: [...state.friends, friend] })),

      removeFriend: (id) =>
        set((state) => ({ friends: state.friends.filter((f) => f.id !== id) })),

      searchFriends: (query) => {
        const lower = query.toLowerCase();
        return get().friends.filter(
          (f) =>
            f.name.toLowerCase().includes(lower) ||
            f.email?.toLowerCase().includes(lower) ||
            f.ghin?.includes(lower)
        );
      },
    }),
    {
      name: "caddie-friends",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Round Store ──────────────────────────────────────────────────────────────

interface RoundStore {
  round: RoundState | null;
  setRound: (round: RoundState) => void;
  updateScore: (holeNumber: number, playerId: string, score: number) => void;
  advanceHole: () => void;
  completeHole: (holeNumber: number) => void;
  resetRound: () => void;
}

export const useRoundStore = create<RoundStore>()((set, get) => ({
  round: null,

  setRound: (round) => set({ round }),

  updateScore: (holeNumber, playerId, score) => {
    const round = get().round;
    if (!round) return;
    const key = `${holeNumber}-${playerId}`;
    set({
      round: {
        ...round,
        scores: { ...round.scores, [key]: score },
      },
    });
  },

  advanceHole: () => {
    const round = get().round;
    if (!round) return;
    const next = round.currentHole + 1;
    if (next <= 18) {
      set({ round: { ...round, currentHole: next } });
    }
  },

  completeHole: (holeNumber) => {
    const round = get().round;
    if (!round) return;
    const already = round.holesCompleted.includes(holeNumber);
    if (!already) {
      set({
        round: {
          ...round,
          holesCompleted: [...round.holesCompleted, holeNumber],
        },
      });
    }
  },

  resetRound: () => set({ round: null }),
}));
