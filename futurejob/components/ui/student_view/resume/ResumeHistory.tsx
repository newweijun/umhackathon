"use client";

import React, { useEffect, useState } from "react";
import { Plus, FileSearch, Download } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { getStudentResumes } from "@/lib/services/workflows"; // Adjust import

// 1. Define what the data coming from Firebase looks like
interface ResumeRecord {
  id: string;
  role: string;
  score: number;
  createdAt?: {
    toDate: () => Date;
  };
  [key: string]: unknown; // Allows any other fields from Firestore without throwing errors
}

export default function ResumeHistory() {
  const [pastResumes, setPastResumes] = useState<(ResumeRecord & { date: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setPastResumes([]);
        setLoading(false);
        return;
      }

      try {
        const resumes = (await getStudentResumes(user.uid)) as ResumeRecord[];

        // 2. Tell TypeScript that 'res' is a ResumeRecord
        const formatted = resumes.map((res) => {
          // Handle Firestore timestamps safely now
          const dateObj = res.createdAt?.toDate
            ? res.createdAt.toDate()
            : new Date();

          return {
            ...res,
            date: dateObj.toLocaleDateString("en-MY", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-bold text-lg">Saved Resumes</h2>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold text-slate-700">
              Target Role
            </th>
            <th className="px-6 py-4 font-semibold text-slate-700">
              Generated Date
            </th>
            <th className="px-6 py-4 font-semibold text-slate-700">
              ATS Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-slate-500">
                Loading history...
              </td>
            </tr>
          ) : pastResumes.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-8 text-center text-slate-500">
                No resumes generated yet.
              </td>
            </tr>
          ) : (
            pastResumes.map((resume) => (
              <tr key={resume.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {resume.role}
                </td>
                <td className="px-6 py-4 text-slate-500">{resume.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${
                      resume.score >= 80
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : resume.score >= 60
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {resume.score}/100
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
