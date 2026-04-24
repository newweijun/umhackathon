"use client";

import { useState } from "react";
import { CheckCircle, Globe, MapPin, Building2, Loader2 } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";

interface VerifyCompanyButtonProps {
  companyId: string;
}

export function VerifyCompanyButton({ companyId }: VerifyCompanyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!confirm("Are you sure you want to verify this company? This will also open all their draft jobs.")) return;
    
    setLoading(true);
    try {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("Not authenticated");
      
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/verify-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ companyId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify company");
      }

      setVerified(true);
    } catch (error) {
      console.error("Verification error:", error);
      alert(error instanceof Error ? error.message : "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
        <CheckCircle className="w-4 h-4" />
        Verified
      </div>
    );
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-indigo-200"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCircle className="w-3.5 h-3.5" />
      )}
      Verify Profile
    </button>
  );
}
