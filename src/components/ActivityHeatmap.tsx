import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useUserNotes } from '@/hooks/useUserNotes';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format, subDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface ActivityData {
  date: Date;
  count: number;
  details: string[];
}

const WEEKS_TO_SHOW = 20;
const DAYS_IN_WEEK = 7;

export function ActivityHeatmap() {
  const { data: userProgress } = useUserProgress();
  const { data: applications } = useJobApplications();
  const { data: notes } = useUserNotes();
  
  const [hoveredDay, setHoveredDay] = useState<ActivityData | null>(null);

  // Calculate activity data
  const activityMap = useMemo(() => {
    const map = new Map<string, ActivityData>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Initialize all days
    const startDate = subDays(startOfWeek(today), (WEEKS_TO_SHOW - 1) * 7);
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    
    allDays.forEach(date => {
      const key = format(date, 'yyyy-MM-dd');
      map.set(key, { date, count: 0, details: [] });
    });

    // Add progress activities
    userProgress?.forEach(progress => {
      if (progress.last_reviewed_at) {
        const date = new Date(progress.last_reviewed_at);
        const key = format(date, 'yyyy-MM-dd');
        const existing = map.get(key);
        if (existing) {
          existing.count++;
          existing.details.push(`Reviewed question: ${progress.status}`);
        }
      }
    });

    // Add job application activities
    applications?.forEach(app => {
      const createDate = new Date(app.created_at);
      const createKey = format(createDate, 'yyyy-MM-dd');
      const existing = map.get(createKey);
      if (existing) {
        existing.count++;
        existing.details.push(`Added application: ${app.company_name}`);
      }

      if (app.applied_at) {
        const applyDate = new Date(app.applied_at);
        const applyKey = format(applyDate, 'yyyy-MM-dd');
        const applyExisting = map.get(applyKey);
        if (applyExisting && applyKey !== createKey) {
          applyExisting.count++;
          applyExisting.details.push(`Applied to: ${app.company_name}`);
        }
      }
    });

    // Add notes activities
    notes?.forEach(note => {
      const date = new Date(note.created_at);
      const key = format(date, 'yyyy-MM-dd');
      const existing = map.get(key);
      if (existing) {
        existing.count++;
        existing.details.push(`Added note: ${note.title}`);
      }
    });

    return map;
  }, [userProgress, applications, notes]);

  // Organize into weeks
  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = subDays(startOfWeek(today), (WEEKS_TO_SHOW - 1) * 7);
    const allDays = eachDayOfInterval({ start: startDate, end: today });
    
    const weeksArray: ActivityData[][] = [];
    let currentWeek: ActivityData[] = [];
    
    allDays.forEach((date, index) => {
      const key = format(date, 'yyyy-MM-dd');
      const activity = activityMap.get(key) || { date, count: 0, details: [] };
      currentWeek.push(activity);
      
      if (currentWeek.length === 7 || index === allDays.length - 1) {
        weeksArray.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeksArray;
  }, [activityMap]);

  // Get color intensity based on activity count
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-muted/50';
    if (count <= 2) return 'bg-primary/20';
    if (count <= 4) return 'bg-primary/40';
    if (count <= 6) return 'bg-primary/60';
    return 'bg-primary';
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate total activities
  const totalActivities = useMemo(() => {
    let total = 0;
    activityMap.forEach(activity => {
      total += activity.count;
    });
    return total;
  }, [activityMap]);

  return (
    <div className="soft-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-serif font-semibold text-foreground">Activity</h2>
          <p className="text-sm text-muted-foreground">{totalActivities} contributions in the last {WEEKS_TO_SHOW} weeks</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted/50" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
          {dayLabels.map((label, i) => (
            <div key={label} className="h-3 flex items-center justify-end" style={{ display: i % 2 === 0 ? 'flex' : 'none' }}>
              {label}
            </div>
          ))}
        </div>

        {/* Weeks grid */}
        <div className="flex gap-1 overflow-x-auto">
          <TooltipProvider>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <Tooltip key={dayIndex}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                        className={cn(
                          'w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                          getColorClass(day.count),
                          isSameDay(day.date, today) && 'ring-2 ring-primary'
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-sm">
                        <p className="font-medium">
                          {day.count} activit{day.count === 1 ? 'y' : 'ies'} on {format(day.date, 'MMM d, yyyy')}
                        </p>
                        {day.details.length > 0 && (
                          <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                            {day.details.slice(0, 3).map((detail, i) => (
                              <li key={i}>• {detail}</li>
                            ))}
                            {day.details.length > 3 && (
                              <li>• +{day.details.length - 3} more</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
