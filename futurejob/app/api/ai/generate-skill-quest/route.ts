import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { generateSkillQuestWithGemini } from "@/lib/ai/workflow";
import { type SkillQuestResult } from "@/lib/ai/gemini";

interface GenerateSkillQuestRequestBody {
  studentId?: string;
  jobId?: string;
  applicationId?: string;
  rejectionReason?: string;
}

function getBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }
  return token;
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function fallbackSkillQuest(rejectionReason: string): SkillQuestResult {
  return {
    summary: "Focus on improving role-specific technical depth and evidence of execution.",
    gapSkills: ["technical-depth", "project-evidence", "problem-solving"],
    tasks: [
      {
        title: "Build one role-aligned portfolio project",
        action: "Create and publish one end-to-end project matching the target job stack.",
        expectedOutcome: "A public demo and repository proving practical capability.",
        estimatedHours: 8,
      },
      {
        title: "Close top 2 skill gaps",
        action: "Complete focused practice and mini tasks on the top two missing skills.",
        expectedOutcome: "Stronger interview answers and implementation confidence.",
        estimatedHours: 6,
      },
      {
        title: "Update resume with measurable outcomes",
        action: "Rewrite project bullets with concrete metrics and impact statements.",
        expectedOutcome: "Resume demonstrates business impact and ownership.",
        estimatedHours: 3,
      },
    ],
    reapplyCondition:
      "Reapply after finishing at least 2 tasks and attaching one updated project proof.",
    expectedScoreGain: 12,
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
    const body = (await request.json()) as GenerateSkillQuestRequestBody;

    const studentId = toText(body.studentId);
    const jobId = toText(body.jobId);
    const applicationId = toText(body.applicationId);
    const rejectionReason = toText(body.rejectionReason) || "Application rejected after review.";

    if (!studentId || !jobId) {
      return NextResponse.json({ error: "studentId and jobId are required." }, { status: 400 });
    }

    const jobSnapshot = await adminDb.collection("jobs").doc(jobId).get();
    if (!jobSnapshot.exists) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const jobCompanyId = toText(jobSnapshot.get("companyId"));
    const requesterRole = toText((decodedToken as Record<string, unknown>).role);

    if (decodedToken.uid !== jobCompanyId && requesterRole !== "admin") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const profileSnapshot = await adminDb.collection("candidateProfiles").doc(studentId).get();
    const profileData = profileSnapshot.exists ? profileSnapshot.data() ?? {} : {};

    const studentProfileSummary = JSON.stringify(
      {
        fullName: toText(profileData.fullName) || toText(profileData.name),
        skills: Array.isArray(profileData.skills) ? profileData.skills : toText(profileData.skills),
        experience: toText(profileData.experience),
        education: toText(profileData.education),
      },
      null,
      2,
    );

    const jobSummary = JSON.stringify(
      {
        title: toText(jobSnapshot.get("title")),
        expectations: toText(jobSnapshot.get("expectations")),
        aboutJob: toText(jobSnapshot.get("aboutJob")),
        keyResponsibilities: toText(jobSnapshot.get("keyResponsibilities")),
      },
      null,
      2,
    );

    let quest: SkillQuestResult;
    let source: "gemini" | "heuristic" = "gemini";

    try {
      quest = await generateSkillQuestWithGemini({
        studentProfileSummary,
        jobSummary,
        rejectionReason,
      });
    } catch {
      quest = fallbackSkillQuest(rejectionReason);
      source = "heuristic";
    }

    const questPayload = {
      studentId,
      jobId,
      companyId: jobCompanyId,
      applicationId: applicationId || null,
      rejectionReason,
      source,
      ...quest,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const questRef = await adminDb.collection("skillQuests").add(questPayload);

    await adminDb.collection("notifications").add({
      userId: studentId,
      title: "New Skill Quest Generated",
      body: "Your application was rejected, but we generated an AI improvement plan for your next attempt.",
      type: "application_rejected",
      applicationId: applicationId || null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: questRef.id,
      source,
      quest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate skill quest.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
