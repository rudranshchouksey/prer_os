import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { 
  Brain, 
  ChevronRight, 
  RotateCcw, 
  Trophy,
  Target,
  Sparkles
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { techVaultData, InterviewQuestion } from '@/data/techVaultData';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function InterviewSimulator() {
  const { flashcardProgress, updateFlashcardProgress, totalQuestionsAnswered } = useStore();
  
  const allQuestions = useMemo(() => 
    techVaultData.flatMap(cat => 
      cat.questions.map(q => ({ ...q, category: cat.title, color: cat.color }))
    ), []
  );

  const [currentIndex, setCurrentIndex] = useState(() => 
    Math.floor(Math.random() * allQuestions.length)
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ answered: 0, low: 0, medium: 0, high: 0 });

  const currentQuestion = allQuestions[currentIndex];
  const progress = flashcardProgress[currentQuestion?.id];

  const handleConfidence = useCallback((confidence: 'low' | 'medium' | 'high') => {
    if (!currentQuestion) return;
    
    updateFlashcardProgress(currentQuestion.id, confidence);
    setSessionStats(prev => ({
      ...prev,
      answered: prev.answered + 1,
      [confidence]: prev[confidence] + 1
    }));
    
    // Move to next random question
    setTimeout(() => {
      setShowAnswer(false);
      setCurrentIndex(Math.floor(Math.random() * allQuestions.length));
    }, 300);
  }, [currentQuestion, allQuestions.length, updateFlashcardProgress]);

  const handleShuffle = useCallback(() => {
    setShowAnswer(false);
    setCurrentIndex(Math.floor(Math.random() * allQuestions.length));
  }, [allQuestions.length]);

  const stats = useMemo(() => {
    const total = Object.values(flashcardProgress).length;
    const highConf = Object.values(flashcardProgress).filter(p => p.confidence === 'high').length;
    const medConf = Object.values(flashcardProgress).filter(p => p.confidence === 'medium').length;
    const lowConf = Object.values(flashcardProgress).filter(p => p.confidence === 'low').length;
    return { total, highConf, medConf, lowConf, allQuestions: allQuestions.length };
  }, [flashcardProgress, allQuestions.length]);

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
              Interview Simulator
            </h1>
            <p className="text-muted-foreground">
              Test your knowledge with randomized flashcards
            </p>
          </div>
          
          <div className="flex gap-3">
            <GlassCard hover={false} className="py-3 px-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm">
                <span className="font-mono font-bold text-primary">{stats.total}</span>
                <span className="text-muted-foreground">/{stats.allQuestions} reviewed</span>
              </span>
            </GlassCard>
            <GlassCard hover={false} className="py-3 px-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" />
              <span className="font-mono font-bold">{totalQuestionsAnswered}</span>
            </GlassCard>
          </div>
        </div>

        {/* Session Stats */}
        {sessionStats.answered > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-3"
          >
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">This session:</span>
              <span className="font-mono font-bold">{sessionStats.answered}</span>
            </div>
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2 border-l-2 border-success">
              <span className="text-sm text-success">High</span>
              <span className="font-mono font-bold text-success">{sessionStats.high}</span>
            </div>
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2 border-l-2 border-warning">
              <span className="text-sm text-warning">Medium</span>
              <span className="font-mono font-bold text-warning">{sessionStats.medium}</span>
            </div>
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2 border-l-2 border-destructive">
              <span className="text-sm text-destructive">Low</span>
              <span className="font-mono font-bold text-destructive">{sessionStats.low}</span>
            </div>
          </motion.div>
        )}

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, rotateY: -10, scale: 0.95 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="relative overflow-hidden" hover={false}>
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  "bg-primary/10 text-primary border border-primary/20"
                )}>
                  {currentQuestion?.category}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium uppercase",
                  currentQuestion?.difficulty === 'beginner' && "bg-success/10 text-success",
                  currentQuestion?.difficulty === 'intermediate' && "bg-warning/10 text-warning",
                  currentQuestion?.difficulty === 'advanced' && "bg-destructive/10 text-destructive"
                )}>
                  {currentQuestion?.difficulty}
                </span>
              </div>

              {/* Question */}
              <div className="mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Brain className="w-5 h-5 text-secondary" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
                    {currentQuestion?.question}
                  </h2>
                </div>
              </div>

              {/* Answer Section */}
              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center"
                  >
                    <Button
                      variant="cyber"
                      size="lg"
                      onClick={() => setShowAnswer(true)}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Reveal Answer
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="border-t border-border pt-6">
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-dark-800 rounded-xl p-4 border border-border overflow-x-auto">
                          {currentQuestion?.answer}
                        </pre>
                      </div>
                    </div>

                    {/* Confidence Rating */}
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        How confident do you feel about this topic?
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Button
                          variant="confidence-low"
                          size="lg"
                          onClick={() => handleConfidence('low')}
                          className="min-w-[100px]"
                        >
                          🤔 Low
                        </Button>
                        <Button
                          variant="confidence-medium"
                          size="lg"
                          onClick={() => handleConfidence('medium')}
                          className="min-w-[100px]"
                        >
                          😊 Medium
                        </Button>
                        <Button
                          variant="confidence-high"
                          size="lg"
                          onClick={() => handleConfidence('high')}
                          className="min-w-[100px]"
                        >
                          💪 High
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Previous Confidence */}
              {progress && (
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Last reviewed: {' '}
                    <span className={cn(
                      "font-medium",
                      progress.confidence === 'high' && "text-success",
                      progress.confidence === 'medium' && "text-warning",
                      progress.confidence === 'low' && "text-destructive"
                    )}>
                      {progress.confidence.toUpperCase()}
                    </span>
                    {' · '}{progress.reviewCount} reviews
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Shuffle Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleShuffle}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Shuffle to New Question
          </Button>
        </div>

        {/* Progress Overview */}
        <GlassCard className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Confidence Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
              <p className="text-3xl font-bold font-mono text-success">{stats.highConf}</p>
              <p className="text-xs text-muted-foreground mt-1">High Confidence</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-3xl font-bold font-mono text-warning">{stats.medConf}</p>
              <p className="text-xs text-muted-foreground mt-1">Medium Confidence</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-3xl font-bold font-mono text-destructive">{stats.lowConf}</p>
              <p className="text-xs text-muted-foreground mt-1">Needs Review</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </MainLayout>
  );
}
