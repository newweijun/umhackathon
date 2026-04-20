"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { SortOption } from "@/lib/types/jobs";

interface JobMatchHeaderProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export default function JobMatchHeader({
  sortBy,
  onSortChange,
}: JobMatchHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          AI Job Matches
        </h1>
        <p className="text-slate-500 mt-1">
          Roles specifically tailored to your resume, skills, and experience.
        </p>
      </div>

      <div className="flex gap-3 w-full md:w-auto text-sm">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-sm"
        >
          <option value="match">Sort by: Match Score</option>
          <option value="newest">Sort by: Newest</option>
          <option value="salary">Sort by: Salary</option>
        </select>
      </div>
    </header>
  );
}
