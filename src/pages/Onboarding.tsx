import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Code, Server, Cloud, Layout, Database, Shield, Smartphone, Globe, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateSettings } from '@/hooks/useUserSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'frontend', title: 'Frontend', description: 'React, Vue, CSS, UI/UX', icon: Layout, color: 'from-blue-500 to-cyan-500' },
  { id: 'backend', title: 'Backend', description: 'Node.js, APIs, Databases', icon: Server, color: 'from-green-500 to-emerald-500' },
  { id: 'devops', title: 'DevOps', description: 'CI/CD, Docker, Kubernetes', icon: Cloud, color: 'from-orange-500 to-amber-500' },
  { id: 'system-design', title: 'System Design', description: 'Architecture, Scaling', icon: Cpu, color: 'from-purple-500 to-violet-500' },
  { id: 'data-structures', title: 'Data Structures', description: 'Arrays, Trees, Graphs', icon: Database, color: 'from-pink-500 to-rose-500' },
  { id: 'algorithms', title: 'Algorithms', description: 'Sorting, Searching, DP', icon: Code, color: 'from-indigo-500 to-blue-500' },
  { id: 'security', title: 'Security', description: 'Auth, Encryption, OWASP', icon: Shield, color: 'from-red-500 to-orange-500' },
  { id: 'mobile', title: 'Mobile', description: 'React Native, Flutter', icon: Smartphone, color: 'from-teal-500 to-cyan-500' },
  { id: 'web', title: 'Web Fundamentals', description: 'HTTP, DNS, Browsers', icon: Globe, color: 'from-yellow-500 to-orange-500' },
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const updateSettings = useUpdateSettings();
  const navigate = useNavigate();

  const toggleCategory = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setLoading(true);
    try {
      await updateSettings.mutateAsync({
        interested_categories: selected,
        onboarding_completed: true
      });
      toast.success('Preferences saved! Welcome to PrepOS.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await updateSettings.mutateAsync({
        onboarding_completed: true
      });
      navigate('/dashboard');
    } catch (error) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4 md:p-8">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <motion.div variants={cardVariants} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            What do you want to learn?
          </h1>
          <p className="text-muted-foreground text-lg">
            Select the topics you're interested in. We'll personalize your experience.
          </p>
        </motion.div>

        {/* Category Grid */}
        <motion.div 
          variants={pageVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selected.includes(category.id);
            
            return (
              <motion.button
                key={category.id}
                variants={cardVariants}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                    : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                )}
              >
                {/* Selection indicator */}
                <div className={cn(
                  "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                  isSelected 
                    ? "bg-primary text-primary-foreground scale-100" 
                    : "bg-muted scale-90"
                )}>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                  category.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Actions */}
        <motion.div 
          variants={cardVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={loading}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={loading || selected.length === 0}
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? 'Saving...' : `Continue with ${selected.length} topic${selected.length !== 1 ? 's' : ''}`}
          </Button>
        </motion.div>

        {/* Selected count */}
        {selected.length > 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            Selected: {selected.map(id => categories.find(c => c.id === id)?.title).join(', ')}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
