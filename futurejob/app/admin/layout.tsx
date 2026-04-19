"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/ui/AdminSidebar";
import { firebaseAuth } from "@/lib/firebase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        const next = encodeURIComponent(pathname || "/admin/dashboard");
        router.replace(`/login?next=${next}`);
        return;
      }

      setIsAuthReady(true);
    });

    return unsubscribe;
  }, [pathname, router]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
