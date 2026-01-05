import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Lock, Trash2, Pencil, FolderOpen, 
  Check, Circle, Zap, Menu, Filter, MoreVertical
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetTrigger
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { MarkdownContent } from '@/components/CodeBlock';
import { 
  useUserQuestions, 
  useCreateUserQuestion, 
  useUpdateUserQuestion, 
  useDeleteUserQuestion, 
  useUserProgress,           
  useToggleQuestionProgress, 
  UserQuestion 
} from '@/hooks/useUserQuestions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function InterviewReady() {
  const { data: myQuestions, isLoading } = useUserQuestions();
  const { data: userProgress } = useUserProgress();
  
  const createQ = useCreateUserQuestion();
  const updateQ = useUpdateUserQuestion();
  const deleteQ = useDeleteUserQuestion();
  const toggleProgress = useToggleQuestionProgress();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<UserQuestion | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState<{
    question_text: string;
    answer_text: string;
    category: string;
    difficulty: Difficulty;
  }>({ 
    question_text: '', 
    answer_text: '', 
    category: '', 
    difficulty: 'Medium' 
  });

  const categories = useMemo(() => {
    if (!myQuestions) return {};
    return myQuestions.reduce((acc, q) => {
      const cat = q.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(q);
      return acc;
    }, {} as Record<string, typeof myQuestions>);
  }, [myQuestions]);

  const categoryNames = Object.keys(categories).sort();

  useMemo(() => {
    if (categoryNames.length > 0 && !selectedCategory) {
        setSelectedCategory(categoryNames[0]);
    }
  }, [categoryNames]);

  const handleSave = async () => {
    try {
        if (editingQ) {
            await updateQ.mutateAsync({ id: editingQ.id, ...formData });
            toast.success("Question updated");
        } else {
            await createQ.mutateAsync(formData);
            toast.success("Question added to personal bank");
        }
        setIsEditorOpen(false);
        setEditingQ(null);
        setFormData({ question_text:'', answer_text:'', category:'', difficulty:'Medium' });
    } catch { 
        toast.error("Failed to save"); 
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Delete this personal question?")) {
        await deleteQ.mutateAsync(id);
        toast.success("Deleted");
    }
  };

  const handleToggleMastered = (qId: string, currentStatus: boolean) => {
    toggleProgress.mutate({
      questionId: qId,
      status: currentStatus ? 'Review' : 'Mastered'
    });
    if (!currentStatus) toast.success("Marked as Mastered!");
  };

  // Reusable Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h2 className="font-serif font-bold text-slate-900">My Questions</h2>
            </div>
            <Button onClick={() => { setEditingQ(null); setIsEditorOpen(true); }} className="w-full bg-slate-900 text-white rounded-full">
                <Plus className="w-4 h-4 mr-2" /> Add Question
            </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
            {categoryNames.map(cat => (
                <button
                    key={cat}
                    onClick={() => {
                        setSelectedCategory(cat);
                        setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm mb-1 transition-all",
                        selectedCategory === cat 
                            ? "bg-white shadow-sm text-indigo-700 border border-slate-100 font-medium ring-1 ring-slate-200" 
                            : "text-slate-600 hover:bg-slate-100"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <FolderOpen className={cn("w-4 h-4", selectedCategory === cat ? "text-indigo-500" : "text-slate-400")} />
                        <span>{cat}</span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-full px-2">{categories[cat].length}</Badge>
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-theme(spacing.8))] bg-white md:rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="w-72 bg-slate-50/50 border-r border-slate-200 hidden md:flex flex-col">
            <SidebarContent />
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between mb-4">
                     <h1 className="text-xl font-serif font-bold text-slate-900">My Questions</h1>
                     <div className="flex gap-2">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-full">
                                    <Filter className="w-4 h-4 mr-2" /> Topics
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-80">
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>
                        <Button onClick={() => { setEditingQ(null); setIsEditorOpen(true); }} size="sm" className="bg-slate-900 text-white rounded-full">
                            <Plus className="w-4 h-4" />
                        </Button>
                     </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">{selectedCategory || 'My Questions'}</h1>
                        <p className="text-slate-500 mt-1">Manage your personal question bank</p>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search questions..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="pl-10 bg-slate-50 border-transparent focus:bg-white transition-all rounded-full"
                        />
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                {categories[selectedCategory || '']?.filter(q => q.question_text.toLowerCase().includes(search.toLowerCase())).map(q => {
                    
                    const isMastered = userProgress?.some(
                        p => p.question_id === q.id && p.status === 'Mastered'
                    ) || false;
                    
                    return (
                        <SingleQuestionCard 
                            key={q.id}
                            q={q}
                            isMastered={isMastered}
                            onToggleMastered={handleToggleMastered}
                            onEdit={(q) => {
                                setEditingQ(q);
                                setFormData({ 
                                    question_text: q.question_text, 
                                    answer_text: q.answer_text, 
                                    category: q.category, 
                                    difficulty: q.difficulty as Difficulty 
                                });
                                setIsEditorOpen(true);
                            }}
                            onDelete={(id) => handleDelete(id)}
                        />
                    );
                })}
                </div>
            </div>
        </main>
      </div>

      {/* ADD/EDIT MODAL */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{editingQ ? 'Edit Question' : 'New Personal Question'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. React, Behavioral" />
                    </div>
                    <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select 
                            value={formData.difficulty} 
                            onValueChange={(v) => setFormData({...formData, difficulty: v as Difficulty})}
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
                <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} className="resize-none" rows={2} />
                </div>
                <div className="space-y-2">
                    <Label>Answer (Markdown)</Label>
                    <Textarea value={formData.answer_text} onChange={e => setFormData({...formData, answer_text: e.target.value})} rows={8} className="font-mono text-sm" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} className="bg-slate-900 text-white">Save Question</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

// --- SUB-COMPONENT FOR PREMIUM CARD LOOK ---
function SingleQuestionCard({ q, isMastered, onToggleMastered, onEdit, onDelete }: {
    q: UserQuestion, 
    isMastered: boolean, 
    onToggleMastered: (id: string, status: boolean) => void,
    onEdit: (q: UserQuestion) => void,
    onDelete: (id: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false);

    const difficultyColors = {
        'Easy': 'bg-green-100 text-green-700 border-transparent',
        'Medium': 'bg-amber-100 text-amber-700 border-transparent',
        'Hard': 'bg-red-100 text-red-700 border-transparent'
    };

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "border rounded-[2rem] p-6 transition-all group relative", 
                isMastered 
                    ? "bg-green-50/30 border-green-200" 
                    : "bg-white border-slate-200 hover:shadow-md"
            )}
        >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Pill Badge for Difficulty */}
                    <Badge variant="outline" className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border-0", 
                        difficultyColors[q.difficulty as keyof typeof difficultyColors]
                    )}>
                        {q.difficulty}
                    </Badge>

                    {/* Tags as Pills */}
                    {q.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-normal">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* PREMIUM MASTERED BUTTON */}
                <Button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevents card expansion
                        onToggleMastered(q.id, isMastered);
                    }}
                    className={cn(
                        "rounded-full px-4 py-1.5 h-auto text-sm font-medium transition-all shadow-none",
                        // 👇 This logic handles the GREEN color change
                        isMastered 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200"
                    )}
                >
                    {/* 👇 This logic handles the ICON change (Check vs Circle) */}
                    {isMastered ? <Check className="w-4 h-4 mr-1.5" /> : <Circle className="w-4 h-4 mr-1.5" />}
                    
                    {/* 👇 This logic handles the TEXT change ("Mastered" vs "Mark as Mastered") */}
                    {isMastered ? "Mastered" : "Mark as Mastered"}
                </Button>
            </div>

            {/* Question Text */}
            <h3 className="text-xl font-serif text-slate-900 mb-4 leading-relaxed pr-8">
                {q.question_text}
            </h3>
            
            {/* Show Answer Toggle */}
            <div className="mt-2">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                    {isOpen ? "Hide Answer" : "Show Answer"}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-6 border-t border-slate-100/50">
                            <div className="prose prose-slate prose-sm max-w-none text-slate-600">
                                <MarkdownContent content={q.answer_text || 'No answer provided.'} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ACTIONS: Edit/Delete (Bottom Right, Visible on Hover) */}
            <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onEdit(q)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(q.id)} className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    );
}