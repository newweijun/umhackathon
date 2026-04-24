"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  createRatingLookup,
  getCandidateProfilesByIds,
  getJobApplicationsByStatus,
  getCompanyRatingResults,
  getRatingForApplication,
  getJobById,
  updateApplicationStatus,
  type ApplicationRecord,
  type ApplicationStatus,
  type JobRecord,
} from "@/lib/services";
import { firebaseAuth } from "@/lib/firebase/client";
import { SearchBar } from "@/components/ui/company_view/SearchBar";
import ScheduleInterviewModal from "@/components/ui/company_view/ScheduleInterviewModal";

type DashboardApplicant = {
  id: string;
  studentId: string;
  name: string;
  skills: string;
  match: number;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
};

const COMPANY_DASHBOARD_STATUSES: ApplicationStatus[] = [
  "submitted",
  "reviewing",
  "approved",
  "rejected",
];

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function normalizeStatus(
  status: ApplicationStatus,
): DashboardApplicant["status"] {
  if (status === "approved") {
    return "Approved";
  }
  if (status === "rejected") {
    return "Rejected";
  }
  return "Pending";
}

function mapApplicationToApplicant(
  application: ApplicationRecord,
): DashboardApplicant {
  const fallbackName = application.studentId
    ? `Candidate ${application.studentId.slice(0, 6)}`
    : "Unknown Candidate";

  return {
    id: application.id,
    name: fallbackName,
    skills: "Skill data unavailable",
    match: 75,
    status: normalizeStatus(application.status),
    reason:
      "No AI reasoning trace yet. This row is currently based on application records only.",
  };
}

function buildApplicantFromSources(
  application: ApplicationRecord,
  candidateProfile?: Record<string, unknown> | null,
  ratingResult?: Record<string, unknown> | null,
): DashboardApplicant {
  const fallback = mapApplicationToApplicant(application);

  const profileName =
    toText(candidateProfile?.fullName) ||
    toText(candidateProfile?.name) ||
    toText(candidateProfile?.displayName);

  const appName =
    toText(application.candidateName) ||
    toText(application.studentName) ||
    toText(application.applicantName);

  const profileSkillsRaw = candidateProfile?.skills;
  const profileSkills = Array.isArray(profileSkillsRaw)
    ? profileSkillsRaw
        .filter((item): item is string => typeof item === "string")
        .join(", ")
    : toText(profileSkillsRaw);

  const appSkillsRaw = application.skills;
  const appSkills = Array.isArray(appSkillsRaw)
    ? appSkillsRaw
        .filter((item): item is string => typeof item === "string")
        .join(", ")
    : toText(appSkillsRaw);

  const match =
    toNumber(ratingResult?.score) ||
    toNumber(ratingResult?.matchScore) ||
    toNumber(ratingResult?.match) ||
    toNumber(application.match) ||
    toNumber(application.matchScore) ||
    toNumber(application.score) ||
    fallback.match;

  const reason =
    toText(ratingResult?.reasoning) ||
    toText(ratingResult?.reason) ||
    toText(application.reason) ||
    toText(application.reasoning) ||
    fallback.reason;

  return {
    ...fallback,
    name: profileName || appName || fallback.name,
    skills: profileSkills || appSkills || fallback.skills,
    match,
    reason,
  };
}

