import { useMemo } from 'react';
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
import { 
  format, 
  subDays, 
  eachDayOfInterval, 
  isSameDay
} from 'date-fns';
import { Activity, Calendar as CalendarIcon } from 'lucide-react';

const DAYS_TO_SHOW = 160; 

// --- 1. STRICT INTERFACES (Fixes "Property does not exist" errors) ---

interface ActivityData {
  date: Date;
  count: number;
  details: string[];
}

// These match your Supabase DB Schema return types
interface ProgressItem {
  last_reviewed_at: string | null;
  status: string;
}

interface ApplicationItem {
  created_at: string;
  company_name: string;
}

interface NoteItem {
  created_at: string;
  title: string | null;
}

export function ActivityHeatmap() {
  const { data: userProgress } = useUserProgress();
  const { data: applications } = useJobApplications();
  const { data: notes } = useUserNotes();
  
  const { days, totalCount, maxCount } = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, DAYS_TO_SHOW);
    const allDaysRaw = eachDayOfInterval({ start: startDate, end: today });
    const activityMap = new Map<string, ActivityData>();

    allDaysRaw.forEach(date => {
      activityMap.set(format(date, 'yyyy-MM-dd'), { date, count: 0, details: [] });
    });

    // --- 2. SAFE CASTING (Fixes "Object is of type unknown" errors) ---
    
    // We force cast (as ...) because we know the shape, but TS might not infer it from the hook
    const safeProgress = (userProgress || []) as unknown as ProgressItem[];
    
    safeProgress.forEach(p => {
      if (p.last_reviewed_at) {
        const key = format(new Date(p.last_reviewed_at), 'yyyy-MM-dd');
        const entry = activityMap.get(key);
        if (entry) {
          entry.count += 1;
          if (!entry.details.includes('Study Session')) entry.details.push('Study Session');
        }
      }
    });

    const safeApplications = (applications || []) as unknown as ApplicationItem[];
    
    safeApplications.forEach(a => {
      if (a.created_at) {
        const key = format(new Date(a.created_at), 'yyyy-MM-dd');
        const entry = activityMap.get(key);
        if (entry) {
          entry.count += 2;
          entry.details.push(`Job: ${a.company_name}`);
        }
      }
    });

    const safeNotes = (notes || []) as unknown as NoteItem[];
    
    safeNotes.forEach(n => {
      if (n.created_at) {
        const key = format(new Date(n.created_at), 'yyyy-MM-dd');
        const entry = activityMap.get(key);
        if (entry) {
          entry.count += 1;
          entry.details.push(`Note: ${n.title || 'Untitled'}`);
        }
      }
    });

    let total = 0;
    let max = 0;
    const finalDays = Array.from(activityMap.values());
    
    finalDays.forEach(d => {
      total += d.count;
      if (d.count > max) max = d.count;
    });

    return { days: finalDays, totalCount: total, maxCount: max };
  }, [userProgress, applications, notes]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200';
    const ceiling = Math.max(maxCount, 5); 
    const ratio = count / ceiling;
    if (ratio <= 0.25) return 'bg-purple-200 hover:bg-purple-300'; 
    if (ratio <= 0.50) return 'bg-purple-400 hover:bg-purple-500'; 
    if (ratio <= 0.75) return 'bg-purple-600 hover:bg-purple-700'; 
    return 'bg-purple-800 hover:bg-purple-900 shadow-sm shadow-purple-200'; 
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-2">
        <div>
           <h3 className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
             <Activity className="w-3 h-3" />
             Contribution Activity
           </h3>
           <div className="flex items-baseline gap-2 mt-1">
             <span className="text-2xl font-bold text-gray-900">
               {totalCount}
             </span>
             <span className="text-xs sm:text-sm text-gray-500 font-medium">
               contributions in last {Math.round(DAYS_TO_SHOW/30)} months
             </span>
           </div>
        </div>
        
        {/* Legend */}
        <div className="hidden min-[400px]:flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-[3px]">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-gray-100" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-purple-200" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-purple-400" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-purple-600" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-purple-800" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide touch-pan-x">
        <div className="min-w-[600px] select-none">
          <div className="flex">
            {/* Y-Axis Labels */}
            <div className="flex flex-col gap-[3px] mt-5 mr-2 pr-2 border-r border-gray-100">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <span key={i} className={cn(
                  "text-[9px] h-[10px] leading-none",
                  i % 2 !== 0 ? "text-gray-400 font-medium" : "text-transparent"
                )}>{d}</span>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex-1">
              <div className="flex mb-1 h-4 relative w-full">
                 <span className="text-[10px] text-gray-400 absolute left-0">{format(days[0].date, 'MMM')}</span>
                 <span className="text-[10px] text-gray-400 absolute left-1/2">{format(days[Math.floor(days.length/2)].date, 'MMM')}</span>
                 <span className="text-[10px] text-gray-400 absolute right-0">Today</span>
              </div>

              <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                <TooltipProvider delayDuration={0}>
                  {days.map((day, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.002 }}
                          className={cn(
                            "w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all duration-200 tap-highlight-transparent",
                            getIntensityClass(day.count),
                            isSameDay(day.date, new Date()) && "ring-1 ring-gray-900 ring-offset-1"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-white border border-gray-200 text-gray-900 p-3 rounded-lg shadow-xl z-50">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                             <CalendarIcon className="w-3 h-3" />
                             {format(day.date, 'EEE, MMM do')}
                          </div>
                          <div className="text-sm font-bold">
                            {day.count === 0 ? 'No contributions' : `${day.count} contributions`}
                          </div>
                          {day.details.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-gray-100">
                              <ul className="space-y-1">
                                {day.details.slice(0, 3).map((d, idx) => (
                                  <li key={idx} className="text-[10px] text-gray-500 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    <span className="truncate max-w-[150px]">{d}</span>
                                  </li>
                                ))}
                                {day.details.length > 3 && (
                                  <li className="text-[10px] text-gray-400 pl-3">+{day.details.length - 3} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}