import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; 
import { 
  Zap, Brain, Target, BookOpen, ArrowRight, Github, 
  Layers, Cloud, Code, Palette, Shield, Terminal, 
  CheckCircle, ChevronRight, Star, Cpu, Users
} from 'lucide-react';

// --- Components ---

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${className}`}>
    {children}
  </span>
);

const CodeWindow = () => {
  return (
    <div className="w-full h-full bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
      </div>
      <div className="p-4 space-y-2 font-mono text-xs md:text-sm text-slate-400">
        <div className="flex gap-2">
          <span className="text-purple-400">const</span>
          <span className="text-blue-400">interviewPrep</span>
          <span className="text-slate-400">=</span>
          <span className="text-emerald-400">async</span>
          <span className="text-slate-400">()</span>
          <span className="text-purple-400">=&gt;</span>
          <span className="text-slate-400">{`{`}</span>
        </div>
        <div className="pl-4">
          <span className="text-slate-500">// Mastering system design</span>
        </div>
        <div className="pl-4 flex gap-2">
          <span className="text-purple-400">await</span>
          <span className="text-blue-300">User</span>
          <span className="text-slate-400">.</span>
          <span className="text-yellow-300">master</span>
          <span className="text-slate-400">(</span>
          <span className="text-orange-300">'Scalability'</span>
          <span className="text-slate-400">);</span>
        </div>
         <div className="pl-4 flex gap-2">
          <span className="text-purple-400">await</span>
          <span className="text-blue-300">User</span>
          <span className="text-slate-400">.</span>
          <span className="text-yellow-300">solve</span>
          <span className="text-slate-400">(</span>
          <span className="text-orange-300">'Hard_Leetcode'</span>
          <span className="text-slate-400">);</span>
        </div>
        <div className="pl-4 flex gap-2">
          <span className="text-purple-400">return</span>
          <span className="text-emerald-400">offerLetter</span>
          <span className="text-slate-400">;</span>
        </div>
        <div>
          <span className="text-slate-400">{`}`}</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-3">
          <div className="h-2 w-16 bg-slate-800 rounded-full animate-pulse" />
          <div className="h-2 w-8 bg-purple-900/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};

const companies = ['Google', 'Meta', 'Netflix', 'Amazon', 'Uber', 'Airbnb', 'Stripe'];

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  // Helper for smooth scrolling to sections
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* --- Abstract Background --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-100/50 blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-50/50 blur-3xl opacity-50" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-pink-50/30 blur-3xl opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-multiply"></div>
      </div>

      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-transparent">
        <motion.div 
          className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
          style={{ opacity: headerOpacity }}
        />
        <div className="container mx-auto px-6 py-4 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">PrepOS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('curriculum')} 
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Curriculum
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex text-slate-600" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-purple-900/20">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Badge className="bg-purple-50 text-purple-700 border-purple-100 mb-6 gap-1.5">
                <Star className="w-3 h-3 fill-purple-700" />
                For Senior Engineers & Architects
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Systemize your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  interview prep.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                The all-in-one OS for cracking Senior Software Engineering interviews. 
                Track progress, master architecture, and simulate real-world scenarios.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate('/auth')} className="h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-purple-900/10">
                  Start Preparing <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-200 hover:bg-slate-50">
                  <Github className="mr-2 w-4 h-4" /> Star on GitHub
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p>Trusted by engineers from <span className="font-semibold text-slate-900">Big Tech</span></p>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-100 border border-white shadow-2xl">
                <div className="rounded-xl overflow-hidden bg-white shadow-inner aspect-[4/3] relative">
                  {/* Decorative UI elements mimicking a dashboard */}
                  <div className="absolute inset-0 p-6 grid grid-cols-12 gap-6 bg-slate-50/50">
                    <div className="col-span-4 space-y-4">
                      <div className="h-24 bg-white rounded-lg border border-slate-100 shadow-sm p-4">
                        <div className="w-8 h-8 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center mb-3"><Target size={16}/></div>
                        <div className="h-2 w-16 bg-slate-100 rounded mb-1"/>
                        <div className="h-2 w-24 bg-slate-200 rounded"/>
                      </div>
                      <div className="h-40 bg-white rounded-lg border border-slate-100 shadow-sm p-4">
                        <div className="flex justify-between items-center mb-4">
                           <div className="h-2 w-20 bg-slate-200 rounded"/>
                           <Badge className="scale-75 origin-right bg-green-50 text-green-700 border-green-100">85%</Badge>
                        </div>
                        <div className="space-y-3">
                          {[1,2,3].map(i => (
                             <div key={i} className="flex items-center gap-2">
                               <div className={`w-4 h-4 rounded-full border ${i === 1 ? 'border-purple-500 bg-purple-500' : 'border-slate-200'}`} />
                               <div className="h-2 w-full bg-slate-100 rounded"/>
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-8">
                       <div className="h-full bg-slate-900 rounded-lg shadow-xl overflow-hidden transform translate-y-4">
                          <CodeWindow />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Offer Accepted</p>
                    <p className="text-xs text-slate-500">Just now</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Social Proof --- */}
      <section className="py-10 border-y border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {companies.map(c => (
              <span key={c} className="text-xl font-bold font-serif text-slate-800">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Bento Grid --- */}
      <section id="features" className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to <br />
              <span className="text-purple-600">dominate technical rounds</span>
            </h2>
            <p className="text-slate-600 text-lg">
              PrepOS replaces scattered notion docs and spreadsheets with a unified engineering management system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Smart Roadmap</h3>
                <p className="text-slate-500 max-w-sm">Kanban-style study planner tailored specifically for the L5/L6 interview loops.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-1/2 h-3/4 bg-slate-50 rounded-tl-3xl border-t border-l border-slate-100 p-4 group-hover:scale-[1.02] transition-transform origin-bottom-right">
                {/* Kanban Mock */}
                <div className="flex gap-3 h-full">
                   <div className="w-1/2 bg-white rounded-lg shadow-sm border border-slate-100 p-2 space-y-2">
                      <div className="h-2 w-12 bg-slate-200 rounded mb-2"/>
                      <div className="h-16 bg-yellow-50 rounded border border-yellow-100"/>
                      <div className="h-16 bg-blue-50 rounded border border-blue-100"/>
                   </div>
                   <div className="w-1/2 bg-white rounded-lg shadow-sm border border-slate-100 p-2 opacity-50">
                      <div className="h-2 w-12 bg-slate-200 rounded mb-2"/>
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Tall Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:row-span-2 bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 backdrop-blur-sm border border-white/10">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Tech Docs</h3>
                <p className="text-slate-400 mb-8">Deep dives into System Design, CAP Theorem, and Sharding strategies.</p>
                
                <div className="mt-auto bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 font-mono text-xs text-slate-300">
                  <p className="text-purple-400">$ cat system-design.md</p>
                  <p className="mt-2 text-slate-500"># Load Balancing</p>
                  <p>Strategies:</p>
                  <ul className="list-disc list-inside pl-2 text-slate-400">
                    <li>Round Robin</li>
                    <li>Least Conn</li>
                    <li>IP Hash</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Standard Card 1 */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Q&A Bank</h3>
              <p className="text-slate-500">500+ real questions from recent FAANG loops.</p>
            </motion.div>

            {/* Standard Card 2 */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
               <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics</h3>
              <p className="text-slate-500">Track your weak spots across 5 technical domains.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Curriculum Section --- */}
      <section id="curriculum" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
             <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Curated Curriculum</h2>
                <p className="text-slate-500 max-w-lg">Don't study everything. Study what matters. Our topics are weighted by appearance frequency.</p>
             </div>
             <Button variant="outline" className="gap-2">
                View Full Catalog <ChevronRight className="w-4 h-4" />
             </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'System Design', icon: Cloud, items: ['Consistent Hashing', 'Rate Limiting', 'DDIA Summary'] },
              { title: 'Frontend At Scale', icon: Palette, items: ['Performance Patterns', 'Micro-frontends', 'State Management'] },
              { title: 'Backend & DB', icon: Layers, items: ['Isolation Levels', 'Indexing Strategies', 'Event Driven Arch'] },
              { title: 'Low Level Design', icon: Code, items: ['Design Patterns', 'Schema Design', 'SOLID Principles'] },
              { title: 'Security', icon: Shield, items: ['OAuth 2.0 & OIDC', 'XSS & CSRF', 'Encryption Stds'] },
              { title: 'Behavioral', icon: Users, items: ['STAR Method', 'Conflict Resolution', 'Leadership Principles'] },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-900">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{cat.title}</h3>
                </div>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
               <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen" />
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Ready to land that <br/>Staff Engineer role?
              </h2>
              <p className="text-lg text-slate-300 mb-10">
                Join 10,000+ engineers who use PrepOS to organize their career growth.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/auth')} className="bg-white text-slate-900 hover:bg-slate-100 h-14 px-8 text-lg font-semibold">
                  Get Started for Free
                </Button>
                <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 hover:text-white h-14 px-8 text-lg">
                  View Demo
                </Button>
              </div>
              <p className="mt-8 text-sm text-slate-500">No credit card required • Free tier available</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white">
                  <Zap className="w-3 h-3" />
                </div>
                <span className="font-bold text-slate-900">PrepOS</span>
              </div>
              <p className="text-sm text-slate-500">
                The operating system for your engineering career.
              </p>
            </div>
            
            {[
              { 
                header: 'Product', 
                links: [
                  { label: 'Features', action: () => scrollToSection('features') },
                  { label: 'Changelog', action: () => navigate('/changelog') },
                  { label: 'Get Started', action: () => navigate('/auth') },
                ] 
              },
              { 
                header: 'Company', 
                links: [
                  { label: 'About', action: () => navigate('/about') },
                  { label: 'Careers', action: () => navigate('/about') }, // Linking to About for now
                  { label: 'Contact', action: () => navigate('/contact') },
                ] 
              },
              { 
                header: 'Legal', 
                links: [
                  { label: 'Privacy', action: () => navigate('/privacy') },
                  { label: 'Terms', action: () => navigate('/terms') },
                  { label: 'Security', action: () => navigate('/security') },
                ] 
              },
            ].map((col) => (
              <div key={col.header}>
                <h4 className="font-semibold text-slate-900 mb-4">{col.header}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <button 
                        onClick={link.action} 
                        className="text-sm text-slate-500 hover:text-purple-600 transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© 2026 PrepOS Inc. All rights reserved.</p>
            <div className="flex gap-6">
               <Github className="w-5 h-5 hover:text-slate-900 cursor-pointer" />
               <div className="w-5 h-5 bg-slate-200 rounded-full" /> 
               <div className="w-5 h-5 bg-slate-200 rounded-full" /> 
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}