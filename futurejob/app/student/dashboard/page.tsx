"use client";

import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Search, Filter, Building2, Briefcase, Loader2 } from "lucide-react";
import {
  getStudentApplications,
  getJobDetailsByIds,
  getStudentRatingResults,
  getCompanyProfilesByIds,
  type ApplicationStatus,
} from "@/lib/services";
import { firebaseAuth } from "@/lib/firebase/client";
import { SearchBar } from "@/components/ui/company_view/SearchBar";
import { JobMatch } from "@/lib/types/jobs";
import JobMatchDetails from "@/components/ui/student_view/matches/JobMatchDetail";

type DashboardApplication = {
  id: string;
  companyName: string;
  role: string;
  status: "Applied" | "Under Review" | "Interviewing" | "Offered" | "Rejected";
  jobDetails?: JobMatch;
};

// Map backend statuses to the Student UI statuses
function normalizeStatus(
  status: ApplicationStatus | string,
): DashboardApplication["status"] {
  switch (status.toLowerCase()) {
    case "submitted":
    case "applied":
      return "Applied";
    case "reviewing":
    case "under_review":
      return "Under Review";
    case "interviewing":
      return "Interviewing";
    case "approved":
    case "offered":
      return "Offered";
    case "rejected":
      return "Rejected";
    default:
      return "Applied";
  }
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export default function StudentDashboard() {
  const [applications, setApplications] = useState<DashboardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setApplications([]);
        setLoading(false);
        setError("Please sign in to view your applications.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch all applications
        const studentApps = await getStudentApplications(user.uid);
        if (studentApps.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // 2. Fetch Job details and Ratings in parallel
        const jobIds = Array.from(new Set(studentApps.map(app => app.jobId)));
        const [jobMap, ratings] = await Promise.all([
          getJobDetailsByIds(jobIds),
          getStudentRatingResults(user.uid)
        ]);

        // 3. Fetch Company profiles
        const companyIds = Array.from(jobMap.values()).map(j => j.companyId);
        const companyMap = await getCompanyProfilesByIds(companyIds);

        // 4. Create Rating Lookup
        const ratingLookup = new Map(ratings.map(r => [r.jobId, r]));

        const mapped: DashboardApplication[] = studentApps.map((app) => {
          const job = jobMap.get(app.jobId);
          const rating = ratingLookup.get(app.jobId);
          const company = job ? companyMap.get(job.companyId) : null;

          const role = toText(app.role) || toText(job?.title) || "Unknown Role";
          const companyName = toText(app.companyName) || toText(company?.name) || "Unknown Company";

          // Construct JobMatch object for the slide-out
          let jobDetails: JobMatch | undefined;
          if (job) {
            const salaryStr = String(job.salaryRange || "");
            const baseSalary = parseInt(salaryStr.replace(/[^0-9]/g, "")) || 0;
            
            jobDetails = {
              id: job.id,
              company: companyName,
              companyId: job.companyId,
              role: role,
              location: job.locationDetails || (job.locationType === "Remote" ? "Remote" : "Location Pending"),
              salary: job.salaryRange ? `RM ${job.salaryRange}` : "Competitive",
              baseSalary: baseSalary,
              datePosted: (job.createdAt as any)?.seconds ? (job.createdAt as any).seconds * 1000 : Date.now(),
              matchScore: rating?.score || 100,
              aiReasoning: rating?.reasoning || rating?.reason || "Application submitted.",
              matchedSkills: (rating?.matchedSkills as string[]) || [],
              missingSkills: (rating?.missingSkills as string[]) || [],
              description: job.aboutJob || job.expectations || "No description provided."
            };
          }

          return {
            id: app.id,
            companyName,
            role,
            status: normalizeStatus(app.status),
            jobDetails
          };
        });

        setApplications(mapped);
      } catch (fetchError) {
        console.error("Dashboard error:", fetchError);
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load your applications.";
        setError(message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const filteredApplications = useMemo(() => {
    if (!searchQuery) return applications;
    const lower = searchQuery.toLowerCase();
    return applications.filter(app => 
      app.role.toLowerCase().includes(lower) || 
      app.companyName.toLowerCase().includes(lower)
    );
  }, [applications, searchQuery]);

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-6rem)] gap-6 relative animate-in fade-in duration-300">
      {/* Main Table Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Application Status
            </h1>
            <p className="text-slate-500 mt-1">
              Track your job hunt • {applications.length} Active Applications
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <SearchBar
              wrapperClassName="flex-1 md:flex-none"
              className="w-full md:w-64"
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm min-w-150">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 font-semibold text-slate-700 w-2/5">
                    Target Role
                  </th>
                  <th className="px-8 py-5 font-semibold text-slate-700 w-2/5">
                    Company
                  </th>
                  <th className="px-8 py-5 font-semibold text-slate-700 w-1/5">
                    Current Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-16 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="animate-pulse">Loading your applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-16 text-center text-rose-500 font-medium"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-16 text-center text-slate-500"
                    >
                      {searchQuery ? "No matching applications found." : "You haven't applied to any jobs yet."}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => app.jobDetails && setSelectedJob(app.jobDetails)}
                      className="hover:bg-indigo-50/30 transition-colors duration-150 cursor-pointer group"
                    >
                      <td className="px-8 py-5">
                        <div className="font-semibold text-slate-900 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                          <Briefcase className="w-4 h-4 text-indigo-500" />
                          {app.role}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-slate-700 font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {app.companyName}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full border ${
                            app.status === "Offered"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : app.status === "Rejected"
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : app.status === "Interviewing"
                                  ? "bg-purple-50 border-purple-200 text-purple-700"
                                  : app.status === "Under Review"
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : "bg-slate-100 border-slate-200 text-slate-700" // Applied
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              app.status === "Offered"
                                ? "bg-emerald-500"
                                : app.status === "Rejected"
                                  ? "bg-rose-500"
                                  : app.status === "Interviewing"
                                    ? "bg-purple-500"
                                    : app.status === "Under Review"
                                      ? "bg-blue-500"
                                      : "bg-slate-400"
                            }`}
                          />
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Overlay */}
      {selectedJob && (
        <JobMatchDetails
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          hideApply={true}
        />
      )}
    </div>
  );
}
