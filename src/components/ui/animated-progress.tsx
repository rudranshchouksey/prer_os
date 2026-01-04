import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className, 
  barClassName,
  size = 'md'
}: AnimatedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", heights[size], className)}>
      <motion.div
        className={cn("h-full bg-slate-900 rounded-full", barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}