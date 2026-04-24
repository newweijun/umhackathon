"use client";

import { type ApplicationRecord } from "@/lib/services/applications";
import { type CandidateProfileRecord } from "@/lib/services/candidateProfiles";

interface ChatSidebarProps {
  applications: ApplicationRecord[];
  candidates: Map<string, CandidateProfileRecord>;
  selectedId: string | null;
  onSelect: (app: ApplicationRecord) => void;
  type?: string;
}

export default function ChatSidebar({
  applications,
  candidates,
  selectedId,
  onSelect,
  type = "company", // Add this prop
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="font-semibold text-slate-900">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 italic">
            No conversations yet.
          </div>
        ) : (
          applications.map((app) => {
            // FIX: If student view, use companyId. If company view, use studentId.
            const participantId =
              type === "student" ? app.companyId : app.studentId;
            const participant = candidates.get(participantId);

            const isSelected = selectedId === app.id;

            return (
              <button
                key={app.id}
                onClick={() => onSelect(app)}
                className={`w-full p-4 flex items-center gap-3 transition-colors border-b border-slate-100 ${
                  isSelected
                    ? "bg-white shadow-sm ring-1 ring-inset ring-slate-200"
                    : "hover:bg-slate-100"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {participant?.name?.charAt(0) || "?"}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {participant?.name || "Loading..."}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{String(app.role)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
