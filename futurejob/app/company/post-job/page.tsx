"use client";

import { useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Sparkles, Building2, MapPin, DollarSign, Send, Clock, GraduationCap, FileText, CheckSquare, Info } from "lucide-react";
import { MotionButton } from "@/components/ui/company_view/MotionButton";
import { createJob } from "@/lib/services";
import { firebaseAuth } from "@/lib/firebase/client";

export default function PostJob() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Job Basics
  const [title, setTitle] = useState("");
  const [locationType, setLocationType] = useState("Remote");
  const [locationDetails, setLocationDetails] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [employmentType, setEmploymentType] = useState("Full time");

  // Job Details
  const [minQualification, setMinQualification] = useState("");
  const [preferredQualification, setPreferredQualification] = useState("");
  const [aboutJob, setAboutJob] = useState("");
  const [keyResponsibilities, setKeyResponsibilities] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const user = await new Promise<User | null>((resolve) => {
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
          resolve(currentUser);
          return;
        }

        const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
          unsubscribe();
          resolve(nextUser);
        });
      });

      if (!user) {
        throw new Error("Please sign in as company user first.");
      }

      await createJob({
        companyId: user.uid,
        title,
        locationType,
        locationDetails: locationType === "Remote" ? "" : locationDetails,
        salaryRange,
        employmentType,
        minQualification,
        preferredQualification,
        aboutJob,
        keyResponsibilities,
        // Optional: combine text fields for legacy `expectations` compatibility
        expectations: `About: ${aboutJob}\n\nKey Responsibilities: ${keyResponsibilities}\n\nMinimum Qualifications: ${minQualification}\n\nPreferred Qualifications: ${preferredQualification}`,
        status: "draft",
      });

      setStatusMessage("Job saved to Firestore as draft.");
      
      // Reset form
      setTitle("");
      setLocationType("Remote");
      setLocationDetails("");
      setSalaryRange("");
      setEmploymentType("Full time");
      setMinQualification("");
      setPreferredQualification("");
      setAboutJob("");
      setKeyResponsibilities("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save job.";
      setStatusMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-4rem)] pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Job Posting</h1>
        <p className="text-slate-500">Provide structured details and your expectations to find the perfect candidate.</p>
      </header>

      <form onSubmit={handleGenerate} className="space-y-8">
        
        {/* Job Basics Section */}
        <section className="glass-card p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Job Basics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <select
                  required
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                >
                  <option>Full time</option>
                  <option>Part time</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Salary Range (RM) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={salaryRange}
                  onChange={(event) => setSalaryRange(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="e.g. 5,000 - 8,000"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location Type *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <select
                  required
                  value={locationType}
                  onChange={(event) => setLocationType(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
            </div>

            {/* Location Details (Conditional) */}
            {locationType !== "Remote" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location Details *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={locationDetails}
                    onChange={(event) => setLocationDetails(event.target.value)}
                    className="w-full pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="e.g. Kuala Lumpur, Malaysia"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Job Details Section */}
        <section className="glass-card p-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Job Details & Expectations</h2>
              <p className="text-xs text-slate-500 mt-1">Provide clear expectations to help candidates understand the role.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* About the job */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Info className="w-4 h-4 text-slate-400" />
                About the Job *
              </label>
              <textarea
                required
                rows={3}
                value={aboutJob}
                onChange={(event) => setAboutJob(event.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none text-slate-700 leading-relaxed"
                placeholder="Give a brief overview of the role, team, and company culture."
              />
            </div>

            {/* Key Responsibilities */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <CheckSquare className="w-4 h-4 text-slate-400" />
                Key Responsibilities *
              </label>
              <textarea
                required
                rows={4}
                value={keyResponsibilities}
                onChange={(event) => setKeyResponsibilities(event.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none text-slate-700 leading-relaxed"
                placeholder="List the day-to-day responsibilities and core tasks for this role."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Minimum Qualifications */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  Minimum Qualifications *
                </label>
                <textarea
                  required
                  rows={4}
                  value={minQualification}
                  onChange={(event) => setMinQualification(event.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none text-slate-700 leading-relaxed"
                  placeholder="e.g. Bachelor's Degree in Computer Science, 3+ years experience with React."
                />
              </div>

              {/* Preferred Qualifications */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Preferred Qualifications
                </label>
                <textarea
                  rows={4}
                  value={preferredQualification}
                  onChange={(event) => setPreferredQualification(event.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none text-slate-700 leading-relaxed"
                  placeholder="e.g. Experience with Next.js, understanding of UI/UX principles."
                />
              </div>
            </div>
          </div>
        </section>

        {statusMessage ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {statusMessage}
          </div>
        ) : null}

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <MotionButton
            type="submit"
            disabled={isGenerating}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md shadow-indigo-200/50 cursor-pointer disabled:opacity-70 transition-all"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Saving Job Post...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Create Job Post
              </>
            )}
          </MotionButton>
        </div>
      </form>
    </div>
  );
}
