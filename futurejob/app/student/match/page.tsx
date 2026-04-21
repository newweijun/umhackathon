"use client";

import React, { useState, useMemo } from "react";
// Adjust these imports based on where you place the files
import { JobMatch, SortOption } from "@/lib/types/jobs";
import JobMatchHeader from "@/components/ui/student_view/matches/JobMatchHeader";
import JobMatchCard from "@/components/ui/student_view/matches/JobMatchCard";
import JobMatchDetails from "@/components/ui/student_view/matches/JobMatchDetail";

const MOCK_MATCHES: JobMatch[] = [
  {
    id: "job_001",
    company: "Stripe",
    role: "Frontend Engineer Intern",
    location: "Remote",
    salary: "$4,000 - $5,000 / mo",
    baseSalary: 4000,
    datePosted: new Date("2026-04-18").getTime(),
    matchScore: 92,
    aiReasoning:
      "Exceptional alignment. Your recent eMoney portal project heavily utilizes Next.js and Tailwind, which are the core requirements for this team.",
    matchedSkills: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    missingSkills: ["GraphQL"],
    description:
      "We are looking for a passionate Frontend Intern to help build the next generation of Stripe's merchant dashboard. You will work closely with our design and engineering teams to implement pixel-perfect, accessible UI components.",
  },
  {
    id: "job_002",
    company: "Google",
    role: "Fullstack Developer, New Grad",
    location: "Kuala Lumpur, MY",
    salary: "RM 6,000 - RM 8,000 / mo",
    baseSalary: 1200,
    datePosted: new Date("2026-04-20").getTime(),
    matchScore: 78,
    aiReasoning:
      "Strong foundation in backend APIs and React. However, you lack explicit mention of cloud deployment experience (GCP/AWS).",
    matchedSkills: ["React", "Node.js", "PostgreSQL"],
    missingSkills: ["Docker", "Google Cloud"],
    description:
      "Join Google Cloud's enterprise solutions team. You will be responsible for building scalable full-stack applications that help our largest customers manage their infrastructure.",
  },
  {
    id: "job_003",
    company: "Airbnb",
    role: "UI/UX Design Intern",
    location: "Remote",
    salary: "$3,500 / mo",
    baseSalary: 3500,
    datePosted: new Date("2026-04-10").getTime(),
    matchScore: 45,
    aiReasoning:
      "Low match. While you have frontend development skills, this role requires a dedicated portfolio of Figma prototypes and formal user research methodologies.",
    matchedSkills: ["CSS", "Frontend Design"],
    missingSkills: ["Figma", "User Research", "Wireframing"],
    description:
      "Help design the future of travel. As a UI/UX intern, you will conduct user interviews, build low-fidelity wireframes, and create high-fidelity prototypes in Figma.",
  },
];
export default function StudentJobMatches() {
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("match");

  // Handle the sorting logic
  const sortedMatches = useMemo(() => {
    const matchesCopy = [...MOCK_MATCHES];
    return matchesCopy.sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "newest") return b.datePosted - a.datePosted;
      if (sortBy === "salary") return b.baseSalary - a.baseSalary;
      return 0;
    });
  }, [sortBy]);

  // Handle the final application action
  const handleApply = () => {
    alert(
      `Application submitted to ${selectedJob?.company} for the ${selectedJob?.role} position!`,
    );
    setSelectedJob(null);
  };

  return (
    <div className="flex flex-col h-auto md:h-[calc(100vh-6rem)] gap-6 relative animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col min-w-0">
        {/* 1. The Header */}
        <JobMatchHeader sortBy={sortBy} onSortChange={setSortBy} />

        {/* 2. The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 overflow-y-auto pr-2">
          {sortedMatches.map((job) => (
            <JobMatchCard
              key={job.id}
              job={job}
              onClick={() => setSelectedJob(job)}
            />
          ))}
        </div>
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
