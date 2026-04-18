"use client";

import { useState } from "react";
import { Search, Filter, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

// Mock Data
const mockApplicants = [
  { id: 1, name: "Alice Chen", skills: "React, Next.js, Tailwind", match: 96, status: "Pending", reason: "Strong background in Next.js. Exceeds required experience." },
  { id: 2, name: "Marcus Johnson", skills: "Vue, Nuxt, CSS", match: 72, status: "Pending", reason: "Lacks React experience but shows strong frontend fundamentals." },
  { id: 3, name: "Sarah Lee", skills: "React, Node.js, PostgreSQL", match: 92, status: "Approved", reason: "Perfect tech stack match. Included excellent portfolio." },
  { id: 4, name: "David Kim", skills: "Python, Django, React", match: 85, status: "Pending", reason: "Good full-stack knowledge, slightly lower on specific frontend requirements." },
];

export default function CompanyDashboard() {
  const [selectedApplicant, setSelectedApplicant] = useState<typeof mockApplicants[0] | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6">
      {/* Main Table Area */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applicant Dashboard</h1>
            <p className="text-slate-500">Frontend Developer Role • 4 Applicants</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors duration-200">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </header>

        {/* High Density Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Candidate</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Core Skills</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Match %</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockApplicants.map((applicant) => (
                <tr 
                  key={applicant.id} 
                  onClick={() => setSelectedApplicant(applicant)}
                  className={`hover:bg-indigo-50/50 cursor-pointer transition-colors duration-150 ${selectedApplicant?.id === applicant.id ? 'bg-indigo-50/80' : ''}`}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{applicant.name}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{applicant.skills}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                      applicant.match >= 90 ? 'bg-emerald-100 text-emerald-700' : 
                      applicant.match >= 80 ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {applicant.match}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md border ${
                      applicant.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer" title="Approve">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" title="Reject">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Reasoning Panel */}
      {selectedApplicant && (
        <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-slate-900">{selectedApplicant.name}</h2>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-3xl font-black text-indigo-600">{selectedApplicant.match}%</div>
              <div className="text-sm font-medium text-slate-500 leading-tight">AI Match<br/>Score</div>
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">AI Reasoning Trace</h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
              {selectedApplicant.reason}
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-8 mb-3">Next Steps</h3>
            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-colors cursor-pointer flex justify-center items-center gap-2">
              Schedule Interview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
