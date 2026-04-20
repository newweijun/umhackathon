"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-indigo-50 border-8 border-indigo-50/50 rounded-3xl flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-indigo-500" strokeWidth={2.5} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Select a conversation
      </h2>
      <p className="text-slate-500 max-w-sm leading-relaxed">
        Choose an employer from the left sidebar to view your messages and
        updates.
      </p>
    </div>
  );
}
