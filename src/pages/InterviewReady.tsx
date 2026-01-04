import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Lock, Trash2, Pencil, FolderOpen, ChevronRight, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { MarkdownContent } from '@/components/CodeBlock';
import { useUserQuestions, useCreateUserQuestion, useUpdateUserQuestion, useDeleteUserQuestion, UserQuestion } from '@/hooks/useUserQuestions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Define the Difficulty type explicitly to match your database schema
type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function InterviewReady() {
  const { data: myQuestions, isLoading } = useUserQuestions(); // PRIVATE HOOK
  const createQ = useCreateUserQuestion();
  const updateQ = useUpdateUserQuestion();
  const deleteQ = useDeleteUserQuestion();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<UserQuestion | null>(null);
  
  // Explicitly type the state so TypeScript knows difficulty is not just any string
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

  // 1. Group Personal Questions by Category
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

  // Set default category on load
  useMemo(() => {
    if (categoryNames.length > 0 && !selectedCategory) {
        setSelectedCategory(categoryNames[0]);
    }
  }, [categoryNames]);

  const handleSave = async () => {
    try {
        if (editingQ) {
            // TypeScript now knows formData.difficulty matches the expected type
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

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.8))] md:flex-row gap-6 bg-white md:rounded-2xl border border-slate-200 overflow-hidden">
        
        {/* PERSONAL SIDEBAR */}
        <aside className="w-full md:w-72 bg-slate-50/50 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-serif font-bold text-slate-900">My Questions</h2>
                </div>
                <Button onClick={() => { setEditingQ(null); setIsEditorOpen(true); }} className="w-full bg-slate-900 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
                {categoryNames.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm mb-1 transition-all",
                            selectedCategory === cat 
                                ? "bg-white shadow-sm text-indigo-700 border border-slate-100 font-medium" 
                                : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <FolderOpen className={cn("w-4 h-4", selectedCategory === cat ? "text-indigo-500" : "text-slate-400")} />
                            <span>{cat}</span>
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] h-5">{categories[cat].length}</Badge>
                    </button>
                ))}
            </div>
        </aside>

        {/* PERSONAL CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-serif font-bold text-slate-900">{selectedCategory || 'My Questions'}</h1>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Search my questions..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="pl-9 bg-white"
                        />
                    </div>
                </div>

                {categories[selectedCategory || '']?.filter(q => q.question_text.toLowerCase().includes(search.toLowerCase())).map(q => (
                    <motion.div layout key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => {
                                setEditingQ(q);
                                // Cast the existing difficulty to the specific type if needed, though usually safe coming from DB
                                setFormData({ 
                                    question_text: q.question_text, 
                                    answer_text: q.answer_text, 
                                    category: q.category, 
                                    difficulty: q.difficulty as Difficulty 
                                });
                                setIsEditorOpen(true);
                            }}><Pencil className="w-4 h-4 text-slate-400 hover:text-indigo-600" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" /></Button>
                        </div>

                        <div className="flex gap-3 mb-3">
                            <Badge variant="outline" className={cn(
                                "text-[10px]", 
                                q.difficulty === 'Hard' ? "bg-red-50 text-red-700 border-red-100" : 
                                q.difficulty === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-100" : 
                                "bg-green-50 text-green-700 border-green-100"
                            )}>{q.difficulty}</Badge>
                        </div>

                        <h3 className="font-medium text-lg text-slate-900 mb-4">{q.question_text}</h3>
                        
                        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 border border-slate-100">
                            <MarkdownContent content={q.answer_text || 'No answer added yet.'} />
                        </div>
                    </motion.div>
                ))}
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
                    <Textarea value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Answer (Markdown)</Label>
                    <Textarea value={formData.answer_text} onChange={e => setFormData({...formData, answer_text: e.target.value})} rows={6} className="font-mono text-sm" />
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