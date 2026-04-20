"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Briefcase, Clock, ChevronRight } from "lucide-react";

export default function JobPostTab() {
  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Engineer",
      location: "Mountain View, CA",
      level: "Senior",
      salary: "$180k - $250k",
      type: "Full-time",
      posted: "2 days ago",
      applicants: 234,
      description:
        "We're looking for an experienced full stack engineer to join our platform team...",
      tags: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    },
    {
      id: 2,
      title: "Product Manager - AI/ML",
      location: "Mountain View, CA",
      level: "Senior",
      salary: "$200k - $280k",
      type: "Full-time",
      posted: "5 days ago",
      applicants: 189,
      description:
        "Lead the product strategy for our AI and machine learning initiatives...",
      tags: ["Product Strategy", "AI/ML", "Data Analysis", "Leadership"],
    },
    {
      id: 3,
      title: "UX/UI Designer",
      location: "San Francisco, CA",
      level: "Mid-level",
      salary: "$140k - $200k",
      type: "Full-time",
      posted: "1 week ago",
      applicants: 156,
      description:
        "Design beautiful and intuitive user experiences for millions of users...",
      tags: ["Figma", "UI Design", "UX Research", "Prototyping"],
    },
    {
      id: 4,
      title: "Cloud Infrastructure Engineer",
      location: "Remote",
      level: "Senior",
      salary: "$190k - $260k",
      type: "Full-time",
      posted: "1 week ago",
      applicants: 267,
      description:
        "Build and maintain the infrastructure that powers Google Cloud...",
      tags: ["Kubernetes", "GCP", "Terraform", "DevOps"],
    },
    {
      id: 5,
      title: "Data Scientist",
      location: "Mountain View, CA",
      level: "Mid-level",
      salary: "$150k - $220k",
      type: "Full-time",
      posted: "2 weeks ago",
      applicants: 342,
      description:
        "Use data and machine learning to solve real-world problems...",
      tags: ["Python", "ML", "Data Analysis", "Statistics"],
    },
    {
      id: 6,
      title: "Technical Program Manager",
      location: "Sunnyvale, CA",
      level: "Mid-level",
      salary: "$160k - $230k",
      type: "Full-time",
      posted: "2 weeks ago",
      applicants: 198,
      description:
        "Coordinate cross-functional teams to deliver impactful products...",
      tags: ["Project Management", "Coordination", "Analytics", "Leadership"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Google has {jobs.length} job openings - find the one for you.
        </h2>
        <p className="text-slate-600 mb-6">
          Explore career opportunities across our organization. Join a team of
          talented people working on products that impact billions.
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Job title or keyword"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Search
          </button>
        </div>
      </motion.div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors mt-1" />
                </div>
                <p className="text-slate-600 text-sm mb-4">{job.description}</p>

                {/* Job Details */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    <span>{job.level}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-500" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{job.posted}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Side Info */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-medium text-slate-900">
                  {job.applicants} applicants
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {job.type}
                </span>
              </div>
            </div>

            {/* Button */}
            <div className="flex gap-3">
              <button className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                View Job
              </button>
              <button className="flex-1 md:flex-none px-6 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Save
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
