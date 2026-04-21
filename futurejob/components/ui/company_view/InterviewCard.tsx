"use client";

import { type InterviewRecord } from "@/lib/services/interviews";
import { type CandidateProfileRecord } from "@/lib/services/candidateProfiles";

interface InterviewCardProps {
  interview: InterviewRecord;
  candidate: CandidateProfileRecord | undefined;
}

export default function InterviewCard({ interview, candidate }: InterviewCardProps) {
  const date = interview.scheduledAt?.toDate ? interview.scheduledAt.toDate() : new Date(interview.scheduledAt);
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
            {(candidate?.fullName || candidate?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{candidate?.fullName || candidate?.name || "Candidate"}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Job ID: {interview.jobId?.slice(-6) || "N/A"}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          interview.status === "scheduled" ? "bg-amber-50 text-amber-600 border border-amber-100" :
          interview.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
          "bg-slate-50 text-slate-600 border border-slate-100"
        }`}>
          {interview.status}
        </span>
      </div>
      
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        {interview.meetingLink && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium truncate">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Join Meeting
            </a>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100">
          Reschedule
        </button>
        <button className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
          Notes
        </button>
      </div>
    </div>
  );
}
