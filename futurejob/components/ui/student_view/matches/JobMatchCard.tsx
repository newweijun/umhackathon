"use client";

import React from "react";
import { MapPin, DollarSign, Building2 } from "lucide-react";
import { JobMatch } from "@/lib/types/jobs";

interface JobMatchCardProps {
  job: JobMatch;
  onClick: () => void;
}

export default function JobMatchCard({ job, onClick }: JobMatchCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex flex-col relative overflow-hidden group"
    >
      {/* Decorative Match Highlight Line */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          job.matchScore >= 80
            ? "bg-emerald-500"
            : job.matchScore >= 60
              ? "bg-amber-500"
              : "bg-rose-500"
        }`}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
            <Building2 className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500">
              {job.company}
            </div>
            <div className="font-bold text-slate-900 leading-tight">
              {job.role}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-4">
        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          <MapPin className="w-3 h-3" /> {job.location}
        </span>
        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          <DollarSign className="w-3 h-3" /> {job.salary}
        </span>
      </div>

      {/* AI Insight Snippet */}
      <div className="mt-auto bg-indigo-50/50 p-3 rounded-lg border border-indigo-50 flex gap-3">
        <div className="shrink-0 pt-0.5">
          <div
            className={`text-lg font-black leading-none ${
              job.matchScore >= 80
                ? "text-emerald-600"
                : job.matchScore >= 60
                  ? "text-amber-600"
                  : "text-rose-600"
            }`}
          >
            {job.matchScore}%
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">
            Match
          </div>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
          {job.aiReasoning}
        </p>
      </div>
    </div>
  );
}
