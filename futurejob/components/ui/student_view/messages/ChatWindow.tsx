"use client";

import React, { useState } from "react";
import { Send, User } from "lucide-react";
import { Chat } from "@/lib/types/chat";

interface ChatWindowProps {
  chat: Chat;
  onSendMessage?: (chat: Chat, text: string) => Promise<void>;
  sending?: boolean;
}

export default function ChatWindow({ chat, onSendMessage, sending = false }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (onSendMessage) {
      await onSendMessage(chat, inputText.trim());
    }
    setInputText("");
  };

  return (
    <>
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
          {chat.avatar}
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{chat.company}</h3>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
          >
            <div className="flex max-w-[80%] gap-3">
              {!msg.isMe && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 mt-auto">
                  {chat.avatar}
                </div>
              )}

              <div>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isMe
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`text-xs text-slate-400 mt-1 ${msg.isMe ? "text-right" : "text-left"}`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.isMe && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-auto">
                  <User size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm text-slate-700"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
