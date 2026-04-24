"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  getCompanyInterviews,
  type InterviewRecord,
} from "@/lib/services/interviews";
import {
  getCandidateProfilesByIds,
  type CandidateProfileRecord,
} from "@/lib/services/candidateProfiles";
import InterviewCard from "@/components/ui/company_view/InterviewCard";
import ScheduleInterviewModal from "@/components/ui/company_view/ScheduleInterviewModal";
import { Calendar } from "lucide-react";

export default function Interviews() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [candidates, setCandidates] = useState<
    Map<string, CandidateProfileRecord>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const result = await getCompanyInterviews(currentUser.uid);
        setInterviews(result.interviews);
        setUsedFallback(result.usedFallback);

        const studentIds = result.interviews.map((i) => i.studentId);
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

    fetchInterviews();
  }, [currentUser]);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Interview Sessions
          </h1>
          <p className="text-slate-500">
            Manage your upcoming meetings with approved candidates.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          Schedule Interview
        </button>
      </header>

      {usedFallback ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Index is still building, so fallback loading is enabled. The page is
          available now, and it will automatically switch back to the indexed
          query once the index is ready.
        </div>
      ) : null}

      <div className="flex-1 flex flex-col gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-500 italic">
            Loading interviews...
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 border-8 border-indigo-50/50 rounded-3xl flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-indigo-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Upcoming Interviews
            </h2>
            <p className="text-slate-500 max-w-md leading-relaxed mb-6">
              You havent scheduled any interviews yet. Click the schedule button
              above to set up a meeting with a candidate.
            </p>
          </div>
        ) : (
          // 👇 THIS IS THE KEY CHANGE: grid-cols-1 forces it to span the whole screen width
          <div className="grid grid-cols-1 gap-4">
            {interviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                candidate={candidates.get(interview.studentId)}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <ScheduleInterviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            if (currentUser) {
              const fetchInterviews = async () => {
                setLoading(true);
                try {
                  const result = await getCompanyInterviews(currentUser.uid);
                  setInterviews(result.interviews);
                  setUsedFallback(result.usedFallback);

                  const studentIds = result.interviews.map((i) => i.studentId);
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
              fetchInterviews();
            }
          }}
          companyId={currentUser?.uid}
        />
      )}
    </div>
  );
}
