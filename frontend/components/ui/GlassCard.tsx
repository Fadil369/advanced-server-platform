import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}

export function GlassCard({ 
  children, 
  className = "", 
  gradient = false, 
  hover = true 
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative backdrop-blur-xl bg-white/5 border border-white/10 
        rounded-2xl shadow-2xl overflow-hidden group
        ${gradient ? 'bg-gradient-to-br from-white/10 to-white/5' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {children}
    </motion.div>
  );
}
