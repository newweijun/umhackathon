"use client";

import React from "react";
import { Plus, FileSearch, Download } from "lucide-react";

export default function ResumeHistory() {
  const pastResumes = [
    { id: 1, date: "2026-04-10", role: "Frontend Developer", score: 85 },
    { id: 2, date: "2026-03-22", role: "Fullstack Intern", score: 72 },
    { id: 3, date: "2026-01-15", role: "General Application", score: 55 },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-bold text-lg">Saved Resumes</h2>
        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
          <Plus size={16} /> Upload External Resume
        </button>
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
            <th className="px-6 py-4 font-semibold text-slate-700 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pastResumes.map((resume) => (
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
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button
                    className="text-slate-400 hover:text-indigo-600 transition"
                    title="Analyze"
                  >
                    <FileSearch size={18} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-indigo-600 transition"
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
