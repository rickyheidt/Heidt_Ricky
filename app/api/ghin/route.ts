import { NextRequest, NextResponse } from "next/server";

// ─── GHIN API Configuration ───────────────────────────────────────────────────
//
// The USGA GHIN API is at https://api2.ghin.com/api/v1
//
// As of 2024, ghin.com uses source=GHINcom without a token in the URL.
// This route tries that first (no config needed), then falls back to
// GHIN_API_TOKEN if provided in env (for older/alternate access methods).
//
// In most cases NO env var is required — it works out of the box.
//
// ─────────────────────────────────────────────────────────────────────────────

const GHIN_API_BASE = "https://api2.ghin.com/api/v1";
const GHIN_API_TOKEN = process.env.GHIN_API_TOKEN; // optional fallback

export interface GhinGolferResult {
  ghin: string;
  handicapIndex: number;
  firstName: string;
  lastName: string;
  club?: string;
  association?: string;
  state?: string;
  status: "active" | "inactive";
}

async function callGhinApi(
  ghinNumber: string,
  lastName: string,
  token?: string
): Promise<Response> {
  const params = new URLSearchParams({
    golfer_id: ghinNumber,
    last_name: lastName,
    page: "1",
    per_page: "100",
    source: "GHINcom",
  });

  // Add token if provided
  if (token) {
    params.set("token", token);
  }

  return fetch(
    `${GHIN_API_BASE}/golfers/search.json?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Mimic ghin.com browser request
        "User-Agent": "Mozilla/5.0",
        Origin: "https://www.ghin.com",
        Referer: "https://www.ghin.com/",
      },
      cache: "no-store",
    }
  );
}

function parseGhinResponse(
  data: Record<string, unknown>,
  ghinNumber: string,
  lastName: string
): GhinGolferResult | null {
  const golfers = data.golfers as Array<Record<string, unknown>> | undefined;
  if (!golfers || golfers.length === 0) return null;

  const golfer = golfers[0];

  // Parse handicap — GHIN returns "14.2" or "+2.1" (plus = scratch or better)
  const rawHcp = String(golfer.handicap_index ?? golfer.HI ?? "0");
  const isPlus = rawHcp.startsWith("+");
  const handicapIndex = isPlus
    ? -parseFloat(rawHcp.slice(1))
    : parseFloat(rawHcp);

  return {
    ghin: String(golfer.ghin_number ?? golfer.GHINNumber ?? ghinNumber),
    handicapIndex: isNaN(handicapIndex) ? 18.0 : handicapIndex,
    firstName: String(golfer.first_name ?? golfer.FirstName ?? ""),
    lastName: String(golfer.last_name ?? golfer.LastName ?? lastName),
    club: String(golfer.club_name ?? golfer.ClubName ?? ""),
    association: String(golfer.assoc_name ?? golfer.AssocName ?? ""),
    state: String(golfer.state ?? golfer.State ?? ""),
    status:
      String(golfer.status ?? golfer.Status ?? "active").toLowerCase() ===
      "active"
        ? "active"
        : "inactive",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ghinNumber, lastName } = body as {
      ghinNumber: string;
      lastName: string;
    };

    // Validate inputs
    if (!ghinNumber || !lastName) {
      return NextResponse.json(
        { error: "GHIN number and last name are required." },
        { status: 400 }
      );
    }

    if (!/^\d{7,8}$/.test(ghinNumber.trim())) {
      return NextResponse.json(
        { error: "GHIN number must be 7 or 8 digits." },
        { status: 400 }
      );
    }

    const ghin = ghinNumber.trim();
    const last = lastName.trim();

    // ── Strategy 1: Try source=GHINcom without a token (works as of 2024) ────
    let ghinResponse = await callGhinApi(ghin, last);

    // ── Strategy 2: If that fails and we have a token, try with token ─────────
    if (!ghinResponse.ok && GHIN_API_TOKEN) {
      ghinResponse = await callGhinApi(ghin, last, GHIN_API_TOKEN);
    }

    // ── Handle errors ─────────────────────────────────────────────────────────
    if (!ghinResponse.ok) {
      if (ghinResponse.status === 401 || ghinResponse.status === 403) {
        return NextResponse.json(
          {
            error: "GHIN API authentication failed.",
            hint: "To fix: open ghin.com in Chrome, DevTools → Network, search a GHIN number, find the request to api2.ghin.com, look for an Authorization header or token= param, add as GHIN_API_TOKEN in Vercel.",
            configRequired: true,
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: `GHIN API error: ${ghinResponse.status}` },
        { status: 502 }
      );
    }

    const data = await ghinResponse.json();
    const result = parseGhinResponse(data, ghin, last);

    if (!result) {
      return NextResponse.json(
        {
          error:
            "No golfer found with that GHIN number and last name. Please double-check your details.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("GHIN API route error:", err);
    return NextResponse.json(
      { error: "Failed to reach the GHIN API. Please try again." },
      { status: 500 }
    );
  }
}
