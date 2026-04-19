"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { Briefcase, Users, UserPlus, Calendar, Plus, ChevronRight, BarChart2 } from "lucide-react";
import {
  getCompanyJobsByStatus,
  getCompanyApplicationsByStatus,
  type JobRecord,
  type ApplicationRecord,
  type ApplicationStatus,
  type JobStatus,
} from "@/lib/services";
import { firebaseAuth } from "@/lib/firebase/client";

type JobWithStats = JobRecord & {
  totalApplicants: number;
  newApplicants: number;
};

const COMPANY_DASHBOARD_APP_STATUSES: ApplicationStatus[] = [
  "submitted",
  "reviewing",
  "approved",
  "rejected",
];

const COMPANY_DASHBOARD_JOB_STATUSES: JobStatus[] = ["open", "draft", "closed"];

export default function CompanyDashboard() {
  const router = useRouter();
  
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    newApplicants: 0,
    upcomingInterviews: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setJobs([]);
        setLoading(false);
        setError("Please sign in to view dashboard.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all jobs for company
        const jobsResults = await Promise.all(
          COMPANY_DASHBOARD_JOB_STATUSES.map((status) =>
            getCompanyJobsByStatus(user.uid, status, 50)
          )
        );
        const allJobs = jobsResults.flat();

        // Fetch all applications for company to compute stats
        const appsResults = await Promise.all(
          COMPANY_DASHBOARD_APP_STATUSES.map((status) =>
            getCompanyApplicationsByStatus(user.uid, status, 500)
          )
        );
        const allApplications = appsResults.flat();

        // Calculate global metrics
        const activeJobsCount = allJobs.filter(j => j.status === "open").length;
        const totalApplicantsCount = allApplications.length;
        const newApplicantsCount = allApplications.filter(a => a.status === "submitted").length;

        setMetrics({
          activeJobs: activeJobsCount,
          totalApplicants: totalApplicantsCount,
          newApplicants: newApplicantsCount,
          upcomingInterviews: 0, // Placeholder
        });

        // Calculate per-job stats
        const appsByJob = allApplications.reduce((acc, app) => {
          if (!acc[app.jobId]) {
            acc[app.jobId] = { total: 0, new: 0 };
          }
          acc[app.jobId].total += 1;
          if (app.status === "submitted") {
            acc[app.jobId].new += 1;
          }
          return acc;
        }, {} as Record<string, { total: number; new: number }>);

        const jobsWithStats: JobWithStats[] = allJobs.map(job => ({
          ...job,
          totalApplicants: appsByJob[job.id]?.total || 0,
          newApplicants: appsByJob[job.id]?.new || 0,
        }));

        // Sort: Active first, then by createdAt desc (or just leave as is, which is grouped by status due to Promise.all order)
        // Let's sort by active first
        jobsWithStats.sort((a, b) => {
          if (a.status === "open" && b.status !== "open") return -1;
          if (a.status !== "open" && b.status === "open") return 1;
          return 0;
        });

        setJobs(jobsWithStats);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load dashboard data.";
        setError(message);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col h-auto min-h-[calc(100vh-6rem)] gap-8">
      {/* Header & Quick Actions */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Here's what's happening with your job postings today.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push("/company/post-job")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Post</span>
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Live
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {loading ? "-" : metrics.activeJobs}
            </h3>
            <p className="text-sm font-medium text-slate-500">Active Job Posts</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {loading ? "-" : metrics.totalApplicants}
            </h3>
            <p className="text-sm font-medium text-slate-500">Total Candidates</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 opacity-50" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            {metrics.newApplicants > 0 && !loading && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {loading ? "-" : metrics.newApplicants}
            </h3>
            <p className="text-sm font-medium text-slate-500">New Applications to Review</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">
              {loading ? "-" : metrics.upcomingInterviews}
            </h3>
            <p className="text-sm font-medium text-slate-500">Upcoming Interviews</p>
          </div>
        </div>
      </div>

      {/* Main Content Area: Job List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Your Job Posts</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Job Title</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Total Apps</th>
                <th className="px-6 py-4 font-semibold text-slate-700">New Apps</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      Loading jobs...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Briefcase className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs posted yet</h3>
                      <p className="text-slate-500 mb-6">Create your first job post to start receiving candidates.</p>
                      <button 
                        onClick={() => router.push("/company/post-job")}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        Create Job Post
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </div>
                      {/* You could add a created date here if desired */}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        job.status === "open" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : job.status === "draft"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{job.totalApplicants}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${job.newApplicants > 0 ? "text-rose-600" : "text-slate-500"}`}>
                          {job.newApplicants}
                        </span>
                        {job.newApplicants > 0 && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => router.push(`/company/jobs/${job.id}/candidates`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium transition-all cursor-pointer"
                      >
                        View Candidates
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
