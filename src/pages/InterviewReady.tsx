import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Search,
  MessageSquareText,
  FolderOpen,
  Loader2,
  Zap,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Pencil,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MarkdownContent } from '@/components/CodeBlock';
import { useStudyModules, Question } from '@/hooks/useStudyModules';
import { useUserProgress, useUpdateProgress } from '@/hooks/useUserProgress';
import { ContributeQuestionModal } from '@/components/ContributeQuestionModal';
import { VoteButtons } from '@/components/VoteButtons';
import { gradeAnswer } from '@/services/ai';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Interfaces ---

interface QuestionCardProps {
  question: Question;
  isMastered: boolean;
  onMarkMastered: () => void;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
}

interface AnswerGradeResult {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// --- Question Card Component ---

function QuestionCard({ question, isMastered, onMarkMastered, onEdit, onDelete }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<AnswerGradeResult | null>(null);
  const { user } = useAuth();

  const difficultyStyles = {
    'Easy': 'bg-success/10 text-success border-success/20',
    'Medium': 'bg-warning/10 text-warning border-warning/20',
    'Hard': 'bg-destructive/10 text-destructive border-destructive/20'
  };

  const handleGradeAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please enter your answer first');
      return;
    }

    setIsGrading(true);
    try {
      const result = await gradeAnswer({
        question: question.question_text,
        expectedAnswer: question.answer_text,
        userAnswer,
      });
      setGradeResult(result);
    } catch (error) {
      toast.error('Failed to analyze answer');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <motion.div
      layout
      layoutId={question.id}
      className="soft-card overflow-hidden group relative bg-white border border-slate-200 shadow-sm rounded-xl"
    >
      <div className="flex">
        {/* Vote section */}
        <div className="flex flex-col items-center justify-start pt-4 px-2 md:px-4 bg-muted/30 border-r border-border min-w-[50px] md:min-w-[60px]">
          <VoteButtons 
            questionId={question.id} 
            upvotes={question.upvotes || 0}
            downvotes={question.downvotes || 0}
          />
        </div>
        
        {/* Edit/Delete buttons - Visible on Hover (Desktop) or Always (Mobile) */}
        {user && (
          <div className="absolute top-2 right-2 flex gap-1 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-1 border border-border shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-6 md:w-6 hover:bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(question);
              }}
            >
              <Pencil className="w-3.5 h-3.5 md:w-3 md:h-3 text-slate-500" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 md:h-6 md:w-6 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-3 md:h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this community contribution? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(question.id);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        
        {/* Question Header & Content */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 md:px-5 py-4 flex items-start justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex-1 pr-12 md:pr-16 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {isMastered && (
                  <Badge variant="outline" className="text-[10px] md:text-xs bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Mastered
                  </Badge>
                )}
                {!question.is_system_generated && (
                  <Badge variant="outline" className="text-[10px] md:text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Users className="w-3 h-3 mr-1" />
                    Community
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] md:text-xs", difficultyStyles[question.difficulty as keyof typeof difficultyStyles] || difficultyStyles['Medium'])}
                >
                  {question.difficulty || 'Medium'}
                </Badge>
              </div>
              <h3 className="font-medium text-slate-900 leading-snug md:leading-relaxed text-base md:text-lg break-words">
                {question.question_text}
              </h3>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 mt-1 ml-2 md:ml-4"
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
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
                <div className="px-3 md:px-5 py-6 border-t border-slate-100 bg-slate-50/50">
                  <MarkdownContent content={question.answer_text} />
                  
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-200/60">
                      {question.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] md:text-xs bg-white border border-slate-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* AI Grader Section */}
                  <div className="mt-6 pt-6 border-t border-slate-200/60 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-slate-900">Practice Your Answer</span>
                    </div>
                    
                    <Textarea
                      placeholder="Type your answer here to get AI feedback..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      rows={4}
                      className="resize-none bg-white border-slate-200 focus:border-purple-300"
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <Button
                        onClick={handleGradeAnswer}
                        disabled={isGrading || !userAnswer.trim()}
                        variant="outline"
                        className="gap-2 w-full sm:w-auto"
                      >
                        {isGrading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Analyze Answer
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant={isMastered ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkMastered();
                        }}
                        className={cn(
                          "gap-2 transition-all w-full sm:w-auto",
                          isMastered 
                            ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100" 
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isMastered ? 'Mastered' : 'Mark as Mastered'}
                      </Button>
                    </div>

                    {gradeResult && (
                      <Alert className={cn(
                        "mt-4 border",
                        gradeResult.score >= 8 && "border-green-200 bg-green-50",
                        gradeResult.score >= 6 && gradeResult.score < 8 && "border-amber-200 bg-amber-50",
                        gradeResult.score < 6 && "border-red-200 bg-red-50"
                      )}>
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle className="flex items-center gap-2 font-bold">
                          Score: {gradeResult.score}/{gradeResult.maxScore}
                        </AlertTitle>
                        <AlertDescription className="space-y-3 mt-2 text-sm">
                          <p>{gradeResult.feedback}</p>
                          {/* Details (Strengths/Improvements) ... same as before */}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// --- Reusable Sidebar Content ---

const SidebarContent = ({ 
  categories, 
  categorizedModules, 
  expandedCategories, 
  toggleCategory, 
  selectedModule, 
  setSelectedCategory, 
  setSelectedModule,
  searchQuery,
  setSearchQuery,
  totalQuestions,
  masteredCount,
  userProgress,
  onAddClick,
  closeMobileMenu
}: any) => (
  <div className="flex flex-col h-full">
    <div className="p-4 border-b border-border bg-slate-50/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-slate-900">Interview Ready</h2>
        </div>
        <Button size="sm" onClick={onAddClick} className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-white border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-900">{totalQuestions}</div>
          <div className="text-xs text-slate-500 font-medium">Questions</div>
        </div>
        <div className="p-3 rounded-lg bg-green-50 border border-green-100 text-center">
          <div className="text-2xl font-bold text-green-700">{masteredCount}</div>
          <div className="text-xs text-green-600 font-medium">Mastered</div>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-2">
      {categories.map((category: string) => (
        <div key={category} className="mb-1">
          <button
            onClick={() => toggleCategory(category)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {expandedCategories.has(category) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            <FolderOpen className="w-4 h-4 text-purple-500" />
            <span className="flex-1 text-left">{category}</span>
          </button>

          <AnimatePresence>
            {expandedCategories.has(category) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-4 space-y-0.5 mt-1">
                  {categorizedModules[category]?.map((module: any) => {
                    const moduleMastered = module.questions?.filter((q: any) => userProgress?.some((p: any) => p.question_id === q.id && p.status === 'Mastered')).length || 0;
                    const moduleTotal = module.questions?.length || 0;
                    
                    return (
                      <button
                        key={module.id}
                        onClick={() => { 
                          setSelectedCategory(category); 
                          setSelectedModule(module.id);
                          if(closeMobileMenu) closeMobileMenu();
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all border-l-2 ml-2",
                          selectedModule === module.id
                            ? "bg-purple-50 border-purple-500 text-purple-900 font-medium"
                            : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        <span className="truncate mr-2 text-left">{module.title}</span>
                        {moduleMastered > 0 && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {moduleMastered}/{moduleTotal}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  </div>
);

// --- Main Page Component ---

export default function InterviewReady() {
  const { data: studyModules, isLoading } = useStudyModules();
  const { data: userProgress } = useUserProgress();
  const updateProgress = useUpdateProgress();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editFormData, setEditFormData] = useState({ question_text: '', answer_text: '', difficulty: 'Medium' });
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Group modules
  const categorizedModules = useMemo(() => {
    if (!studyModules) return {};
    return studyModules.reduce((acc, module) => {
      const cat = module.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(module);
      return acc;
    }, {} as Record<string, typeof studyModules>);
  }, [studyModules]);

  const categories = Object.keys(categorizedModules);

  // Initial Selection
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      const firstCat = categories[0];
      setExpandedCategories(new Set([firstCat]));
      if (categorizedModules[firstCat]?.length > 0) {
        setSelectedCategory(firstCat);
        setSelectedModule(categorizedModules[firstCat][0].id);
      }
    }
  }, [categories, categorizedModules, expandedCategories.size]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const selectedModuleData = studyModules?.find(m => m.id === selectedModule);
  const questions = selectedModuleData?.questions || [];

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter(q => 
      q.question_text.toLowerCase().includes(query) ||
      q.answer_text.toLowerCase().includes(query) ||
      q.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [questions, searchQuery]);

  const isQuestionMastered = (questionId: string) => {
    return userProgress?.some(p => p.question_id === questionId && p.status === 'Mastered') || false;
  };

  const handleMarkMastered = (questionId: string) => {
    const currentStatus = isQuestionMastered(questionId);
    const newStatus = currentStatus ? 'Review' : 'Mastered';
    const newConfidence = currentStatus ? 3 : 5;

    updateProgress.mutate(
      { questionId, status: newStatus, confidence: newConfidence },
      { onSuccess: () => toast.success(currentStatus ? 'Marked for Review' : 'Marked as Mastered!') }
    );
  };

  // --- Edit/Delete Handlers ---
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setEditFormData({
      question_text: question.question_text,
      answer_text: question.answer_text,
      difficulty: question.difficulty || 'Medium'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setIsEditSaving(true);
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          question_text: editFormData.question_text,
          answer_text: editFormData.answer_text,
          difficulty: editFormData.difficulty
        })
        .eq('id', editingQuestion.id);
      
      if (error) throw error;
      toast.success('Question updated!');
      setEditingQuestion(null);
      queryClient.invalidateQueries({ queryKey: ['study-modules'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);
      if (error) throw error;
      toast.success('Question deleted');
      queryClient.invalidateQueries({ queryKey: ['study-modules'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  // Shared Sidebar Props
  const sidebarProps = {
    categories,
    categorizedModules,
    expandedCategories,
    toggleCategory,
    selectedModule,
    setSelectedCategory,
    setSelectedModule,
    searchQuery,
    setSearchQuery,
    totalQuestions: studyModules?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0,
    masteredCount: userProgress?.filter(p => p.status === 'Mastered').length || 0,
    userProgress,
    onAddClick: () => setIsContributeOpen(true),
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
             <Menu className="w-6 h-6 text-slate-700" />
           </Button>
           <h1 className="font-bold text-slate-900 text-lg">Interview Ready</h1>
        </div>
        <Button size="sm" onClick={() => setIsContributeOpen(true)} className="bg-slate-900 text-white">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-2rem)] md:-m-6 relative">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 border-r border-border bg-white flex-col h-full">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* Mobile Sidebar (Drawer) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-50 md:hidden shadow-xl"
              >
                <div className="absolute top-2 right-2">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </Button>
                </div>
                <SidebarContent {...sidebarProps} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30 w-full">
          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 md:pb-8">
            {selectedModuleData ? (
              <motion.div
                key={selectedModule}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6 md:mb-8">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100">{selectedCategory}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-medium text-slate-900 truncate">{selectedModuleData.title}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-2 md:mb-3">
                    {selectedModuleData.title}
                  </h1>
                  {selectedModuleData.description && (
                    <p className="text-sm md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                      {selectedModuleData.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-12 md:py-20 bg-white rounded-xl border border-dashed border-slate-300">
                      <MessageSquareText className="w-10 h-10 md:w-12 md:h-12 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-base md:text-lg font-medium text-slate-900">No questions found</h3>
                      <p className="text-sm text-slate-500 mb-6">Be the first to contribute to this topic!</p>
                      <Button onClick={() => setIsContributeOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                      </Button>
                    </div>
                  ) : (
                    filteredQuestions.map(question => (
                      <QuestionCard 
                        key={question.id} 
                        question={question}
                        isMastered={isQuestionMastered(question.id)}
                        onMarkMastered={() => handleMarkMastered(question.id)}
                        onEdit={handleEditQuestion}
                        onDelete={handleDeleteQuestion}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center text-slate-400">
                <Zap className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 opacity-20" />
                <h2 className="text-lg md:text-xl font-medium text-slate-900 mb-2">Select a Module</h2>
                <p className="text-sm">Choose a topic from the menu to start practicing.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <ContributeQuestionModal 
        isOpen={isContributeOpen} 
        onClose={() => setIsContributeOpen(false)}
        modules={studyModules?.map(m => ({ id: m.id, title: m.title, category: m.category })) || []}
      />

      {/* Edit Dialog - Mobile Friendly Width */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="sm:max-w-lg w-[95%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={editFormData.question_text}
                onChange={(e) => setEditFormData({ ...editFormData, question_text: e.target.value })}
                rows={3}
              />
            </div>
            {/* ... other fields ... */}
             <div className="space-y-2">
              <Label>Answer (Markdown supported)</Label>
              <Textarea
                value={editFormData.answer_text}
                onChange={(e) => setEditFormData({ ...editFormData, answer_text: e.target.value })}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={editFormData.difficulty}
                onValueChange={(v) => setEditFormData({ ...editFormData, difficulty: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEditingQuestion(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isEditSaving} className="w-full sm:w-auto">
              {isEditSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}