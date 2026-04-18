"use client";

import { useState } from "react";
import { Sparkles, Building2, MapPin, DollarSign, Send } from "lucide-react";
import { MotionButton } from "@/components/ui/MotionButton";

export default function PostJob() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    // Mock generation delay
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Job Posting</h1>
        <p className="text-slate-500">Provide your expectations and let AI structure the perfect job description.</p>
      </header>

      <form onSubmit={handleGenerate} className="glass-card p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Job Title */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location Type</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <select className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer">
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Salary Range (RM)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="e.g. 5,000 - 8,000"
              />
            </div>
          </div>
        </div>

        {/* AI Conversational Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Natural Language Expectations</label>
          <p className="text-xs text-slate-500 mb-3">Just type conversationally what you need. AI will parse this into structured skills and requirements.</p>
          <textarea 
            required
            rows={5}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none text-slate-700 leading-relaxed"
            placeholder="We are looking for someone who works hard, knows React and Next.js, and can build fast UIs. It would be great if they also know some Tailwind CSS. We offer a flexible working environment."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <MotionButton 
            type="submit" 
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-lg shadow-md shadow-indigo-200/50 cursor-pointer disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Generating Structure...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate AI Job Post
              </>
            )}
          </MotionButton>
        </div>
      </form>
    </div>
  );
}
