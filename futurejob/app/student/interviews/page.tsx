"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Video, Building2 } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  getStudentInterviews,
  type InterviewRecord,
} from "@/lib/services/interviews";

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real data when the component loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setInterviews([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentInterviews(user.uid);
        setInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 2. Helper function to format the timestamp into distinct date/time strings for the UI
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return { date: "TBD", time: "TBD" };
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return {
      date: dateObj.toLocaleDateString("en-MY", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: dateObj.toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-300">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Interviews</h1>
        <p className="text-slate-500 mt-1">
          View your scheduled meetings and access interview links.
        </p>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-500 italic">
            Loading your schedule...
          </div>
        ) : interviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {/* 3. Map over the REAL data */}
            {interviews.map((interview) => {
              const { date, time } = formatDateTime(interview.scheduledAt);

              return (
                <div
                  key={interview.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  {/* Interview Details */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {interview.role}
                      </h2>
                      <p className="text-slate-500 font-medium mb-3">
                        {interview.companyName}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Meet Button */}
                  <div className="shrink-0 flex md:flex-col justify-end gap-3 md:border-l border-slate-100 md:pl-6">
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer flex justify-center items-center gap-2"
                    >
                      <Video className="w-4 h-4" /> Join Google Meet
                    </a>
                    <p className="hidden md:block text-xs text-center text-slate-400 font-medium">
                      Link provided by {interview.companyName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 border-8 border-indigo-50/50 rounded-3xl flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-indigo-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Interviews Scheduled
            </h2>
            <p className="text-slate-500 max-w-md leading-relaxed">
              You dont have any upcoming meetings with employers at the moment.
              When a company schedules an interview, the Google Meet link will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
