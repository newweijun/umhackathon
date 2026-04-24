"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Briefcase, Save, Edit3, Loader2, CheckCircle2 } from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getCompanyProfile, updateCompanyProfile, type CompanyProfileRecord } from "@/lib/services/companyProfile";
import AboutTab from "./components/AboutTab";
import JobPostTab from "./components/JobPostTab";
import { MotionButton } from "@/components/ui/company_view/MotionButton";

type TabType = "about" | "jobs";

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Partial<CompanyProfileRecord>>({
    name: "",
    industry: "",
    size: "",
    headquarters: "",
    website: "",
    about: "",
    mission: "",
    founded: "",
    specialties: [],
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login?next=/company/profile");
        return;
      }
      setUser(firebaseUser);
      
      try {
        const data = await getCompanyProfile(firebaseUser.uid);
        if (data) {
          setProfile(data);
        } else {
          // Initialize with some default if no profile exists
          setProfile({
            name: firebaseUser.displayName || "Your Company",
            website: "",
            industry: "",
          });
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Process specialties if they are string
      const finalProfile = { ...profile };
      if (typeof finalProfile.specialties === "string") {
        finalProfile.specialties = finalProfile.specialties.split(",").map(s => s.trim()).filter(Boolean);
      }

      await updateCompanyProfile(user.uid, finalProfile);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (newData: Partial<CompanyProfileRecord>) => {
    setProfile(prev => ({ ...prev, ...newData }));
  };

  const tabs = [
    { id: "about", label: "About", icon: null },
    { id: "jobs", label: "Job Posts", icon: null },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutTab profile={profile} isEditing={isEditing} onProfileChange={handleProfileChange} />;
      case "jobs":
        return <JobPostTab companyId={user?.uid || ""} companyName={profile.name || ""} />;
      default:
        return <AboutTab profile={profile} isEditing={isEditing} onProfileChange={handleProfileChange} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        {/* Back Button */}
        <div className="px-6 py-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-600 font-medium">Company Profile</span>
          </div>
          
          <div className="flex items-center gap-3">
            {success && (
              <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}
            {isEditing ? (
              <MotionButton
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </MotionButton>
            ) : (
              <MotionButton
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </MotionButton>
            )}
          </div>
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
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name || ""}
                  onChange={(e) => handleProfileChange({ name: e.target.value })}
                  className="text-3xl font-bold text-slate-900 mb-2 bg-white border border-slate-200 rounded px-2 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Company Name"
                />
              ) : (
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{profile.name || "Your Company"}</h1>
              )}
              
              <p className="text-slate-600 mb-3">
                {profile.industry || "Industry"} • {profile.headquarters || "Location"}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{profile.size || "Size"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>Verified Company</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.headquarters || "Global"}</span>
                </div>
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
        {renderTabContent()}
      </div>
    </div>
  );
}
