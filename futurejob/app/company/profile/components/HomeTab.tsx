"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeTab() {
  const posts = [
    {
      id: 1,
      title: "Google announces new AI initiatives",
      description:
        "We're excited to share our latest AI research and products that are helping to solve some of the world's biggest challenges.",
      date: "2 days ago",
      image: "bg-gradient-to-br from-blue-500 to-cyan-500",
      likes: 1245,
      comments: 89,
    },
    {
      id: 2,
      title: "Join our Engineering Team",
      description:
        "We're hiring talented engineers to join our team. Explore opportunities in full-stack development, cloud infrastructure, and more.",
      date: "5 days ago",
      image: "bg-gradient-to-br from-purple-500 to-pink-500",
      likes: 892,
      comments: 156,
    },
    {
      id: 3,
      title: "Women in Tech - Celebrating Our Team",
      description:
        "This month we celebrate the incredible women engineers, product managers, and designers who drive innovation at Google.",
      date: "1 week ago",
      image: "bg-gradient-to-br from-green-500 to-emerald-500",
      likes: 2103,
      comments: 234,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Call to Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Interested in working with us in the future?
        </h2>
        <p className="text-slate-600 mb-6">
          Members who share that they're interested in a company may be 2x as
          likely to get a message from a recruiter than those who don't.{" "}
          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
            Learn more
          </button>
        </p>
        <button className="px-6 py-2.5 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
          I'm interested
        </button>
      </motion.div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Post Image */}
            <div className={`w-full h-48 ${post.image}`} />

            {/* Post Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {post.title}
              </h3>
              <p className="text-slate-600 mb-4">{post.description}</p>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>{post.date}</span>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center justify-between text-sm text-slate-600 pb-4 border-b border-slate-100">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-sm">
                  <Heart className="w-4 h-4" />
                  Like
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
