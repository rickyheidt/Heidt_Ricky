"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Friend, RoundState, Course } from "./types";
import { DEFAULT_FRIENDS } from "./data";
import { generateId } from "./utils";
import { hashPassword, verifyPassword } from "./auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem("caddie-users") || "[]") as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  try {
    localStorage.setItem("caddie-users", JSON.stringify(users));
  } catch {
    // ignore
  }
}

function syncUserToStorage(user: User) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    // Preserve passwordHash from stored version (zustand state may not have it)
    const existingHash = users[idx].passwordHash;
    users[idx] = { ...user, passwordHash: user.passwordHash ?? existingHash };
  } else {
    users.push(user);
  }
  saveUsers(users);
}

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  signOut: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    name: string,
    email: string,
    password: string,
    handicap?: number
  ) => Promise<boolean>;
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
        const updated = { ...user, ...updates };
        set({ user: updated });
        syncUserToStorage(updated);
      },

      signOut: () => {
        const user = get().user;
        if (user) syncUserToStorage(user);
        set({ user: null, isAuthenticated: false });
      },

      signIn: async (email: string, password: string) => {
        const users = loadUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!found) return false;

        // If user has a password hash, verify it
        if (found.passwordHash) {
          const valid = await verifyPassword(password, found.passwordHash);
          if (!valid) return false;
        }
        // Legacy users without passwordHash: allow sign-in with any password

        set({ user: found, isAuthenticated: true });
        return true;
      },

      signUp: async (
        name: string,
        email: string,
        password: string,
        handicap?: number
      ) => {
        // Check for duplicate email
        const existing = loadUsers();
        if (
          existing.some(
            (u) => u.email.toLowerCase() === email.toLowerCase()
          )
        ) {
          return false;
        }

        const hashed = await hashPassword(password);

        const newUser: User = {
          id: generateId(),
          name,
          email,
          passwordHash: hashed,
          handicap: handicap ?? 18.0,
          ghinLinked: false,
          stats: { roundsPlayed: 0, lifetimeWinnings: 0, wins: 0 },
        };

        existing.push(newUser);
        saveUsers(existing);
        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      linkGhin: async (ghin: string, lastName: string) => {
        const user = get().user;
        if (!user) return false;

        let handicapIndex = 18.0;
        let resolvedFirstName = "";
        let resolvedLastName = lastName;

        try {
          const res = await fetch("/api/ghin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ghinNumber: ghin, lastName }),
          });

          const data = await res.json();

          if (!res.ok) {
            if (data.configRequired) return false;
            return false;
          }

          handicapIndex = data.handicapIndex ?? 18.0;
          resolvedFirstName = data.firstName ?? "";
          resolvedLastName = data.lastName ?? lastName;
        } catch {
          return false;
        }

        const updated: User = {
          ...user,
          ghin,
          ghinLinked: true,
          ghinVerified: true,
          handicap: handicapIndex,
          name: resolvedFirstName
            ? `${resolvedFirstName} ${resolvedLastName}`.trim()
            : user.name,
          ghinSyncedAt: new Date().toISOString(),
        };
        set({ user: updated });
        syncUserToStorage(updated);
        return true;
      },

      unlinkGhin: () => {
        const user = get().user;
        if (!user) return;
        const updated: User = {
          ...user,
          ghin: undefined,
          ghinLinked: false,
          ghinSyncedAt: undefined,
        };
        set({ user: updated });
        syncUserToStorage(updated);
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

// ─── Custom Courses Store ─────────────────────────────────────────────────────

interface CoursesState {
  customCourses: Course[];
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
}

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set) => ({
      customCourses: [],

      addCourse: (course) =>
        set((state) => ({
          customCourses: [...state.customCourses, course],
        })),

      removeCourse: (id) =>
        set((state) => ({
          customCourses: state.customCourses.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "caddie-courses",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
