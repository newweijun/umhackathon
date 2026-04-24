"use client";

import { ApplicationRecord } from "@/lib/services/applications";
import { CandidateProfileRecord } from "@/lib/services/candidateProfiles";
import { Message } from "@/lib/services/messages";
import { Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  application: ApplicationRecord | null;
  participant: CandidateProfileRecord | any; // Change 'candidate' to 'participant'
  messages: Message[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  isBlocked: boolean;
  placeholder?: string;
}

export default function ChatWindow({
  application,
  participant, // Destructure as participant
  messages,
  currentUserId,
  onSendMessage,
  isBlocked,
  placeholder = "Type a message...",
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || isBlocked) return;
    onSendMessage(inputText);
    setInputText("");
  };

  if (!application) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
          {participant?.name?.charAt(0) || <User size={20} />}
        </div>
        <div>
          <h2 className="font-bold text-slate-900">
            {participant?.name || "Company"}
          </h2>
          <p className="text-xs text-slate-500">{application.role as string}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        {messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-slate-400 italic">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                  msg.senderId === currentUserId
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area - Where isBlocked is applied */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div
          className={`flex items-center gap-2 border rounded-xl px-3 py-2 transition-all ${
            isBlocked
              ? "bg-slate-50 border-slate-200"
              : "bg-white border-slate-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400"
          }`}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isBlocked}
            placeholder={isBlocked ? placeholder : "Type your reply..."}
            className="flex-1 bg-transparent border-none outline-none text-sm py-1 disabled:cursor-not-allowed disabled:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={isBlocked || !inputText.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        {isBlocked && (
          <p className="text-[10px] text-amber-600 mt-2 ml-1 font-medium">
            Note: Only the recruiter can initiate the chat.
          </p>
        )}
      </div>
    </div>
  );
}
