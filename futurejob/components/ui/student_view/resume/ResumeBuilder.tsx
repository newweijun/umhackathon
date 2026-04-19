"use client";

import React, { useState } from "react";
import { Download, Trash2 } from "lucide-react";

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  skills: string;
}

export default function ResumeBuilder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ResumeData>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+60 12-345 6789",
    education: "B.Sc. Computer Science - 3.8 CGPA",
    experience:
      "Software Intern at TechCorp\n- Developed REST APIs\n- Improved database query speeds by 20%\n- Collaborated with design team for UI implementation",
    skills: "React, Next.js, PostgreSQL, TailwindCSS",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      education: "",
      experience: "",
      skills: "",
    });
  };

  // --- FIX #1: Async PDF Generation with Dynamic Import ---
  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    try {
      // Dynamically import the library ONLY on the client side
      // This prevents the Next.js "self is not defined" SSR error
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.getElementById("resume-preview");

      if (!element) {
        console.error("Could not find the resume preview element.");
        setIsGenerating(false);
        return;
      }

      const opt = {
        margin: 0,
        filename: `${formData.fullName.replace(/\s+/g, "_")}_Resume.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      // Await the generation process
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in duration-300">
      {/* --- FORM SECTION --- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col h-full max-h-[calc(100vh-12rem)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg text-slate-900">Your Details</h2>
          <button
            onClick={clearForm}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors"
          >
            <Trash2 size={14} /> Clear Form
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                type="text"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type="text"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Education
            </label>
            <input
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              type="text"
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
          </div>
          <div className="flex-1 flex flex-col min-h-37.5">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Experience & Projects
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full flex-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition resize-none"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Core Skills
            </label>
            <input
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              type="text"
              placeholder="E.g. React, Python, Data Analysis..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition"
            />
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="animate-pulse flex items-center gap-2">
                Generating PDF...
              </span>
            ) : (
              <>
                <Download size={18} /> Export as PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- LIVE PREVIEW SECTION --- */}
      <div className="bg-slate-200 rounded-xl p-4 md:p-8 flex items-start justify-center overflow-auto h-150 lg:h-full max-h-[calc(100vh-12rem)] border border-slate-300 shadow-inner">
        {/* FIX #2: Replaced all Tailwind color names with explicit HEX codes inside the preview */}
        <div
          id="resume-preview"
          className="bg-[#ffffff] w-full max-w-[210mm] aspect-[1/1.414] p-10 md:p-12 shadow-md shrink-0 text-[#0f172a] overflow-hidden"
        >
          <h1 className="text-3xl font-serif border-b-2 border-[#1e293b] pb-2 mb-4 wrap-break-words">
            {formData.fullName || "Your Name"}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-[#475569] mb-8">
            <span>{formData.email || "email@example.com"}</span>
            <span>•</span>
            <span>{formData.phone || "Phone Number"}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#cbd5e1] pb-1 mb-3 text-[#1e293b]">
              Education
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {formData.education || "University details here"}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#cbd5e1] pb-1 mb-3 text-[#1e293b]">
              Experience & Projects
            </h3>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {formData.experience ||
                "Describe your roles, achievements, and impact."}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[#cbd5e1] pb-1 mb-3 text-[#1e293b]">
              Skills
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {formData.skills || "List your technical and soft skills here"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
