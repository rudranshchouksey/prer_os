import { motion } from 'framer-motion';
import { useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Target, 
  BookOpen, 
  Brain, 
  TrendingUp,
  Zap,
  ArrowRight,
  Settings,
  CheckCircle2
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
import { useState } from 'react';
import { useUserSettings, useTrackActivity } from '@/hooks/useUserSettings';
import { useUserProgress, useProgressStats } from '@/hooks/useUserProgress';
import { useStudyModules } from '@/hooks/useStudyModules';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { 
    dailyStreak, 
    interviewDate, 
    setInterviewDate,
    incrementStreak
  } = useStore();

  const { data: settings } = useUserSettings();
  const { trackActivity } = useTrackActivity();
  const { data: userProgress } = useUserProgress();
  const { data: studyModules } = useStudyModules();
  const progressStats = useProgressStats();
  const [showDateInput, setShowDateInput] = useState(false);

  // Track activity on load
  useEffect(() => {
    trackActivity();
  }, []);

  // Calculate real stats from database
  const stats = useMemo(() => {
    const totalQuestions = studyModules?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0;
    const masteredQuestions = userProgress?.filter(p => p.status === 'Mastered').length || 0;
    const reviewQuestions = userProgress?.filter(p => p.status === 'Review').length || 0;
    const newQuestions = totalQuestions - masteredQuestions - reviewQuestions;
    
    // Calculate category breakdown - filtered by user interests
    const userCategories = settings?.interested_categories || [];
    const categoryProgress = studyModules?.reduce((acc, module) => {
      const cat = module.category || 'General';
      
      // If user has interests, only show those categories
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
        const progress = userProgress?.find(p => p.question_id === q.id);
        if (progress?.status === 'Mastered') acc[cat].mastered++;
        else if (progress?.status === 'Review') acc[cat].review++;
      });
      return acc;
    }, {} as Record<string, { total: number; mastered: number; review: number }>) || {};
    
    return {
      totalQuestions,
      masteredQuestions,
      reviewQuestions,
      newQuestions,
      progressPercent: totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0,
      categoryProgress
    };
  }, [studyModules, userProgress, settings?.interested_categories]);

  // Trigger streak increment on page load
  useMemo(() => {
    incrementStreak();
  }, [incrementStreak]);

  const handleDateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get('interviewDate') as string;
    if (date) {
      setInterviewDate(date);
      setShowDateInput(false);
    }
  };

  const userInterests = settings?.interested_categories || [];

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-2">
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Your command center for interview preparation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Edit Preferences
              </Button>
            </Link>
            <StreakCounter streak={settings?.daily_streak || dailyStreak} />
          </div>
        </motion.div>

        {/* User Interests Badge */}
        {userInterests.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Your tracks:</span>
            {userInterests.map(interest => (
              <span key={interest} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                {interest.replace('-', ' ')}
              </span>
            ))}
          </motion.div>
        )}

        {/* Countdown Timer */}
        <motion.div variants={itemVariants}>
          <div className="soft-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-serif font-semibold text-foreground">Interview Countdown</h2>
                  </div>
                  {interviewDate ? (
                    <p className="text-sm text-muted-foreground">
                      Target: {new Date(interviewDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Set your interview date to start the countdown
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <CountdownTimer targetDate={interviewDate} />
                  {!showDateInput ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDateInput(true)}
                    >
                      {interviewDate ? 'Change Date' : 'Set Date'}
                    </Button>
                  ) : (
                    <form onSubmit={handleDateSubmit} className="flex gap-2">
                      <Input 
                        type="date" 
                        name="interviewDate"
                        defaultValue={interviewDate || ''}
                      />
                      <Button type="submit" size="sm">Save</Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div variants={itemVariants}>
          <ActivityHeatmap />
        </motion.div>

        {/* Stats Grid - Real Data */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">{stats.totalQuestions}</p>
            <p className="text-sm text-muted-foreground">Total Questions</p>
          </div>

          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-serif font-bold text-success">{stats.masteredQuestions}</p>
            <p className="text-sm text-muted-foreground">Mastered</p>
          </div>

          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-warning" />
            </div>
            <p className="text-3xl font-serif font-bold text-warning">{stats.reviewQuestions}</p>
            <p className="text-sm text-muted-foreground">In Review</p>
          </div>

          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">{stats.newQuestions}</p>
            <p className="text-sm text-muted-foreground">New</p>
          </div>
        </motion.div>

        {/* Overall Progress Section */}
        <motion.div variants={itemVariants}>
          <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-semibold text-foreground">Overall Progress</h2>
              <span className="text-sm text-muted-foreground">
                {stats.masteredQuestions} of {stats.totalQuestions} questions mastered
              </span>
            </div>
            <AnimatedProgress 
              value={stats.masteredQuestions} 
              max={stats.totalQuestions || 1}
              size="lg"
              color="green"
            />
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-success font-medium">{stats.progressPercent}% Complete</span>
              <span className="text-muted-foreground">
                {stats.totalQuestions - stats.masteredQuestions} remaining
              </span>
            </div>
          </div>
        </motion.div>

        {/* Category Progress */}
        <motion.div variants={itemVariants}>
          <div className="soft-card p-6">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-6">Category Breakdown</h2>
            <div className="space-y-4">
              {Object.entries(stats.categoryProgress).map(([category, data], index) => {
                const colors = ['blue', 'green', 'purple'] as const;
                const color = colors[index % colors.length];
                return (
                  <div key={category}>
                    <AnimatedProgress
                      value={data.mastered}
                      max={data.total || 1}
                      label={category}
                      color={color}
                      size="md"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{data.mastered} mastered</span>
                      <span>{data.review} in review</span>
                      <span>{data.total - data.mastered - data.review} new</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.categoryProgress).length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No categories found. Start adding questions to see progress.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Link to="/questions">
            <div className="soft-card-hover p-6 group cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-foreground">Interview Ready</h3>
                    <p className="text-sm text-muted-foreground">Practice questions from all categories</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          <Link to="/docs">
            <div className="soft-card-hover p-6 group cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-foreground">Study Notes</h3>
                    <p className="text-sm text-muted-foreground">Your personal knowledge base</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Recent Activity */}
        {userProgress && userProgress.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="soft-card p-6">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {userProgress
                  .filter(p => p.last_reviewed_at)
                  .sort((a, b) => new Date(b.last_reviewed_at || 0).getTime() - new Date(a.last_reviewed_at || 0).getTime())
                  .slice(0, 5)
                  .map(progress => {
                    // Find the question
                    const question = studyModules
                      ?.flatMap(m => m.questions || [])
                      .find(q => q.id === progress.question_id);
                    if (!question) return null;
                    
                    return (
                      <div key={progress.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            progress.status === 'Mastered' && "bg-success",
                            progress.status === 'Review' && "bg-warning",
                            progress.status === 'New' && "bg-muted-foreground"
                          )} />
                          <p className="text-sm text-foreground truncate">{question.question_text}</p>
                        </div>
                        <span className={cn(
                          "text-xs font-medium ml-4",
                          progress.status === 'Mastered' && "text-success",
                          progress.status === 'Review' && "text-warning"
                        )}>
                          {progress.status}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
