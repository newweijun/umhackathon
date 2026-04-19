"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/company_view/Sidebar";
import { Menu } from "lucide-react";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      <main className="flex-1 md:ml-20 flex flex-col w-full min-h-screen transition-all duration-300">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-30">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            FutureJobSenpai
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
