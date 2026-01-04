import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MapPin, Users, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function About() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            We're building the <br/>
            <span className="text-purple-600">OS for Engineers.</span>
          </h1>
          <p className="text-lg text-slate-600">
            PrepOS was born out of frustration. The senior interview process is broken, scattered, and outdated. We are fixing it with better tools, not just more content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Users, title: 'Community First', desc: 'Built by engineers, for engineers. We listen to our users.' },
            { icon: Zap, title: 'Speed Matters', desc: 'Our tools are designed to save you time, not consume it.' },
            { icon: Heart, title: 'Transparent', desc: 'No hidden fees. No dark patterns. Just good software.' }
          ].map((val, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-2xl text-center">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-900">
                <val.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{val.title}</h3>
              <p className="text-slate-500">{val.desc}</p>
            </div>
          ))}
        </div>

        {/* Team Section Placeholder */}
        <div className="border-t border-slate-100 pt-20">
          <h2 className="text-3xl font-bold mb-12 text-center">The Team</h2>
          <div className="flex justify-center gap-10">
            
            {/* Rudransh */}
            <div className="text-center">
              <Avatar className="w-24 h-24 mb-4 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src="/rudransh-chouksey.jpg" className="object-cover" />
                <AvatarFallback className="bg-slate-200 text-xl font-bold text-slate-500">RC</AvatarFallback>
              </Avatar>
              <div className="font-bold text-lg">Rudransh Chouksey</div>
              <div className="text-sm text-slate-500 font-medium">Founder & Engineer</div>
            </div>

            {/* Shivani */}
            <div className="text-center">
              <Avatar className="w-24 h-24 mb-4 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src="/shivani-rawat.jpg" className="object-cover" />
                <AvatarFallback className="bg-slate-200 text-xl font-bold text-slate-500">SR</AvatarFallback>
              </Avatar>
              <div className="font-bold text-lg">Shivani Rawat</div>
              <div className="text-sm text-slate-500 font-medium">Co-Founder & Design</div>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export function Contact() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Get in touch</h1>
            <p className="text-slate-600 mb-8">
              Have a question about the curriculum? Found a bug? Just want to say hi? We'd love to hear from you.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Email</div>
                  <div className="text-slate-500">support@prepos.com</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">Office</div>
                  <div className="text-slate-500">Indore, India (Remote First)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" placeholder="How can we help?" />
              </div>
              <Button className="w-full bg-slate-900 text-white">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}