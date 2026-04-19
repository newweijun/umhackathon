"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export function SearchBar({ wrapperClassName = "", className = "", ...props }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className={`relative ${wrapperClassName}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Search className={`w-5 h-5 absolute left-3 top-2.5 transition-colors duration-300 z-10 pointer-events-none ${isFocused ? 'text-indigo-500' : 'text-slate-400'}`} />
      <input 
        type="text" 
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
        className={`pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300 hover:shadow-md ${className}`}
      />
    </motion.div>
  );
}
