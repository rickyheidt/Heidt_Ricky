"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { COURSES } from "@/lib/data";
import type { Course } from "@/lib/types";
import { cn } from "@/lib/utils";

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game") ?? "skins";

  const [query, setQuery] = useState("");
  const [locationUsed, setLocationUsed] = useState(false);

  const filteredCourses = useMemo(() => {
    if (!query.trim()) return COURSES;
    const lower = query.toLowerCase();
    return COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.city.toLowerCase().includes(lower) ||
        c.state.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleUseLocation = () => {
    setLocationUsed(true);
    // Mock: immediately show all courses sorted by distance
  };

  const handleSelectCourse = (course: Course) => {
    router.push(`/setup?game=${gameId}&course=${course.id}`);
  };

  const displayCourses = locationUsed
    ? [...filteredCourses].sort((a, b) => {
        // Sort by numeric distance (strip " mi")
        const parseDistance = (d?: string) => {
          if (!d) return 9999;
          const num = parseFloat(d.replace(/[^0-9.]/g, "").replace(",", ""));
          return isNaN(num) ? 9999 : num;
        };
        return parseDistance(a.distance) - parseDistance(b.distance);
      })
    : filteredCourses;

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-forest mb-6 active:opacity-60 transition-opacity min-h-[44px]"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
          <span className="font-inter text-sm font-medium">Back</span>
        </button>

        <h1 className="font-fraunces text-ink text-4xl font-bold leading-tight">
          Select Course
        </h1>
      </div>

      {/* ── Search + Location ──────────────────────────────────────── */}
      <div className="px-5 flex flex-col gap-3 mb-5">
        {/* Search bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className={cn(
              "w-full bg-cream-dark rounded-xl pl-11 pr-4 py-3.5",
              "font-inter text-ink text-sm placeholder:text-muted",
              "border border-transparent focus:border-forest/30 focus:outline-none",
              "transition-colors"
            )}
          />
        </div>

        {/* Use My Location button */}
        <button
          onClick={handleUseLocation}
          className={cn(
            "flex items-center gap-2.5 px-4 py-3 rounded-xl",
            "bg-cream-dark active:scale-[0.98] transition-all",
            locationUsed
              ? "border border-forest/30 text-forest"
              : "border border-transparent text-forest"
          )}
        >
          <MapPin size={18} className="text-forest shrink-0" />
          <span className="font-inter font-medium text-sm text-forest">
            {locationUsed ? "Showing nearby courses" : "Use My Location"}
          </span>
          {locationUsed && (
            <span className="ml-auto bg-forest/10 text-forest font-inter text-xs font-semibold px-2 py-0.5 rounded-full">
              Near Me
            </span>
          )}
        </button>
      </div>

      {/* ── Results count ──────────────────────────────────────────── */}
      <div className="px-5 mb-3">
        <p className="font-inter text-muted text-xs">
          {displayCourses.length} course{displayCourses.length !== 1 ? "s" : ""}
          {query ? ` matching "${query}"` : " available"}
        </p>
      </div>

      {/* ── Course List ────────────────────────────────────────────── */}
      <div className="px-5 flex flex-col gap-3">
        {displayCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">⛳</span>
            <p className="font-fraunces text-ink text-xl font-semibold">
              No courses found
            </p>
            <p className="font-inter text-muted text-sm mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          displayCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={cn(
                "w-full text-left bg-cream-dark rounded-2xl shadow-card p-5",
                "active:scale-[0.98] transition-transform"
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                {/* Course name */}
                <h2 className="font-fraunces text-ink text-lg font-semibold leading-snug flex-1">
                  {course.name}
                </h2>

                {/* Distance badge */}
                {course.distance && (
                  <span className="shrink-0 bg-gold/10 text-gold font-inter text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5">
                    {course.distance}
                  </span>
                )}
              </div>

              {/* City, State */}
              <p className="font-inter text-muted text-sm mb-3">
                {course.city}, {course.state}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatPill label={`${course.holes} holes`} />
                <span className="text-muted/40 text-xs">·</span>
                <StatPill label={`Par ${course.par}`} />
                <span className="text-muted/40 text-xs">·</span>
                <StatPill label={`Rating ${course.rating}`} />
                <span className="text-muted/40 text-xs">·</span>
                <StatPill label={`Slope ${course.slope}`} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <span className="font-inter text-muted text-xs font-medium">{label}</span>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-inter text-muted">Loading...</p>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
