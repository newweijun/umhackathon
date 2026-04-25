import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { parseProfileWithGemini } from "@/lib/ai/workflow";
import { type ProfileParseResult } from "@/lib/ai/gemini";

interface ParseProfileRequestBody {
  rawText?: string;
  priorAnswers?: Record<string, string>;
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

function parseFallback(rawText: string): ProfileParseResult {
  const emailMatch = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = rawText.match(/(\+?\d[\d\s-]{7,}\d)/);

  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const skills = Array.from(
    new Set(
      rawText
        .split(/[;,\n]/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1)
        .slice(0, 10),
    ),
  );

  const fullName = lines[0] ?? "";

  const missingFields: string[] = [];
  if (!fullName) missingFields.push("fullName");
  if (!emailMatch) missingFields.push("email");
  if (skills.length === 0) missingFields.push("skills");
  if (rawText.length < 60) missingFields.push("experienceSummary");

  const clarificationQuestions = missingFields.slice(0, 3).map((field) => {
    if (field === "skills") {
      return "Please list your top technical skills separated by commas.";
    }
    if (field === "experienceSummary") {
      return "Can you describe your latest project or work experience in 2-3 sentences?";
    }
    return `Please provide your ${field}.`;
  });

  return {
    structuredProfile: {
      fullName,
      email: emailMatch?.[0] ?? "",
      phone: phoneMatch?.[0] ?? "",
      targetRole: "",
      education: "",
      experienceSummary: rawText.slice(0, 280),
      skills,
      projects: [],
    },
    missingFields,
    clarificationQuestions,
    confidence: 45,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase/admin");

    const bearer = getBearerToken(request);
    if (!bearer) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(bearer);
    const body = (await request.json()) as ParseProfileRequestBody;

    const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";
    if (!rawText) {
      return NextResponse.json({ error: "rawText is required." }, { status: 400 });
    }

    let parseResult: ProfileParseResult;
    let source: "gemini" | "heuristic" = "gemini";

    try {
      parseResult = await parseProfileWithGemini({
        rawText,
        priorAnswers: body.priorAnswers,
      });
    } catch {
      parseResult = parseFallback(rawText);
      source = "heuristic";
    }

    const parsePayload = {
      studentId: decodedToken.uid,
      source,
      rawText,
      priorAnswers: body.priorAnswers ?? {},
      result: parseResult,
      missingFields: parseResult.missingFields,
      clarificationQuestions: parseResult.clarificationQuestions,
      confidence: parseResult.confidence,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("aiParses").add(parsePayload);

    await adminDb
      .collection("candidateProfiles")
      .doc(decodedToken.uid)
      .set(
        {
          fullName: parseResult.structuredProfile.fullName,
          email: parseResult.structuredProfile.email,
          phone: parseResult.structuredProfile.phone,
          skills: parseResult.structuredProfile.skills,
          experience: parseResult.structuredProfile.experienceSummary,
          education: parseResult.structuredProfile.education,
          targetRole: parseResult.structuredProfile.targetRole,
          projects: parseResult.structuredProfile.projects,
          aiProfileParse: {
            source,
            missingFields: parseResult.missingFields,
            confidence: parseResult.confidence,
            updatedAt: FieldValue.serverTimestamp(),
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    return NextResponse.json({
      ...parseResult,
      needsClarification: parseResult.missingFields.length > 0,
      source,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
