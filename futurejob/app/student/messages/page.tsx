"use client";

import React, { useState } from "react";
// Adjust these import paths based on your actual folder structure:
import ChatSidebar from "@/components/ui/student_view/messages/ChatSideBar";
import ChatEmptyState from "@/components/ui/student_view/messages/ChatEmptyState";
import ChatWindow from "@/components/ui/student_view/messages/ChatWindow";
import { Chat } from "@/lib/types/chat";
const MOCK_CHATS: Chat[] = [
  {
    id: "chat_001",
    company: "Stripe Recruiting",
    avatar: "S",
    lastMessage: "We'd like to schedule a call with you next week!",
    time: "10:30 AM",
    messages: [
      {
        id: 1,
        text: "Hi! Thanks for applying to the Fullstack Developer role.",
        sender: "Stripe",
        isMe: false,
        time: "10:25 AM",
      },
      {
        id: 2,
        text: "We'd like to schedule a call with you next week!",
        sender: "Stripe",
        isMe: false,
        time: "10:30 AM",
      },
    ],
  },
  {
    id: "chat_002",
    company: "Google HR",
    avatar: "G",
    lastMessage: "Your resume is currently under review.",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        text: "Thanks for applying. Your resume is currently under review by our technical team.",
        sender: "Google",
        isMe: false,
        time: "Yesterday",
      },
      {
        id: 2,
        text: "Thank you! Looking forward to hearing from you.",
        sender: "Me",
        isMe: true,
        time: "Yesterday",
      },
    ],
  },
];

export default function StudentMessages() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Find the selected chat data
  const activeChat = MOCK_CHATS.find((chat) => chat.id === activeChatId);

  return (
    <div className="min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-300">
      <header className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 mt-1">
          Communicate with employers and recruiters regarding your applications.
        </p>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        {/* Left Sidebar Component */}
        <ChatSidebar
          chats={MOCK_CHATS}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
        />

        {/* Right Main Area Component */}
        <div className="flex-1 flex flex-col bg-white">
          {!activeChat ? <ChatEmptyState /> : <ChatWindow chat={activeChat} />}
        </div>
      </div>
    </div>
  );
}
