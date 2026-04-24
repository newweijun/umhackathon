"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResumeAnalysis() {
  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full border-4 border-amber-400 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-black text-slate-800">72</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Current ATS Score: Fair
          </h2>
          <p className="text-slate-500 mt-1">
            Your latest resume for Fullstack Intern is missing some critical
            keywords and quantifiable metrics. Fixing these will highly increase
            your chances of passing automated screenings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weaknesses Card */}
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
          <h3 className="font-bold text-rose-800 flex items-center gap-2 mb-4">
            <AlertTriangle size={20} /> Critical Weaknesses
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-rose-900">
              <span className="font-bold">•</span>
              <div>
                <strong>Lack of Metrics:</strong> You stated you Improved load
                speed but did not mention the initial vs final speed, or the
                tools used to measure it.
              </div>
            </li>
            <li className="flex gap-3 text-sm text-rose-900">
              <span className="font-bold">•</span>
              <div>
                <strong>Missing Keywords:</strong> The job description asks for
                Git and Agile, neither of which appear in your Core Skills
                section.
              </div>
            </li>
          </ul>
        </div>

        {/* Strengths Card */}
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <h3 className="font-bold text-emerald-800 flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} /> Strengths
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-emerald-900">
              <span className="font-bold">•</span>
              <div>
                <strong>Clear Stack Alignment:</strong> Your explicit mention of
                React and Next.js perfectly aligns with modern frontend
                requirements.
              </div>
            </li>
            <li className="flex gap-3 text-sm text-emerald-900">
              <span className="font-bold">•</span>
              <div>
                <strong>Clean Formatting:</strong> The AI parser was able to
                extract your contact info and education history with 100%
                accuracy.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
