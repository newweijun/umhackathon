"use client";

import { motion } from "framer-motion";
import { Award, Globe, Target, Users, Edit3 } from "lucide-react";
import { CompanyProfileRecord } from "@/lib/services/companyProfile";

interface AboutTabProps {
  profile: Partial<CompanyProfileRecord>;
  isEditing: boolean;
  onProfileChange: (data: Partial<CompanyProfileRecord>) => void;
}

export default function AboutTab({ profile, isEditing, onProfileChange }: AboutTabProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onProfileChange({ [name]: value });
  };

  const sections = [
    {
      icon: Target,
      title: "About Us",
      name: "about",
      content: profile.about || "Describe your company...",
    },
    {
      icon: Award,
      title: "Our Mission",
      name: "mission",
      content: profile.mission || "What is your company's mission?",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Company Overview</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
              {isEditing ? (
                <input
                  type="text"
                  name="industry"
                  value={profile.industry || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Software Development"
                />
              ) : (
                <p className="text-slate-600">{profile.industry || "Not specified"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company size</label>
              {isEditing ? (
                <input
                  type="text"
                  name="size"
                  value={profile.size || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. 10,001+ employees"
                />
              ) : (
                <p className="text-slate-600">{profile.size || "Not specified"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Headquarters</label>
              {isEditing ? (
                <input
                  type="text"
                  name="headquarters"
                  value={profile.headquarters || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Mountain View, CA, USA"
                />
              ) : (
                <p className="text-slate-600">{profile.headquarters || "Not specified"}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Founded</label>
              {isEditing ? (
                <input
                  type="text"
                  name="founded"
                  value={profile.founded || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. 1998"
                />
              ) : (
                <p className="text-slate-600">{profile.founded || "Not specified"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
              {isEditing ? (
                <input
                  type="text"
                  name="website"
                  value={profile.website || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. www.google.com"
                />
              ) : (
                <p className="text-indigo-600 hover:text-indigo-700 cursor-pointer">{profile.website || "Not specified"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Specialties (comma separated)</label>
              {isEditing ? (
                <input
                  type="text"
                  name="specialties"
                  value={Array.isArray(profile.specialties) ? profile.specialties.join(", ") : (profile.specialties || "")}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Search, Advertising, Cloud"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile.specialties) ? profile.specialties : (profile.specialties || "").split(",").map(s => s.trim()).filter(Boolean)).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                  {(!profile.specialties || profile.specialties.length === 0) && <p className="text-slate-500 text-sm">No specialties added</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-lg shrink-0">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {section.title}
                  </h3>
                  {isEditing ? (
                    <textarea
                      name={section.name}
                      value={section.content}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm text-slate-700"
                    />
                  ) : (
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
