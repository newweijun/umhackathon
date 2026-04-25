"use client";

import React, { useState } from "react";
import {
  Download,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  X,
} from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";
import { updateCandidateProfile } from "@/lib/services/candidateProfiles";
import { saveResumeRecord } from "@/lib/services/workflows";

// --- INTERFACES ---
export interface ExperienceRecord {
  id: string;
  role: string;
  company: string;
  time: string;
  description: string;
}

export interface SectionVisibility {
  [key: string]: boolean;
}

export default function ResumeBuilder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawProfileInput, setRawProfileInput] = useState("");
  const [isParsingProfile, setIsParsingProfile] = useState(false);
  const [parseError, setParseError] = useState("");
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});

  // 1. Fixed Header Data
  const [headerData, setHeaderData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+60 12-345 6789",
  });

  // 2. Dynamic Section Data
  const [basicSections, setBasicSections] = useState({
    education: "B.Sc. Computer Science - 3.8 CGPA",
    skills: "React, Next.js, PostgreSQL, TailwindCSS",
    references: "Available upon request",
  });

  // 3. Dynamic Experience List
  const [experiences, setExperiences] = useState<ExperienceRecord[]>([
    {
      id: "1",
      role: "Software Intern",
      company: "TechCorp",
      time: "Jan 2024 - Present",
      description:
        "• Developed REST APIs\n• Improved database query speeds by 20%\n• Collaborated with design team for UI implementation",
    },
  ]);

  // 4. Section Visibility Toggles
  const [visibility, setVisibility] = useState<SectionVisibility>({
    education: true,
    experience: true,
    skills: true,
    references: true,
  });

  // 5. Drag & Drop Ordering
  const [sectionOrder, setSectionOrder] = useState([
    "education",
    "experience",
    "skills",
    "references",
  ]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // --- HANDLERS ---
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderData({ ...headerData, [e.target.name]: e.target.value });
  };

  const handleBasicSectionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setBasicSections({ ...basicSections, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (section: string) => {
    setVisibility((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExperienceChange = (
    id: string,
    field: keyof ExperienceRecord,
    value: string,
  ) => {
    setExperiences((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    );
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        role: "",
        company: "",
        time: "",
        description: "",
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIdx === null || draggedIdx === index) return;
    const newOrder = [...sectionOrder];
    const draggedItem = newOrder[draggedIdx];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, draggedItem);
    setDraggedIdx(index);
    setSectionOrder(newOrder);
  };

  const clearForm = () => {
    setHeaderData({ fullName: "", email: "", phone: "" });
    setBasicSections({ education: "", skills: "", references: "" });
    setExperiences([]);
  };

  const handleAiParseProfile = async () => {
    const user = firebaseAuth.currentUser;
    if (!user) {
      setParseError("Please sign in first.");
      return;
    }

    if (!rawProfileInput.trim()) {
      setParseError("Paste your raw resume/profile text first.");
      return;
    }

    setIsParsingProfile(true);
    setParseError("");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/ai/parse-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          rawText: rawProfileInput,
          priorAnswers: clarificationAnswers,
        }),
      });

      const payload = (await response.json()) as {
        structuredProfile?: {
          fullName?: string;
          email?: string;
          phone?: string;
          education?: string;
          experienceSummary?: string;
          skills?: string[];
          projects?: Array<{ name?: string; summary?: string; techStack?: string[] }>;
        };
        needsClarification?: boolean;
        clarificationQuestions?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "AI parse failed.");
      }

      const profile = payload.structuredProfile;
      if (profile) {
        setHeaderData((prev) => ({
          ...prev,
          fullName: profile.fullName || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
        }));

        setBasicSections((prev) => ({
          ...prev,
          education: profile.education || prev.education,
          skills:
            Array.isArray(profile.skills) && profile.skills.length > 0
              ? profile.skills.join(", ")
              : prev.skills,
        }));

        if (profile.experienceSummary) {
          setExperiences((prev) => {
            if (prev.length === 0) {
              return [
                {
                  id: Date.now().toString(),
                  role: "",
                  company: "",
                  time: "",
                  description: profile.experienceSummary || "",
                },
              ];
            }

            const first = prev[0];
            return [
              {
                ...first,
                description: first.description || profile.experienceSummary || "",
              },
              ...prev.slice(1),
            ];
          });
        }

        await updateCandidateProfile(user.uid, {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          education: profile.education,
          experience: profile.experienceSummary,
          skills: profile.skills,
          projects: profile.projects,
        });
      }

      setClarificationQuestions(payload.clarificationQuestions ?? []);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "AI parse failed.");
    } finally {
      setIsParsingProfile(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("resume-preview");
      if (!element) return;

      const safeFileName = `${headerData.fullName.trim().replace(/\s+/g, "_").toLowerCase()}_resume.pdf`;

      const printElement = element.cloneNode(true) as HTMLElement;
      printElement.style.padding = "15mm";
      printElement.style.width = "210mm";
      printElement.style.height = "auto";

      const opt = {
        margin: 0,
        filename: safeFileName,
        image: { type: "jpeg" as const, quality: 1 },
        html2canvas: {
          scale: 4,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(printElement).save();

      const user = firebaseAuth.currentUser;
      if (user) {
        await saveResumeRecord({
          studentId: user.uid,
          targetRole: headerData.fullName || "Student",
          atsScore: Math.floor(Math.random() * (95 - 70 + 1)) + 70,
          resumeData: {
            header: headerData,
            basics: basicSections,
            experiences: experiences,
            order: sectionOrder,
            visibility: visibility,
          },
        });
      }
    } catch (error: any) {
      console.error("Export failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderFormSection = (sectionId: string, index: number) => {
    const isVisible = visibility[sectionId];

    return (
      <div
        key={sectionId}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragEnter={() => handleDragEnter(index)}
        onDragOver={(e) => e.preventDefault()}
        className="bg-slate-50 border border-slate-200 rounded-lg p-4 transition-all hover:border-indigo-300 group cursor-move"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <GripVertical
              className="text-slate-400 group-hover:text-indigo-500"
              size={16}
            />
            <h3 className="font-bold text-slate-800 capitalize">{sectionId}</h3>
          </div>
          <button
            onClick={() => toggleVisibility(sectionId)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
              isVisible
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            {isVisible ? (
              <>
                <Eye size={14} /> Included
              </>
            ) : (
              <>
                <EyeOff size={14} /> Hidden
              </>
            )}
          </button>
        </div>

        {isVisible && (
          <div
            className="cursor-text"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          >
            {sectionId === "experience" ? (
              <div className="space-y-4">
                {experiences.map((exp, i) => (
                  <div
                    key={exp.id}
                    className="p-3 bg-white border border-slate-200 rounded-md relative"
                  >
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"
                    >
                      <X size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-3 pr-6">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.role}
                        onChange={(e) =>
                          handleExperienceChange(exp.id, "role", e.target.value)
                        }
                        className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:border-indigo-400"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) =>
                          handleExperienceChange(
                            exp.id,
                            "company",
                            e.target.value,
                          )
                        }
                        className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:border-indigo-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Time (e.g. Jan 2024 - Present)"
                      value={exp.time}
                      onChange={(e) =>
                        handleExperienceChange(exp.id, "time", e.target.value)
                      }
                      className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:border-indigo-400 mb-3"
                    />
                    <textarea
                      placeholder="Description & Achievements"
                      value={exp.description}
                      onChange={(e) =>
                        handleExperienceChange(
                          exp.id,
                          "description",
                          e.target.value,
                        )
                      }
                      className="w-full p-2 border border-slate-200 rounded text-sm outline-none focus:border-indigo-400 min-h-20 resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-md text-sm font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-colors flex justify-center items-center gap-1"
                >
                  <Plus size={16} /> Add Experience
                </button>
              </div>
            ) : (
              <textarea
                name={sectionId}
                // @ts-expect-error sectionId is a valid key of basicSections
                value={basicSections[sectionId]}
                onChange={handleBasicSectionChange}
                placeholder={`Enter your ${sectionId} details...`}
                className="w-full p-3 border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-400 min-h-20 resize-y bg-white"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-full max-h-[calc(100vh-8rem)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-xl text-slate-900">Resume Details</h2>
            <p className="text-xs text-slate-500 mt-1">
              Drag sections to reorder. Toggle to hide/show.
            </p>
          </div>
          <button
            onClick={clearForm}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="font-bold text-indigo-900 mb-2 text-sm">
              AI Resume Parse & Clarification
            </h3>
            <p className="text-xs text-indigo-700 mb-3">
              Paste unstructured resume text. AI will extract fields and ask follow-up questions when data is missing.
            </p>
            <textarea
              value={rawProfileInput}
              onChange={(e) => setRawProfileInput(e.target.value)}
              placeholder="Paste your resume text, profile summary, project details, and skills here..."
              className="w-full p-3 border border-indigo-200 rounded-md text-sm outline-none focus:border-indigo-400 min-h-28 resize-y bg-white"
            />

            {clarificationQuestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {clarificationQuestions.map((question, index) => (
                  <div key={question}>
                    <label className="block text-xs font-semibold text-indigo-900 mb-1">
                      Follow-up {index + 1}
                    </label>
                    <p className="text-xs text-indigo-700 mb-1">{question}</p>
                    <input
                      type="text"
                      value={clarificationAnswers[question] || ""}
                      onChange={(e) =>
                        setClarificationAnswers((prev) => ({
                          ...prev,
                          [question]: e.target.value,
                        }))
                      }
                      className="w-full p-2 border border-indigo-200 rounded text-sm outline-none focus:border-indigo-400 bg-white"
                      placeholder="Your answer..."
                    />
                  </div>
                ))}
              </div>
            )}

            {parseError && (
              <p className="mt-2 text-xs text-rose-600 font-medium">{parseError}</p>
            )}

            <button
              onClick={handleAiParseProfile}
              disabled={isParsingProfile}
              className="mt-3 px-3 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isParsingProfile ? "Parsing..." : "Parse with AI"}
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
              Personal Information (Fixed Top)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                name="fullName"
                placeholder="Full Name"
                value={headerData.fullName}
                onChange={handleHeaderChange}
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="email"
                  placeholder="Email Address"
                  value={headerData.email}
                  onChange={handleHeaderChange}
                  type="email"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400"
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  value={headerData.phone}
                  onChange={handleHeaderChange}
                  type="text"
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sectionOrder.map((sectionId, index) =>
              renderFormSection(sectionId, index),
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="animate-pulse">Exporting...</span>
            ) : (
              <>
                <Download size={18} /> Export as PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-200 rounded-xl p-4 md:p-8 flex items-start justify-center overflow-auto h-250 lg:h-full max-h-[calc(100vh-8rem)] border border-slate-300 shadow-inner">
        <div
          id="resume-preview"
          className="bg-[#ffffff] w-full max-w-[210mm] min-h-[297mm] p-10 md:p-14 shadow-md shrink-0 text-[#000000] overflow-hidden"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            lineHeight: "1.5",
          }}
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-1 text-[#000000]">
              {headerData.fullName || "Your Name"}
            </h1>
            <div className="text-[13px] flex items-center justify-center gap-2">
              <span>{headerData.email || "email@example.com"}</span>
              <span>|</span>
              <span>{headerData.phone || "Phone Number"}</span>
            </div>
          </div>

          {sectionOrder.map((sectionId) => {
            if (!visibility[sectionId]) return null;

            return (
              <div key={sectionId} className="mb-5">
                {/* MODIFIED: Increased padding-bottom (pb-2) and margin-bottom (mb-3) */}
                <h3 className="text-[14px] font-bold uppercase tracking-widest border-b border-[#000000] pb-2 mb-3">
                  {sectionId}
                </h3>

                {sectionId === "experience" ? (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="text-[14px]">
                            <span className="font-bold">
                              {exp.role || "Job Title"}
                            </span>
                            {exp.company && <span>, {exp.company}</span>}
                          </div>
                          <div className="text-[13px] font-bold text-right shrink-0">
                            {exp.time || "Time Period"}
                          </div>
                        </div>
                        <div className="text-[13px] whitespace-pre-wrap ml-4">
                          {exp.description ||
                            "• Describe your responsibilities and achievements"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[13px] whitespace-pre-wrap">
                    {/* @ts-expect-error sectionId is a valid key of basicSections */}
                    {basicSections[sectionId] ||
                      `Your ${sectionId} details here`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
