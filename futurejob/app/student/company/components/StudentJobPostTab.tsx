"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Briefcase, Clock, ChevronRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { getCompanyJobsByStatus, type JobRecord } from "@/lib/services/jobs";
import { JobMatch } from "@/lib/types/jobs";
import JobMatchDetails from "@/components/ui/student_view/matches/JobMatchDetail";

interface StudentJobPostTabProps {
  companyId: string;
  companyName: string;
}

export default function StudentJobPostTab({ companyId, companyName }: StudentJobPostTabProps) {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      if (!companyId) return;
      setLoading(true);
      try {
        // For students, we only show OPEN jobs
        const openJobs = await getCompanyJobsByStatus(companyId, "open", 50);
        setJobs(openJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load job postings.");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [companyId]);

  const handleViewDetails = (job: JobRecord) => {
    const salaryStr = String(job.salaryRange || "");
    const baseSalary = parseInt(salaryStr.replace(/[^0-9]/g, "")) || 0;

    const jobMatch: JobMatch = {
      id: job.id,
      company: companyName,
      companyId: companyId,
      role: String(job.title || "Unknown Role"),
      location: String(job.locationDetails || "") || (String(job.locationType) === "Remote" ? "Remote" : "Location Pending"),
      salary: job.salaryRange ? `RM ${String(job.salaryRange)}` : "Competitive",
      baseSalary: baseSalary,
      datePosted: (job.createdAt as any)?.seconds ? (job.createdAt as any).seconds * 1000 : Date.now(),
      matchScore: 100,
      aiReasoning: "Explore this opportunity and apply to see your AI match score!",
      matchedSkills: [],
      missingSkills: [],
      description: String(job.aboutJob || "") || String(job.expectations || "") || "No description provided."
    };
    setSelectedJob(jobMatch);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading available positions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Open Positions at {companyName}
        </h2>
        <p className="text-slate-600">
          Discover your next career milestone. We are actively looking for talented individuals to join our mission.
        </p>
      </motion.div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No active openings</h3>
            <p className="text-slate-500">This company doesn't have any open positions at the moment. Check back later!</p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleViewDetails(job)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {String(job.title || "")}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{String(job.locationType || "")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{String(job.employmentType || "")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-slate-900">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>RM {String(job.salaryRange || "")}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 italic">
                    "{String(job.aboutJob || "No description provided.")}"
                  </p>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider hidden md:block">View Role</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {selectedJob && (
        <JobMatchDetails
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
