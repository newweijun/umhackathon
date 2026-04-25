"use client";

import React, { useState, useMemo, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { 
  getJobsByStatus,
  getCompanyProfilesByIds,
  getCandidateProfile,
} from "@/lib/services";
import { JobMatch, SortOption } from "@/lib/types/jobs";
import JobMatchHeader from "@/components/ui/student_view/matches/JobMatchHeader";
import JobMatchCard from "@/components/ui/student_view/matches/JobMatchCard";
import JobMatchDetails from "@/components/ui/student_view/matches/JobMatchDetail";

type MatchApiResult = {
  jobId: string;
  matchScore: number;
  aiReasoning: string;
  matchedSkills: string[];
  missingSkills: string[];
};

function toDatePosted(createdAt: unknown) {
  if (createdAt && typeof createdAt === "object" && "seconds" in createdAt) {
    const seconds = (createdAt as { seconds?: unknown }).seconds;
    if (typeof seconds === "number") {
      return seconds * 1000;
    }
  }

  return Date.now();
}

export default function StudentJobMatches() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("match");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch all jobs with 'open' status
        const openJobs = await getJobsByStatus("open", 100);
        
        if (openJobs.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // 2. Fetch company profiles for these jobs
        const companyIds = Array.from(new Set(openJobs.map(j => j.companyId)));
        const companyMap = await getCompanyProfilesByIds(companyIds);

        // 3. Fetch current student profile for AI scoring context
        const profile = await getCandidateProfile(user.uid);

        // 4. Ask server route to score each open job using Gemini
        let matchLookup = new Map<string, MatchApiResult>();
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/ai/match-jobs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              student: {
                uid: user.uid,
                fullName: (profile?.fullName as string) || (profile?.name as string) || "",
                experience: (profile?.experience as string) || "",
                preferredLocation: "",
                skills: Array.isArray(profile?.skills)
                  ? (profile.skills as string[])
                  : typeof profile?.skills === "string"
                    ? (profile.skills as string)
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                    : [],
              },
              jobs: openJobs.map((job) => ({
                id: job.id,
                companyId: job.companyId,
                title: String(job.title || ""),
                companyName: String(companyMap.get(job.companyId)?.name || ""),
                location: String(job.locationDetails || ""),
                salary: String(job.salaryRange || ""),
                description: String(job.aboutJob || ""),
                requirements: String(job.expectations || ""),
              })),
            }),
          });

          if (response.ok) {
            const payload = (await response.json()) as { matches?: MatchApiResult[] };
            const entries = (payload.matches ?? [])
              .filter((item) => typeof item.jobId === "string")
              .map((item) => [item.jobId, item] as const);
            matchLookup = new Map(entries);
          }
        } catch (aiError) {
          console.warn("AI scoring failed, fallback to default score.", aiError);
        }

        // 5. Map to JobMatch interface
        const mappedMatches: JobMatch[] = openJobs.map(job => {
          const company = companyMap.get(job.companyId);
          const aiMatch = matchLookup.get(job.id);
          
          // Parse salary for sorting
          const salaryStr = String(job.salaryRange || "");
          const baseSalary = parseInt(salaryStr.replace(/[^0-9]/g, "")) || 0;

          return {
            id: job.id,
            company: String(company?.name || "Unknown Company"),
            companyId: job.companyId,
            role: String(job.title || "Unknown Role"),
            location: String(job.locationDetails || "") || (String(job.locationType) === "Remote" ? "Remote" : "Location Pending"),
            salary: job.salaryRange ? `RM ${String(job.salaryRange)}` : "Competitive",
            baseSalary: baseSalary,
            datePosted: toDatePosted(job.createdAt),
            matchScore: typeof aiMatch?.matchScore === "number" ? aiMatch.matchScore : 50,
            aiReasoning:
              aiMatch?.aiReasoning ||
              "AI matching temporarily unavailable. Showing default ranking.",
            matchedSkills: aiMatch?.matchedSkills ?? [],
            missingSkills: aiMatch?.missingSkills ?? [],
            description: String(job.aboutJob || "") || String(job.expectations || "") || "No description provided."
          };
        });

        setMatches(mappedMatches);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle the sorting logic
  const sortedMatches = useMemo(() => {
    const matchesCopy = [...matches];
    return matchesCopy.sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "newest") return b.datePosted - a.datePosted;
      if (sortBy === "salary") return b.baseSalary - a.baseSalary;
      return 0;
    });
  }, [matches, sortBy]);

  // Handle the final application action
  const handleApply = () => {
    alert(
      `Application submitted to ${selectedJob?.company} for the ${selectedJob?.role} position!`,
    );
    setSelectedJob(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-6rem)] gap-6 relative animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col min-w-0">
        {/* 1. The Header */}
        <JobMatchHeader sortBy={sortBy} onSortChange={setSortBy} />

        {/* 2. The Grid */}
        {sortedMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
            <p className="text-xl font-medium">No job matches found yet.</p>
            <p className="mt-2">Try updating your profile or checking back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 overflow-y-auto pr-2">
            {sortedMatches.map((job) => (
              <JobMatchCard
                key={job.id}
                job={job}
                onClick={() => setSelectedJob(job)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. The Details Overlay (Only shows if a job is selected) */}
      {selectedJob && (
        <JobMatchDetails
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
