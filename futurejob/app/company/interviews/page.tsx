"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getCompanyInterviews, type InterviewRecord } from "@/lib/services/interviews";
import { getCandidateProfilesByIds, type CandidateProfileRecord } from "@/lib/services/candidateProfiles";
import InterviewCard from "@/components/ui/company_view/InterviewCard";
import ScheduleInterviewModal from "@/components/ui/company_view/ScheduleInterviewModal";

export default function Interviews() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [candidates, setCandidates] = useState<Map<string, CandidateProfileRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchInterviews = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const result = await getCompanyInterviews(currentUser.uid);
      setInterviews(result.interviews);
      setUsedFallback(result.usedFallback);
      
      const studentIds = result.interviews.map(i => i.studentId);
      if (studentIds.length > 0) {
        const profiles = await getCandidateProfilesByIds(studentIds);
        setCandidates(profiles);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [currentUser]);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interview Sessions</h1>
          <p className="text-slate-500">Manage your upcoming meetings with approved candidates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
        >
          Schedule Interview
        </button>
      </header>

      {usedFallback ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Index is still building, so fallback loading is enabled. The page is available now, and it will automatically switch back to the indexed query once the index is ready.
        </div>
      ) : null}

      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8 text-slate-500 italic">
          Loading interviews...
        </div>
      ) : interviews.length === 0 ? (
        <div className="flex-1 glass-card p-4 md:p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Interviews</h2>
          <p className="text-slate-500 max-w-sm mb-6">You haven&apos;t scheduled any interviews yet. Start by selecting an approved candidate from the messages or dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <InterviewCard 
              key={interview.id} 
              interview={interview} 
              candidate={candidates.get(interview.studentId)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ScheduleInterviewModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchInterviews();
          }}
          companyId={currentUser?.uid}
        />
      )}
    </div>
  );
}
