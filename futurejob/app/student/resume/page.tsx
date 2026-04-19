"use client";

import React, { useState } from "react";
import { FileText, History, Sparkles } from "lucide-react";
import ResumeBuilder from "@/components/ui/student_view/resume/ResumeBuilder";
import ResumeHistory from "@/components/ui/student_view/resume/ResumeHistory";
import ResumeAnalysis from "@/components/ui/student_view/resume/ResumeAnalysis";

type TabState = "builder" | "history" | "analysis";

export default function ResumeLab() {
  const [activeTab, setActiveTab] = useState<TabState>("builder");

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative font-sans text-slate-800">
      {/* Header */}
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Resume Lab</h1>
        <p className="text-slate-500 mt-1">
          Build, manage, and analyze your resumes for ATS systems.
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <TabButton
          icon={<FileText size={18} />}
          label="Builder & Preview"
          isActive={activeTab === "builder"}
          onClick={() => setActiveTab("builder")}
        />
        <TabButton
          icon={<History size={18} />}
          label="Past Resumes"
          isActive={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        />
        <TabButton
          icon={<Sparkles size={18} />}
          label="AI Analysis"
          isActive={activeTab === "analysis"}
          onClick={() => setActiveTab("analysis")}
          activeColor="text-violet-600 border-violet-600"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-8">
        {activeTab === "builder" && <ResumeBuilder />}
        {activeTab === "history" && <ResumeHistory />}
        {activeTab === "analysis" && <ResumeAnalysis />}
      </div>
    </div>
  );
}

// Reusable Tab Button Component
const TabButton = ({
  icon,
  label,
  isActive,
  onClick,
  activeColor = "text-indigo-600 border-indigo-600",
}: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
      isActive
        ? activeColor
        : "text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300"
    }`}
  >
    {icon} {label}
  </button>
);
