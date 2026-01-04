import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Search,
  FileText,
  FolderOpen,
  Loader2,
  BookOpen,
  CheckCircle2,
  Pencil,
  Trash2,
  Menu,
  X,
  MoreHorizontal,
  Globe,
  Code,
  Check
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList // Added CommandList wrapper for better rendering
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MarkdownContent } from '@/components/CodeBlock';
import { useStudyModules } from '@/hooks/useStudyModules';
import { useWikiDocs, useCreateWikiDoc, useUpdateWikiDoc, useDeleteWikiDoc } from '@/hooks/useWikiDocs';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Types ---

interface Topic {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'community';
  authorId?: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  topics: Topic[];
}

// --- Helper: Read Tracking ---
const getReadTopics = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem('prepos-read-topics') || '[]'));
  } catch { return new Set(); }
};

const markTopicAsRead = (topicId: string): Set<string> => {
  const read = getReadTopics();
  read.add(topicId);
  localStorage.setItem('prepos-read-topics', JSON.stringify([...read]));
  return read;
};

// --- Sidebar Component ---
const DocsSidebar = ({
  categories,
  expanded,
  toggle,
  selected,
  onSelect,
  search,
  setSearch,
  readTopics,
  onAdd,
  onEdit,
  onDelete,
  userId
}: any) => (
  <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm border-r border-slate-200">
    <div className="p-4 border-b border-slate-100 bg-slate-50/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2 className="font-serif font-bold text-slate-900">Wiki Docs</h2>
        </div>
        <Button size="sm" onClick={onAdd} className="bg-slate-900 text-white hover:bg-slate-800 h-8 shadow-sm">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Contribute
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-slate-200 h-9 text-sm"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {categories.map((cat: Category) => (
        <div key={cat.id}>
          <button
            onClick={() => toggle(cat.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {expanded.has(cat.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
            <FolderOpen className="w-4 h-4 text-indigo-500/70" />
            <span>{cat.name}</span>
            <span className="ml-auto text-xs text-slate-400 font-normal">{cat.topics.length}</span>
          </button>

          <AnimatePresence>
            {expanded.has(cat.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-4 py-1 space-y-0.5 border-l border-slate-100 ml-4">
                  {cat.topics.map((topic) => (
                    <div 
                      key={topic.id}
                      className={cn(
                        "group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-all cursor-pointer",
                        selected === topic.id
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                      onClick={() => onSelect(topic.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {readTopics.has(topic.id) ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        ) : topic.type === 'community' ? (
                          <FileText className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="truncate">{topic.title}</span>
                      </div>

                      {/* Only Show Menu for Author */}
                      {topic.type === 'community' && topic.authorId === userId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 -mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(topic); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
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

export default function Docs() {
  const { data: systemModules, isLoading: sysLoading } = useStudyModules();
  const { data: communityDocs, isLoading: wikiLoading } = useWikiDocs(); 
  
  const createDoc = useCreateWikiDoc();
  const updateDoc = useUpdateWikiDoc();
  const deleteDoc = useDeleteWikiDoc();
  
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['react', 'backend']));
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [readTopics, setReadTopics] = useState<Set<string>>(getReadTopics);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  
  // FIXED: Category Selection State
  const [categoryOpen, setCategoryOpen] = useState(false); 
  const [categorySearch, setCategorySearch] = useState('');

  // 1. Merge & Categorize Data
  const categories: Category[] = useMemo(() => {
    const cats: Record<string, Category> = {};

    // Helper to normalize keys
    const getKey = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

    // A. Process System Modules
    (systemModules || []).forEach(mod => {
      const catName = mod.category || 'General';
      const catId = getKey(catName);
      if (!cats[catId]) cats[catId] = { id: catId, name: catName, topics: [] };
      
      cats[catId].topics.push({
        id: mod.slug,
        title: mod.title,
        content: mod.description || '',
        type: 'system',
        category: catName
      });
    });

    // B. Process Community Docs
    if (communityDocs) {
        communityDocs.forEach(doc => {
            const catName = doc.category || 'Community';
            const catId = getKey(catName);
            
            if (!cats[catId]) cats[catId] = { id: catId, name: catName, topics: [] };
            
            cats[catId].topics.push({
                id: doc.id,
                title: doc.title,
                content: doc.content,
                type: 'community',
                authorId: doc.created_by,
                category: catName
            });
        });
    }

    return Object.values(cats).sort((a, b) => a.name.localeCompare(b.name));
  }, [systemModules, communityDocs]);

  // Extract unique category names for the dropdown
  const uniqueCategoryNames = useMemo(() => {
    return categories.map(c => c.name);
  }, [categories]);

  // 2. Filter for Search
  const filteredCats = useMemo(() => {
    if (!search) return categories;
    const lower = search.toLowerCase();
    return categories.map(c => ({
      ...c,
      topics: c.topics.filter(t => t.title.toLowerCase().includes(lower))
    })).filter(c => c.topics.length > 0);
  }, [categories, search]);

  // 3. Current Selected Content
  const selectedTopic = useMemo(() => {
    if (!selectedId) return null;
    for (const c of categories) {
        const t = c.topics.find(top => top.id === selectedId);
        if (t) return t;
    }
    return null;
  }, [selectedId, categories]);

  // Handlers
  const handleEdit = (topic: Topic) => {
    setEditingDoc(topic);
    setFormData({ title: topic.title, content: topic.content, category: topic.category });
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
        await deleteDoc.mutateAsync(id);
        if (selectedId === id) setSelectedId(null);
        toast.success("Document deleted");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category) {
        toast.error("Title and Category are required");
        return;
    }
    
    try {
        if (editingDoc) {
            // Update
            await updateDoc.mutateAsync({ id: editingDoc.id, ...formData });
            toast.success("Document updated");
        } else {
            // Create
            await createDoc.mutateAsync(formData);
            toast.success("Document published to community");
        }
        setIsEditorOpen(false);
        setEditingDoc(null);
        setFormData({ title: '', content: '', category: '' });
    } catch (e) {
        toast.error("Failed to save. Try again.");
    }
  };

  if (sysLoading || wikiLoading) return <MainLayout><div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div></MainLayout>;

  return (
    <MainLayout>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-5 h-5 text-slate-600" />
            <span className="font-bold text-slate-800">Wiki</span>
        </div>
        <Button size="sm" onClick={() => { setEditingDoc(null); setIsEditorOpen(true); }}>
            <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.8))] bg-white md:rounded-2xl md:border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:block w-72 h-full flex-shrink-0">
            <DocsSidebar 
                categories={filteredCats} 
                expanded={expanded}
                toggle={(id: string) => {
                    const next = new Set(expanded);
                    if (next.has(id)) next.delete(id); else next.add(id);
                    setExpanded(next);
                }}
                selected={selectedId}
                onSelect={setSelectedId}
                search={search}
                setSearch={setSearch}
                readTopics={readTopics}
                onAdd={() => { setEditingDoc(null); setFormData({ title:'', content:'', category: '' }); setIsEditorOpen(true); }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                userId={user?.id}
            />
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
            {isMobileOpen && (
                <motion.div 
                    initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                    className="fixed inset-0 z-50 bg-white md:hidden"
                >
                    <div className="flex justify-end p-4"><Button variant="ghost" onClick={() => setIsMobileOpen(false)}><X /></Button></div>
                    <DocsSidebar 
                        categories={filteredCats} 
                        expanded={expanded}
                        toggle={(id: string) => {
                            const next = new Set(expanded);
                            if (next.has(id)) next.delete(id); else next.add(id);
                            setExpanded(next);
                        }}
                        selected={selectedId}
                        onSelect={(id: string) => { setSelectedId(id); setIsMobileOpen(false); }}
                        search={search}
                        setSearch={setSearch}
                        readTopics={readTopics}
                        onAdd={() => { setIsMobileOpen(false); setEditingDoc(null); setIsEditorOpen(true); }}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        userId={user?.id}
                    />
                </motion.div>
            )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
            {selectedTopic ? (
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6 flex items-center gap-3">
                        <Badge variant="outline" className={cn(
                            "uppercase text-[10px] tracking-wider font-bold",
                            selectedTopic.type === 'system' ? "bg-slate-50 text-slate-500" : "bg-orange-50 text-orange-600 border-orange-200"
                        )}>
                            {selectedTopic.type === 'system' ? 'System Doc' : 'Community Contribution'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                            {selectedTopic.category}
                        </span>
                    </div>

                    <motion.div
                        key={selectedTopic.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="prose prose-slate prose-lg max-w-none"
                    >
                        <h1 className="font-serif font-bold text-4xl text-slate-900 mb-8">{selectedTopic.title}</h1>
                        <MarkdownContent content={selectedTopic.content} />
                    </motion.div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                        <Button 
                            variant={readTopics.has(selectedTopic.id) ? "outline" : "default"}
                            onClick={() => {
                                const newRead = markTopicAsRead(selectedTopic.id);
                                setReadTopics(new Set(newRead));
                                toast.success("Marked as read");
                            }}
                            className={cn("gap-2", readTopics.has(selectedTopic.id) && "text-green-600 border-green-200 bg-green-50")}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {readTopics.has(selectedTopic.id) ? "Read" : "Mark as Read"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-serif font-bold text-slate-700">Select a topic</h3>
                    <p className="text-sm mt-2">Browse the community library or contribute your own knowledge.</p>
                </div>
            )}
        </main>
      </div>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                <DialogTitle className="font-serif text-xl">
                    {editingDoc ? 'Edit Contribution' : 'Contribute to Wiki'}
                </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            placeholder="e.g. React useEffect Deep Dive"
                        />
                    </div>
                    
                    {/* Fixed Smart Category Selector */}
                    <div className="space-y-2 flex flex-col">
                        <Label>Category</Label>
                        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={categoryOpen}
                              className="justify-between bg-white"
                            >
                              {formData.category || "Select category..."}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder="Search category..." 
                                value={categorySearch}
                                onValueChange={setCategorySearch}
                              />
                              <CommandList>
                                <CommandEmpty>
                                    <div className="p-2">
                                        <p className="text-xs text-muted-foreground mb-2">No existing category found.</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-xs h-7 justify-start"
                                            onClick={() => {
                                                if (categorySearch) {
                                                    setFormData({ ...formData, category: categorySearch });
                                                    setCategoryOpen(false);
                                                }
                                            }}
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Create "{categorySearch}"
                                        </Button>
                                    </div>
                                </CommandEmpty>
                                <CommandGroup heading="Existing Categories">
                                    {uniqueCategoryNames.map((category) => (
                                    <CommandItem
                                        key={category}
                                        value={category}
                                        onSelect={(currentValue) => {
                                            // Ensure we use the exact casing from the list, not the lowercase value from cmdk
                                            const exactMatch = uniqueCategoryNames.find(c => c.toLowerCase() === currentValue.toLowerCase());
                                            setFormData({...formData, category: exactMatch || currentValue});
                                            setCategoryOpen(false);
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            formData.category === category ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {category}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2 h-full">
                    <div className="flex justify-between items-center">
                        <Label>Content</Label>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded flex items-center gap-1 border border-slate-200">
                            <Code className="w-3 h-3" />
                            Use ```language for code blocks
                        </span>
                    </div>
                    <Textarea 
                        value={formData.content} 
                        onChange={e => setFormData({...formData, content: e.target.value})} 
                        className="font-mono text-sm h-[400px] resize-none leading-relaxed"
                        placeholder="# Introduction...&#10;&#10;```javascript&#10;console.log('Hello World');&#10;```"
                    />
                </div>
            </div>

            <DialogFooter className="p-4 border-t border-slate-100 bg-white">
                <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={createDoc.isPending || updateDoc.isPending} className="bg-slate-900 text-white">
                    {(createDoc.isPending || updateDoc.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Publish
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}