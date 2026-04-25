export interface GeminiStudentProfileInput {
  uid: string;
  fullName?: string;
  skills?: string[];
  experience?: string;
  preferredLocation?: string;
}

export interface GeminiJobInput {
  id: string;
  companyId?: string;
  title: string;
  companyName?: string;
  location?: string;
  salary?: string;
  description?: string;
  requirements?: string;
}

export interface JobMatchScoreResult {
  jobId: string;
  matchScore: number;
  aiReasoning: string;
  matchedSkills: string[];
  missingSkills: string[];
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_PARSE_RETRIES = 3;

export interface ParsedProfile {
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
  education: string;
  experienceSummary: string;
  skills: string[];
  projects: Array<{ name: string; summary: string; techStack: string[] }>;
}

export interface ProfileParseResult {
  structuredProfile: ParsedProfile;
  missingFields: string[];
  clarificationQuestions: string[];
  confidence: number;
}

export interface SkillQuestTask {
  title: string;
  action: string;
  expectedOutcome: string;
  estimatedHours: number;
}

export interface SkillQuestResult {
  summary: string;
  gapSkills: string[];
  tasks: SkillQuestTask[];
  reapplyCondition: string;
  expectedScoreGain: number;
}

function clampScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 50;
  }

  const rounded = Math.round(value);
  return Math.min(100, Math.max(0, rounded));
}

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

function normalizeResults(payload: unknown, jobIds: Set<string>): JobMatchScoreResult[] {
  if (!Array.isArray(payload)) {
    throw new Error("Gemini response is not an array.");
  }

  const normalized: JobMatchScoreResult[] = [];

  for (const row of payload) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const jobId = typeof row.jobId === "string" ? row.jobId : "";
    if (!jobId || !jobIds.has(jobId)) {
      continue;
    }

    normalized.push({
      jobId,
      matchScore: clampScore(row.matchScore),
      aiReasoning:
        typeof row.aiReasoning === "string" && row.aiReasoning.trim().length > 0
          ? row.aiReasoning.trim()
          : "No AI reasoning generated.",
      matchedSkills: normalizeArrayString(row.matchedSkills),
      missingSkills: normalizeArrayString(row.missingSkills),
    });
  }

  return normalized;
}

function buildPrompt(student: GeminiStudentProfileInput, jobs: GeminiJobInput[]) {
  const studentSkills = (student.skills ?? []).join(", ");

  return [
    "You are a recruitment matching engine.",
    "Return STRICT JSON only.",
    "Output format: an array of objects.",
    "Each object schema:",
    '{"jobId":"string","matchScore":0-100,"aiReasoning":"string","matchedSkills":["string"],"missingSkills":["string"]}',
    "Rules:",
    "- Include one object for each job in input.",
    "- Keep aiReasoning under 40 words.",
    "- Use realistic matching based on skills, experience and role fit.",
    "- Do not include markdown.",
    "Student profile:",
    JSON.stringify(
      {
        uid: student.uid,
        fullName: student.fullName ?? "",
        experience: student.experience ?? "",
        preferredLocation: student.preferredLocation ?? "",
        skills: student.skills ?? [],
        skillsAsText: studentSkills,
      },
      null,
      2,
    ),
    "Jobs:",
    JSON.stringify(jobs, null, 2),
  ].join("\n");
}

export async function scoreJobsWithGemini(
  student: GeminiStudentProfileInput,
  jobs: GeminiJobInput[],
): Promise<JobMatchScoreResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!student.uid) {
    throw new Error("Missing student uid.");
  }

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return [];
  }

  const endpoint = `${GEMINI_ENDPOINT}/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  const prompt = buildPrompt(student, jobs);
  const jobIds = new Set(jobs.map((job) => job.id));

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
      const parsed = JSON.parse(jsonText) as unknown;
      const normalized = normalizeResults(parsed, jobIds);

      if (normalized.length > 0) {
        return normalized;
      }

      if (attempt === MAX_PARSE_RETRIES) {
        return [];
      }
    } catch {
      if (attempt === MAX_PARSE_RETRIES) {
        throw new Error("Gemini JSON parsing failed after retries.");
      }
    }
  }

  return [];
}