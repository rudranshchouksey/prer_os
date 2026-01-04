import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Book, Code, Database, Server, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DocsLanding() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Technical guides, architecture patterns, and API references for the PrepOS platform.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 -mt-12 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Book, title: 'Getting Started', desc: 'How to use the platform effectively.' },
            { icon: Server, title: 'System Design', desc: 'Core concepts for distributed systems.' },
            { icon: Database, title: 'Data Structures', desc: 'Deep dive into advanced structures.' },
            { icon: Code, title: 'Frontend System Design', desc: 'Component architecture and state.' },
            { icon: Shield, title: 'Security', desc: 'OAuth, JWT, and attack vectors.' },
          ].map((item, i) => (
            <div 
              key={i} 
              onClick={() => navigate('/auth')} // Assumes you have a specific doc viewer route
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-4 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}