"use client";

import React from "react";
import {
  Sparkles,
  Briefcase,
  ChevronRight,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { JobMatch } from "@/lib/types/jobs";

interface JobMatchDetailsProps {
  job: JobMatch;
  onClose: () => void;
  onApply: () => void;
}

export default function JobMatchDetails({
  job,
  onClose,
  onApply,
}: JobMatchDetailsProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-1/2 -translate-y-1/2 right-0 md:right-6 z-50 w-full sm:w-125 lg:w-150 h-screen md:h-[90vh] md:max-h-212.5 bg-white border-l md:border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 md:rounded-2xl shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors bg-white rounded-full p-1 border border-slate-200 shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm mb-4">
            <Building2 className="w-6 h-6 text-slate-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
            {job.role}
          </h2>
          <p className="text-indigo-600 font-medium text-sm">{job.company}</p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Deep AI Analysis
            </h3>
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="flex items-end gap-2 mb-3">
                <span
                  className={`text-4xl font-black leading-none ${
                    job.matchScore >= 80
                      ? "text-emerald-600"
                      : job.matchScore >= 60
                        ? "text-amber-600"
                        : "text-rose-600"
                  }`}
                >
                  {job.matchScore}%
                </span>
                <span className="text-sm font-bold text-slate-700 pb-1">
                  Resume Match
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {job.aiReasoning}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Skills Breakdown
            </h3>
            <div className="space-y-2">
              {job.matchedSkills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {skill}
                </div>
              ))}
              {job.missingSkills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-rose-50/50"
                >
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-slate-500 line-through decoration-slate-300">
                    {skill}
                  </span>
                  <span className="text-xs text-rose-500 font-medium ml-auto">
                    Missing
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              About the Role
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <button
            onClick={onApply}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
          >
            <Briefcase className="w-4 h-4" /> 1-Click Apply
          </button>
        </div>
      </div>
    </>
  );
}
