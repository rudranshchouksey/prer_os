import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Brain, 
  Target, 
  BookOpen, 
  ArrowRight,
  Github,
  Layers,
  Cloud,
  Code,
  Palette,
  Shield,
  FileText,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Smart Roadmap',
    description: 'Kanban-style study planner tailored for senior engineering interviews'
  },
  {
    icon: BookOpen,
    title: 'Tech Documentation',
    description: 'Comprehensive docs covering architecture, cloud, and full-stack topics'
  },
  {
    icon: Target,
    title: 'Interview Q&A',
    description: 'Community-driven question bank with voting and detailed answers'
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    description: 'Visual dashboard tracking your mastery across all domains'
  }
];

const categories = [
  { icon: Layers, name: 'Architecture' },
  { icon: Cloud, name: 'Cloud & DevOps' },
  { icon: Code, name: 'Full Stack' },
  { icon: Palette, name: 'Frontend' },
  { icon: Shield, name: 'Security' },
];

const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Stripe', 'Netflix'];

const stats = [
  { label: 'Questions', value: '500+' },
  { label: 'Topics', value: '50+' },
  { label: 'Engineers', value: '10K+' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-soft">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold text-foreground">PrepOS</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <button 
              onClick={() => navigate('/docs')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              <FileText className="w-4 h-4 inline mr-1.5" />
              Docs
            </button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 shadow-soft"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-purple-300/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-soft text-sm text-muted-foreground mb-8">
                <Zap className="w-4 h-4 text-primary" />
                Engineered for Senior Developers
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight text-foreground">
                Crack the{' '}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Senior Developer
                </span>
                <br />
                Interview
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Master system design, cloud architecture, and full-stack fundamentals 
                with our comprehensive interview preparation platform.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-soft-lg hover:shadow-soft-xl transition-all"
                >
                  Start Preparing for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/50 border-border hover:bg-white shadow-soft"
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
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mt-14"
            >
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-border shadow-soft text-sm font-medium text-foreground"
                >
                  <cat.icon className="w-4 h-4 text-primary" />
                  <span>{cat.name}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-12 mt-16"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
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
            <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Succeed
              </span>
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
                className="bg-white rounded-2xl p-6 shadow-soft-lg border border-border/50 hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold mb-4 text-foreground">
              Curated{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Curriculum
              </span>
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
                className="bg-white rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-soft-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{item.category}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.difficulty === 'Hard' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>{item.difficulty}</span>
                </div>
                <p className="font-medium text-foreground">{item.q}</p>
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
            <p className="text-muted-foreground mb-8 flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Trusted by engineers at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {companies.map((company, i) => (
                <motion.span
                  key={company}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-2xl font-bold text-muted-foreground/40"
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-12 shadow-soft-xl border border-border/50 max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-soft">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of engineers who landed their dream jobs with PrepOS
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90 text-lg px-10 py-6 shadow-soft-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-soft">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif font-semibold text-foreground">PrepOS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/docs')} className="hover:text-foreground transition-colors">
                Docs
              </button>
              <span>© 2024 PrepOS. Built for engineers, by engineers.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
