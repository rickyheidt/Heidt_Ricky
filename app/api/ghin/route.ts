import { NextRequest, NextResponse } from "next/server";

// ─── GHIN API Configuration ───────────────────────────────────────────────────
//
// The USGA GHIN API is at https://api2.ghin.com/api/v1
//
// To get your GHIN_API_TOKEN, apply for developer access at:
//   https://www.usga.org/content/usga/home-page/handicapping/ghin.html
//
// Once approved, add the token to Vercel:
//   Project → Settings → Environment Variables → GHIN_API_TOKEN
//
// ─────────────────────────────────────────────────────────────────────────────

const GHIN_API_BASE = "https://api2.ghin.com/api/v1";
const GHIN_API_TOKEN = process.env.GHIN_API_TOKEN;

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

    // ── No API token configured ─────────────────────────────────────────────
    if (!GHIN_API_TOKEN) {
      return NextResponse.json(
        {
          error: "GHIN_API_TOKEN is not configured.",
          hint: "Add your GHIN API token to Vercel environment variables. Apply for access at usga.org/ghin",
          configRequired: true,
        },
        { status: 503 }
      );
    }

    // ── Call the GHIN API ────────────────────────────────────────────────────
    const params = new URLSearchParams({
      golfer_id: ghinNumber.trim(),
      last_name: lastName.trim(),
      token: GHIN_API_TOKEN,
    });

    const ghinResponse = await fetch(
      `${GHIN_API_BASE}/golfers/search.json?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!ghinResponse.ok) {
      if (ghinResponse.status === 401 || ghinResponse.status === 403) {
        return NextResponse.json(
          {
            error: "GHIN API token is invalid or expired.",
            hint: "Check your GHIN_API_TOKEN in Vercel environment variables.",
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
    const golfers = data.golfers as Array<Record<string, unknown>>;

    if (!golfers || golfers.length === 0) {
      return NextResponse.json(
        {
          error:
            "No golfer found with that GHIN number and last name. Please double-check your details.",
        },
        { status: 404 }
      );
    }

    const golfer = golfers[0];

    // Parse handicap — GHIN returns it as "14.2" or "+2.1" (plus = scratch or better)
    const rawHcp = String(golfer.handicap_index ?? golfer.HI ?? "0");
    const isPlus = rawHcp.startsWith("+");
    const handicapIndex = isPlus
      ? -parseFloat(rawHcp.slice(1))
      : parseFloat(rawHcp);

    const result: GhinGolferResult = {
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

    return NextResponse.json(result);
  } catch (err) {
    console.error("GHIN API route error:", err);
    return NextResponse.json(
      { error: "Failed to reach the GHIN API. Please try again." },
      { status: 500 }
    );
  }
}
