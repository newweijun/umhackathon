import Link from "next/link";
import { LayoutDashboard, Briefcase, Calendar, MessageSquare, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
  { name: "Post Job", href: "/company/post-job", icon: Briefcase },
  { name: "Interviews", href: "/company/interviews", icon: Calendar },
  { name: "Messages", href: "/company/messages", icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
          FutureJobSenpai
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 cursor-pointer font-medium"
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Footer Settings */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-slate-50 transition-colors duration-200 cursor-pointer font-medium">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
