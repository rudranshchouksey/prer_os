import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'none';
}

export function GlassCard({ children, className, hover = true, glow = 'none' }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass rounded-2xl p-6",
        "transition-all duration-300",
        glow === 'blue' && "neon-border-blue",
        glow === 'purple' && "neon-border-purple",
        hover && "hover:border-primary/30",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
