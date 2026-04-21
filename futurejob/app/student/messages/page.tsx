"use client";

import React, { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
} from "firebase/firestore";
import ChatSidebar from "@/components/ui/student_view/messages/ChatSideBar";
import ChatEmptyState from "@/components/ui/student_view/messages/ChatEmptyState";
import ChatWindow from "@/components/ui/student_view/messages/ChatWindow";
import { Chat } from "@/lib/types/chat";
import { firebaseAuth, firebaseDb } from "@/lib/firebase/client";

type FirestoreMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  participants: string[];
  studentId?: string;
  companyId?: string;
  companyName?: string;
  createdAt?: Timestamp;
};

function toMessageRecord(snapshot: QueryDocumentSnapshot<DocumentData>): FirestoreMessage {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    text: typeof data.text === "string" ? data.text : "",
    senderId: typeof data.senderId === "string" ? data.senderId : "",
    senderName: typeof data.senderName === "string" ? data.senderName : undefined,
    participants: Array.isArray(data.participants)
      ? data.participants.filter((item: unknown): item is string => typeof item === "string")
      : [],
    studentId: typeof data.studentId === "string" ? data.studentId : undefined,
    companyId: typeof data.companyId === "string" ? data.companyId : undefined,
    companyName: typeof data.companyName === "string" ? data.companyName : undefined,
    createdAt: data.createdAt,
  };
}

function formatMessageTime(value?: Timestamp) {
  if (!value) {
    return "Now";
  }

  return value.toDate().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConversationTime(value?: Timestamp) {
  if (!value) {
    return "Now";
  }

  const date = value.toDate();
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return formatMessageTime(value);
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function buildChats(messages: FirestoreMessage[], currentUserId: string): Chat[] {
  const grouped = new Map<string, FirestoreMessage[]>();

  for (const message of messages) {
    const participantId =
      message.companyId || message.participants.find((item) => item !== currentUserId) || "unknown";

    const bucket = grouped.get(participantId) ?? [];
    bucket.push(message);
    grouped.set(participantId, bucket);
  }

  return Array.from(grouped.entries())
    .map(([participantId, bucket]) => {
      const sorted = [...bucket].sort(
        (a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0)
      );

      const latest = sorted[sorted.length - 1];
      const latestMillis = latest?.createdAt?.toMillis() ?? 0;
      const companyName =
        latest?.companyName ||
        latest?.senderName ||
        (participantId === "unknown" ? "Unknown Company" : `Company ${participantId.slice(0, 6)}`);

      return {
        chat: {
          id: participantId,
          participantId,
          company: companyName,
          avatar: companyName.charAt(0).toUpperCase() || "C",
          lastMessage: latest?.text || "No messages yet",
          time: formatConversationTime(latest?.createdAt),
          messages: sorted.map((item) => ({
            id: item.id,
            text: item.text,
            sender: item.senderName || (item.senderId === currentUserId ? "Me" : companyName),
            isMe: item.senderId === currentUserId,
            time: formatMessageTime(item.createdAt),
          })),
        } satisfies Chat,
        latestMillis,
      };
    })
    .sort((a, b) => b.latestMillis - a.latestMillis)
    .map((item) => item.chat);
}

export default function StudentMessages() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("Student");
  const [rawMessages, setRawMessages] = useState<FirestoreMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUserId(user?.uid ?? null);
      setCurrentUserName(user?.displayName || user?.email || "Student");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setRawMessages([]);
      setLoading(false);
      setError("Please sign in to view your messages.");
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(firebaseDb, "messages");
    const messagesQuery = query(
      messagesRef,
      where("participants", "array-contains", currentUserId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const records = snapshot.docs.map(toMessageRecord);
        setRawMessages(records);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message || "Failed to load messages.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  const chats = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    return buildChats(rawMessages, currentUserId);
  }, [rawMessages, currentUserId]);

  useEffect(() => {
    if (chats.length === 0) {
      setActiveChatId(null);
      return;
    }

    if (!activeChatId || !chats.some((chat) => chat.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [activeChatId, chats]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;

  async function handleSendMessage(chat: Chat, text: string) {
    if (!currentUserId) {
      setError("Please sign in to send messages.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await addDoc(collection(firebaseDb, "messages"), {
        text,
        senderId: currentUserId,
        senderName: currentUserName,
        participants: [currentUserId, chat.participantId],
        studentId: currentUserId,
        companyId: chat.participantId,
        companyName: chat.company,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Failed to send message.";
      setError(message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-300">
      <header className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">
          Communicate with employers and recruiters regarding your applications.
        </p>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Loading conversations...
          </div>
        ) : (
          <>
            <ChatSidebar chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} />

            <div className="flex-1 flex flex-col bg-white">
              {!activeChat ? (
                <ChatEmptyState />
              ) : (
                <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} sending={sending} />
              )}
            </div>
          </>
        )}
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
