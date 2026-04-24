"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Briefcase, Loader2, Globe } from "lucide-react";
import { getCompanyProfile, type CompanyProfileRecord } from "@/lib/services/companyProfile";
import AboutTab from "@/app/company/profile/components/AboutTab";
import StudentJobPostTab from "../components/StudentJobPostTab";

type TabType = "about" | "jobs";

export default function StudentCompanyProfilePage() {
  const { id } = useParams() as { id: string };
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CompanyProfileRecord | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      try {
        const data = await getCompanyProfile(id);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching company profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  const tabs = [
    { id: "about", label: "About", icon: null },
    { id: "jobs", label: "Job Posts", icon: null },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Company Not Found</h1>
        <p className="text-slate-500 mb-6">The company profile you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        {/* Back Button */}
        <div className="px-6 py-4 md:px-8 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-600 font-medium">Company Profile</span>
        </div>

        {/* Company Header Section */}
        <div className="px-6 md:px-8 pb-8">
          {/* Banner Image Placeholder */}
          <div className="w-full h-48 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
          </div>

          {/* Company Info Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative z-10 mb-8">
            {/* Company Logo */}
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg flex items-center justify-center text-white text-4xl font-bold border-4 border-white shrink-0">
              {profile.name?.charAt(0) || "C"}
            </div>

            {/* Company Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{profile.name || "Company Name"}</h1>
              
              <p className="text-slate-600 mb-3">
                {profile.industry || "Industry"} • {profile.headquarters || "Location"}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{profile.size || "Size Not Specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>Verified Company</span>
                </div>
                {profile.website && (
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 md:px-8 border-t border-slate-200">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-2 py-4 font-medium text-sm md:text-base border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">
        {activeTab === "about" ? (
          <AboutTab 
            profile={profile} 
            isEditing={false} 
            onProfileChange={() => {}} 
          />
        ) : (
          <StudentJobPostTab 
            companyId={id} 
            companyName={profile.name || ""} 
          />
        )}
      </div>
    </div>
  );
}
