"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/student_view/SideBar";
import { Menu, Zap } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Student Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* md:ml-20 ensures the main content is pushed over by exactly 5rem 
        to account for the collapsed desktop sidebar state. 
      */}
      <main className="flex-1 md:ml-20 flex flex-col w-full min-h-screen transition-all duration-300">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
          {/* Matched the branding from the Sidebar */}
          <div className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            <Zap className="w-6 h-6 text-indigo-500 shrink-0" />
            <span>FutureJob</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
