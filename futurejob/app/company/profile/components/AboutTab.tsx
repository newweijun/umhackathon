"use client";

import { motion } from "framer-motion";
import { Award, Globe, Target, Users } from "lucide-react";

export default function AboutTab() {
  const sections = [
    {
      icon: Target,
      title: "About Us",
      content:
        "Google is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, search engine, cloud computing, software, and hardware. It is considered one of the Big Tech companies, alongside Amazon, Apple, Meta, and Microsoft.",
    },
    {
      icon: Award,
      title: "Our Mission",
      content:
        "To organize the world's information and make it universally accessible and useful. We believe that innovation drives human progress and that technology has the power to solve some of the world's greatest challenges.",
    },
    {
      icon: Globe,
      title: "Our Reach",
      content:
        "With offices in over 50 countries and serving billions of users worldwide, Google is a truly global company committed to diversity, inclusion, and creating positive social impact.",
    },
    {
      icon: Users,
      title: "Our Culture",
      content:
        "We foster a culture of innovation, collaboration, and continuous learning. Our teams are passionate about creating products that make a difference in people's lives every day.",
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
        <h2 className="text-2xl font-bold text-slate-900 mb-6">About Google</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              About the company
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Google is a world leader in online advertising, search, and cloud
              services. Founded in 1998, we've grown to serve over 3 billion
              people worldwide with innovative products and services.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Industry
            </h3>
            <p className="text-slate-600 mb-6">Software Development</p>

            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Company size
            </h3>
            <p className="text-slate-600 mb-6">10,001+ employees</p>

            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Headquarters
            </h3>
            <p className="text-slate-600">Mountain View, CA, USA</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Founded
            </h3>
            <p className="text-slate-600 mb-6">1998</p>

            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Website
            </h3>
            <p className="text-indigo-600 hover:text-indigo-700 mb-6 cursor-pointer">
              www.google.com
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "Search",
                "Advertising",
                "Cloud",
                "AI",
                "Hardware",
                "Mobile",
                "Maps",
              ].map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
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
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Team Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold mb-8">By the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Years in Business", value: "26+" },
            { label: "Countries", value: "50+" },
            { label: "Employees", value: "190k+" },
            { label: "Users Served", value: "3B+" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-white/80 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
