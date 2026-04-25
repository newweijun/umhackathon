import {
  type ProfileParseResult,
  type SkillQuestResult,
} from "@/lib/ai/gemini";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_PARSE_RETRIES = 3;

function extractJsonText(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return withoutFence.trim();
  }

  return trimmed;
}

function normalizeArrayString(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((entry): entry is string => typeof entry === "string").slice(0, 12);
}

async function callGeminiJson(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const endpoint = `${GEMINI_ENDPOINT}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= MAX_PARSE_RETRIES; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Gemini API request failed (${response.status}): ${responseText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonText = extractJsonText(text);

    try {
      return JSON.parse(jsonText) as unknown;
    } catch {
      if (attempt === MAX_PARSE_RETRIES) {
        throw new Error("Gemini JSON parsing failed after retries.");
      }
    }
  }

  throw new Error("Gemini API returned no parsable JSON.");
}

export async function parseProfileWithGemini(input: {
  rawText: string;
  priorAnswers?: Record<string, string>;
}): Promise<ProfileParseResult> {
  const prompt = [
    "You are an AI resume parser and clarification planner.",
    "Return STRICT JSON only.",
    "Schema:",
    '{"structuredProfile":{"fullName":"","email":"","phone":"","targetRole":"","education":"","experienceSummary":"","skills":[""],"projects":[{"name":"","summary":"","techStack":[""]}]},"missingFields":[""],"clarificationQuestions":[""],"confidence":0}',
    "Rules:",
    "- confidence is 0-100 number.",
    "- missingFields must be concise machine-readable keys.",
    "- clarificationQuestions max 3 questions and must directly target missing fields.",
    "Raw profile text:",
    input.rawText,
    "Prior clarification answers (if any):",
    JSON.stringify(input.priorAnswers ?? {}, null, 2),
  ].join("\n");

  const parsed = (await callGeminiJson(prompt)) as Partial<ProfileParseResult>;

  return {
    structuredProfile: {
      fullName: parsed.structuredProfile?.fullName ?? "",
      email: parsed.structuredProfile?.email ?? "",
      phone: parsed.structuredProfile?.phone ?? "",
      targetRole: parsed.structuredProfile?.targetRole ?? "",
      education: parsed.structuredProfile?.education ?? "",
      experienceSummary: parsed.structuredProfile?.experienceSummary ?? "",
      skills: normalizeArrayString(parsed.structuredProfile?.skills),
      projects: Array.isArray(parsed.structuredProfile?.projects)
        ? parsed.structuredProfile.projects
            .filter((project) => project && typeof project === "object")
            .map((project) => ({
              name: typeof project.name === "string" ? project.name : "",
              summary: typeof project.summary === "string" ? project.summary : "",
              techStack: normalizeArrayString(project.techStack),
            }))
            .slice(0, 8)
        : [],
    },
    missingFields: normalizeArrayString(parsed.missingFields),
    clarificationQuestions: normalizeArrayString(parsed.clarificationQuestions).slice(0, 3),
    confidence:
      typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
        ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
        : 50,
  };
}

export async function generateSkillQuestWithGemini(input: {
  studentProfileSummary: string;
  jobSummary: string;
  rejectionReason: string;
}): Promise<SkillQuestResult> {
  const prompt = [
    "You are an AI career coach generating an actionable skill quest.",
    "Return STRICT JSON only.",
    "Schema:",
    '{"summary":"","gapSkills":[""],"tasks":[{"title":"","action":"","expectedOutcome":"","estimatedHours":1}],"reapplyCondition":"","expectedScoreGain":0}',
    "Rules:",
    "- tasks length between 2 and 5.",
    "- estimatedHours must be integer between 1 and 20.",
    "- expectedScoreGain is 0-100 integer.",
    "Student profile summary:",
    input.studentProfileSummary,
    "Job summary:",
    input.jobSummary,
    "Rejection reason:",
    input.rejectionReason,
  ].join("\n");

  const parsed = (await callGeminiJson(prompt)) as Partial<SkillQuestResult>;

  const tasks = Array.isArray(parsed.tasks)
    ? parsed.tasks
        .filter((task) => task && typeof task === "object")
        .map((task) => ({
          title: typeof task.title === "string" ? task.title : "",
          action: typeof task.action === "string" ? task.action : "",
          expectedOutcome:
            typeof task.expectedOutcome === "string" ? task.expectedOutcome : "",
          estimatedHours:
            typeof task.estimatedHours === "number" && Number.isFinite(task.estimatedHours)
              ? Math.max(1, Math.min(20, Math.round(task.estimatedHours)))
              : 4,
        }))
        .slice(0, 5)
    : [];

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "Improve core role-fit skills.",
    gapSkills: normalizeArrayString(parsed.gapSkills).slice(0, 8),
    tasks,
    reapplyCondition:
      typeof parsed.reapplyCondition === "string"
        ? parsed.reapplyCondition
        : "Complete at least 2 tasks and update your portfolio before reapplying.",
    expectedScoreGain:
      typeof parsed.expectedScoreGain === "number" && Number.isFinite(parsed.expectedScoreGain)
        ? Math.max(0, Math.min(100, Math.round(parsed.expectedScoreGain)))
        : 10,
  };
}
