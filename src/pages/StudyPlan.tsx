import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  CheckCircle2, 
  Target, 
  Sparkles,
  BookOpen,
  MoreHorizontal
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTasks, useCreateTask, useUpdateTask, useDeleteTask, UserTask } from '@/hooks/useUserTasks';
import { toast } from 'sonner';

// dnd-kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types & Config ---

type ColumnType = 'must-do' | 'nice-to-have' | 'applied';

const columns: { id: ColumnType; label: string; color: string; bg: string; border: string }[] = [
  { id: 'must-do', label: 'Priority / Must Do', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'nice-to-have', label: 'Nice to Have', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'applied', label: 'Completed / Applied', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
];

const SUGGESTIONS = [
  'System Design: Scalability',
  'React Hooks Deep Dive',
  'PostgreSQL Indexing',
  'Docker & Kubernetes',
  'GraphQL vs REST',
  'CI/CD Pipelines'
];

// --- Components ---

function TaskCard({ task, isOverlay, onDelete }: { task: UserTask; isOverlay?: boolean; onDelete?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all touch-none",
        "hover:border-purple-300 hover:shadow-md",
        isDragging && "opacity-30 border-dashed border-slate-400 bg-slate-50",
        isOverlay && "opacity-100 scale-105 shadow-xl ring-2 ring-purple-500 z-50 cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium text-slate-900 leading-tight mb-1",
            task.category === 'applied' && "line-through text-slate-500"
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
             <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-slate-100 text-slate-500">
               {task.category === 'must-do' ? 'High Priority' : task.category === 'nice-to-have' ? 'Medium' : 'Done'}
             </Badge>
          </div>
        </div>

        {!isOverlay && onDelete && (
          <button
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ 
  column, 
  tasks, 
  onDeleteTask 
}: { 
  column: typeof columns[number]; 
  tasks: UserTask[]; 
  onDeleteTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', column }
  });

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-50/50 border border-slate-200/60 overflow-hidden">
      {/* Column Header */}
      <div className={cn("p-3 border-b border-slate-100 flex items-center justify-between", column.bg)}>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.color.replace('text-', 'bg-'))} />
          <h3 className={cn("text-xs font-bold uppercase tracking-wider", column.color)}>
            {column.label}
          </h3>
        </div>
        <Badge variant="secondary" className="bg-white shadow-sm font-mono text-[10px] text-slate-600">
          {tasks.length}
        </Badge>
      </div>

      {/* Sortable Area */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px] transition-colors",
          isOver && "bg-purple-50/50"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={() => onDeleteTask(task.id)} />
          ))}
          {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
              <p className="text-xs text-slate-400 font-medium">Drop tasks here</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default function StudyPlan() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useUserTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const [newItemTitle, setNewItemTitle] = useState('');
  const [activeTask, setActiveTask] = useState<UserTask | null>(null);

  // Sensors optimized for interactions
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddItem = (title = newItemTitle, category: ColumnType = 'must-do') => {
    if (!title.trim()) return;
    if (!user) return toast.error('Please log in');
    
    createTask.mutate({ title: title.trim(), description: null, category, due_date: null }, {
      onSuccess: () => {
        setNewItemTitle('');
        toast.success('Task added');
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
        setActiveTask(task);
        if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Dropped on a column directly
    if (columns.some(c => c.id === over.id)) {
        if (activeTask.category !== over.id) {
            updateTask.mutate({ id: activeTask.id, category: over.id as ColumnType });
        }
        return;
    }

    // Dropped on another task
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask && overTask.category !== activeTask.category) {
        updateTask.mutate({ id: activeTask.id, category: overTask.category });
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  // Stats Calculation
  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.category === 'applied').length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 pb-20">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Study Roadmap</h1>
            <p className="text-slate-500">Organize your preparation strategy.</p>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Completion</span>
                <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Input & Suggestions Area */}
        <div className="space-y-4">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Target className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <Input
                    placeholder="Add a new topic to study..."
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    className="pl-11 h-12 bg-white border-slate-200 shadow-sm text-base focus-visible:ring-purple-500"
                />
                <div className="absolute inset-y-0 right-1.5 flex items-center">
                    <Button size="sm" onClick={() => handleAddItem()} disabled={createTask.isPending} className="h-9 bg-slate-900 text-white hover:bg-slate-800">
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-2">
                <span className="flex items-center text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <Sparkles className="w-3 h-3 mr-1 text-purple-500" /> Recommended:
                </span>
                {SUGGESTIONS.map(suggestion => (
                    <button
                        key={suggestion}
                        onClick={() => handleAddItem(suggestion, 'must-do')}
                        className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-all"
                    >
                        + {suggestion}
                    </button>
                ))}
            </div>
        </div>

        {/* Kanban Board */}
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        tasks={tasks.filter(t => t.category === col.id)}
                        onDeleteTask={(id) => deleteTask.mutate(id)}
                    />
                ))}
            </div>
            
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>

      </motion.div>
    </MainLayout>
  );
}