export default function JobCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.jobId === "string" ? params.jobId : "";

  const [job, setJob] = useState<JobRecord | null>(null);
  const [applicants, setApplicants] = useState<DashboardApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<DashboardApplicant | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const fetchApplicants = async (userId: string) => {
    try {
      // Fetch job details
      const jobData = await getJobById(jobId);
      if (!jobData || jobData.companyId !== userId) {
        setError("Job not found or you do not have permission.");
        setLoading(false);
        return;
      }
      setJob(jobData);

      // Fetch applications for this specific job
      const results = await Promise.all(
        COMPANY_DASHBOARD_STATUSES.map((status) =>
          getJobApplicationsByStatus(jobId, status, 50),
        ),
      );

      const applications = results.flat();
      const candidateProfileMap = await getCandidateProfilesByIds(
        applications.map((application) => application.studentId),
      );

      const ratingResults = await getCompanyRatingResults(userId, 500);
      const ratingLookup = createRatingLookup(ratingResults);

      const mapped = applications.map((application) => {
        const candidateProfile =
          candidateProfileMap.get(application.studentId) ?? null;
        const ratingResult = getRatingForApplication(
          ratingLookup,
          application.id,
          application.studentId,
          application.jobId,
        );

        return buildApplicantFromSources(
          application,
          candidateProfile,
          ratingResult,
        );
      });
      const deduplicated = Array.from(
        new Map(mapped.map((item) => [item.id, item])).values(),
      );
      setApplicants(deduplicated);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load applicants.";
      setError(message);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setApplicants([]);
        setJob(null);
        setLoading(false);
        setError("Please sign in to view applications.");
        return;
      }

      setLoading(true);
      setError(null);
      await fetchApplicants(user.uid);
    });

    return unsubscribe;
  }, [jobId]);

  const handleStatusUpdate = async (
    applicantId: string,
    studentId: string,
    nextStatus: ApplicationStatus,
    reason?: string,
  ) => {
    const user = firebaseAuth.currentUser;
    if (!user) return;

    setUpdatingId(applicantId);
    try {
      await updateApplicationStatus({
        applicationId: applicantId,
        nextStatus,
        actorRole: "company",
        studentIdForNotification: studentId,
        rejectionReason: reason,
      });
      await fetchApplicants(user.uid);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (!selectedApplicant) {
      return;
    }

    const stillExists = applicants.some(
      (item) => item.id === selectedApplicant.id,
    );
    if (!stillExists) {
      setSelectedApplicant(null);
    }
  }, [applicants]);

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-6rem)] gap-6 relative">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-2">
          <button
            onClick={() => router.push("/company/dashboard")}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
        </div>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {job ? job.title : "Loading Job..."} Candidates
            </h1>
            <p className="text-slate-500">
              {applicants.length} Total Applicants
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <SearchBar
              wrapperClassName="flex-1 md:flex-none"
              className="w-full md:w-64"
              placeholder="Search candidates..."
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Candidate
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Core Skills
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Match %
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      Loading applicants...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-rose-500"
                    >
                      {error}
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No applicants found for this job.
                    </td>
                  </tr>
                ) : (
                  applicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      onClick={() => setSelectedApplicant(applicant)}
                      className={`hover:bg-indigo-50/50 cursor-pointer transition-colors duration-150 ${selectedApplicant?.id === applicant.id ? "bg-indigo-50/80" : ""}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {applicant.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                        {applicant.skills}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                            applicant.match >= 90
                              ? "bg-emerald-100 text-emerald-700"
                              : applicant.match >= 80
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {applicant.match}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-md border ${
                            applicant.status === "Approved"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : applicant.status === "Rejected"
                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          {applicant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={
                              updatingId === applicant.id ||
                              applicant.status === "Approved"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(
                                applicant.id,
                                applicant.studentId,
                                "approved",
                              );
                            }}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              applicant.status === "Approved"
                                ? "text-slate-300"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title="Approve"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button
                            disabled={
                              updatingId === applicant.id ||
                              applicant.status === "Rejected"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              const reason =
                                prompt("Enter rejection reason (optional):") ||
                                "";
                              handleStatusUpdate(
                                applicant.id,
                                applicant.studentId,
                                "rejected",
                                reason,
                              );
                            }}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              applicant.status === "Rejected"
                                ? "text-slate-300"
                                : "text-rose-500 hover:bg-rose-50"
                            }`}
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedApplicant && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
            onClick={() => setSelectedApplicant(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:relative md:inset-auto md:z-auto md:w-80 bg-white border-l md:border border-slate-200 md:rounded-xl shadow-2xl md:shadow-sm flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedApplicant.name}
                </h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="text-3xl font-black text-indigo-600">
                  {selectedApplicant.match}%
                </div>
                <div className="text-sm font-medium text-slate-500 leading-tight">
                  AI Match
                  <br />
                  Score
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                AI Reasoning Trace
              </h3>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                {selectedApplicant.reason}
              </div>

              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-8 mb-3">
                Next Steps
              </h3>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-colors cursor-pointer flex justify-center items-center gap-2"
              >
                Schedule Interview <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {isInterviewModalOpen && selectedApplicant && (
        <ScheduleInterviewModal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          onSuccess={() => {
            setIsInterviewModalOpen(false);
            alert("Interview scheduled successfully!");
          }}
          companyId={firebaseAuth.currentUser?.uid || ""}
          initialApplication={
            {
              id: selectedApplicant.id,
              studentId: selectedApplicant.studentId,
              jobId: jobId,
              companyId: firebaseAuth.currentUser?.uid || "",
              status: "approved",
            } as any
          }
        />
      )}
    </div>
  );
}
