import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { GitCommit, Tag } from 'lucide-react';

const changes = [
  {
    version: 'v2.1.0',
    date: 'Jan 12, 2026',
    title: 'The Architecture Update',
    badge: 'Major',
    items: [
      'Added new System Design canvas for drag-and-drop architecture diagrams.',
      'Released 50+ new questions for L6/Staff engineering roles.',
      'Fixed an issue where progress analytics were caching aggressively.',
    ]
  },
  {
    version: 'v2.0.4',
    date: 'Dec 28, 2025',
    title: 'Performance Improvements',
    badge: 'Patch',
    items: [
      'Reduced initial bundle size by 40%.',
      'Improved dark mode contrast for code blocks.',
    ]
  },
  {
    version: 'v2.0.0',
    date: 'Dec 15, 2025',
    title: 'PrepOS 2.0 Launch',
    badge: 'Major',
    items: [
      'Complete UI Redesign.',
      'Introduced "Smart Roadmap" features.',
      'Added community discussion boards.',
    ]
  }
];

export default function Changelog() {
  return (
    <PageLayout>
      <div className="bg-slate-50 py-20 border-b border-slate-200">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Tag className="w-4 h-4" /> What's New
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Changelog</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            New updates and improvements to PrepOS. We ship usually twice a week.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-20 max-w-3xl">
        <div className="relative border-l border-slate-200 ml-3 md:ml-0 space-y-16">
          {changes.map((change, i) => (
            <div key={i} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-200 border border-white ring-4 ring-white" />
              
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                   <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{change.version}</span>
                   <span className="text-sm text-slate-500">{change.date}</span>
                </div>
                {change.badge === 'Major' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Major Release
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">{change.title}</h2>
              <ul className="space-y-3">
                {change.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-slate-600">
                    <GitCommit className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}