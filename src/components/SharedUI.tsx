import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Logo: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={cn("relative flex items-center justify-center group", sizes[size], className)}>
      {/* Structural Frame */}
      <motion.div
        animate={{ 
          rotate: [0, 90, 0],
          scale: [1, 1.05, 1] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-brand-dark rounded-2xl border-2 border-indigo-500/10 shadow-xl shadow-brand-primary/5"
      />
      
      {/* Internal letters */}
      <div className="relative z-10 flex flex-col items-center justify-center leading-none">
        <span className="text-white font-black italic tracking-tighter select-none" style={{ fontSize: size === 'xl' ? '2rem' : size === 'lg' ? '1.5rem' : '1rem' }}>
          CH
        </span>
      </div>

      {/* Status indicator */}
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
    </div>
  );
};

import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-brand-primary font-bold text-sm transition-all group"
    >
      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </div>
      <span>Back</span>
    </button>
  );
};
