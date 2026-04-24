"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import {
  getStudentApplications,
  type ApplicationRecord,
} from "@/lib/services/applications";
import {
  getCompanyProfilesByIds,
  type CompanyProfileRecord,
} from "@/lib/services/companyProfile";
import {
  sendMessage,
  subscribeToMessages,
  type Message,
} from "@/lib/services/messages";
import ChatSidebar from "@/components/ui/company_view/ChatSidebar";
import ChatWindow from "@/components/ui/company_view/ChatWindow";
import { Loader2 } from "lucide-react";

export default function StudentMessages() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [companies, setCompanies] = useState<Map<string, CompanyProfileRecord>>(
    new Map(),
  );
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationRecord | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) =>
      setCurrentUser(user),
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const apps = await getStudentApplications(currentUser.uid);
          // Only show apps where chat is possible (e.g., approved or further)
          const filteredApps = apps.filter((a) =>
            ["approved", "interviewing", "offered"].includes(a.status),
          );
          setApplications(filteredApps);

          const companyIds = Array.from(
            new Set(filteredApps.map((app) => app.companyId)),
          );
          if (companyIds.length > 0) {
            const profiles = await getCompanyProfilesByIds(companyIds);
            setCompanies(profiles);
          }
        } catch (error) {
          console.error("Error fetching student messages:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
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
    if (!selectedApplication || !currentUser || messages.length === 0) return;
    await sendMessage(
      currentUser.uid,
      selectedApplication.companyId,
      text,
      selectedApplication.id,
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4">My Conversations</h1>
      <div className="flex-1 flex overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <>
            <ChatSidebar
              applications={applications}
              candidates={companies}
              selectedId={selectedApplication?.id || null}
              onSelect={setSelectedApplication}
              type="student"
            />
            <ChatWindow
              application={selectedApplication}
              participant={
                selectedApplication
                  ? companies.get(selectedApplication.companyId)
                  : undefined
              }
              messages={messages}
              currentUserId={currentUser?.uid}
              onSendMessage={handleSendMessage}
              isBlocked={messages.length === 0} // Student cannot start
              placeholder="Waiting for company to initiate..."
            />
          </>
        )}
      </div>
    </div>
  );
}
