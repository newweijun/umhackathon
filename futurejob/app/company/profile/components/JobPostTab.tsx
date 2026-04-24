"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Briefcase, Clock, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { getCompanyJobsByStatus, type JobRecord } from "@/lib/services/jobs";
import CompanyJobDetailsModal from "@/components/ui/company_view/CompanyJobDetailsModal";

interface JobPostTabProps {
  companyId: string;
  companyName: string;
}

export default function JobPostTab({ companyId, companyName }: JobPostTabProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);

  const fetchJobs = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      // Fetch jobs across different statuses
      const openJobs = await getCompanyJobsByStatus(companyId, "open", 20);
      const draftJobs = await getCompanyJobsByStatus(companyId, "draft", 20);
      const closedJobs = await getCompanyJobsByStatus(companyId, "closed", 20);
      
      setJobs([...openJobs, ...draftJobs, ...closedJobs]);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load job postings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading job postings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
        <p className="text-slate-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {companyName || "Your Company"} has {jobs.length} job postings.
        </h2>
        <p className="text-slate-600 mb-6">
          Explore career opportunities across our organization. Join a team of
          talented people working on products that impact billions.
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search within your jobs..."
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Search
          </button>
        </div>
      </motion.div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs posted yet</h3>
            <p className="text-slate-500">When you post a job, it will appear here.</p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedJob(job)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        job.status === "open" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : job.status === "draft"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {String(job.status).toUpperCase()}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{(job.aboutJob as string) || "No description provided."}</p>

                  {/* Job Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span>{(job.locationType as string) || "Remote"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span>{(job.employmentType as string) || "Full-time"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                      <span>RM {(job.salaryRange as string) || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Posted recently</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/company/jobs/${job.id}/candidates`);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Candidates
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <CompanyJobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
          onSuccess={() => {
            fetchJobs();
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
