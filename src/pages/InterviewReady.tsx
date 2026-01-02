import { useState, useMemo } from 'react';
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
  Trash2
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

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div
      layout
      className="soft-card overflow-hidden group relative"
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
        
        {/* Edit/Delete buttons - Wiki style */}
        {user && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(question);
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
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
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(question.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        
        {/* Question content */}
        <div className="flex-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-5 py-4 flex items-start justify-between hover:bg-muted/20 transition-colors text-left"
          >
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {isMastered && (
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Mastered
                  </Badge>
                )}
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

                  {/* AI Answer Grader Section */}
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Practice Your Answer</span>
                    </div>
                    
                    <Textarea
                      placeholder="Type your answer here to get AI feedback..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    
                    <Button
                      onClick={handleGradeAnswer}
                      disabled={isGrading || !userAnswer.trim()}
                      variant="outline"
                      className="gap-2"
                    >
                      {isGrading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Analyze with AI
                        </>
                      )}
                    </Button>

                    {gradeResult && (
                      <Alert className={cn(
                        "border-2",
                        gradeResult.score >= 8 && "border-success/50 bg-success/5",
                        gradeResult.score >= 6 && gradeResult.score < 8 && "border-warning/50 bg-warning/5",
                        gradeResult.score < 6 && "border-destructive/50 bg-destructive/5"
                      )}>
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle className="flex items-center gap-2">
                          Score: <span className={cn("font-bold", getScoreColor(gradeResult.score))}>
                            {gradeResult.score}/{gradeResult.maxScore}
                          </span>
                        </AlertTitle>
                        <AlertDescription className="space-y-3 mt-2">
                          <p>{gradeResult.feedback}</p>
                          
                          {gradeResult.strengths.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-success mb-1">✓ Strengths:</p>
                              <ul className="text-sm space-y-0.5 pl-4">
                                {gradeResult.strengths.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {gradeResult.improvements.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-warning mb-1">→ Areas to improve:</p>
                              <ul className="text-sm space-y-0.5 pl-4">
                                {gradeResult.improvements.map((imp, i) => (
                                  <li key={i}>• {imp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Mark as Mastered Button */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <Button
                      size="sm"
                      variant={isMastered ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkMastered();
                      }}
                      className={cn(
                        "gap-2",
                        isMastered && "text-success border-success/20 hover:bg-success/10"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isMastered ? 'Mastered' : 'Mark as Mastered'}
                    </Button>
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
  
  // Edit question state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editFormData, setEditFormData] = useState({ question_text: '', answer_text: '', difficulty: 'Medium' });
  const [isEditSaving, setIsEditSaving] = useState(false);

  // Group modules by category
  const categorizedModules = useMemo(() => {
    if (!studyModules) return {};
    
    return studyModules.reduce((acc, module) => {
      const cat = module.category || 'General';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(module);
      return acc;
    }, {} as Record<string, typeof studyModules>);
  }, [studyModules]);

  const categories = Object.keys(categorizedModules);

  // Auto-expand first category and select first module
  useMemo(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set([categories[0]]));
      if (categorizedModules[categories[0]]?.length > 0) {
        setSelectedCategory(categories[0]);
        setSelectedModule(categorizedModules[categories[0]][0].id);
      }
    }
  }, [categories, categorizedModules]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Get questions for selected module
  const selectedModuleData = studyModules?.find(m => m.id === selectedModule);
  const questions = selectedModuleData?.questions || [];

  // Filter questions by search
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter(q => 
      q.question_text.toLowerCase().includes(query) ||
      q.answer_text.toLowerCase().includes(query) ||
      q.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [questions, searchQuery]);

  // Check if question is mastered
  const isQuestionMastered = (questionId: string) => {
    return userProgress?.some(p => p.question_id === questionId && p.status === 'Mastered') || false;
  };

  // Handle mark as mastered
  const handleMarkMastered = (questionId: string) => {
    const currentStatus = isQuestionMastered(questionId);
    updateProgress.mutate(
      { 
        questionId, 
        status: currentStatus ? 'Review' : 'Mastered',
        confidence: currentStatus ? 3 : 5
      },
      {
        onSuccess: () => {
          toast.success(currentStatus ? 'Moved back to review' : 'Marked as mastered!');
        }
      }
    );
  };

  // Handle edit question (Wiki-style)
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
      toast.error(error.message || 'Failed to update question');
    } finally {
      setIsEditSaving(false);
    }
  };

  // Handle delete question (Wiki-style)
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
      toast.error(error.message || 'Failed to delete question');
    }
  };

  // Stats
  const totalQuestions = studyModules?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0;
  const masteredCount = userProgress?.filter(p => p.status === 'Mastered').length || 0;
  const communityCount = studyModules?.reduce((acc, m) => 
    acc + (m.questions?.filter(q => !q.is_system_generated).length || 0), 0) || 0;

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
      <div className="flex h-[calc(100vh-2rem)] -m-6">
        {/* Secondary Sidebar for Interview Navigation */}
        <aside className="w-72 border-r border-border bg-white/50 backdrop-blur-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Interview Ready</h2>
              </div>
              <Button
                size="sm"
                onClick={() => setIsContributeOpen(true)}
                className="bg-primary hover:bg-primary/90 h-8"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-border h-9"
              />
            </div>
            
            {/* Stats */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1 text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div className="flex-1 text-center p-2 rounded-lg bg-success/10">
                <p className="text-lg font-bold text-success">{masteredCount}</p>
                <p className="text-xs text-muted-foreground">Mastered</p>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {categories.map((category) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <span>{category}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {categorizedModules[category]?.reduce((acc, m) => acc + (m.questions?.length || 0), 0) || 0}
                  </Badge>
                </button>

                <AnimatePresence>
                  {expandedCategories.has(category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 py-1 space-y-0.5">
                        {categorizedModules[category]?.map((module) => {
                          const moduleQuestionCount = module.questions?.length || 0;
                          const moduleMasteredCount = module.questions?.filter(q => 
                            userProgress?.some(p => p.question_id === q.id && p.status === 'Mastered')
                          ).length || 0;
                          
                          return (
                            <button
                              key={module.id}
                              onClick={() => {
                                setSelectedCategory(category);
                                setSelectedModule(module.id);
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                selectedModule === module.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <MessageSquareText className="w-4 h-4" />
                              <span className="flex-1 truncate">{module.title}</span>
                              {moduleMasteredCount > 0 && (
                                <span className="text-xs text-success">
                                  {moduleMasteredCount}/{moduleQuestionCount}
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
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
          <div className="max-w-4xl mx-auto p-8">
            {selectedModuleData ? (
              <motion.div
                key={selectedModule}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Module Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{selectedCategory}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground font-medium">{selectedModuleData.title}</span>
                  </div>
                  <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
                    {selectedModuleData.title}
                  </h1>
                  {selectedModuleData.description && (
                    <p className="text-muted-foreground">{selectedModuleData.description}</p>
                  )}
                  
                  {/* Progress indicator */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium text-foreground">
                        {questions.filter(q => isQuestionMastered(q.id)).length} / {questions.length} mastered
                      </span>
                    </div>
                    {communityCount > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="w-3 h-3" />
                        {communityCount} community
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {filteredQuestions.length === 0 ? (
                    <div className="soft-card p-12 text-center">
                      <MessageSquareText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                        No questions found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery 
                          ? 'Try adjusting your search' 
                          : 'Be the first to contribute a question!'}
                      </p>
                      <Button onClick={() => setIsContributeOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
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
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Zap className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
                  Select a Topic
                </h2>
                <p className="text-muted-foreground">
                  Choose a category and topic from the sidebar to view questions
                </p>
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

      {/* Edit Question Modal */}
      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question *</Label>
              <Textarea
                id="edit-question"
                value={editFormData.question_text}
                onChange={(e) => setEditFormData({ ...editFormData, question_text: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">Answer *</Label>
              <Textarea
                id="edit-answer"
                value={editFormData.answer_text}
                onChange={(e) => setEditFormData({ ...editFormData, answer_text: e.target.value })}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">Difficulty</Label>
              <Select
                value={editFormData.difficulty}
                onValueChange={(v) => setEditFormData({ ...editFormData, difficulty: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditSaving}>
              {isEditSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
