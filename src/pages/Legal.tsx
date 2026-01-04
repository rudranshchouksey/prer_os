import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Shield, Lock, FileText } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'security';
}

export default function LegalPage({ type }: LegalPageProps) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: Lock,
      date: 'January 3, 2026',
      intro: 'We take your privacy seriously. This policy describes how PrepOS collects and uses your data.',
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      date: 'January 1, 2026',
      intro: 'By using PrepOS, you agree to these terms. Please read them carefully.',
    },
    security: {
      title: 'Security',
      icon: Shield,
      date: 'December 28, 2025',
      intro: 'How we protect your data, your code, and your progress.',
    }
  }[type];

  const Icon = content.icon;

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12 border-b border-slate-100 pb-8">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
            <Icon className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{content.title}</h1>
          <p className="text-xl text-slate-500">{content.intro}</p>
          <div className="mt-4 text-sm font-mono text-slate-400">Last updated: {content.date}</div>
        </div>

        {/* Content Body - Mimicking standard legal structure */}
        <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h3>
            <p>Welcome to PrepOS. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h3>
            <p>We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Name and Contact Data</li>
              <li>Credentials (hashed and salted)</li>
              <li>Payment Data (processed via Stripe)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Data</h3>
            <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests.</p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}