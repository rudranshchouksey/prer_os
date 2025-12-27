import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  streak: number;
  className?: string;
}

export function StreakCounter({ streak, className }: StreakCounterProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center gap-3 glass rounded-2xl p-4",
        streak > 0 && "neon-border-purple",
        className
      )}
    >
      <div className="relative">
        <motion.div
          animate={streak > 0 ? {
            scale: [1, 1.1, 1],
          } : undefined}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Flame className={cn(
            "w-8 h-8",
            streak > 0 ? "text-warning" : "text-muted-foreground"
          )} />
        </motion.div>
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 blur-xl bg-warning/40"
          />
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-mono neon-text-purple">{streak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>
    </motion.div>
  );
}
