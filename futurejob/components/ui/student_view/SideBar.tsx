"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Target,
  Video,
  MessageSquare,
  Settings,
  X,
  Zap,
} from "lucide-react";

// Updated for the Student View feature set
const navItems = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Resume Lab", href: "/student/resume", icon: FileText },
  { name: "Job Matches", href: "/student/match", icon: Target },
  { name: "Interviews", href: "/student/interviews", icon: Video },
  { name: "Messages", href: "/student/messages", icon: MessageSquare },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* On mobile: width 64 (16rem), offscreen unless isOpen is true.
        On desktop: width 20 (5rem), expands to 64 (16rem) on hover. group class added for styling children.
      */}
      <aside
        className={`bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out group ${
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 w-64 md:w-20 hover:w-64"
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            <Zap className="w-8 h-8 text-indigo-500 shrink-0" />
            <span
              className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "md:opacity-0 group-hover:opacity-100"}`}
            >
              FutureJob
            </span>
          </div>
          <button
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            onClick={() => setIsOpen?.(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-x-hidden overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen?.(false)}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 cursor-pointer font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <item.icon
                  className={`w-6 h-6 shrink-0 ${isActive ? "text-indigo-600" : ""}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "md:opacity-0 group-hover:opacity-100"}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Settings */}
        <div className="p-3 border-t border-slate-100 overflow-hidden whitespace-nowrap">
          <button className="flex items-center gap-4 px-3 py-3 w-full rounded-xl text-slate-600 hover:bg-slate-50 transition-colors duration-200 cursor-pointer font-medium">
            <Settings className="w-6 h-6 shrink-0" strokeWidth={2} />
            <span
              className={`transition-opacity duration-300 ${isOpen ? "opacity-100" : "md:opacity-0 group-hover:opacity-100"}`}
            >
              Settings
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
