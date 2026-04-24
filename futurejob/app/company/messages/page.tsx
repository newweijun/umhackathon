"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  getCompanyApplicationsByStatus,
  type ApplicationRecord,
} from "@/lib/services/applications";
import {
  getCandidateProfilesByIds,
  type CandidateProfileRecord,
} from "@/lib/services/candidateProfiles";
import {
  sendMessage,
  subscribeToMessages,
  type Message,
} from "@/lib/services/messages";
import ChatSidebar from "@/components/ui/company_view/ChatSidebar";
import ChatWindow from "@/components/ui/company_view/ChatWindow";

export default function CompanyMessages() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [candidates, setCandidates] = useState<
    Map<string, CandidateProfileRecord>
  >(new Map());
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRecord | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchApps = async () => {
        setLoading(true);
        try {
          console.log("Logged in User ID:", currentUser.uid);
          console.log("Querying status:", "approved");
          const apps = await getCompanyApplicationsByStatus(
            currentUser.uid,
            "approved",
          );
          console.log("Found approved apps:", apps.length);
          setApplications(apps);

          const studentIds = apps.map((app) => app.studentId);
          if (studentIds.length > 0) {
            const profiles = await getCandidateProfilesByIds(studentIds);
            setCandidates(profiles);
          }
        } catch (error) {
          console.error("Error fetching company messages:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchApps();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedApplication && currentUser) {
      const unsubscribe = subscribeToMessages(
        selectedApplication.id,
        currentUser.uid,
        (msgs) => {
          setMessages(msgs);
        },
      );
      return () => unsubscribe();
    }
  }, [selectedApplication, currentUser]);

  const handleSendMessage = async (text: string) => {
    if (!selectedApplication || !currentUser) return;
    await sendMessage(
      currentUser.uid,
      selectedApplication.studentId,
      text,
      selectedApplication.id,
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4">Message</h1>
      <div className="flex-1 flex overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-500 italic">
            Loading...
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
              // Change 'candidate' to 'participant' to match the updated interface
              participant={
                selectedApplication
                  ? candidates.get(selectedApplication.studentId)
                  : undefined
              }
              messages={messages}
              currentUserId={currentUser?.uid}
              onSendMessage={handleSendMessage}
              isBlocked={false} // Company can always send
            />
          </>
        )}
      </div>
    </div>
  );
}
