import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Check, 
  Star, 
  Clock,
  ListTodo,
  Loader2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

type ColumnType = 'must-do' | 'nice-to-have' | 'applied';

const columns: { id: ColumnType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'must-do', label: 'Must Do', icon: Star, color: 'text-destructive' },
  { id: 'nice-to-have', label: 'Nice to Have', icon: Clock, color: 'text-warning' },
  { id: 'applied', label: 'Applied', icon: Check, color: 'text-success' }
];

interface SortableTaskCardProps {
  task: UserTask;
  onDelete: () => void;
}

function SortableTaskCard({ task, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "glass rounded-xl p-4 group hover:border-primary/30 transition-all",
        isDragging && "shadow-lg ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{task.title}</p>
          {task.description && (
            <span className="text-xs text-muted-foreground line-clamp-2">{task.description}</span>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

function TaskCardOverlay({ task }: { task: UserTask }) {
  return (
    <div className="glass rounded-xl p-4 shadow-2xl ring-2 ring-primary">
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{task.title}</p>
          {task.description && (
            <span className="text-xs text-muted-foreground">{task.description}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface DroppableColumnProps {
  column: typeof columns[number];
  tasks: UserTask[];
  onDeleteTask: (id: string) => void;
}

function DroppableColumn({ column, tasks, onDeleteTask }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <column.icon className={cn("w-5 h-5", column.color)} />
          <h2 className="font-semibold">{column.label}</h2>
        </div>
        <span className="text-sm text-muted-foreground font-mono">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-3 min-h-[200px] p-4 rounded-2xl border transition-colors",
          "bg-dark-800/30 border-border/50",
          isOver && "bg-primary/5 border-primary/30"
        )}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ListTodo className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Drop items here</p>
            </div>
          ) : (
            tasks.map(task => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))
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
  const [newItemColumn, setNewItemColumn] = useState<ColumnType>('must-do');
  const [activeTask, setActiveTask] = useState<UserTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    if (!user) {
      toast.error('Please log in to add items');
      return;
    }
    
    createTask.mutate({
      title: newItemTitle.trim(),
      description: null,
      category: newItemColumn,
      due_date: null
    }, {
      onSuccess: () => {
        setNewItemTitle('');
        toast.success('Item added');
      },
      onError: () => {
        toast.error('Failed to add item');
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    deleteTask.mutate(id, {
      onSuccess: () => toast.success('Item deleted'),
      onError: () => toast.error('Failed to delete item')
    });
  };

  const getTasksByCategory = (category: ColumnType) => 
    tasks.filter(task => task.category === category);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped over a column
    const targetColumn = columns.find(c => c.id === over.id);
    if (targetColumn && activeTask.category !== targetColumn.id) {
      updateTask.mutate({
        id: activeTask.id,
        category: targetColumn.id
      });
      return;
    }

    // Check if dropped over another task
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask && overTask.category !== activeTask.category) {
      updateTask.mutate({
        id: activeTask.id,
        category: overTask.category
      });
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Please log in to view your study plan.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-2">
            Study Plan
          </h1>
          <p className="text-muted-foreground">
            Drag and drop to organize your learning roadmap
          </p>
        </div>

        {/* Add New Item */}
        <GlassCard className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Add a new study item..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="bg-dark-800 border-border"
            />
          </div>
          <div className="flex gap-2">
            {columns.map(col => (
              <button
                key={col.id}
                onClick={() => setNewItemColumn(col.id)}
                className={cn(
                  "p-2 rounded-lg border transition-all",
                  newItemColumn === col.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                )}
                title={col.label}
              >
                <col.icon className={cn("w-4 h-4", col.color)} />
              </button>
            ))}
          </div>
          <Button 
            onClick={handleAddItem} 
            className="gap-2"
            disabled={createTask.isPending}
          >
            {createTask.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </Button>
        </GlassCard>

        {/* Kanban Board with Drag and Drop */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {columns.map(column => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={getTasksByCategory(column.id)}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
            
            <DragOverlay>
              {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Quick Add Suggestions */}
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Quick Add from Tech Vault</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Event-Driven Architecture',
              'Docker Containerization',
              'OAuth 2.0 Flow',
              'React Performance',
              'Prisma Relations',
              'Kubernetes Basics'
            ].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => {
                  if (!user) {
                    toast.error('Please log in to add items');
                    return;
                  }
                  createTask.mutate({
                    title: suggestion,
                    description: 'From Tech Vault',
                    category: 'must-do',
                    due_date: null
                  });
                }}
                className="px-3 py-1.5 rounded-lg text-sm bg-muted hover:bg-muted/80 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </MainLayout>
  );
}
