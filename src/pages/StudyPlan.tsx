import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Check, 
  Star, 
  Clock,
  ListTodo
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore, StudyItem } from '@/store/useStore';
import { cn } from '@/lib/utils';

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

function StudyItemCard({ 
  item, 
  onStatusChange, 
  onDelete 
}: { 
  item: StudyItem; 
  onStatusChange: (status: ColumnType) => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass rounded-xl p-4 group hover:border-primary/30 transition-all"
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.title}</p>
          {item.category && (
            <span className="text-xs text-muted-foreground">{item.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {columns.filter(c => c.id !== item.status).map(col => (
            <button
              key={col.id}
              onClick={() => onStatusChange(col.id)}
              className={cn(
                "p-1.5 rounded-lg hover:bg-muted transition-colors",
                col.color
              )}
              title={`Move to ${col.label}`}
            >
              <col.icon className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudyPlan() {
  const { studyItems, addStudyItem, updateStudyItemStatus, removeStudyItem } = useStore();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemColumn, setNewItemColumn] = useState<ColumnType>('must-do');

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    addStudyItem({
      title: newItemTitle.trim(),
      status: newItemColumn,
      category: ''
    });
    setNewItemTitle('');
  };

  const getItemsByStatus = (status: ColumnType) => 
    studyItems.filter(item => item.status === status);

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
            Organize your learning roadmap with a Kanban-style board
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
          <Button onClick={handleAddItem} className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </GlassCard>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map(column => {
            const items = getItemsByStatus(column.id);
            return (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className={cn("w-5 h-5", column.color)} />
                    <h2 className="font-semibold">{column.label}</h2>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono">
                    {items.length}
                  </span>
                </div>
                
                <div className="space-y-3 min-h-[200px] p-4 rounded-2xl bg-dark-800/30 border border-border/50">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <ListTodo className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No items yet</p>
                    </div>
                  ) : (
                    items.map(item => (
                      <StudyItemCard
                        key={item.id}
                        item={item}
                        onStatusChange={(status) => updateStudyItemStatus(item.id, status)}
                        onDelete={() => removeStudyItem(item.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
                  addStudyItem({ title: suggestion, status: 'must-do', category: 'Tech Vault' });
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
