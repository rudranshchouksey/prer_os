import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface ContributeNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string }>;
}

export function ContributeNoteModal({ isOpen, onClose, categories }: ContributeNoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to contribute');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setLoading(true);

    try {
      const tags = useCustomCategory && customCategory.trim() 
        ? [customCategory.trim()] 
        : categoryId 
          ? [categoryId] 
          : [];

      const { error } = await supabase.from('notes').insert({
        title: title.trim(),
        content: content.trim(),
        user_id: user.id,
        tags
      });

      if (error) throw error;

      toast.success('Note added successfully!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      
      // Reset form
      setTitle('');
      setContent('');
      setCategoryId('');
      setCustomCategory('');
      setUseCustomCategory(false);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={!useCustomCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setUseCustomCategory(false)}
          >
            Existing
          </Button>
          <Button
            type="button"
            variant={useCustomCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setUseCustomCategory(true)}
          >
            New Category
          </Button>
        </div>
        
        {useCustomCategory ? (
          <Input
            placeholder="Enter new category name"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="bg-muted/50 border-border"
          />
        ) : (
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="Enter note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-muted/50 border-border"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content * (Supports code blocks with ```)</Label>
        <Textarea
          id="content"
          placeholder={"Write your documentation...\n\nYou can use code blocks:\n```javascript\nconst example = 'hello';\n```"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-muted/50 border-border min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Add Note'
          )}
        </Button>
      </div>
    </form>
  );

  // Mobile: Use Sheet (Drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <SheetTitle>Add Documentation</SheetTitle>
                <SheetDescription>Contribute to the knowledge base</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="overflow-y-auto">
            {FormContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Modal
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal - Centered with flexbox */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl p-6 shadow-soft-xl border border-border">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Add Documentation</h2>
                      <p className="text-sm text-muted-foreground">Contribute to the knowledge base</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {FormContent}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
