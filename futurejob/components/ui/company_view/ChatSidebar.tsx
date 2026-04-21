"use client";

import { type ApplicationRecord } from "@/lib/services/applications";
import { type CandidateProfileRecord } from "@/lib/services/candidateProfiles";

interface ChatSidebarProps {
  applications: ApplicationRecord[];
  candidates: Map<string, CandidateProfileRecord>;
  selectedId: string | null;
  onSelect: (app: ApplicationRecord) => void;
}

export default function ChatSidebar({ applications, candidates, selectedId, onSelect }: ChatSidebarProps) {
  return (
    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 shrink-0 flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white/50">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversations</div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {applications.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-500 italic">
            No approved candidates yet.
          </div>
        ) : (
          applications.map((app) => {
            const candidate = candidates.get(app.studentId);
            const isSelected = selectedId === app.id;
            const initials = (candidate?.fullName || candidate?.name || "??")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <button
                key={app.id}
                onClick={() => onSelect(app)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 border ${
                  isSelected 
                    ? "bg-white border-indigo-100 shadow-sm ring-1 ring-indigo-50" 
                    : "border-transparent hover:bg-white/60 hover:border-slate-200"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-semibold text-sm truncate ${isSelected ? "text-indigo-900" : "text-slate-900"}`}>
                    {candidate?.fullName || candidate?.name || "Unknown Candidate"}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    Job ID: {app.jobId.slice(-6)}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
