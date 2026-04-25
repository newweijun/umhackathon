"use client";

import React, { useState } from "react";
import { 
  X, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  GraduationCap, 
  Building2, 
  CheckCircle2,
  Calendar,
  Users,
  Loader2,
  Lock,
  Unlock
} from "lucide-react";
import { JobRecord, updateJobStatus } from "@/lib/services";

interface CompanyJobDetailsModalProps {
  job: JobRecord;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CompanyJobDetailsModal({ job, onClose, onSuccess }: CompanyJobDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper to format timestamps if they are Firestore timestamps
  const formatDate = (ts: any) => {
    if (!ts) return "N/A";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleDateString('en-MY', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleStatusToggle = async () => {
    const nextStatus = job.status === "open" ? "closed" : "open";
    const confirmMsg = nextStatus === "closed" 
      ? "Are you sure you want to close this job? It will no longer be visible to students." 
      : "Are you sure you want to open this job? It will become visible to students.";
    
    if (!confirm(confirmMsg)) return;

    setIsUpdating(true);
    try {
      await updateJobStatus(job.id, nextStatus);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 z-[60] backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 -translate-y-1/2 right-0 md:right-6 z-[70] w-full sm:w-[500px] lg:w-[600px] h-screen md:h-[90vh] bg-white border-l md:border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 md:rounded-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 transition-colors p-1.5 hover:bg-white rounded-full border border-transparent hover:border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                job.status === "open" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {job.status}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{job.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{String(job.locationType || "On-site")} {job.locationDetails ? `• ${job.locationDetails}` : ""}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{String(job.employmentType || "Full-time")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-slate-900">RM {String(job.salaryRange || "Competitive")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Posted on {formatDate(job.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
          {/* About the Job */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-600 rounded-full" />
              Job Description
            </h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {String(job.aboutJob || "No description provided.")}
            </p>
          </section>

          {/* Key Responsibilities */}
          {!!job.keyResponsibilities && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                Key Responsibilities
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {String(job.keyResponsibilities)}
              </p>
            </section>
          )}

          {/* Qualifications */}
          <section className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                Minimum Qualifications
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed">
                {String(job.minQualification || "None specified.")}
              </div>
            </div>
            
            {!!job.preferredQualification && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                  Preferred Qualifications
                </h3>
                <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 text-slate-700 text-sm leading-relaxed">
                  {String(job.preferredQualification)}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex gap-3">
          <button 
            onClick={() => window.location.href = `/company/jobs/${job.id}/candidates`}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            View All Candidates
          </button>
          <button 
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={`px-6 py-3 border font-bold rounded-xl transition-all flex items-center gap-2 ${
              job.status === "open"
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
            } disabled:opacity-50 cursor-pointer`}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : job.status === "open" ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            {job.status === "open" ? "Close Job" : "Open Job"}
          </button>
        </div>
      </div>
    </>
  );
}
