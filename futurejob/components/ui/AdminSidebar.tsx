"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, ShieldCheck, Users, Briefcase, Settings, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Moderation", href: "/admin/moderation", icon: ShieldCheck },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
          FutureJob Admin
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer font-medium ${
                isActive 
                  ? "bg-sky-50 text-sky-700" 
                  : "text-slate-600 hover:text-sky-700 hover:bg-sky-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-slate-50 transition-colors duration-200 cursor-pointer font-medium">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer font-medium"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
