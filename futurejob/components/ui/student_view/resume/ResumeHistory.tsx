"use client";

import React, { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getStudentResumes } from "@/lib/services/workflows";

interface ResumeRecord {
  id: string;
  targetRole: string;
  score: number;
  atsScore?: number; // Added to handle both field naming versions
  resumeData?: {
    header: { fullName: string; email: string; phone: string };
    basics: { education: string; skills: string; references: string };
    experiences: Array<{
      id: string;
      role: string;
      company: string;
      time: string;
      description: string;
    }>;
    order: string[];
    visibility: Record<string, boolean>;
  };
  createdAt?: {
    toDate: () => Date;
  };
}

export default function ResumeHistory() {
  const [pastResumes, setPastResumes] = useState<
    (ResumeRecord & { date: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setPastResumes([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch resumes using your existing service
        const resumes = (await getStudentResumes(user.uid)) as ResumeRecord[];

        const formatted = resumes.map((res) => {
          // --- THE SCORE FIX ---
          // This checks for 'score' first, then 'atsScore', then defaults to 0
          const displayScore =
            res.score !== undefined
              ? res.score
              : res.atsScore !== undefined
                ? res.atsScore
                : 0;

          return {
            ...res,
            score: displayScore, // Ensure the 'score' property used in the UI is populated
            date: res.createdAt?.toDate
              ? res.createdAt.toDate().toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Recent",
          };
        });
        setPastResumes(formatted);
      } catch (error) {
        console.error("Failed to load resumes", error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleRedownload = async (resume: ResumeRecord) => {
    if (!resume.resumeData) {
      alert("No text data found for this record.");
      return;
    }

    setIsDownloading(resume.id);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const { header, basics, experiences, order, visibility } =
        resume.resumeData;

      const printElement = document.createElement("div");

      // Spacing Fix: pb: 8px and margin-bottom: 12px for <h3>
      printElement.innerHTML = `
      <div style="
        font-family: 'Times New Roman', Times, serif; 
        padding: 15mm; 
        color: black; 
        background: white; 
        width: 210mm; 
        line-height: 1.5;
        box-sizing: border-box;
      ">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="text-transform: uppercase; margin: 0 0 5px 0; font-size: 24pt; font-weight: bold;">
            ${header.fullName}
          </h1>
          <p style="font-size: 11pt; margin: 0;">
            ${header.email} | ${header.phone}
          </p>
        </div>

        ${order
          .map((sectionId) => {
            if (!visibility[sectionId]) return "";

            return `
            <div style="margin-top: 15px; page-break-inside: avoid;">
              <h3 style="
                text-transform: uppercase; 
                border-bottom: 1.5pt solid black; 
                font-size: 12pt; 
                margin-bottom: 12px; 
                padding-bottom: 8px;
                font-weight: bold;
                letter-spacing: 1px;
              ">
                ${sectionId}
              </h3>
              
              ${
                sectionId === "experience"
                  ? experiences
                      .map(
                        (exp) => `
                  <div style="margin-bottom: 12px; page-break-inside: avoid;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
                      <tr>
                        <td style="text-align: left; font-weight: bold;">
                          ${exp.role}${exp.company ? `, ${exp.company}` : ""}
                        </td>
                        <td style="text-align: right; font-weight: bold;">
                          ${exp.time}
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 10.5pt; white-space: pre-wrap; margin-top: 4px; padding-left: 5px;">
                      ${exp.description}
                    </div>
                  </div>
                `,
                      )
                      .join("")
                  : `<div style="font-size: 10.5pt; white-space: pre-wrap;">${basics[sectionId as keyof typeof basics]}</div>`
              }
            </div>
          `;
          })
          .join("")}
      </div>
    `;

      const opt = {
        margin: 0,
        filename: `${header.fullName.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`,
        image: { type: "jpeg" as const, quality: 1 },
        html2canvas: {
          scale: 4,
          letterRendering: true,
          useCORS: true,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(printElement).save();
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <div>
          <h2 className="font-bold text-lg text-slate-900">Saved Resumes</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Re-generate PDFs from your saved data
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">
                Generated File
              </th>
              <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-700">
                ATS Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : pastResumes.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-slate-400">
                  No history found.
                </td>
              </tr>
            ) : (
              pastResumes.map((resume) => {
                const safeName = (resume.targetRole || "student").toLowerCase();
                const fileName = `${safeName} resume.pdf`;

                return (
                  <tr
                    key={resume.id}
                    className="hover:bg-slate-50 group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <button
                          onClick={() => handleRedownload(resume)}
                          disabled={!!isDownloading}
                          className="font-medium text-slate-700 hover:text-indigo-600 hover:underline transition-colors text-sm text-left flex items-center gap-2"
                        >
                          {fileName}
                          {isDownloading === resume.id && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{resume.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          resume.score >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {resume.score}/100
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
