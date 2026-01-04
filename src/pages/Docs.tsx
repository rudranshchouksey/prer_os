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
  Copy,
  User
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { MarkdownContent } from '@/components/CodeBlock';
import { useStudyModules } from '@/hooks/useStudyModules';
import { useUserNotes, useUpdateNote, useDeleteNote, useCreateNote } from '@/hooks/useUserNotes';
import { ContributeNoteModal } from '@/components/ContributeNoteModal';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- Types ---

interface Topic {
  id: string;
  title: string;
  content: string;
  isUserNote: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
  expanded?: boolean;
}

// --- Helper Functions ---

const getReadTopics = (): Set<string> => {
  try {
    const stored = localStorage.getItem('prepos-read-topics');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
};

const markTopicAsRead = (topicId: string): Set<string> => {
  const readTopics = getReadTopics();
  readTopics.add(topicId);
  localStorage.setItem('prepos-read-topics', JSON.stringify([...readTopics]));
  return readTopics;
};

// --- RESTORED CONTENT DICTIONARY ---
const getDocContent = (topicId: string): string => {
  const docs: Record<string, string> = {
    'react-hooks': `# React Hooks

Hooks are functions that let you "hook into" React state and lifecycle features from function components.

## useState

The most basic hook for managing state:

\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

## useEffect

For side effects like data fetching, subscriptions, or DOM mutations:

\`\`\`javascript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

## Rules of Hooks

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Use the ESLint plugin for enforcement`,

    'react-context': `# Context API

Context provides a way to pass data through the component tree without prop drilling.

## Creating Context

\`\`\`typescript
import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
\`\`\`

## Usage

\`\`\`typescript
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      style={{ background: theme === 'light' ? '#fff' : '#333' }}
    >
      Toggle Theme
    </button>
  );
}
\`\`\``,

    'default': `# Welcome to PrepOS Docs

Select a topic from the sidebar to view documentation.

### 📚 Managing Your Content
- **System Topics**: Built-in guides (ReadOnly). You can **Clone** these to edit them.
- **My Notes**: Your personal notes. You can **Edit** or **Delete** these freely.

### 🚀 Quick Start
Click the **+ Add** button or use the **...** menu on any topic to manage it.`
  };

  return docs[topicId] || docs['default'];
};

// --- Sidebar Component ---

interface DocsSidebarProps {
  categories: Category[];
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  selectedTopic: string | null;
  setSelectedTopic: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalTopics: number;
  readCount: number;
  readTopics: Set<string>;
  onAddClick: () => void;
  onEditNote: (topic: Topic) => void;
  onDeleteNote: (topicId: string) => void;
  onCloneTopic: (topic: Topic, categoryName: string) => void;
  closeMobileMenu?: () => void;
}

const DocsSidebar = ({
  categories,
  expandedCategories,
  toggleCategory,
  selectedTopic,
  setSelectedTopic,
  searchQuery,
  setSearchQuery,
  totalTopics,
  readCount,
  readTopics,
  onAddClick,
  onEditNote,
  onDeleteNote,
  onCloneTopic,
  closeMobileMenu
}: DocsSidebarProps) => (
  <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm">
    <div className="p-4 border-b border-border bg-slate-50/80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Documentation</h2>
        </div>
        <Button
          size="sm"
          onClick={onAddClick}
          className="bg-slate-900 text-white hover:bg-slate-800 h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white border-border h-9"
        />
      </div>

      <div className="flex gap-2 mt-3">
        <div className="flex-1 text-center p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-foreground">{totalTopics}</p>
          <p className="text-xs text-muted-foreground">Topics</p>
        </div>
        <div className="flex-1 text-center p-2 rounded-lg bg-green-50 border border-green-100">
          <p className="text-lg font-bold text-green-700">{readCount}</p>
          <p className="text-xs text-green-600 font-medium">Read</p>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-3 space-y-1">
      {categories.map((category) => (
        <div key={category.id}>
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-slate-100 transition-colors"
          >
            {expandedCategories.has(category.id) ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <FolderOpen className="w-4 h-4 text-primary" />
            <span>{category.name}</span>
          </button>

          <AnimatePresence>
            {expandedCategories.has(category.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-6 py-1 space-y-0.5">
                  {category.topics.map((topic) => (
                    <div 
                      key={topic.id}
                      className={cn(
                        "group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedTopic === topic.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-slate-50"
                      )}
                    >
                      <button
                        onClick={() => {
                          setSelectedTopic(topic.id);
                          if(closeMobileMenu) closeMobileMenu();
                        }}
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                      >
                        {readTopics.has(topic.id) ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : topic.isUserNote ? (
                          <User className="w-4 h-4 flex-shrink-0 opacity-70" />
                        ) : (
                          <FileText className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{topic.title}</span>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {topic.isUserNote ? (
                            <>
                              <DropdownMenuItem onClick={() => onEditNote(topic)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDeleteNote(topic.id.replace('note-', ''))}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem onClick={() => onCloneTopic(topic, category.name)}>
                              <Copy className="w-4 h-4 mr-2" /> Clone & Edit
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

// --- Main Component ---

export default function Docs() {
  const { data: studyModules, isLoading } = useStudyModules();
  const { data: userNotes } = useUserNotes();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['react']));
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [readTopics, setReadTopics] = useState<Set<string>>(getReadTopics);
  
  const [editingTopic, setEditingTopic] = useState<{ id: string; title: string; content: string } | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', content: '' });
  const [isEditSaving, setIsEditSaving] = useState(false);

  const categories: Category[] = useMemo(() => {
    const modules = studyModules || [];
    
    // 1. Group Modules
    const groupedModules = modules.reduce((acc, module) => {
      const catName = module.category || 'General';
      const catId = catName.toLowerCase().replace(/\s+/g, '-');
      
      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          name: catName,
          icon: module.icon || 'FileText',
          topics: []
        };
      }
      acc[catId].topics.push({
        id: module.slug,
        title: module.title,
        content: module.description || '',
        isUserNote: false
      });
      return acc;
    }, {} as Record<string, Category>);

    // 2. Base Categories with Hardcoded IDs for mapping
    const baseCategories: Record<string, Category> = {
      'react': {
        id: 'react',
        name: 'React.js',
        icon: 'Code',
        topics: [
          { id: 'react-hooks', title: 'Hooks', content: '', isUserNote: false },
          { id: 'react-context', title: 'Context API', content: '', isUserNote: false },
        ]
      },
      ...groupedModules
    };
    
    // 3. Distribute User Notes
    const unassignedNotes: Topic[] = [];

    if (userNotes && userNotes.length > 0) {
      userNotes.forEach(note => {
        const noteTopic = {
          id: `note-${note.id}`,
          title: note.title,
          content: note.content || '',
          isUserNote: true
        };

        let assigned = false;
        
        let tags: string[] = [];
        if (Array.isArray(note.tags)) {
           tags = note.tags;
        } else if (typeof note.tags === 'string') {
            try { tags = JSON.parse(note.tags); } catch { tags = [note.tags]; }
        }

        for (const tag of tags) {
            const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
            if (baseCategories[normalizedTag]) {
                baseCategories[normalizedTag].topics.push(noteTopic);
                assigned = true;
                break;
            }
            const foundKey = Object.keys(baseCategories).find(k => 
                baseCategories[k].name.toLowerCase() === tag.toLowerCase()
            );
            if (foundKey) {
                baseCategories[foundKey].topics.push(noteTopic);
                assigned = true;
                break;
            }
        }

        if (!assigned) {
          unassignedNotes.push(noteTopic);
        }
      });
    }

    const finalCategories = Object.values(baseCategories);

    if (unassignedNotes.length > 0) {
      finalCategories.push({
        id: 'my-notes',
        name: 'My Notes',
        icon: 'FileText',
        topics: unassignedNotes
      });
    }
    
    return finalCategories;
  }, [studyModules, userNotes]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      topics: cat.topics.filter(topic => 
        topic.title.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query)
      )
    })).filter(cat => cat.topics.length > 0);
  }, [categories, searchQuery]);

  // Content Selection Logic
  const isUserNote = selectedTopic?.startsWith('note-');
  const selectedNoteId = isUserNote ? selectedTopic?.replace('note-', '') : null;
  const selectedNote = userNotes?.find(n => n.id === selectedNoteId);
  
  let content = '';
  if (isUserNote && selectedNote) {
    content = selectedNote.content || `# ${selectedNote.title}\n\nNo content yet.`;
  } else {
    // Try to get hardcoded content first
    const hardcoded = getDocContent(selectedTopic || 'default');
    if (hardcoded && selectedTopic !== 'default') {
        content = hardcoded;
    } else if (selectedTopic) {
        // Fallback to module description if no hardcoded content
        for (const cat of categories) {
            const found = cat.topics.find(t => t.id === selectedTopic);
            if (found) {
                content = `# ${found.title}\n\n${found.content || 'No description available.'}`;
                break;
            }
        }
    } else {
        content = hardcoded; // Default welcome message
    }
  }

  const isTopicRead = selectedTopic ? readTopics.has(selectedTopic) : false;

  const handleMarkAsRead = () => {
    if (selectedTopic) {
      const updated = markTopicAsRead(selectedTopic);
      setReadTopics(new Set(updated));
      toast.success('Topic marked as read!');
    }
  };

  const handleEditNote = (topic: Topic) => {
    const noteId = topic.id.replace('note-', '');
    const note = userNotes?.find(n => n.id === noteId);
    
    if (note) {
      setEditingTopic({
        id: note.id,
        title: note.title,
        content: note.content || ''
      });
      setEditFormData({
        title: note.title,
        content: note.content || ''
      });
    }
  };

  const handleCloneTopic = async (topic: Topic, categoryName: string) => {
    const newTitle = `${topic.title} (Copy)`;
    const newContent = topic.content || getDocContent(topic.id);
    
    try {
      await createNote.mutateAsync({
        title: newTitle,
        content: newContent,
        tags: [categoryName]
      });
      toast.success(`Cloned "${topic.title}" to your notes!`);
    } catch (error) {
      toast.error("Failed to clone topic");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTopic) return;
    setIsEditSaving(true);
    try {
      await updateNote.mutateAsync({
        id: editingTopic.id,
        title: editFormData.title,
        content: editFormData.content
      });
      toast.success('Note updated!');
      setEditingTopic(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update note');
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success('Note deleted');
      if (selectedTopic === `note-${noteId}`) {
        setSelectedTopic(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete note');
    }
  };

  const sidebarProps = {
    categories: filteredCategories,
    expandedCategories,
    toggleCategory,
    selectedTopic,
    setSelectedTopic,
    searchQuery,
    setSearchQuery,
    totalTopics: categories.reduce((acc, cat) => acc + cat.topics.length, 0),
    readCount: readTopics.size,
    readTopics,
    onAddClick: () => setIsContributeOpen(true),
    onEditNote: handleEditNote,
    onDeleteNote: handleDeleteNote,
    onCloneTopic: handleCloneTopic
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
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
             <Menu className="w-6 h-6 text-slate-700" />
           </Button>
           <h1 className="font-bold text-slate-900 text-lg">Documentation</h1>
        </div>
        <Button size="sm" onClick={() => setIsContributeOpen(true)} className="bg-slate-900 text-white">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-2rem)] md:-m-6 relative">
        <aside className="hidden md:flex w-72 border-r border-border bg-white flex-col h-full">
          <DocsSidebar {...sidebarProps} />
        </aside>

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
                <div className="absolute top-2 right-2 z-50">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </Button>
                </div>
                <DocsSidebar {...sidebarProps} closeMobileMenu={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/30">
          <div className="w-full max-w-4xl mx-auto p-4 md:p-8 pb-20 md:pb-8">
            <motion.div
              key={selectedTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-slate prose-lg max-w-none w-full break-words [&_pre]:overflow-x-auto [&_code]:break-words prose-headings:font-serif prose-headings:font-bold prose-h1:text-3xl md:prose-h1:text-4xl"
            >
              {isUserNote && user && (
                <div className="not-prose flex gap-2 mb-4 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditNote({ 
                        id: `note-${selectedNote?.id}`, 
                        title: selectedNote?.title!, 
                        content: selectedNote?.content!, 
                        isUserNote: true 
                    })}
                    className="gap-2 text-slate-500 hover:text-slate-900"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this community contribution? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteNote(selectedNoteId!)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
              
              <MarkdownContent content={content} />
              
              {selectedTopic && selectedTopic !== 'default' && (
                <div className="mt-8 pt-6 border-t border-border flex justify-end gap-2 not-prose">
                  <Button
                    size="sm"
                    variant={isTopicRead ? "outline" : "default"}
                    onClick={handleMarkAsRead}
                    disabled={isTopicRead}
                    className={cn(
                      "gap-2 transition-all",
                      isTopicRead 
                        ? "text-green-700 border-green-200 bg-green-50" 
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isTopicRead ? 'Marked as Read' : 'Mark as Read'}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>

      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent className="sm:max-w-2xl w-[95%] rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content (Markdown)</Label>
              <Textarea
                id="edit-content"
                value={editFormData.content}
                onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setEditingTopic(null)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditSaving} className="w-full sm:w-auto bg-slate-900 text-white">
              {isEditSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ContributeNoteModal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        categories={categories.map(c => ({ id: c.id, name: c.name }))}
      />
    </MainLayout>
  );
}