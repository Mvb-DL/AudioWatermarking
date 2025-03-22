// app/api/[action]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: { action: string } }
) {
  try {
    // Dynamische Parameter asynchron abrufen
    const params = await Promise.resolve(context.params);
    const { action } = params;

    // Versuche, den JSON-Body zu parsen (falls vorhanden)
    const body = await request.json().catch(() => ({}));

    if (action === "fingerprint") {
      // Logik für /api/fingerprint
      return NextResponse.json(
        { message: "Fingerprint endpoint aufgerufen", data: body },
        { status: 200 }
      );
    } else if (action === "compare") {
      // Logik für /api/compare
      return NextResponse.json(
        { message: "Compare endpoint aufgerufen", data: body },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Endpoint nicht gefunden" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Fehler in der API-Route:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
