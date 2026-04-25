import { NextRequest, NextResponse } from "next/server";
import {
  scoreJobsWithGemini,
  type GeminiJobInput,
  type GeminiStudentProfileInput,
} from "@/lib/ai/gemini";
import { FieldValue } from "firebase-admin/firestore";

interface MatchJobsRequestBody {
  student?: GeminiStudentProfileInput;
  jobs?: GeminiJobInput[];
}

const DEFAULT_MATCH_RATE_LIMIT_MAX = 6;
const DEFAULT_MATCH_RATE_LIMIT_WINDOW_MS = 60_000;

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

function toRatingDocId(studentId: string, jobId: string) {
  return `${studentId}__${jobId}`;
}

function toSkillList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[;,\n]/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return [] as string[];
}

function normalizeWordSet(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s+#.]/g, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  );
}

function scoreJobsHeuristically(student: GeminiStudentProfileInput, jobs: GeminiJobInput[]) {
  const studentSkills = toSkillList(student.skills);
  const studentSkillSet = new Set(studentSkills);

  return jobs.map((job) => {
    const roleText = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`.trim();
    const roleTokens = normalizeWordSet(roleText);

    const matchedSkills = studentSkills.filter((skill) => roleTokens.has(skill));

    const requirementTokens = Array.from(roleTokens).filter((token) => token.length >= 3);
    const missingSkills = requirementTokens
      .filter((token) => !studentSkillSet.has(token))
      .slice(0, 6);

    const overlapRatio =
      studentSkills.length > 0 ? matchedSkills.length / studentSkills.length : 0;
    const score = Math.max(35, Math.min(95, Math.round(45 + overlapRatio * 50)));

    const aiReasoning =
      matchedSkills.length > 0
        ? `Matched ${matchedSkills.slice(0, 4).join(", ")} with this role's requirements. Improve missing skills to raise your match score.`
        : "Your profile has limited direct overlap with this role's requirements. Add relevant skills and project evidence to improve matching.";

    return {
      jobId: job.id,
      matchScore: score,
      aiReasoning,
      matchedSkills: matchedSkills.slice(0, 8),
      missingSkills,
    };
  });
}

type MatchSource = "gemini" | "heuristic";

type MatchErrorCode =
  | "none"
  | "gemini_empty_result"
  | "gemini_missing_api_key"
  | "gemini_auth_failed"
  | "gemini_forbidden"
  | "gemini_rate_limited"
  | "gemini_http_error"
  | "gemini_parse_failed"
  | "unknown";

function classifyGeminiFailure(error: unknown): MatchErrorCode {
  if (!(error instanceof Error)) {
    return "unknown";
  }

  const message = error.message.toLowerCase();

  if (message.includes("gemini_api_key is not configured")) {
    return "gemini_missing_api_key";
  }

  if (message.includes("json parsing failed")) {
    return "gemini_parse_failed";
  }

  if (message.includes("(401)")) {
    return "gemini_auth_failed";
  }

  if (message.includes("(403)")) {
    return "gemini_forbidden";
  }

  if (message.includes("(429)")) {
    return "gemini_rate_limited";
  }

  if (message.includes("gemini api request failed")) {
    return "gemini_http_error";
  }

  return "unknown";
}

function getRateLimitSettings() {
  const rawMax = Number(process.env.AI_MATCH_RATE_LIMIT_MAX ?? DEFAULT_MATCH_RATE_LIMIT_MAX);
  const rawWindow = Number(
    process.env.AI_MATCH_RATE_LIMIT_WINDOW_MS ?? DEFAULT_MATCH_RATE_LIMIT_WINDOW_MS,
  );

  return {
    maxRequests:
      Number.isFinite(rawMax) && rawMax > 0 ? Math.floor(rawMax) : DEFAULT_MATCH_RATE_LIMIT_MAX,
    windowMs:
      Number.isFinite(rawWindow) && rawWindow > 0
        ? Math.floor(rawWindow)
        : DEFAULT_MATCH_RATE_LIMIT_WINDOW_MS,
  };
}

