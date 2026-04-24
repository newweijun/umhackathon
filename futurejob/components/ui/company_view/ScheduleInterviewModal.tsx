"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Video, Mail, Briefcase } from "lucide-react";
import {
  scheduleInterview,
  getStudentIdByEmail,
} from "@/lib/services/interviews";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
}: ScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // Added to show email errors

  const [formData, setFormData] = useState({
    studentEmail: "", // Changed from studentId
    companyName: "Google", // Hardcoded for testing
    role: "Software Engineer",
    date: "",
    time: "",
    meetingLink: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let studentUid = null;

    // --- TEST 1: The Email Lookup ---
    try {
      console.log("🔍 STEP 1: Looking up email in the 'users' collection...");
      studentUid = await getStudentIdByEmail(formData.studentEmail);
      console.log("✅ STEP 1 SUCCESS! Found UID:", studentUid);
    } catch (err) {
      console.error("❌ STEP 1 FAILED (Missing Permissions on Users):", err);
      setErrorMsg("Error: Firebase blocked reading the users collection.");
      setLoading(false);
      return;
    }

    if (!studentUid) {
      setErrorMsg("Could not find a student with that email address.");
      setLoading(false);
      return;
    }

    // --- TEST 2: The Interview Creation ---
    try {
      console.log(
        "📝 STEP 2: Saving interview to the 'interviews' collection...",
      );
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

      await scheduleInterview({
        companyId,
        studentId: studentUid,
        companyName: formData.companyName,
        role: formData.role,
        scheduledAt: scheduledDateTime,
        meetingLink: formData.meetingLink,
      });
      console.log("✅ STEP 2 SUCCESS! Interview Saved.");

      alert("Interview scheduled successfully!");
      onSuccess();
    } catch (err) {
      console.error(
        "❌ STEP 2 FAILED (Missing Permissions on Interviews):",
        err,
      );
      setErrorMsg("Error: Firebase blocked creating the interview document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            Schedule Interview
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Show error message if email lookup fails */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-100">
              {errorMsg}
            </div>
          )}

          <div>
            {/* Changed label to Email */}
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Student Email
            </label>
            <div className="relative">
              {/* Changed icon to Mail */}
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="email"
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.studentEmail}
                onChange={(e) =>
                  setFormData({ ...formData, studentEmail: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Job Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="text"
                placeholder="e.g. Frontend Intern"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="date"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="time"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Google Meet Link
            </label>
            <div className="relative">
              <Video className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="url"
                placeholder="https://meet.google.com/..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100"
                value={formData.meetingLink}
                onChange={(e) =>
                  setFormData({ ...formData, meetingLink: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-70"
            >
              {loading ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
