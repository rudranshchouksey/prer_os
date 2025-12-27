import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Brain, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  Github,
  Layers,
  Cloud,
  Code,
  Palette,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Smart Roadmap',
    description: 'Kanban-style study planner tailored for senior engineering interviews'
  },
  {
    icon: BookOpen,
    title: 'Tech Vault',
    description: 'Comprehensive curriculum covering architecture, cloud, and full-stack topics'
  },
  {
    icon: Target,
    title: 'Mock Mode',
    description: 'Flashcard-based interview simulator with confidence tracking'
  },
  {
    icon: Zap,
    title: 'Progress Analytics',
    description: 'Visual dashboard tracking your mastery across all domains'
  }
];

const categories = [
  { icon: Layers, name: 'Architecture', color: 'text-primary' },
  { icon: Cloud, name: 'Cloud & DevOps', color: 'text-secondary' },
  { icon: Code, name: 'Full Stack', color: 'text-primary' },
  { icon: Palette, name: 'Frontend', color: 'text-secondary' },
  { icon: Shield, name: 'Security', color: 'text-primary' },
];

const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Stripe', 'Netflix'];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center cyber-grid">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PrepOS</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary mb-8">
              <Zap className="w-4 h-4" />
              Engineered for Senior Developers
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Crack the{' '}
              <span className="gradient-text">Senior Developer</span>
              <br />
              Interview
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Master system design, cloud architecture, and full-stack fundamentals 
              with our comprehensive interview preparation platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 neon-border-blue"
              >
                Start Preparing for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-border hover:bg-muted"
              >
                <Github className="w-5 h-5 mr-2" />
                View on GitHub
              </Button>
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-16"
          >
            {categories.map((cat, i) => (
              <div
                key={cat.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50"
              >
                <cat.icon className={`w-4 h-4 ${cat.color}`} />
                <span className="text-sm">{cat.name}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete toolkit designed specifically for senior engineering interviews
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover-lift group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Curated <span className="gradient-text">Curriculum</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real interview questions from top tech companies, with detailed explanations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { q: 'Explain Event-Driven Architecture', category: 'Architecture', difficulty: 'Medium' },
              { q: 'Docker vs Kubernetes?', category: 'Cloud', difficulty: 'Medium' },
              { q: 'Node.js Event Loop phases?', category: 'Backend', difficulty: 'Hard' },
              { q: 'Zustand vs Redux?', category: 'Frontend', difficulty: 'Medium' },
              { q: 'Explain OAuth 2.0 flow', category: 'Security', difficulty: 'Medium' },
              { q: 'Optimize a slow SQL query', category: 'Database', difficulty: 'Hard' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover-glow"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">{item.category}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.difficulty === 'Hard' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                  }`}>{item.difficulty}</span>
                </div>
                <p className="font-medium">{item.q}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-8">Trusted by engineers at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {companies.map((company, i) => (
                <motion.span
                  key={company}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.5 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-2xl font-bold text-muted-foreground/50"
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-cyber opacity-50" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of engineers who landed their dream jobs with PrepOS
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-lg px-10 py-6"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PrepOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PrepOS. Built for engineers, by engineers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
