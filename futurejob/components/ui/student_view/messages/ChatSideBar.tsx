"use client";

import React from "react";
import { Chat } from "@/lib/types/chat";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
}: ChatSidebarProps) {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-4 shrink-0 flex flex-col">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
        Recent Conversations
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {chats.map((chat) => {
          const isActive = activeChatId === chat.id;
          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                isActive
                  ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                  : "border border-transparent hover:bg-slate-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <div
                    className={`font-semibold text-sm truncate ${isActive ? "text-indigo-900" : "text-slate-900"}`}
                  >
                    {chat.company}
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {chat.time}
                  </div>
                </div>
                <div
                  className={`text-xs truncate ${isActive ? "text-indigo-600 font-medium" : "text-slate-500"}`}
                >
                  {chat.lastMessage}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
