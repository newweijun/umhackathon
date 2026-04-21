"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getCompanyApplicationsByStatus, type ApplicationRecord } from "@/lib/services/applications";
import { getCandidateProfilesByIds, type CandidateProfileRecord } from "@/lib/services/candidateProfiles";
import { sendMessage, subscribeToMessages, type Message } from "@/lib/services/messages";
import ChatSidebar from "@/components/ui/company_view/ChatSidebar";
import ChatWindow from "@/components/ui/company_view/ChatWindow";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [candidates, setCandidates] = useState<Map<string, CandidateProfileRecord>>(new Map());
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchApps = async () => {
        setLoading(true);
        try {
          const apps = await getCompanyApplicationsByStatus(currentUser.uid, "approved");
          setApplications(apps);
          
          const studentIds = apps.map(app => app.studentId);
          if (studentIds.length > 0) {
            const profiles = await getCandidateProfilesByIds(studentIds);
            setCandidates(profiles);
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchApps();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedApplication && currentUser) {
      const unsubscribe = subscribeToMessages(selectedApplication.id, currentUser.uid, (msgs) => {
        setMessages(msgs);
      });
      return () => unsubscribe();
    } else {
      setMessages([]);
    }
  }, [selectedApplication, currentUser]);

  const handleSendMessage = async (text: string) => {
    if (!selectedApplication || !currentUser || !text.trim()) return;
    
    try {
      await sendMessage(
        currentUser.uid,
        selectedApplication.studentId,
        text,
        selectedApplication.id
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500">
          Keep in touch with your approved applicants.
        </p>
      </header>

      <div className="flex-1 glass-card flex flex-col md:flex-row overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-500 italic">
            Loading conversations...
          </div>
        ) : (
          <>
            <ChatSidebar 
              applications={applications}
              candidates={candidates}
              selectedId={selectedApplication?.id || null}
              onSelect={setSelectedApplication}
            />
            
            <ChatWindow 
              application={selectedApplication}
              candidate={selectedApplication ? candidates.get(selectedApplication.studentId) : undefined}
              messages={messages}
              currentUserId={currentUser?.uid}
              onSendMessage={handleSendMessage}
            />
          </>
        )}
      </div>
    </div>
  );
}