async function enforceUidRateLimit(
  adminDb: import("firebase-admin/firestore").Firestore,
  uid: string,
) {
  const nowMs = Date.now();
  const { maxRequests, windowMs } = getRateLimitSettings();
  const limitRef = adminDb.collection("apiRateLimits").doc(`match-jobs__${uid}`);

  const result = await adminDb.runTransaction(async (transaction: import("firebase-admin/firestore").Transaction) => {
    const snapshot = await transaction.get(limitRef);
    const data = snapshot.data() as { windowStartMs?: unknown; count?: unknown } | undefined;

    const existingWindowStartMs =
      typeof data?.windowStartMs === "number" ? data.windowStartMs : nowMs;
    const existingCount = typeof data?.count === "number" ? data.count : 0;

    const resetWindow = nowMs - existingWindowStartMs >= windowMs;
    const nextWindowStartMs = resetWindow ? nowMs : existingWindowStartMs;
    const nextCount = resetWindow ? 1 : existingCount + 1;

    if (!resetWindow && existingCount >= maxRequests) {
      const retryAfterMs = Math.max(windowMs - (nowMs - existingWindowStartMs), 1);
      return { allowed: false, retryAfterMs };
    }

    const payload: Record<string, unknown> = {
      uid,
      route: "match-jobs",
      windowStartMs: nextWindowStartMs,
      count: nextCount,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (!snapshot.exists) {
      payload.createdAt = FieldValue.serverTimestamp();
    }

    transaction.set(limitRef, payload, { merge: true });
    return { allowed: true, retryAfterMs: 0 };
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase/admin");
    const bearer = getBearerToken(request);
    if (!bearer) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(bearer);
    const rateLimitResult = await enforceUidRateLimit(adminDb, decodedToken.uid);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please retry shortly.",
          retryAfterMs: rateLimitResult.retryAfterMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          },
        },
      );
    }

    const body = (await request.json()) as MatchJobsRequestBody;
    const student = body.student;
    const jobs = body.jobs;

    if (!student || typeof student.uid !== "string" || !student.uid) {
      return NextResponse.json({ error: "Invalid student payload." }, { status: 400 });
    }

    if (decodedToken.uid !== student.uid) {
      return NextResponse.json({ error: "Forbidden student context." }, { status: 403 });
    }

    if (!Array.isArray(jobs)) {
      return NextResponse.json({ error: "Invalid jobs payload." }, { status: 400 });
    }

    const limitedJobs = jobs.slice(0, 40);
    let result: Awaited<ReturnType<typeof scoreJobsWithGemini>>;
    let ratingSource: MatchSource = "gemini";
    let errorCode: MatchErrorCode = "none";
    let fallbackReason = "";

    try {
      result = await scoreJobsWithGemini(student, limitedJobs);
      if (result.length === 0) {
        result = scoreJobsHeuristically(student, limitedJobs);
        ratingSource = "heuristic";
        errorCode = "gemini_empty_result";
        fallbackReason = "Gemini returned an empty normalized result set.";

        console.warn("[ai.match-jobs] fallback to heuristic", {
          uid: decodedToken.uid,
          source: ratingSource,
          errorCode,
          fallbackReason,
          jobCount: limitedJobs.length,
        });
      }
    } catch (geminiError) {
      result = scoreJobsHeuristically(student, limitedJobs);
      ratingSource = "heuristic";
      errorCode = classifyGeminiFailure(geminiError);
      fallbackReason =
        geminiError instanceof Error ? geminiError.message : "Unknown Gemini failure.";

      console.error("[ai.match-jobs] Gemini scoring failed, fallback to heuristic", {
        uid: decodedToken.uid,
        source: ratingSource,
        errorCode,
        fallbackReason,
        jobCount: limitedJobs.length,
      });
    }

    const uniqueJobIds = Array.from(new Set(limitedJobs.map((job) => job.id).filter(Boolean)));
    const jobSnapshots = await Promise.all(
      uniqueJobIds.map((jobId) => adminDb.collection("jobs").doc(jobId).get()),
    );
    const companyIdByJobId = new Map<string, string>();
    for (const snapshot of jobSnapshots) {
      if (!snapshot.exists) {
        continue;
      }

      const companyId = snapshot.get("companyId");
      if (typeof companyId === "string" && companyId) {
        companyIdByJobId.set(snapshot.id, companyId);
      }
    }

    const targets = result.map((match) => {
      const sourceJob = limitedJobs.find((job) => job.id === match.jobId);
      const ratingDocId = toRatingDocId(student.uid, match.jobId);
      const ratingRef = adminDb.collection("ratingResults").doc(ratingDocId);

      return {
        match,
        sourceJob,
        ratingRef,
      };
    });

    const existingSnapshots = await Promise.all(targets.map((target) => target.ratingRef.get()));

    const writes = targets.map((target, index) => {
      const existingSnapshot = existingSnapshots[index];
      const payload: Record<string, unknown> = {
        studentId: student.uid,
        jobId: target.match.jobId,
        companyId:
          companyIdByJobId.get(target.match.jobId) ?? target.sourceJob?.companyId ?? "",
        score: target.match.matchScore,
        matchScore: target.match.matchScore,
        reason: target.match.aiReasoning,
        reasoning: target.match.aiReasoning,
        matchedSkills: target.match.matchedSkills,
        missingSkills: target.match.missingSkills,
        source: ratingSource,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // Strict mode: createdAt is immutable once the document exists.
      if (!existingSnapshot.exists) {
        payload.createdAt = FieldValue.serverTimestamp();
      } else if (!existingSnapshot.get("createdAt")) {
        // Backfill createdAt for legacy docs so orderBy("createdAt") queries can include them.
        payload.createdAt = FieldValue.serverTimestamp();
      }

      return target.ratingRef.set(payload, { merge: true });
    });

    await Promise.all(writes);

    return NextResponse.json({
      matches: result,
      source: ratingSource,
      errorCode,
      fallbackReason: ratingSource === "heuristic" ? fallbackReason : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to score jobs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}