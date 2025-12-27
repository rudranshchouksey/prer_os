import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'purple' | 'green';
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'md'
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'from-primary to-primary/70',
    purple: 'from-secondary to-secondary/70',
    green: 'from-success to-success/70'
  };
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="font-mono text-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colorClasses[color]
          )}
        />
      </div>
    </div>
  );
}
