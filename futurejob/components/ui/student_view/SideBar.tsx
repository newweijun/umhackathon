"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
// 1. Corrected router import
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Target,
  Video,
  MessageSquare,
  X,
  Zap,
  LogOut,
  User as UserIcon,
  ChevronUp,
} from "lucide-react";
// 2. Added useEffect

// 3. Changed import path to standard 'firebase/auth' and added onAuthStateChanged
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

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
  const router = useRouter(); // Initialize router inside the component

  // 4. Moved State and Refs INSIDE the component body
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 5. Added an Auth Listener so the sidebar actually knows who is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 6. Moved handleLogout INSIDE the component body
  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}

      {/* Sidebar Container */}
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
        <div
          className="p-3 border-t border-slate-100 relative group/profile"
          ref={dropdownRef}
        >
          <div
            className={`absolute bottom-full left-3 right-3 pb-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 z-50 ${isOpen ? "" : "md:hidden group-hover:block"}`}
          >
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg py-2 overflow-hidden">
              {/* Updated link from /company/profile to /student/profile */}
              <Link
                href="/student/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-700 hover:bg-slate-50 transition-colors duration-200 cursor-pointer overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>

            <div
              className={`flex items-center justify-between flex-1 transition-opacity duration-300 ${isOpen ? "opacity-100" : "md:opacity-0 group-hover:opacity-100"}`}
            >
              <div className="flex flex-col items-start text-left truncate overflow-hidden pr-2">
                {/* Updated default text to Student */}
                <span className="text-sm font-semibold truncate w-full">
                  {user?.displayName || "Student User"}
                </span>
                <span className="text-xs text-slate-500 truncate w-full">
                  {user?.email || "student@email.com"}
                </span>
              </div>
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 opacity-0 group-hover/profile:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
