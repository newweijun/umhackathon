"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Briefcase } from "lucide-react";
import HomeTab from "./components/HomeTab";
import AboutTab from "./components/AboutTab";
import JobPostTab from "./components/JobPostTab";

type TabType = "home" | "about" | "jobs";

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const router = useRouter();

  const tabs = [
    { id: "home", label: "Home", icon: null },
    { id: "about", label: "About", icon: null },
    { id: "jobs", label: "Job Posts", icon: null },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab />;
      case "about":
        return <AboutTab />;
      case "jobs":
        return <JobPostTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        {/* Back Button */}
        <div className="px-6 py-4 md:px-8 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-600">Company Profile</span>
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
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg flex items-center justify-center text-white text-4xl font-bold border-4 border-white">
              G
            </div>

            {/* Company Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Google</h1>
              <p className="text-slate-600 mb-3">Software Development • Mountain View, CA</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>41M followers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>10k+ employees</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>Mountain View, CA</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                Edit Profile
              </button>
              <button className="flex-1 md:flex-none px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                Share
              </button>
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
        {renderTabContent()}
      </div>
    </div>
  );
}
