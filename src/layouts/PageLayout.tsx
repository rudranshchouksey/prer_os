import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Reuse the Footer from your Landing page here (shortened for brevity)
const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
    <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
      <p>© 2026 PrepOS Inc. System design for your career.</p>
    </div>
  </footer>
);

export default function PageLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [0, 1]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
       {/* Fixed Nav */}
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
          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={() => navigate('/auth')}>Log In</Button>
             <Button onClick={() => navigate('/auth')} className="bg-slate-900 text-white hover:bg-slate-800">Get Started</Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24">
        {children}
      </main>

      <Footer />
    </div>
  );
}