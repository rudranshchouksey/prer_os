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

interface ContributeQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Array<{ id: string; title: string; category: string }>;
}

export function ContributeQuestionModal({ isOpen, onClose, modules }: ContributeQuestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

    if (!useCustomCategory && !moduleId) {
      toast.error('Please select a category or create a new one');
      return;
    }

    if (useCustomCategory && !customCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setLoading(true);

    try {
      let targetModuleId = moduleId;

      // If using custom category, create new study module first
      if (useCustomCategory && customCategory.trim()) {
        const slug = customCategory.trim().toLowerCase().replace(/\s+/g, '-');
        
        // Check if module already exists
        const { data: existingModule } = await supabase
          .from('study_modules')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (existingModule) {
          targetModuleId = existingModule.id;
        } else {
          // Create new module - note: this might fail if user doesn't have INSERT permission
          // In that case, we'll use an existing module as fallback
          const { data: newModule, error: moduleError } = await supabase
            .from('study_modules')
            .insert({
              title: customCategory.trim(),
              slug,
              category: 'Community',
              description: `Community-created category: ${customCategory.trim()}`,
              icon: 'Code'
            })
            .select('id')
            .single();

          if (moduleError) {
            // Use first available module as fallback
            if (modules.length > 0) {
              targetModuleId = modules[0].id;
              toast.info(`Using "${modules[0].title}" as category (custom categories require admin approval)`);
            } else {
              throw new Error('No categories available');
            }
          } else {
            targetModuleId = newModule.id;
          }
        }
      }

      const { error } = await supabase.from('questions').insert({
        question_text: question.trim(),
        answer_text: answer.trim(),
        module_id: targetModuleId,
        difficulty,
        created_by_id: user.id,
        is_system_generated: false,
        tags: useCustomCategory ? [customCategory.trim()] : null
      });

      if (error) throw error;

      toast.success('Question submitted! Thanks for contributing.');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['study-modules'] });
      
      // Reset form
      setQuestion('');
      setAnswer('');
      setModuleId('');
      setDifficulty('Medium');
      setCustomCategory('');
      setUseCustomCategory(false);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit question');
    } finally {
      setLoading(false);
    }
  };

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
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-strong rounded-2xl p-6 border border-border">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Contribute Question</h2>
                    <p className="text-sm text-muted-foreground">Share your knowledge with the community</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label>Category *</Label>
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
                      placeholder="Enter new category name (e.g., Web3, Rust, GraphQL)"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                  ) : (
                    <Select value={moduleId} onValueChange={setModuleId}>
                      <SelectTrigger className="bg-muted/50 border-border">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter the interview question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-muted/50 border-border min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="answer">Answer * (Supports code blocks with ```)</Label>
                  <Textarea
                    id="answer"
                    placeholder={"Provide a comprehensive answer...\n\nYou can use code blocks:\n```javascript\nconst example = 'hello';\n```"}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="bg-muted/50 border-border min-h-[150px] font-mono text-sm"
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
                      'Submit Question'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
