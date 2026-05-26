"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Check, RotateCcw } from "lucide-react";
import { useCoursesStore } from "@/lib/store";
import { generateId, cn } from "@/lib/utils";
import type { Course, Hole } from "@/lib/types";

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-full transition-all",
            i < current
              ? "w-2 h-2 bg-forest"
              : i === current
              ? "w-4 h-2 bg-forest"
              : "w-2 h-2 bg-forest/20"
          )}
        />
      ))}
    </div>
  );
}

// ─── Par selector for a single hole ───────────────────────────────────────────

function ParButton({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-9 h-9 rounded-lg font-inter font-bold text-sm transition-all active:scale-90",
        selected
          ? "bg-forest text-white shadow-sm"
          : "bg-white text-ink border border-ink/10"
      )}
    >
      {value}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function NewCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game") ?? "skins";
  const { addCourse } = useCoursesStore();

  const [step, setStep] = useState(0); // 0: basic info, 1: holes, 2: review

  // Step 1 state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("CA");
  const [par, setPar] = useState(72);
  const [rating, setRating] = useState("72.0");
  const [slope, setSlope] = useState("130");
  const [error, setError] = useState("");

  // Step 2 state — 18 holes, pars default to 4, yards default to 400
  const [holePars, setHolePars] = useState<number[]>(Array(18).fill(4));
  const [holeYards, setHoleYards] = useState<string[]>(Array(18).fill(""));
  const [holeError, setHoleError] = useState("");

  const totalPar = holePars.reduce((a, b) => a + b, 0);

  const handleBasicNext = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Course name is required"); return; }
    if (!city.trim()) { setError("City is required"); return; }
    if (!state.trim()) { setError("State is required"); return; }
    const r = parseFloat(rating);
    const s = parseInt(slope, 10);
    if (isNaN(r) || r < 60 || r > 80) { setError("Rating must be between 60 and 80"); return; }
    if (isNaN(s) || s < 55 || s > 155) { setError("Slope must be between 55 and 155"); return; }
    setError("");
    setStep(1);
  };

  const handleHolesNext = () => {
    if (totalPar !== par) {
      setHoleError(`Hole pars add up to ${totalPar}, but course par is ${par}. Adjust holes or change course par.`);
      return;
    }
    setHoleError("");
    setStep(2);
  };

  const handleSave = () => {
    const holeData: Hole[] = holePars.map((p, i) => ({
      number: i + 1,
      par: p,
      yards: parseInt(holeYards[i] || "0", 10) || 0,
      handicap: i + 1,
    }));

    const course: Course = {
      id: `custom-${generateId()}`,
      name: name.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      holes: 18,
      par,
      rating: parseFloat(rating),
      slope: parseInt(slope, 10),
      holeData,
    };

    addCourse(course);
    router.replace(`/courses?game=${gameId}`);
  };

  const resetPars = () => {
    setHolePars(Array(18).fill(4));
  };

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : router.back()}
            className="flex items-center gap-2 text-forest active:opacity-60 transition-opacity min-h-[44px]"
          >
            <ArrowLeft size={20} />
            <span className="font-inter text-sm font-medium">
              {step > 0 ? "Back" : "Cancel"}
            </span>
          </button>
          <StepDots current={step} total={3} />
        </div>

        <h1 className="font-fraunces text-ink text-3xl font-bold leading-tight">
          {step === 0 && "Course Info"}
          {step === 1 && "Hole Pars"}
          {step === 2 && "Review"}
        </h1>
        <p className="font-inter text-muted text-sm mt-1">
          {step === 0 && "Basic information about the course"}
          {step === 1 && "Set the par for each hole"}
          {step === 2 && "Confirm and save the course"}
        </p>
      </div>

      {/* ── Step 0: Basic Info ─────────────────────────────────────── */}
      {step === 0 && (
        <div className="px-5 flex flex-col gap-4">
          <div className="bg-cream-dark rounded-2xl p-5 flex flex-col gap-4 shadow-card">
            {/* Course name */}
            <div>
              <label className="font-inter text-xs text-muted font-semibold uppercase tracking-wide block mb-1.5">
                Course Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rams Hill Golf Club"
                className="w-full bg-white border border-ink/10 text-ink font-inter text-base rounded-xl px-4 py-3 outline-none focus:border-forest/40 transition-colors placeholder:text-muted/50"
              />
            </div>

            {/* City + State row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-inter text-xs text-muted font-semibold uppercase tracking-wide block mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Borrego Springs"
                  className="w-full bg-white border border-ink/10 text-ink font-inter text-base rounded-xl px-4 py-3 outline-none focus:border-forest/40 transition-colors placeholder:text-muted/50"
                />
              </div>
              <div className="w-20">
                <label className="font-inter text-xs text-muted font-semibold uppercase tracking-wide block mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.slice(0, 2))}
                  placeholder="CA"
                  maxLength={2}
                  className="w-full bg-white border border-ink/10 text-ink font-inter text-base rounded-xl px-4 py-3 outline-none focus:border-forest/40 transition-colors placeholder:text-muted/50 text-center uppercase"
                />
              </div>
            </div>

            {/* Par */}
            <div>
              <label className="font-inter text-xs text-muted font-semibold uppercase tracking-wide block mb-2">
                Course Par
              </label>
              <div className="flex gap-2">
                {[70, 71, 72, 73].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPar(p)}
                    className={cn(
                      "flex-1 h-12 rounded-xl font-inter font-bold text-base transition-all active:scale-95",
                      par === p
                        ? "bg-forest text-white"
                        : "bg-white border border-ink/10 text-ink"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating + Slope row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-inter text-xs text-muted font-semibold uppercase tracking-wide block mb-1.5">
                  Course Rating
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="72.0"
                  className="w-full bg-white border border-ink/10 text-ink font-inter text-base rounded-xl px-4 py-3 outline-none focus:border-forest/40 transition-colors placeholder:text-muted/50"
                />
              </div>
              <div className="flex-1">
                <label className="font-inter text-xs text-muted font-semibold uppercase tracking-wide block mb-1.5">
                  Slope Rating
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={slope}
                  onChange={(e) => setSlope(e.target.value)}
                  placeholder="130"
                  className="w-full bg-white border border-ink/10 text-ink font-inter text-base rounded-xl px-4 py-3 outline-none focus:border-forest/40 transition-colors placeholder:text-muted/50"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="font-inter text-red-500 text-sm px-1">{error}</p>
          )}

          <button
            onClick={handleBasicNext}
            className="w-full h-14 bg-forest text-white font-inter font-semibold text-base rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg"
          >
            Next: Hole Pars
            <ChevronRight size={20} />
          </button>

          <p className="font-inter text-muted/60 text-xs text-center px-4 leading-relaxed">
            Rating and Slope are on your scorecard — usually near the tee box info.
          </p>
        </div>
      )}

      {/* ── Step 1: Hole Pars ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="px-5 flex flex-col gap-4">
          {/* Par counter */}
          <div className="flex items-center justify-between bg-cream-dark rounded-2xl px-5 py-3.5 shadow-card">
            <div>
              <p className="font-inter text-muted text-xs">Total Par</p>
              <p className={cn(
                "font-fraunces text-2xl font-bold",
                totalPar === par ? "text-forest" : "text-orange-500"
              )}>
                {totalPar}
                <span className="text-muted text-sm font-inter font-normal ml-1">
                  / {par}
                </span>
              </p>
            </div>
            <button
              onClick={resetPars}
              className="flex items-center gap-1.5 text-muted font-inter text-xs active:opacity-60 transition-opacity"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {/* 18-hole grid */}
          <div className="bg-cream-dark rounded-2xl p-4 shadow-card">
            <div className="grid grid-cols-2 gap-2">
              {holePars.map((holePar, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-3 flex items-center justify-between"
                >
                  {/* Hole number */}
                  <span className="font-fraunces text-muted text-sm font-semibold w-8">
                    #{i + 1}
                  </span>

                  {/* Par toggle buttons */}
                  <div className="flex gap-1">
                    {[3, 4, 5].map((p) => (
                      <ParButton
                        key={p}
                        value={p}
                        selected={holePar === p}
                        onClick={() => {
                          const next = [...holePars];
                          next[i] = p;
                          setHolePars(next);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yardage inputs (optional) */}
          <div className="bg-cream-dark rounded-2xl p-4 shadow-card">
            <p className="font-inter text-ink text-sm font-semibold mb-1">
              Yardages{" "}
              <span className="text-muted font-normal">(optional)</span>
            </p>
            <p className="font-inter text-muted text-xs mb-3">
              From the scorecard — leave blank if you don&apos;t have it.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {holeYards.map((yds, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="font-inter text-muted text-[10px] text-center">
                    #{i + 1}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={yds}
                    onChange={(e) => {
                      const next = [...holeYards];
                      next[i] = e.target.value;
                      setHoleYards(next);
                    }}
                    placeholder="400"
                    className="w-full bg-white border border-ink/10 text-ink font-inter text-xs rounded-lg px-2 py-2 outline-none focus:border-forest/30 transition-colors placeholder:text-muted/40 text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {holeError && (
            <p className="font-inter text-red-500 text-sm px-1">{holeError}</p>
          )}

          <button
            onClick={handleHolesNext}
            disabled={totalPar !== par}
            className={cn(
              "w-full h-14 font-inter font-semibold text-base rounded-2xl transition-all flex items-center justify-center gap-2",
              totalPar === par
                ? "bg-forest text-white shadow-lg active:scale-[0.98]"
                : "bg-cream-dark text-muted cursor-not-allowed"
            )}
          >
            Review Course
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* ── Step 2: Review ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="px-5 flex flex-col gap-4">
          {/* Course summary card */}
          <div className="bg-forest rounded-2xl p-5 shadow-card relative overflow-hidden">
            <span className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[24px] border-white/5 pointer-events-none" />
            <span className="absolute -right-4 -bottom-10 w-32 h-32 rounded-full border-[16px] border-white/5 pointer-events-none" />

            <p className="font-inter text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
              Custom Course
            </p>
            <h2 className="font-fraunces text-white text-2xl font-bold leading-tight mb-1">
              {name}
            </h2>
            <p className="font-inter text-white/60 text-sm mb-4">
              {city}, {state.toUpperCase()}
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="font-inter text-white/50 text-xs">Par</p>
                <p className="font-fraunces text-white text-2xl font-bold">{par}</p>
              </div>
              <div>
                <p className="font-inter text-white/50 text-xs">Rating</p>
                <p className="font-fraunces text-white text-2xl font-bold">{rating}</p>
              </div>
              <div>
                <p className="font-inter text-white/50 text-xs">Slope</p>
                <p className="font-fraunces text-white text-2xl font-bold">{slope}</p>
              </div>
            </div>
          </div>

          {/* Hole breakdown */}
          <div className="bg-cream-dark rounded-2xl p-4 shadow-card">
            <p className="font-inter text-ink text-sm font-semibold mb-3">
              Hole Breakdown
            </p>

            {/* Front 9 */}
            <p className="font-inter text-muted text-xs uppercase tracking-wide mb-2">
              Front 9 (out: {holePars.slice(0, 9).reduce((a, b) => a + b, 0)})
            </p>
            <div className="grid grid-cols-9 gap-1 mb-4">
              {holePars.slice(0, 9).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="font-inter text-muted text-[9px]">{i + 1}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-fraunces font-bold text-sm",
                    p === 3 ? "bg-forest/10 text-forest" :
                    p === 5 ? "bg-gold/10 text-gold" :
                    "bg-white text-ink"
                  )}>
                    {p}
                  </div>
                </div>
              ))}
            </div>

            {/* Back 9 */}
            <p className="font-inter text-muted text-xs uppercase tracking-wide mb-2">
              Back 9 (in: {holePars.slice(9).reduce((a, b) => a + b, 0)})
            </p>
            <div className="grid grid-cols-9 gap-1">
              {holePars.slice(9).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="font-inter text-muted text-[9px]">{i + 10}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-fraunces font-bold text-sm",
                    p === 3 ? "bg-forest/10 text-forest" :
                    p === 5 ? "bg-gold/10 text-gold" :
                    "bg-white text-ink"
                  )}>
                    {p}
                  </div>
                </div>
              ))}
            </div>

            {/* Par counts */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-ink/5">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-forest/10" />
                <span className="font-inter text-muted text-xs">
                  {holePars.filter((p) => p === 3).length}× Par 3
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-white border border-ink/10" />
                <span className="font-inter text-muted text-xs">
                  {holePars.filter((p) => p === 4).length}× Par 4
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-gold/10" />
                <span className="font-inter text-muted text-xs">
                  {holePars.filter((p) => p === 5).length}× Par 5
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full h-14 bg-forest text-white font-inter font-semibold text-base rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg"
          >
            <Check size={20} />
            Save Course
          </button>

          <p className="font-inter text-muted/60 text-xs text-center">
            Course will be saved to your device and available for all future rounds.
          </p>
        </div>
      )}
    </div>
  );
}

export default function NewCoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-inter text-muted">Loading...</p>
      </div>
    }>
      <NewCourseContent />
    </Suspense>
  );
}
