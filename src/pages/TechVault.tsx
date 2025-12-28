import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  MessageSquare,
  Layers,
  Cloud,
  Code,
  Palette,
  Shield,
  Search,
  Plus,
  Users
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { techVaultData, Category, Topic, InterviewQuestion } from '@/data/techVaultData';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ContributeQuestionModal } from '@/components/ContributeQuestionModal';
import { useStudyModules, useModuleQuestions, Question } from '@/hooks/useStudyModules';
import { Badge } from '@/components/ui/badge';
import { VoteButtons } from '@/components/VoteButtons';
import { MarkdownContent } from '@/components/CodeBlock';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const iconMap: Record<string, React.ElementType> = {
  Layers,
  Cloud,
  Code,
  Palette,
  Shield
};

function TopicCard({ topic }: { topic: Topic }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      className="border border-border rounded-xl overflow-hidden bg-dark-800/50"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{topic.title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-border space-y-3">
              <MarkdownContent content={topic.description} />
              <ul className="space-y-2">
                {topic.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <MarkdownContent content={point} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuestionCard({ question }: { question: InterviewQuestion }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      className="border border-border rounded-xl overflow-hidden bg-dark-800/50"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <MessageSquare className="w-4 h-4 text-secondary flex-shrink-0" />
          <span className="font-medium text-sm">{question.question}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            question.difficulty === 'beginner' && "bg-success/10 text-success",
            question.difficulty === 'intermediate' && "bg-warning/10 text-warning",
            question.difficulty === 'advanced' && "bg-destructive/10 text-destructive"
          )}>
            {question.difficulty}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-border">
              <MarkdownContent content={question.answer} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Database question card with voting
function DbQuestionCard({ question }: { question: Question }) {
  const [isOpen, setIsOpen] = useState(false);

  const difficultyColor = {
    'Easy': 'bg-success/10 text-success',
    'Medium': 'bg-warning/10 text-warning',
    'Hard': 'bg-destructive/10 text-destructive'
  };

  return (
    <motion.div
      layout
      className="border border-border rounded-xl overflow-hidden bg-dark-800/50"
    >
      <div className="flex">
        {/* Vote buttons */}
        <div className="flex items-center justify-center px-2 py-3 border-r border-border/50 bg-dark-900/30">
          <VoteButtons 
            questionId={question.id} 
            upvotes={question.upvotes || 0}
            downvotes={question.downvotes || 0}
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
        >
          <div className="flex items-center gap-3 flex-1">
            <MessageSquare className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="font-medium text-sm">{question.question_text}</span>
            {!question.is_system_generated && (
              <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/30">
                <Users className="w-3 h-3 mr-1" />
                Community
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded text-xs font-medium",
              difficultyColor[question.difficulty as keyof typeof difficultyColor] || difficultyColor['Medium']
            )}>
              {question.difficulty || 'Medium'}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-border">
              <MarkdownContent content={question.answer_text} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CategorySection({ category }: { category: Category }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'topics' | 'questions'>('topics');
  const Icon = iconMap[category.icon] || Layers;

  const colorClasses = {
    blue: 'from-primary to-primary/50 border-primary/30',
    purple: 'from-secondary to-secondary/50 border-secondary/30',
    pink: 'from-neon-pink to-neon-pink/50 border-neon-pink/30',
    green: 'from-success to-success/50 border-success/30',
    orange: 'from-warning to-warning/50 border-warning/30'
  };

  return (
    <motion.div
      layout
      className="overflow-hidden"
    >
      <GlassCard 
        hover={!isExpanded}
        className={cn(
          "cursor-pointer",
          isExpanded && "neon-border-blue"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br",
              colorClasses[category.color]
            )}>
              <Icon className="w-6 h-6 text-foreground" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">{category.title}</h3>
              <p className="text-sm text-muted-foreground">
                {category.topics.length} topics · {category.questions.length} questions
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-border">
                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('topics'); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === 'topics'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Study Notes
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('questions'); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === 'questions'
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Interview Q&A
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  {activeTab === 'topics' ? (
                    category.topics.map(topic => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))
                  ) : (
                    category.questions.map(question => (
                      <QuestionCard key={question.id} question={question} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

// Database-powered category section
function DbCategorySection({ module, questions }: { module: { id: string; title: string; category: string; description: string | null }; questions: Question[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = Code;

  // Sort questions by vote score (upvotes - downvotes)
  const sortedQuestions = [...questions].sort((a, b) => {
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
    return scoreB - scoreA;
  });

  return (
    <motion.div layout className="overflow-hidden">
      <GlassCard 
        hover={!isExpanded}
        className={cn(
          "cursor-pointer",
          isExpanded && "neon-border-purple"
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
              <Icon className="w-6 h-6 text-foreground" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">{module.title}</h3>
              <p className="text-sm text-muted-foreground">
                {questions.length} community questions
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 pt-6 border-t border-border">
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  {sortedQuestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No questions yet. Be the first to contribute!
                    </p>
                  ) : (
                    sortedQuestions.map(question => (
                      <DbQuestionCard key={question.id} question={question} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </motion.div>
  );
}

export default function TechVault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);
  const { data: studyModules } = useStudyModules();

  const filteredCategories = techVaultData.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.topics.some(t => t.title.toLowerCase().includes(query)) ||
      cat.questions.some(q => q.question.toLowerCase().includes(query))
    );
  });

  // Get all questions from all modules
  const allDbQuestions = studyModules?.flatMap(m => m.questions || []) || [];
  
  // Filter DB questions by search
  const filteredDbQuestions = allDbQuestions.filter(q => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(query) ||
      q.answer_text.toLowerCase().includes(query)
    );
  });

  // Group questions by module for display
  const moduleQuestionsMap = new Map<string, Question[]>();
  filteredDbQuestions.forEach(q => {
    const existing = moduleQuestionsMap.get(q.module_id) || [];
    moduleQuestionsMap.set(q.module_id, [...existing, q]);
  });

  // Get community questions count
  const communityQuestionsCount = allDbQuestions.filter(q => !q.is_system_generated).length;

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
              Tech Vault
            </h1>
            <p className="text-muted-foreground">
              Your comprehensive study curriculum for Senior Full Stack interviews
            </p>
          </div>
          <div className="flex items-center gap-3">
            {communityQuestionsCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                {communityQuestionsCount} community
              </Badge>
            )}
            <Button onClick={() => setShowContributeModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Contribute
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search topics or questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dark-800 border-border"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {techVaultData.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Layers;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium truncate">{cat.title}</span>
                </div>
                <p className="text-2xl font-bold font-mono">
                  {cat.topics.length + cat.questions.length}
                </p>
                <p className="text-xs text-muted-foreground">items to study</p>
              </motion.div>
            );
          })}
        </div>

        {/* Static Categories */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Core Curriculum</h2>
          {filteredCategories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <CategorySection category={category} />
            </motion.div>
          ))}
        </div>

        {/* Database-powered Community Questions */}
        {studyModules && studyModules.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              Community Questions
            </h2>
            {studyModules.map((module, i) => {
              const questions = moduleQuestionsMap.get(module.id) || [];
              if (questions.length === 0 && searchQuery) return null;
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <DbCategorySection module={module} questions={questions} />
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredCategories.length === 0 && filteredDbQuestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
          </div>
        )}
      </motion.div>

      {/* Contribute Modal */}
      <ContributeQuestionModal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        modules={studyModules?.map(m => ({ id: m.id, title: m.title, category: m.category })) || []}
      />
    </MainLayout>
  );
}
