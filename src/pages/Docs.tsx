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
  Trash2
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
import { MarkdownContent } from '@/components/CodeBlock';
import { useStudyModules } from '@/hooks/useStudyModules';
import { useUserNotes, useUpdateNote, useDeleteNote } from '@/hooks/useUserNotes';
import { ContributeNoteModal } from '@/components/ContributeNoteModal';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Topic {
  id: string;
  title: string;
  content: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
  expanded?: boolean;
}

// Track read topics in localStorage for now (can be moved to DB later)
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

This documentation covers:
- **Frontend Technologies**: React, TypeScript, State Management
- **Backend Technologies**: Node.js, APIs, Databases
- **DevOps**: Docker, Kubernetes, CI/CD
- **System Design**: Architecture patterns, Scalability

Each topic includes:
- Detailed explanations
- Code examples with syntax highlighting
- Best practices and common pitfalls`
  };

  return docs[topicId] || docs['default'];
};

export default function Docs() {
  const { data: studyModules, isLoading } = useStudyModules();
  const { data: userNotes } = useUserNotes();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['react']));
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [readTopics, setReadTopics] = useState<Set<string>>(getReadTopics);
  
  // Edit state for wiki-style editing
  const [editingTopic, setEditingTopic] = useState<{ id: string; title: string; content: string } | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', content: '' });
  const [isEditSaving, setIsEditSaving] = useState(false);

  const categories: Category[] = useMemo(() => {
    const modules = studyModules || [];
    
    // Group modules by category
    const grouped = modules.reduce((acc, module) => {
      const cat = module.category || 'General';
      if (!acc[cat]) {
        acc[cat] = {
          id: cat.toLowerCase().replace(/\s+/g, '-'),
          name: cat,
          icon: module.icon || 'FileText',
          topics: []
        };
      }
      acc[cat].topics.push({
        id: module.slug,
        title: module.title,
        content: module.description || ''
      });
      return acc;
    }, {} as Record<string, Category>);

    // Add some sample topics for demonstration
    const baseCategories = [
      {
        id: 'react',
        name: 'React.js',
        icon: 'Code',
        topics: [
          { id: 'react-hooks', title: 'Hooks', content: '' },
          { id: 'react-context', title: 'Context API', content: '' },
          { id: 'react-performance', title: 'Performance', content: '' },
        ]
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        icon: 'Server',
        topics: [
          { id: 'nodejs-event-loop', title: 'Event Loop', content: '' },
          { id: 'nodejs-streams', title: 'Streams', content: '' },
        ]
      },
      {
        id: 'system-design',
        name: 'System Design',
        icon: 'Layers',
        topics: [
          { id: 'microservices', title: 'Microservices', content: '' },
          { id: 'caching', title: 'Caching Strategies', content: '' },
        ]
      },
      ...Object.values(grouped)
    ];
    
    // Add user notes as a category if they exist
    if (userNotes && userNotes.length > 0) {
      baseCategories.push({
        id: 'my-notes',
        name: 'My Notes',
        icon: 'FileText',
        topics: userNotes.map(note => ({
          id: `note-${note.id}`,
          title: note.title,
          content: note.content || ''
        }))
      });
    }
    
    return baseCategories;
  }, [studyModules, userNotes]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
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

  // Check if selected topic is a user note
  const isUserNote = selectedTopic?.startsWith('note-');
  const selectedNoteId = isUserNote ? selectedTopic?.replace('note-', '') : null;
  const selectedNote = userNotes?.find(n => n.id === selectedNoteId);
  
  const content = isUserNote && selectedNote 
    ? selectedNote.content || '# ' + selectedNote.title + '\n\nNo content yet.'
    : getDocContent(selectedTopic || 'default');
  const isTopicRead = selectedTopic ? readTopics.has(selectedTopic) : false;

  const handleMarkAsRead = () => {
    if (selectedTopic) {
      const updated = markTopicAsRead(selectedTopic);
      setReadTopics(new Set(updated));
      toast.success('Topic marked as read!');
    }
  };

  // Wiki-style edit handlers
  const handleEditTopic = () => {
    if (isUserNote && selectedNote) {
      setEditingTopic({
        id: selectedNote.id,
        title: selectedNote.title,
        content: selectedNote.content || ''
      });
      setEditFormData({
        title: selectedNote.title,
        content: selectedNote.content || ''
      });
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

  const handleDeleteTopic = async () => {
    if (!selectedNoteId) return;
    
    try {
      await deleteNote.mutateAsync(selectedNoteId);
      toast.success('Note deleted');
      setSelectedTopic(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete note');
    }
  };

  // Calculate stats
  const totalTopics = categories.reduce((acc, cat) => acc + cat.topics.length, 0);
  const readCount = readTopics.size;

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
        {/* Secondary Sidebar for Docs Navigation */}
        <aside className="w-72 border-r border-border bg-white/50 backdrop-blur-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Documentation</h2>
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
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-border h-9"
              />
            </div>

            {/* Progress Stats */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1 text-center p-2 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{totalTopics}</p>
                <p className="text-xs text-muted-foreground">Topics</p>
              </div>
              <div className="flex-1 text-center p-2 rounded-lg bg-success/10">
                <p className="text-lg font-bold text-success">{readCount}</p>
                <p className="text-xs text-muted-foreground">Read</p>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
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
                          <button
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic.id)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                              selectedTopic === topic.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            {readTopics.has(topic.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            <span>{topic.title}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-background to-muted/20">
          <div className="w-full max-w-4xl mx-auto p-8">
            <motion.div
              key={selectedTopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-lg max-w-none w-full break-words [&_pre]:overflow-x-auto [&_code]:break-words"
            >
              {/* Wiki-style Edit/Delete buttons for user notes */}
              {isUserNote && user && (
                <div className="not-prose flex gap-2 mb-4 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditTopic}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-destructive"
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
                          onClick={handleDeleteTopic}
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
              
              {/* Mark as Read Button */}
              {selectedTopic && selectedTopic !== 'default' && (
                <div className="mt-8 pt-6 border-t border-border flex justify-end gap-2 not-prose">
                  <Button
                    size="sm"
                    variant={isTopicRead ? "outline" : "default"}
                    onClick={handleMarkAsRead}
                    disabled={isTopicRead}
                    className={cn(
                      "gap-2",
                      isTopicRead && "text-success border-success/20"
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

      {/* Edit Note Modal */}
      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTopic(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isEditSaving}>
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
