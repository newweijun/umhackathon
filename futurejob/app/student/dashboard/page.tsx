"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Search, Filter, Building2, Briefcase } from "lucide-react";
import {
  getStudentApplications,
  type ApplicationRecord,
  type ApplicationStatus,
} from "@/lib/services";
import { firebaseAuth } from "@/lib/firebase/client";
import { SearchBar } from "@/components/ui/company_view/SearchBar";

type DashboardApplication = {
  id: string;
  companyName: string;
  role: string;
  status: "Applied" | "Under Review" | "Interviewing" | "Offered" | "Rejected";
};
//THIS IS MOCK DATA ONLY - REPLACE WITH REAL API CALLS
export const mockStudentApplications = [
  {
    id: "app_001",
    role: "Frontend Engineer Intern",
    companyName: "Google",
    status: "interviewing", // Will map to "Interviewing" (Purple)
    createdAt: new Date("2026-04-10").getTime(),
  },
  {
    id: "app_002",
    role: "Fullstack Developer",
    companyName: "Stripe",
    status: "under_review", // Will map to "Under Review" (Blue)
    createdAt: new Date("2026-04-15").getTime(),
  },
  {
    id: "app_003",
    role: "UI/UX Designer",
    companyName: "Spotify",
    status: "rejected", // Will map to "Rejected" (Red)
    createdAt: new Date("2026-04-01").getTime(),
  },
  {
    id: "app_004",
    role: "Software Engineer, New Grad",
    companyName: "Microsoft",
    status: "offered", // Will map to "Offered" (Green)
    createdAt: new Date("2026-03-20").getTime(),
  },
  {
    id: "app_005",
    role: "Data Analyst Intern",
    companyName: "Airbnb",
    status: "applied", // Will map to "Applied" (Gray)
    createdAt: new Date("2026-04-18").getTime(),
  },
];
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
        // Fetch all applications belonging to this student
        const studentApps = await getStudentApplications(user.uid);

        const mapped: DashboardApplication[] = studentApps.map((app) => {
          const role =
            toText(app.jobTitle) || toText(app.role) || "Unknown Role";
          const companyName = toText(app.companyName) || "Unknown Company";

          return {
            id: app.id,
            companyName,
            role,
            status: normalizeStatus(app.status),
          };
        });

        // Deduplicate just in case
        const deduplicated = Array.from(
          new Map(mapped.map((item) => [item.id, item])).values(),
        );
        setApplications(deduplicated);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load your applications.";
        setError(message);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-6rem)] gap-6 relative">
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
                      <div className="animate-pulse">
                        Loading your applications...
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
                ) : applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-8 py-16 text-center text-slate-500"
                    >
                      You havent applied to any jobs yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-8 py-5">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
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
    </div>
  );
}
