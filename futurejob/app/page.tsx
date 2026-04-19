"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Sparkles, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  const companyLoginHref = {
    pathname: "/login",
    query: { next: "/company/dashboard" },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-100/50 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-40 left-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl -z-10 pointer-events-none transform -translate-x-1/3" />

      {/* Floating Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
        <nav className="w-full max-w-5xl glass-card px-6 py-3 flex items-center justify-between rounded-full border-white/40 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-1.5 rounded-lg">
              <Zap size={20} className="fill-white/20" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Future<span className="text-indigo-600">Job</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</Link>
            <Link href={companyLoginHref} className="hover:text-indigo-600 transition-colors">For Companies</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/jobs" 
              className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          className="w-full max-w-4xl text-center flex flex-col items-center mt-12 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-6"
          >
            <Sparkles size={16} />
            <span>AI-Powered Matching Engine</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6"
          >
            Find Your Next Career <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500">
              With Zero Friction.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed"
          >
            Connect with top companies instantly. Our intelligent platform matches your unique skills with the perfect opportunities, eliminating the noise of traditional job hunting.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/jobs" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Briefcase size={20} />
              Explore Jobs
            </Link>
            <Link 
              href={companyLoginHref}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <Building2 size={20} />
              Company Portal
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          id="features"
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start text-left hover:shadow-md hover:border-indigo-100 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Smart Matching</h3>
            <p className="text-slate-600 mb-4 leading-relaxed flex-1">
              Our AI analyzes your skills and preferences to surface jobs where you&apos;re most likely to succeed.
            </p>
            <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all">
              Learn more <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start text-left hover:shadow-md hover:border-violet-100 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 group-hover:bg-violet-100 transition-all duration-300">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">One-Click Apply</h3>
            <p className="text-slate-600 mb-4 leading-relaxed flex-1">
              Say goodbye to repetitive forms. Build your profile once and apply to top companies in seconds.
            </p>
            <div className="flex items-center text-violet-600 font-medium text-sm group-hover:gap-2 transition-all">
              Learn more <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start text-left hover:shadow-md hover:border-cyan-100 transition-all duration-300 group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 group-hover:bg-cyan-100 transition-all duration-300">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Verified Companies</h3>
            <p className="text-slate-600 mb-4 leading-relaxed flex-1">
              Every employer on our platform is vetted. Experience transparent hiring processes without ghosting.
            </p>
            <div className="flex items-center text-cyan-600 font-medium text-sm group-hover:gap-2 transition-all">
              Learn more <ArrowRight size={16} className="ml-1" />
            </div>
          </motion.div>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="bg-slate-900 text-white p-1 rounded-md">
              <Zap size={16} className="fill-white/20" />
            </div>
            <span className="font-bold text-slate-900">Future<span className="text-indigo-600">Job</span></span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} FutureJobSenpai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
