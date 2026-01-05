import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronDown, Plus, Search, 
  MessageSquareText, Loader2, Users, CheckCircle2,
  Pencil, Trash2, Zap, Menu, Filter
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle
} from '@/components/ui/sheet'; // Import Sheet for Mobile Sidebar
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MarkdownContent } from '@/components/CodeBlock';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useStudyModules, 
  useUpdateGlobalQuestion, 
  useDeleteGlobalQuestion, 
  Question 
} from '@/hooks/useStudyModules';
import { ContributeQuestionModal } from '@/components/ContributeQuestionModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- QUESTION CARD COMPONENT ---
function QuestionCard({ question, isAuthor, onEdit, onDelete }: { 
  question: Question; 
  isAuthor: boolean; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const difficultyStyles = {
    'Easy': 'bg-green-50 text-green-700 border-green-200',
    'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
    'Hard': 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
      {/* AUTHOR ACTIONS */}
      {isAuthor && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Pencil className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
          </Button>
        </div>
      )}

      <div className="flex gap-3 mb-3">
        <Badge variant="outline" className={cn("text-[10px]", difficultyStyles[question.difficulty as keyof typeof difficultyStyles])}>
          {question.difficulty}
        </Badge>
        {question.tags?.map(tag => (
          <Badge key={tag} variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">
            {tag}
          </Badge>
        ))}
      </div>

      <h3 className="font-medium text-lg text-slate-900 mb-2">{question.question_text}</h3>
      
      <div className="mt-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-indigo-600 hover:text-indigo-700 p-0 h-auto font-normal hover:bg-transparent"
        >
          {isOpen ? "Hide Answer" : "Show Answer"}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-700 bg-slate-50/50 rounded-lg p-4">
              <MarkdownContent content={question.answer_text || 'No answer provided.'} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN PAGE ---
export default function Practice() {
  const { data: studyModules, isLoading } = useStudyModules();
  const updateQuestion = useUpdateGlobalQuestion();
  const deleteQuestion = useDeleteGlobalQuestion();
  
  const { user } = useAuth();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Sheet State
  
  // Edit State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', difficulty: 'Medium' });

  // Group modules by Category
  const categorizedModules = useMemo(() => {
    if (!studyModules) return {};
    return studyModules.reduce((acc, module) => {
      const cat = module.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(module);
      return acc;
    }, {} as Record<string, typeof studyModules>);
  }, [studyModules]);

  const categories = Object.keys(categorizedModules).sort();

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const selectedModule = studyModules?.find(m => m.id === selectedModuleId);
  
  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditForm({
      question: q.question_text,
      answer: q.answer_text,
      difficulty: q.difficulty
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    try {
      await updateQuestion.mutateAsync({
        id: editingQuestion.id,
        question: editForm.question,
        answer: editForm.answer,
        difficulty: editForm.difficulty
      });
      toast.success("Question updated!");
      setEditingQuestion(null);
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this question?")) {
      try {
        await deleteQuestion.mutateAsync(id);
        toast.success("Deleted");
      } catch (e) {
        toast.error("Failed to delete (Are you the author?)");
      }
    }
  };

  // Reusable Sidebar Content for both Desktop and Mobile
  const SidebarContent = ({ isMobile = false }) => (
    <div className="h-full flex flex-col">
       <div className={cn("p-4 border-b border-slate-100 bg-slate-50/50", isMobile && "pt-6")}>
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
             <Users className="w-5 h-5 text-indigo-600" /> Community Practice
          </h2>
          <p className="text-xs text-slate-500 mt-1 ml-7">Global question bank</p>
       </div>
       
       <div className="flex-1 overflow-y-auto p-2">
         {categories.map(cat => (
           <div key={cat}>
             <button 
               onClick={() => toggleCategory(cat)}
               className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
             >
               <span className="flex items-center gap-2">
                 {expandedCategories.has(cat) ? <ChevronDown className="w-4 h-4 text-slate-400"/> : <ChevronRight className="w-4 h-4 text-slate-400"/>}
                 <span className={cn(expandedCategories.has(cat) && "text-indigo-600")}>{cat}</span>
               </span>
             </button>
             
             {expandedCategories.has(cat) && (
               <div className="pl-6 mt-1 space-y-1">
                 {categorizedModules[cat]?.map(mod => (
                   <button
                     key={mod.id}
                     onClick={() => {
                        setSelectedModuleId(mod.id);
                        if(isMobile) setIsMobileMenuOpen(false); // Close sheet on mobile selection
                     }}
                     className={cn(
                       "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                       selectedModuleId === mod.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                     )}
                   >
                     {mod.title}
                   </button>
                 ))}
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );

  if (isLoading) return <MainLayout><div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-theme(spacing.8))] bg-white md:rounded-2xl border border-slate-200 overflow-hidden">
        
        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <aside className="w-80 bg-white border-r border-slate-200 hidden md:flex flex-col">
            <SidebarContent />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
           
           {/* MOBILE: HEADER & TOPIC SELECTOR */}
           <div className="md:hidden mb-6 space-y-4">
              <div className="flex items-center justify-between">
                 <h1 className="text-2xl font-serif font-bold text-slate-900">Practice</h1>
                 <Button onClick={() => setIsContributeOpen(true)} size="sm" className="bg-slate-900 text-white">
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>

              {/* Mobile Topic Trigger */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                 <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-slate-50 border-slate-200 text-slate-700">
                       <span className="flex items-center gap-2">
                          <Filter className="w-4 h-4"/> 
                          {selectedModule ? selectedModule.title : "Browse Topics"}
                       </span>
                       <ChevronDown className="w-4 h-4 opacity-50"/>
                    </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="p-0 w-80">
                    <SidebarContent isMobile={true} />
                 </SheetContent>
              </Sheet>
           </div>

           {/* DESKTOP: HEADER */}
           <div className="hidden md:flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900">
                  {selectedModule ? selectedModule.title : "Practice"}
                </h1>
                <p className="text-slate-500 mt-1">
                  {selectedModule ? selectedModule.description : "Select a topic to start practicing"}
                </p>
              </div>
              <Button onClick={() => setIsContributeOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                 <Plus className="w-4 h-4 mr-2" /> Contribute
              </Button>
           </div>

           {/* CONTENT AREA */}
           {selectedModule ? (
             <div className="space-y-4 pb-20 md:pb-0">
               {selectedModule.questions?.length === 0 && (
                 <div className="text-center py-10 text-slate-400">No questions yet. Be the first to add one!</div>
               )}
               {selectedModule.questions?.map((q: Question) => (
                 <QuestionCard 
                    key={q.id} 
                    question={q} 
                    isAuthor={user?.id === q.created_by_id} 
                    onEdit={() => handleEdit(q)}
                    onDelete={() => handleDelete(q.id)}
                 />
               ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center text-slate-400 py-20 md:h-96">
               <Zap className="w-16 h-16 opacity-10 mb-4" />
               <p className="hidden md:block">Select a category from the sidebar</p>
               <p className="md:hidden">Tap "Browse Topics" above to start</p>
             </div>
           )}
        </main>
      </div>
      
      {/* CONTRIBUTE MODAL */}
      <ContributeQuestionModal 
        isOpen={isContributeOpen} 
        onClose={() => setIsContributeOpen(false)}
        modules={studyModules || []} 
      />

      {/* EDIT MODAL */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Question</Label>
               <Textarea 
                 value={editForm.question} 
                 onChange={e => setEditForm({...editForm, question: e.target.value})} 
               />
             </div>
             <div className="space-y-2">
               <Label>Answer</Label>
               <Textarea 
                 value={editForm.answer} 
                 onChange={e => setEditForm({...editForm, answer: e.target.value})} 
                 rows={6}
                 className="font-mono text-sm"
               />
             </div>
             <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={editForm.difficulty} onValueChange={v => setEditForm({...editForm, difficulty: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}