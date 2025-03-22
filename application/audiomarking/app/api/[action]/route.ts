import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> }
) {
  const { action } = await context.params;

  try {
    const formData = await request.formData();

    const microserviceURL = "http://127.0.0.1:18080";
    let microserviceEndpoint = "";
    let bodyToSend: BodyInit;

    if (action === "fingerprint") {
      microserviceEndpoint = "/fingerprint";
      const file = formData.get("audio_file");
      if (!file || typeof file === "string") {
        return NextResponse.json(
          { error: "Kein Audiofile gesendet" },
          { status: 400 }
        );
      }
      const msFormData = new FormData();
      msFormData.append("audio_file", file);
      bodyToSend = msFormData;

    } else if (action === "compare") {
      microserviceEndpoint = "/compare";
      const file1 = formData.get("audio1");
      const file2 = formData.get("audio2");
      if (!file1 || !file2 || typeof file1 === "string" || typeof file2 === "string") {
        return NextResponse.json(
          { error: "Beide Audiofiles müssen gesendet werden" },
          { status: 400 }
        );
      }
      const msFormData = new FormData();
      msFormData.append("audio1", file1);
      msFormData.append("audio2", file2);
      bodyToSend = msFormData;

    } else {
      return NextResponse.json(
        { error: "Endpoint nicht gefunden" },
        { status: 404 }
      );
    }

    // Sende Request an Python-Microservice
    const microserviceResponse = await fetch(
      microserviceURL + microserviceEndpoint,
      {
        method: "POST",
        body: bodyToSend,
      }
    );

    const contentType = microserviceResponse.headers.get("content-type") || "";

    const msData = await microserviceResponse.json();
    console.log("📦 JSON-Response vom Microservice:", msData);

    return NextResponse.json(msData, {
      status: microserviceResponse.status,
      headers: {
        "X-From-Python-Microservice": "true",
      },
    });

  } catch (error) {
    console.error("❌ Fehler in der API-Route:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
