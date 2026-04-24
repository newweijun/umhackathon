"use client";

import React, { useState, useMemo, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { 
  getJobsByStatus, 
  getCompanyProfilesByIds 
} from "@/lib/services";
import { JobMatch, SortOption } from "@/lib/types/jobs";
import JobMatchHeader from "@/components/ui/student_view/matches/JobMatchHeader";
import JobMatchCard from "@/components/ui/student_view/matches/JobMatchCard";
import JobMatchDetails from "@/components/ui/student_view/matches/JobMatchDetail";

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

        // 3. Map to JobMatch interface
        const mappedMatches: JobMatch[] = openJobs.map(job => {
          const company = companyMap.get(job.companyId);
          
          // Parse salary for sorting
          const salaryStr = String(job.salaryRange || "");
          const baseSalary = parseInt(salaryStr.replace(/[^0-9]/g, "")) || 0;

          return {
            id: job.id,
            company: company?.name || "Unknown Company",
            companyId: job.companyId,
            role: job.title || "Unknown Role",
            location: job.locationDetails || (job.locationType === "Remote" ? "Remote" : "Location Pending"),
            salary: job.salaryRange ? `RM ${job.salaryRange}` : "Competitive",
            baseSalary: baseSalary,
            datePosted: (job.createdAt as any)?.seconds ? (job.createdAt as any).seconds * 1000 : Date.now(),
            matchScore: 100, // Placeholder score since AI matching is skipped
            aiReasoning: "This job is currently open and accepting applications. Complete your profile to get a personalized AI match score!",
            matchedSkills: [],
            missingSkills: [],
            description: job.aboutJob || job.expectations || "No description provided."
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
