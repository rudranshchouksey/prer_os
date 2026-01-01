import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  BookOpen,
  Zap,
  Briefcase,
  FileText,
  Calendar,
  Plus,
  User,
  LogOut,
  Search,
  Settings,
  MessageSquareText,
} from 'lucide-react';
import { useStudyModules } from '@/hooks/useStudyModules';
import { useAuth } from '@/contexts/AuthContext';

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandMenu({ open: controlledOpen, onOpenChange }: CommandMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: studyModules } = useStudyModules();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, [setOpen]);

  // Get all questions for search
  const allQuestions = studyModules?.flatMap(m => 
    (m.questions || []).map(q => ({
      ...q,
      moduleName: m.title
    }))
  ) || [];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/docs'))}>
            <BookOpen className="mr-2 h-4 w-4" />
            Go to Study Notes
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/questions'))}>
            <Zap className="mr-2 h-4 w-4" />
            Go to Interview Ready
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/applications'))}>
            <Briefcase className="mr-2 h-4 w-4" />
            Go to Applications
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/plan'))}>
            <Calendar className="mr-2 h-4 w-4" />
            Go to Study Plan
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
            <User className="mr-2 h-4 w-4" />
            Go to Profile
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => {
            navigate('/docs');
            // Trigger add note modal - we'll use a query param
            navigate('/docs?action=add-note');
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Note
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            navigate('/applications?action=add');
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Log New Application
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            navigate('/questions?action=add');
          })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Interview Question
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Study Modules Search */}
        {studyModules && studyModules.length > 0 && (
          <>
            <CommandGroup heading="Study Modules">
              {studyModules.slice(0, 5).map((module) => (
                <CommandItem
                  key={module.id}
                  onSelect={() => runCommand(() => navigate(`/docs?topic=${module.slug}`))}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {module.title}
                  <span className="ml-2 text-xs text-muted-foreground">{module.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Questions Search */}
        {allQuestions.length > 0 && (
          <>
            <CommandGroup heading="Questions">
              {allQuestions.slice(0, 5).map((question) => (
                <CommandItem
                  key={question.id}
                  onSelect={() => runCommand(() => navigate(`/questions?q=${encodeURIComponent(question.question_text.substring(0, 50))}`))}
                >
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  <span className="truncate">{question.question_text.substring(0, 60)}...</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Account */}
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => signOut())}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook to control command menu from anywhere
export function useCommandMenu() {
  const [open, setOpen] = useState(false);
  return { open, setOpen, toggle: () => setOpen(o => !o) };
}
