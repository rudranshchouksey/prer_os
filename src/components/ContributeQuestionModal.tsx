import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCreateStudyModule, useCreateGlobalQuestion } from '@/hooks/useStudyModules';

interface ContributeQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Array<{ id: string; title: string; category: string }>;
}

export function ContributeQuestionModal({ isOpen, onClose, modules }: ContributeQuestionModalProps) {
  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // New Topic State
  const [isNewTopicMode, setIsNewTopicMode] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [parentCategory, setParentCategory] = useState(''); 
  const [isNewCategory, setIsNewCategory] = useState(false); 

  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Hooks
  const createModule = useCreateStudyModule();
  const createQuestion = useCreateGlobalQuestion();

  const isLoading = createModule.isPending || createQuestion.isPending;

  // Extract unique existing categories (Frontend, Backend, etc.)
  const existingCategories = useMemo(() => {
    const cats = new Set(modules.map(m => m.category));
    return Array.from(cats).sort();
  }, [modules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to contribute');
      return;
    }

    if (!question.trim() || !answer.trim()) {
      toast.error('Please fill in question and answer');
      return;
    }

    if (isNewTopicMode) {
      if (!newTopicTitle.trim()) {
        toast.error('Please enter a Topic Title');
        return;
      }
      if (!parentCategory.trim()) {
        toast.error('Please select or enter a Parent Category');
        return;
      }
    } else if (!moduleId) {
      toast.error('Please select an existing topic');
      return;
    }

    try {
      let targetModuleId = moduleId;

      // 1. If Creating New Topic
      if (isNewTopicMode) {
        // Check if topic exists to avoid duplicates
        const existing = modules.find(m => m.title.toLowerCase() === newTopicTitle.trim().toLowerCase());
        
        if (existing) {
          targetModuleId = existing.id;
          toast.info(`Topic "${existing.title}" already exists. Adding question there.`);
        } else {
          // Create the new module with the selected Parent Category
          const newModule = await createModule.mutateAsync({
            title: newTopicTitle.trim(),
            category: parentCategory.trim() 
          });
          targetModuleId = newModule.id;
        }
      }

      // 2. Create Question
      await createQuestion.mutateAsync({
        moduleId: targetModuleId,
        question: question.trim(),
        answer: answer.trim(),
        difficulty,
        tags: isNewTopicMode ? [parentCategory.trim()] : undefined
      });

      toast.success('Question submitted successfully!');
      
      // Reset Form
      setQuestion('');
      setAnswer('');
      setModuleId('');
      setDifficulty('Medium');
      setNewTopicTitle('');
      setParentCategory('');
      setIsNewTopicMode(false);
      setIsNewCategory(false);
      onClose();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to submit. Please try again.');
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* 1. SELECTION MODE TOGGLE */}
      <div className="bg-slate-50 p-1 rounded-lg flex gap-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setIsNewTopicMode(false)}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${!isNewTopicMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Add to Existing
        </button>
        <button
          type="button"
          onClick={() => setIsNewTopicMode(true)}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${isNewTopicMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Create New Topic
        </button>
      </div>

      {/* 2. TOPIC SELECTION / CREATION */}
      {!isNewTopicMode ? (
        // MODE A: Select Existing
        <div className="space-y-2">
          <Label>Select Topic</Label>
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select a topic (e.g. React - Frontend)" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  <span className="font-semibold">{module.title}</span> 
                  <span className="text-slate-400 ml-2 text-xs">({module.category})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        // MODE B: Create New Topic
        <div className="space-y-4 border rounded-xl p-4 bg-slate-50/50 border-indigo-100">
          <div className="space-y-2">
            <Label className="text-indigo-900">New Topic Title</Label>
            <Input 
              placeholder="e.g. Web Performance, CSS Grid, tRPC" 
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-indigo-900">Parent Category</Label>
            {isNewCategory ? (
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter new Category Name" 
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="bg-white"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => { setIsNewCategory(false); setParentCategory(''); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Select value={parentCategory} onValueChange={(val) => {
                if (val === 'NEW_CAT_TRIGGER') {
                  setIsNewCategory(true);
                  setParentCategory('');
                } else {
                  setParentCategory(val);
                }
              }}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Choose Category (e.g. Frontend)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_CAT_TRIGGER" className="text-indigo-600 font-medium border-b border-indigo-100 mb-1">
                    + Create New Category
                  </SelectItem>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-[10px] text-slate-500">
              Select "Frontend" to place your new topic alongside "Frontend & Modern UI".
            </p>
          </div>
        </div>
      )}

      {/* 3. COMMON FIELDS */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-white">
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

        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            placeholder="Enter the interview question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Answer <span className="text-xs text-slate-400 font-normal ml-1">(Markdown supported)</span></Label>
          <Textarea
            placeholder={"Explain the solution...\n\n```javascript\nconst code = 'works';\n```"}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="bg-white min-h-[150px] font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isNewTopicMode ? 'Create Topic & Add' : 'Add Question'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl px-6">
          <SheetHeader className="mb-6 text-left">
            <SheetTitle>Contribute</SheetTitle>
            <SheetDescription>Add to the community bank</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto pb-8">{FormContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Contribute</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto">{FormContent}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}