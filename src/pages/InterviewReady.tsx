import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  MessageSquareText,
  Search,
  Plus,
  Users
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MarkdownContent } from '@/components/CodeBlock';
import { ContributeQuestionModal } from '@/components/ContributeQuestionModal';
import { useStudyModules, Question } from '@/hooks/useStudyModules';
import { VoteButtons } from '@/components/VoteButtons';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function QuestionCard({ question }: { question: Question }) {
  const [isOpen, setIsOpen] = useState(false);

  const difficultyStyles = {
    'Easy': 'bg-success/10 text-success border-success/20',
    'Medium': 'bg-warning/10 text-warning border-warning/20',
    'Hard': 'bg-destructive/10 text-destructive border-destructive/20'
  };

  const voteScore = (question.upvotes || 0) - (question.downvotes || 0);

  return (
    <motion.div
      layout
      className="soft-card-hover overflow-hidden"
    >
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center justify-center px-4 py-4 bg-muted/30 border-r border-border">
          <VoteButtons 
            questionId={question.id} 
            upvotes={question.upvotes || 0}
            downvotes={question.downvotes || 0}
          />
        </div>
        
        {/* Question content */}
        <div className="flex-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-5 py-4 flex items-start justify-between hover:bg-muted/20 transition-colors text-left"
          >
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {!question.is_system_generated && (
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                    <Users className="w-3 h-3 mr-1" />
                    Community
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", difficultyStyles[question.difficulty as keyof typeof difficultyStyles] || difficultyStyles['Medium'])}
                >
                  {question.difficulty || 'Medium'}
                </Badge>
              </div>
              <h3 className="font-medium text-foreground leading-relaxed">
                {question.question_text}
              </h3>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 mt-1"
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                <div className="px-5 py-4 border-t border-border bg-muted/10">
                  <MarkdownContent content={question.answer_text} />
                  
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                      {question.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function InterviewReady() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  
  const { data: studyModules, isLoading } = useStudyModules();

  // Get all questions from all modules
  const allQuestions = studyModules?.flatMap(m => m.questions || []) || [];
  
  // Get unique categories with full module info
  const categories = studyModules?.map(m => ({ id: m.id, title: m.title, category: m.category })) || [];
  
  // Filter and sort questions
  const filteredQuestions = allQuestions
    .filter(q => {
      if (selectedCategory !== 'all' && q.module_id !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        q.question_text.toLowerCase().includes(query) ||
        q.answer_text.toLowerCase().includes(query) ||
        q.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'votes') {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        return scoreB - scoreA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const communityCount = allQuestions.filter(q => !q.is_system_generated).length;

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-2">
              Interview Ready
            </h1>
            <p className="text-muted-foreground">
              Practice questions curated by the community
            </p>
          </div>
          <div className="flex items-center gap-3">
            {communityCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                {communityCount} community questions
              </Badge>
            )}
            <Button onClick={() => setShowContributeModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Contribute
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="soft-card p-4">
            <p className="text-sm text-muted-foreground">Total Questions</p>
            <p className="text-2xl font-serif font-bold text-foreground">{allQuestions.length}</p>
          </div>
          <div className="soft-card p-4">
            <p className="text-sm text-muted-foreground">Categories</p>
            <p className="text-2xl font-serif font-bold text-foreground">{categories.length}</p>
          </div>
          <div className="soft-card p-4">
            <p className="text-sm text-muted-foreground">Community</p>
            <p className="text-2xl font-serif font-bold text-foreground">{communityCount}</p>
          </div>
          <div className="soft-card p-4">
            <p className="text-sm text-muted-foreground">Total Votes</p>
            <p className="text-2xl font-serif font-bold text-foreground">
              {allQuestions.reduce((acc, q) => acc + (q.upvotes || 0) + (q.downvotes || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="soft-card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'votes' | 'newest')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">Most Voted</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="soft-card h-24 animate-shimmer" />
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="soft-card p-12 text-center">
              <MessageSquareText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                No questions found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Be the first to contribute a question!'}
              </p>
              <Button onClick={() => setShowContributeModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          ) : (
            filteredQuestions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))
          )}
        </div>

        <ContributeQuestionModal 
          isOpen={showContributeModal} 
          onClose={() => setShowContributeModal(false)}
          modules={categories}
        />
      </motion.div>
    </MainLayout>
  );
}