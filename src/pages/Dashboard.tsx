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
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { AnimatedProgress } from '@/components/ui/animated-progress';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { StreakCounter } from '@/components/ui/streak-counter';
import { useStore } from '@/store/useStore';
import { techVaultData } from '@/data/techVaultData';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useUserSettings, useTrackActivity } from '@/hooks/useUserSettings';

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
    totalQuestionsAnswered,
    flashcardProgress,
    studyItems,
    incrementStreak
  } = useStore();

  const { data: settings } = useUserSettings();
  const { trackActivity } = useTrackActivity();
  const [showDateInput, setShowDateInput] = useState(false);

  // Track activity on load
  useEffect(() => {
    trackActivity();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalQuestions = techVaultData.reduce((acc, cat) => acc + cat.questions.length, 0);
    const reviewedQuestions = Object.keys(flashcardProgress).length;
    const highConfidence = Object.values(flashcardProgress).filter(p => p.confidence === 'high').length;
    const completedItems = studyItems.filter(item => item.status === 'applied').length;
    
    return {
      totalQuestions,
      reviewedQuestions,
      progressPercent: Math.round((reviewedQuestions / totalQuestions) * 100),
      highConfidence,
      completedItems,
      mustDoItems: studyItems.filter(item => item.status === 'must-do').length
    };
  }, [flashcardProgress, studyItems]);

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

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">{totalQuestionsAnswered}</p>
            <p className="text-sm text-muted-foreground">Questions Answered</p>
          </div>

          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-serif font-bold text-foreground">{stats.highConfidence}</p>
            <p className="text-sm text-muted-foreground">High Confidence</p>
          </div>

          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-serif font-bold text-success">{stats.completedItems}</p>
            <p className="text-sm text-muted-foreground">Topics Applied</p>
          </div>

          <div className="soft-card p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
            <p className="text-3xl font-serif font-bold text-warning">{stats.mustDoItems}</p>
            <p className="text-sm text-muted-foreground">Must-Do Items</p>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div variants={itemVariants}>
          <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-semibold text-foreground">Overall Progress</h2>
              <span className="text-sm text-muted-foreground">
                {stats.reviewedQuestions} of {stats.totalQuestions} questions reviewed
              </span>
            </div>
            <AnimatedProgress 
              value={stats.reviewedQuestions} 
              max={stats.totalQuestions}
              size="lg"
              color="blue"
            />
          </div>
        </motion.div>

        {/* Category Progress */}
        <motion.div variants={itemVariants}>
          <div className="soft-card p-6">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-6">Category Breakdown</h2>
            <div className="space-y-4">
              {techVaultData.map(category => {
                const reviewed = category.questions.filter(q => flashcardProgress[q.id]).length;
                const total = category.questions.length;
                return (
                  <div key={category.id}>
                    <AnimatedProgress
                      value={reviewed}
                      max={total}
                      label={category.title}
                      color={category.id.includes('cloud') ? 'purple' : category.id.includes('core') ? 'green' : 'blue'}
                      size="md"
                    />
                  </div>
                );
              })}
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

          <Link to="/notes">
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
        {Object.keys(flashcardProgress).length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="soft-card p-6">
              <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Recent Reviews</h2>
              <div className="space-y-3">
                {Object.values(flashcardProgress)
                  .sort((a, b) => new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime())
                  .slice(0, 5)
                  .map(progress => {
                    const question = techVaultData
                      .flatMap(c => c.questions)
                      .find(q => q.id === progress.questionId);
                    if (!question) return null;
                    return (
                      <div key={progress.questionId} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            progress.confidence === 'high' && "bg-success",
                            progress.confidence === 'medium' && "bg-warning",
                            progress.confidence === 'low' && "bg-destructive"
                          )} />
                          <p className="text-sm text-foreground truncate">{question.question}</p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4">
                          {progress.reviewCount}x
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
