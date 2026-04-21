"use client";

import { useState, useRef, useEffect } from "react";
import { type ApplicationRecord } from "@/lib/services/applications";
import { type CandidateProfileRecord } from "@/lib/services/candidateProfiles";
import { type Message } from "@/lib/services/messages";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

interface ChatWindowProps {
  application: ApplicationRecord | null;
  candidate: CandidateProfileRecord | undefined;
  messages: Message[];
  currentUserId: string | undefined;
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ application, candidate, messages, currentUserId, onSendMessage }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  if (!application) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Select a conversation</h2>
        <p className="text-slate-500 max-w-xs mx-auto">
          Choose a candidate from the sidebar to start discussing the opportunity.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {(candidate?.fullName || candidate?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">{candidate?.fullName || candidate?.name || "Candidate"}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Candidate ID: {application.studentId.slice(-6)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
           >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
           </button>
        </div>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-sm">No messages yet. Send a greeting to start!</div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                }`}>
                  {msg.text}
                  {msg.createdAt && (
                    <div className={`text-[10px] mt-1 opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                       {new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      <ScheduleInterviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          // Optionally send a message about the scheduled interview
          onSendMessage(`I've scheduled an interview session for us. Please check the Interviews tab for details.`);
        }}
        companyId={currentUserId || ""}
        initialApplication={application}
      />
    </div>
  );
}
