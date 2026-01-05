import React, { useMemo, useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Brain, Target, BookOpen, Zap, ArrowRight, Settings,
  CheckCircle2, TrendingUp, Clock, MoreHorizontal, Bell,
  MessageSquareText, FileText, Lock, Globe, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { StreakCounter } from '@/components/ui/streak-counter';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useUserSettings, useTrackActivity } from '@/hooks/useUserSettings';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useStudyModules } from '@/hooks/useStudyModules';
import { useUserQuestions } from '@/hooks/useUserQuestions'; 
import { useUserNotes } from '@/hooks/useUserNotes';
// 👇 NEW IMPORT
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Interfaces ---
interface CategoryStat {
  total: number;
  mastered: number;
  review: number;
}

interface Question {
  id: string;
  question_text?: string;
}

interface Module {
  id: string;
  category?: string;
  questions?: Question[];
}

interface Progress {
  question_id: string;
  status: string;
  last_reviewed_at?: string | null;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  color: 'purple' | 'green' | 'amber' | 'blue' | 'indigo';
  mobileCompact?: boolean;
}

// --- Helper: Time Ago ---
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function Dashboard() {
  const { dailyStreak, interviewDate, setInterviewDate, incrementStreak } = useStore();
  const { data: settings } = useUserSettings();
  const { trackActivity } = useTrackActivity();
  
  const { data: userProgress } = useUserProgress();
  const { data: studyModules } = useStudyModules();
  const { data: personalQuestions } = useUserQuestions();
  const { data: personalNotes } = useUserNotes();

  // 👇 REAL NOTIFICATIONS HOOKS
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [showDateInput, setShowDateInput] = useState(false);
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    trackActivity();
    incrementStreak();
  }, [trackActivity, incrementStreak]);

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const safeModules = (studyModules || []) as unknown as Module[];
    const safeProgress = (userProgress || []) as unknown as Progress[];

    const totalGlobalQuestions = safeModules.reduce((acc, m) => acc + (m.questions?.length || 0), 0);
    const masteredQuestions = safeProgress.filter(p => p.status === 'Mastered').length;
    const reviewQuestions = safeProgress.filter(p => p.status === 'Review').length;
    
    const totalPersonalQuestions = personalQuestions?.length || 0;
    const totalNotes = personalNotes?.length || 0;

    const userCategories = (settings?.interested_categories as unknown as string[]) || [];

    const categoryProgress = safeModules.reduce<Record<string, CategoryStat>>((acc, module) => {
      const cat = module.category || 'General';

      if (userCategories.length > 0) {
        const catNormalized = cat.toLowerCase().replace(/\s+/g, '-');
        const isInterested = userCategories.some(interest =>
          catNormalized.includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(catNormalized) ||
          cat.toLowerCase().includes(interest.toLowerCase())
        );
        if (!isInterested) return acc;
      }

      if (!acc[cat]) {
        acc[cat] = { total: 0, mastered: 0, review: 0 };
      }

      const moduleQuestions = module.questions || [];
      acc[cat].total += moduleQuestions.length;

      moduleQuestions.forEach(q => {
        const progress = safeProgress.find(p => p.question_id === q.id);
        if (progress?.status === 'Mastered') acc[cat].mastered++;
        else if (progress?.status === 'Review') acc[cat].review++;
      });
      return acc;
    }, {});

    return {
      totalGlobalQuestions,
      masteredQuestions,
      reviewQuestions,
      totalPersonalQuestions,
      totalNotes,
      categoryProgress
    };
  }, [studyModules, userProgress, settings?.interested_categories, personalQuestions, personalNotes]);

  const handleDateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get('interviewDate') as string;
    if (date) {
      setInterviewDate(date);
      setShowDateInput(false);
    }
  };

  return (
    <MainLayout className="bg-gray-50/50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 pb-20 md:pb-6"
      >
        {/* --- Header --- */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Welcome back, <span className="text-indigo-600">{settings?.full_name?.split(' ')[0] || 'Developer'}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              System operational. Ready for prep.
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              
              {/* NOTIFICATIONS DROPDOWN */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-gray-200 bg-white shadow-sm text-gray-500 hover:text-gray-700 relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-lg">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllRead.mutate()} 
                        disabled={markAllRead.isPending}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="flex flex-col">
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => !n.read && markRead.mutate(n.id)}
                            className={cn(
                              "flex items-start gap-3 p-4 text-left transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50",
                              n.read ? "bg-white" : "bg-blue-50/30"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 mt-1.5 rounded-full shrink-0",
                              n.read ? "bg-gray-200" : "bg-indigo-500"
                            )} />
                            <div>
                              <p className={cn("text-sm font-medium", n.read ? "text-gray-700" : "text-gray-900")}>
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">{formatTimeAgo(n.created_at)}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                         <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                      )}
                    </div>
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <StreakCounter streak={settings?.daily_streak || dailyStreak} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-gray-200 bg-white shadow-sm">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-200">
                  <DropdownMenuItem asChild><Link to="/profile">Profile Settings</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/settings">App Preferences</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* --- Bento Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="md:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
             <StatCard
               icon={<Target className="w-5 h-5 text-green-600" />}
               label="Mastered"
               value={stats.masteredQuestions}
               trend="up"
               color="green"
               mobileCompact
             />
             <StatCard
               icon={<Brain className="w-5 h-5 text-amber-500" />}
               label="To Review"
               value={stats.reviewQuestions}
               trend="neutral"
               color="amber"
               mobileCompact
             />
             <StatCard
               icon={<MessageSquareText className="w-5 h-5 text-indigo-500" />}
               label="My Questions"
               value={stats.totalPersonalQuestions}
               color="indigo"
               mobileCompact
             />
             <StatCard
               icon={<FileText className="w-5 h-5 text-blue-500" />}
               label="Study Notes"
               value={stats.totalNotes}
               color="blue"
               mobileCompact
             />
             <StatCard
               icon={<Zap className="w-5 h-5 text-purple-500" />}
               label="Global Qs"
               value={stats.totalGlobalQuestions}
               color="purple"
               mobileCompact
             />
          </motion.div>

          {/* Main Content */}
          <div className="md:col-span-8 space-y-4 md:space-y-6">

            {/* Heatmap */}
            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                    Activity Log
                  </h3>
                </div>
              </div>
              <ActivityHeatmap />
            </motion.div>

            {/* Category Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {Object.entries(stats.categoryProgress).slice(0, 4).map(([category, data], i) => (
                <div key={category} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all group shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                      <FolderIcon index={i} className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <span className="text-xs font-mono font-medium text-gray-500">
                      {Math.round((data.mastered / (data.total || 1)) * 100)}%
                    </span>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-2 truncate">{category}</h4>
                  <AnimatedProgress
                    value={data.mastered}
                    max={data.total || 1}
                    size="sm"
                    className="h-1.5 bg-gray-100"
                    barClassName="bg-purple-500"
                  />
                  <div className="mt-3 text-xs text-gray-500 flex justify-between">
                    <span>{data.mastered} / {data.total} Mastered</span>
                  </div>
                </div>
              ))}

              <Link to="/practice" className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-white hover:border-purple-300 transition-all cursor-pointer min-h-[140px]">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm group-hover:border-purple-200">
                  <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-purple-700">Explore All Topics</span>
              </Link>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 space-y-4 md:space-y-6">

            {/* Countdown */}
            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold uppercase tracking-wider">Target Date</span>
                  </div>
                  <button onClick={() => setShowDateInput(!showDateInput)} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200 transition-colors">
                    {showDateInput ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {showDateInput ? (
                  <form onSubmit={handleDateSubmit} className="mb-4">
                    <div className="flex gap-2">
                       <Input type="date" name="interviewDate" defaultValue={interviewDate || ''} className="bg-white h-9" />
                      <Button size="icon" type="submit" className="h-9 w-9 bg-purple-600"><CheckCircle2 className="w-4 h-4" /></Button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-4">
                    {interviewDate ? (
                       <div className="text-base font-medium text-gray-900">
                        {new Date(interviewDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                       </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">No date set</div>
                    )}
                  </div>
                )}
                <CountdownTimer targetDate={interviewDate} className="text-gray-900" />
              </div>
            </motion.div>

            {/* Recent Progress (Dynamic) */}
            <motion.div variants={itemVariants} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm">Recent Progress</h3>
                <Link to="/practice" className="text-xs text-purple-600 font-medium">View All</Link>
              </div>

              <div className="space-y-4 relative">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-100" />
                
                {(userProgress || []).length > 0 ? (
                  ((userProgress || []) as unknown as Progress[])
                    .filter(p => p.last_reviewed_at)
                    .sort((a, b) => new Date(b.last_reviewed_at!).getTime() - new Date(a.last_reviewed_at!).getTime())
                    .slice(0, 5)
                    .map((progress, idx) => {
                       // 1. Try to find in GLOBAL modules
                       const modules = (studyModules || []) as unknown as Module[];
                       let question = modules?.flatMap(m => m.questions || []).find(q => q.id === progress.question_id);
                       let isPersonal = false;

                       // 2. If not found, try to find in PERSONAL questions
                       if (!question && personalQuestions) {
                          const pQuestions = (personalQuestions as unknown as Question[]);
                          question = pQuestions.find(q => q.id === progress.question_id);
                          isPersonal = true;
                       }
                       
                       if (!question) return null;
                       
                       return (
                         <div key={idx} className="relative flex gap-3 items-start pl-2 group">
                           <div className={cn(
                             "w-2.5 h-2.5 mt-1 rounded-full z-10 ring-2 ring-white",
                             progress.status === 'Mastered' ? "bg-green-500" : "bg-amber-400"
                           )} />
                           <div className="flex-1 min-w-0">
                             <p className="text-xs font-medium text-gray-900 truncate" title={(question as any).question_text}>
                                {(question as any).question_text || "Unknown Question"}
                             </p>
                             <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                 {new Date(progress.last_reviewed_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                               </span>
                               {/* Source Badge */}
                               {isPersonal ? (
                                 <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Lock className="w-2 h-2" /> Personal
                                 </span>
                               ) : (
                                 <span className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Globe className="w-2 h-2" /> Global
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                       );
                    })
                ) : (
                  <div className="text-center py-6"><p className="text-xs text-gray-400">No activity yet</p></div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

// --- Sub Components ---

function StatCard({ icon, label, value, trend, color, mobileCompact }: StatCardProps) {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }[color];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses}`}>{icon}</div>
        {trend === 'up' && !mobileCompact && <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>}
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
        <div className="text-xs md:text-sm font-medium text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

function FolderIcon({ index, className }: { index: number, className?: string }) {
  const icons = [Brain, Target, BookOpen, Zap];
  const Icon = icons[index % icons.length];
  return <Icon className={className} />;
}