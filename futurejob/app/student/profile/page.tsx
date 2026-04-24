"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Code, 
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { getCandidateProfile, updateCandidateProfile, type CandidateProfileRecord } from "@/lib/services/candidateProfiles";
import { MotionButton } from "@/components/ui/company_view/MotionButton";

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Partial<CandidateProfileRecord>>({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login?next=/student/profile");
        return;
      }
      setUser(firebaseUser);
      
      try {
        const data = await getCandidateProfile(firebaseUser.uid);
        if (data) {
          setProfile({
            fullName: data.fullName || firebaseUser.displayName || "",
            email: data.email || firebaseUser.email || "",
            phone: data.phone || "",
            experience: data.experience || "",
            skills: Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || ""),
          });
        } else {
          // Initialize with auth data if no profile exists
          setProfile({
            fullName: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            phone: "",
            experience: "",
            skills: "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccess(false);

    try {
      // Convert skills string back to array if needed, or keep as string
      // The service supports both, but array is more structured
      const skillsArray = typeof profile.skills === "string" 
        ? profile.skills.split(",").map(s => s.trim()).filter(Boolean)
        : profile.skills;

      await updateCandidateProfile(user.uid, {
        ...profile,
        skills: skillsArray,
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Your Profile</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {success && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-right-2">
                <CheckCircle2 className="w-4 h-4" />
                Saved successfully
              </span>
            )}
            <MotionButton
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-70 transition-all cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </MotionButton>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. +60 12-345 6789"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Summary/Experience Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Experience & Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Professional Experience</label>
                <textarea
                  name="experience"
                  rows={6}
                  value={profile.experience}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-slate-700 leading-relaxed"
                  placeholder="Describe your past work experience, projects, or a brief professional summary..."
                />
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-500" />
                Technical Skills
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Skills (comma separated)</label>
                <textarea
                  name="skills"
                  rows={3}
                  value={profile.skills as string}
                  onChange={handleChange}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-slate-700 leading-relaxed"
                  placeholder="e.g. React, TypeScript, Next.js, Node.js, UI/UX Design..."
                />
                <p className="text-xs text-slate-500">
                  Separate your skills with commas. These will be used for AI matching.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
