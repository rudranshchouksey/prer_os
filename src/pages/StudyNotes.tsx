import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  FileText, 
  Tag, 
  Trash2,
  Edit3,
  Save,
  X,
  BookOpen
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MacCodeBlock, MarkdownContent } from '@/components/CodeBlock';
import { useUserNotes, useCreateNote, useUpdateNote, useDeleteNote, UserNote } from '@/hooks/useUserNotes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function NoteEditor({ 
  note, 
  onSave, 
  onCancel,
  isNew = false 
}: { 
  note?: UserNote; 
  onSave: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note?.tags || []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    onSave({ title, content, tags });
  };

  return (
    <div className="soft-card p-6 space-y-4">
      <Input
        placeholder="Note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-serif font-semibold border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 bg-transparent"
      />
      
      <Textarea
        placeholder="Write your notes here... Use markdown and code blocks (```language)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[300px] resize-none bg-transparent border-border"
      />
      
      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleAddTag}>
            <Tag className="w-4 h-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          {isNew ? 'Create Note' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

function NoteCard({ 
  note, 
  isSelected,
  onSelect,
  onEdit,
  onDelete 
}: { 
  note: UserNote;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "soft-card-hover p-4 cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-foreground truncate">{note.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {note.content?.slice(0, 100) || 'No content'}
          </p>
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{note.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudyNotes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<UserNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: notes = [], isLoading } = useUserNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query) ||
      note.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleCreateNote = async (data: { title: string; content: string; tags: string[] }) => {
    try {
      await createNote.mutateAsync(data);
      toast.success('Note created successfully');
      setIsCreating(false);
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (data: { title: string; content: string; tags: string[] }) => {
    if (!selectedNote) return;
    try {
      await updateNote.mutateAsync({ id: selectedNote.id, ...data });
      toast.success('Note updated successfully');
      setIsEditing(false);
      setSelectedNote({ ...selectedNote, ...data });
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success('Note deleted');
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

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
              Study Notes
            </h1>
            <p className="text-muted-foreground">
              Your personal knowledge base for interview preparation
            </p>
          </div>
          <Button onClick={() => { setIsCreating(true); setSelectedNote(null); setIsEditing(false); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="soft-card p-4 animate-shimmer h-24" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="soft-card p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No notes match your search' : 'No notes yet. Create your first note!'}
                </p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onSelect={() => { setSelectedNote(note); setIsCreating(false); setIsEditing(false); }}
                  onEdit={() => { setSelectedNote(note); setIsEditing(true); setIsCreating(false); }}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))
            )}
          </div>

          {/* Note Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isCreating ? (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <NoteEditor
                    isNew
                    onSave={handleCreateNote}
                    onCancel={() => setIsCreating(false)}
                  />
                </motion.div>
              ) : isEditing && selectedNote ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <NoteEditor
                    note={selectedNote}
                    onSave={handleUpdateNote}
                    onCancel={() => setIsEditing(false)}
                  />
                </motion.div>
              ) : selectedNote ? (
                <motion.div
                  key={selectedNote.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="soft-card p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-foreground">
                        {selectedNote.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last updated: {new Date(selectedNote.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedNote.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <MarkdownContent content={selectedNote.content || ''} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="soft-card p-12 text-center"
                >
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
                    Select a note to view
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a note from the list or create a new one
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Note
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}