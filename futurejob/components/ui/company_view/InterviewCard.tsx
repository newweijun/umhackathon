"use client";

import { Calendar, Clock, Video } from "lucide-react";
import { type InterviewRecord } from "@/lib/services/interviews";
import { type CandidateProfileRecord } from "@/lib/services/candidateProfiles";

interface InterviewCardProps {
  interview: InterviewRecord;
  candidate: CandidateProfileRecord | undefined; // Make sure your interface has 'email' defined!
}

export default function InterviewCard({
  interview,
  candidate,
}: InterviewCardProps) {
  // Safely parse the Firebase date
  const dateObj = interview.scheduledAt?.toDate
    ? interview.scheduledAt.toDate()
    : new Date(interview.scheduledAt || Date.now());

  const dateStr = dateObj.toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = dateObj.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract candidate details
  const candidateName =
    candidate?.fullName || candidate?.name || "Student Candidate";
  const candidateEmail = String(candidate?.email || "No email provided");
  const initials = candidateEmail.charAt(0).toUpperCase(); // Uses email for the avatar initial

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
      {/* Left Side: Candidate Info & Time */}
      <div className="flex gap-4 md:gap-6 min-w-0 flex-1">
        <div className="flex flex-col gap-4 w-full">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-lg">
              {initials}
            </div>
            <div className="flex flex-col items-start text-left truncate overflow-hidden pr-2">
              <span className="text-sm font-bold text-slate-900 truncate w-full">
                {candidateName}
              </span>
              <span className="text-xs text-slate-500 truncate w-full">
                {candidateEmail}
              </span>
            </div>
          </div>

          {/* Interview Details */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-bold text-slate-900 truncate">
                {interview.role}
              </h2>
              <span
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  interview.status === "scheduled"
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : interview.status === "completed"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-slate-50 text-slate-600 border border-slate-100"
                }`}
              >
                {interview.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-3">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{dateStr}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Actions & Links */}
      <div className="shrink-0 flex flex-col justify-center gap-3 md:border-l border-slate-100 md:pl-6 md:w-56 mt-4 md:mt-0">
        <a
          href={interview.meetingLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
        >
          <Video className="w-4 h-4" /> Join Google Meet
        </a>
      </div>
    </div>
  );
}
