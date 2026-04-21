"use client";

import { useState, useEffect } from "react";
import { getCompanyApplicationsByStatus, type ApplicationRecord } from "@/lib/services/applications";
import { getCandidateProfilesByIds, type CandidateProfileRecord } from "@/lib/services/candidateProfiles";
import { scheduleInterview } from "@/lib/services/interviews";
import { Timestamp } from "firebase/firestore";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  initialApplication?: ApplicationRecord | null;
}

export default function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  companyId,
  initialApplication 
}: ScheduleInterviewModalProps) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [candidates, setCandidates] = useState<Map<string, CandidateProfileRecord>>(new Map());
  const [selectedAppId, setSelectedAppId] = useState(initialApplication?.id || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!initialApplication && isOpen) {
      const fetchApps = async () => {
        setFetching(true);
        try {
          const apps = await getCompanyApplicationsByStatus(companyId, "approved");
          setApplications(apps);
          const studentIds = apps.map(app => app.studentId);
          if (studentIds.length > 0) {
            const profiles = await getCandidateProfilesByIds(studentIds);
            setCandidates(profiles);
          }
        } catch (error) {
          console.error("Error fetching apps for modal:", error);
        } finally {
          setFetching(false);
        }
      };
      fetchApps();
    }
  }, [isOpen, initialApplication, companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !date || !time) return;

    setLoading(true);
    try {
      const app = initialApplication || applications.find(a => a.id === selectedAppId);
      if (!app) throw new Error("Application not found");

      const scheduledAt = new Date(`${date}T${time}`);
      await scheduleInterview({
        applicationId: app.id,
        companyId: companyId,
        studentId: app.studentId,
        jobId: app.jobId,
        scheduledAt: Timestamp.fromDate(scheduledAt),
        meetingLink,
        notes
      });
      onSuccess();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Failed to schedule interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Schedule Interview</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!initialApplication && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Candidate</label>
              <select
                required
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="">Choose an approved candidate...</option>
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {candidates.get(app.studentId)?.fullName || candidates.get(app.studentId)?.name || "Candidate"} - Job: {app.jobId.slice(-6)}
                  </option>
                ))}
              </select>
              {fetching && <p className="text-[10px] text-slate-400 mt-1 italic">Loading candidates...</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
              <input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Link (Optional)</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              placeholder="Internal notes or instructions for the candidate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || (!initialApplication && !selectedAppId)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-100"
            >
              {loading ? "Scheduling..." : "Confirm Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
