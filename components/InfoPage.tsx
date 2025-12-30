import React, { useState, useEffect, useRef } from 'react';
import { AppView } from '../types';

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export default function InfoPage({ view, onNavigate }: Props) {
  // All info pages are now LTR English
  const isRTL = false; 
  
  const getPageData = () => {
    switch(view) {
      case 'updates': return {
        title: 'Platform Updates',
        subtitle: 'Our journey of continuous improvement',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
        gradient: 'from-blue-600 to-indigo-600'
      };
      case 'blog': return {
        title: 'Blog',
        subtitle: 'Insights and news from the AI world',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
        gradient: 'from-purple-600 to-pink-600'
      };
      case 'guide': return {
        title: 'User Guide',
        subtitle: 'Master the platform in 3 simple steps',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        gradient: 'from-emerald-600 to-teal-600'
      };
      case 'support': return {
        title: 'Support Center',
        subtitle: 'We are here to help you succeed',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        gradient: 'from-amber-500 to-orange-600'
      };
      case 'api': return {
        title: 'API Documentation',
        subtitle: 'Developer resources and integration guides',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        gradient: 'from-slate-800 to-slate-950'
      };
      case 'privacy': return {
        title: 'Privacy Policy',
        subtitle: 'How we protect and handle your data',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
        gradient: 'from-blue-900 to-indigo-900'
      };
      case 'terms': return {
        title: 'Terms of Service',
        subtitle: 'Usage rules and agreements',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
        gradient: 'from-slate-700 to-slate-900'
      };
      default: return { title: '', subtitle: '', icon: null, gradient: 'from-gray-500 to-gray-700' };
    }
  };

  const pageInfo = getPageData();

  const renderContent = () => {
    switch(view) {
        case 'updates': 
            return (
                <div className="max-w-4xl mx-auto relative">
                    {/* Timeline Spine */}
                    <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-300 to-transparent md:-ml-[1px]"></div>
                    
                    <div className="space-y-16">
                        <ScrollReveal>
                            <UpdateCard 
                                version="2.5"
                                date="Current Release"
                                title="Gemini Pro Integration"
                                description="We've upgraded the core content engine to Google's latest Gemini Pro model. Reasoning capabilities have improved by 40%."
                                features={['2x Faster Generation', 'Real-time Monitoring', 'Advanced Persian Support']}
                                color="blue"
                                align="left"
                            />
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <UpdateCard 
                                version="2.0"
                                date="Nov 15, 2024"
                                title="Writer Persona System"
                                description="Define custom personas for each writer. You can now create writers with specific tones (Formal, Friendly, Witty, etc.)."
                                features={['Customizable Personas', 'Random Avatars', 'Sentence Length Control']}
                                color="purple"
                                align="right"
                            />
                        </ScrollReveal>

                        <ScrollReveal delay={400}>
                            <UpdateCard 
                                version="1.0"
                                date="Sep 01, 2024"
                                title="Initial Launch"
                                description="Launch of the core content engine and news agent. The beginning of the Smart Content platform."
                                features={['Text Generation', 'Google Connection', 'Basic Dashboard']}
                                color="slate"
                                align="left"
                            />
                        </ScrollReveal>
                    </div>
                </div>
            );
        
        case 'blog':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <ScrollReveal key={i} delay={i * 100}>
                            <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100 hover:shadow-card-hover transition-all group cursor-pointer hover:-translate-y-2 duration-500 h-full flex flex-col">
                                <div className="h-56 bg-slate-200 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-br opacity-90 transition-transform duration-700 group-hover:scale-110 ${
                                        i % 3 === 0 ? 'from-blue-500 to-cyan-400' : 
                                        i % 3 === 1 ? 'from-purple-500 to-pink-400' : 'from-amber-400 to-orange-500'
                                    }`}></div>
                                    
                                    {/* Abstract Pattern */}
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                    
                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                                            Tutorial
                                        </span>
                                        <span className="bg-black/20 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            5 min
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="font-bold text-xl text-slate-800 mb-3 group-hover:text-blue-600 transition-colors leading-tight">How to Transform Your Content Strategy with AI</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-6 flex-grow">
                                        In this article, we explore modern ways to use large language models in content marketing and show you how to increase site traffic with automated tools.
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                            <span>Smart Writer</span>
                                        </div>
                                        <span>Oct 20, 2024</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            );

        case 'guide':
            return (
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal>
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-900 p-8 md:p-12 text-white shadow-2xl mb-16">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-200 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Quick Start Guide
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Master the Platform</h2>
                                    <p className="text-emerald-100/80 text-lg leading-relaxed max-w-xl">
                                        Follow this tailored roadmap to generate high-quality, brand-aligned content in under 5 minutes.
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner rotate-3 hover:rotate-6 transition-transform duration-500">
                                        <svg className="w-12 h-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="relative">
                        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200 md:left-1/2 md:-ml-px hidden md:block"></div>
                        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 md:hidden"></div>
                        <div className="space-y-12">
                            <ScrollReveal delay={100}>
                                <GuideStep 
                                    number="1"
                                    title="Establish Brand DNA"
                                    desc="Configure your company profile to teach the AI your voice. Input your industry, tone, and core values for personalized output."
                                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                    action={{ label: "Go to Settings", onClick: () => onNavigate('dashboard') }}
                                    align="left"
                                />
                            </ScrollReveal>
                            <ScrollReveal delay={200}>
                                <GuideStep 
                                    number="2"
                                    title="Recruit AI Talent"
                                    desc="Create specialized writers with unique personas. Mix and match tones like 'Technical & Precise' or 'Casual & Witty' to suit your audience."
                                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                    action={{ label: "Manage Writers", onClick: () => onNavigate('dashboard') }}
                                    align="right"
                                />
                            </ScrollReveal>
                            <ScrollReveal delay={300}>
                                <GuideStep 
                                    number="3"
                                    title="Launch Intelligence"
                                    desc="Activate the Daily News Agent. It automatically scours the web for relevant trends and drafts comprehensive articles for you."
                                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                    action={{ label: "Start Agent", onClick: () => onNavigate('dashboard') }}
                                    align="left"
                                />
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            );

        case 'support':
            return (
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <ScrollReveal>
                                <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100 hover:shadow-card-hover transition-all text-center group">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">Send Email</h3>
                                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">Typical response time is under 2 hours during business days.</p>
                                    <a href="mailto:support@smartcontent.ai" className="inline-block w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all text-sm">support@smartcontent.ai</a>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal delay={150}>
                                <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100 hover:shadow-card-hover transition-all text-center group">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800 mb-2">Live Chat</h3>
                                    <p className="text-slate-500 mb-6 text-sm leading-relaxed">Chat directly with technical experts (Mon-Fri 9-5 EST).</p>
                                    <button className="inline-block w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all text-sm">Start Chat</button>
                                </div>
                            </ScrollReveal>
                        </div>

                        <div className="lg:col-span-2">
                            <ScrollReveal delay={300}>
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-card border border-slate-100 h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-2xl text-slate-800 mb-8">Contact Form</h3>
                                        <form className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-amber-600 transition-colors">Full Name</label>
                                                    <input type="text" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-bold" />
                                                </div>
                                                <div className="group">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-amber-600 transition-colors">Email Address</label>
                                                    <input type="email" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-bold" />
                                                </div>
                                            </div>
                                            <div className="group">
                                                <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-amber-600 transition-colors">Subject</label>
                                                <input type="text" className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-bold" />
                                            </div>
                                            <div className="group">
                                                <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-amber-600 transition-colors">Message</label>
                                                <textarea className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-medium h-48 resize-none"></textarea>
                                            </div>
                                            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                                                <span>Send Message</span>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            );

        case 'api':
            return (
                <div className="max-w-5xl mx-auto space-y-12">
                    <ScrollReveal>
                        <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-12">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Authentication</h3>
                                    <p className="text-slate-400 leading-relaxed text-lg">To use the API, you need an Access Key (API Key). This key must be sent in the header of all your requests.</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                            <span>HTTPS Protocol Supported</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                            <span>Rate Limit: 100 requests/min</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-inner font-mono text-sm group hover:border-blue-500/50 transition-colors">
                                        <div className="flex gap-2 mb-4">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-blue-400">Authorization: <span className="text-emerald-400">Bearer</span> <span className="text-white">sk_live_51Mz...</span></div>
                                        <div className="text-slate-500 mt-2"># Example Header</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={200}>
                        <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold font-mono">POST</span>
                                    <span className="font-mono text-slate-600 font-bold text-lg">/v1/generate</span>
                                </div>
                                <p className="text-slate-500 mt-3">Generate intelligent text content based on topic and parameters.</p>
                            </div>
                            <div className="p-8 bg-slate-900 text-slate-300 font-mono text-sm overflow-x-auto">
<pre>{`{
  "topic": "Artificial Intelligence in 2025",
  "tone": "Professional",
  "length": "Medium",
  "keywords": ["AI", "Future", "Tech"]
}`}</pre>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            );

        case 'privacy':
            return (
                <div className="max-w-4xl mx-auto">
                    {/* Header Card overlaps the main header slightly */}
                    <ScrollReveal>
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-10 md:p-14 relative overflow-hidden -mt-10 mb-12">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            
                            <div className="mb-10 text-center relative z-10">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3 hover:rotate-6 transition-transform duration-500">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Privacy Policy</h2>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Last Updated: Dec 20, 2024
                                </div>
                            </div>

                            <div className="space-y-12 relative z-10">
                                <PolicySection 
                                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
                                    title="Information We Collect"
                                    text="We collect minimal information such as your name, email address, and company details strictly to provide better services and personalize your experience. This data helps us tailor the AI models to your needs."
                                    color="blue"
                                />
                                
                                <div className="w-full h-px bg-slate-100"></div>

                                <PolicySection 
                                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                                    title="Data Security"
                                    text="All your information is stored on secure servers with End-to-End Encryption. We use advanced security protocols to prevent unauthorized access and continuously monitor our systems."
                                    color="emerald"
                                />

                                <div className="w-full h-px bg-slate-100"></div>

                                <PolicySection 
                                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
                                    title="No Sharing with Third Parties"
                                    text="We pledge never to share your business data or generated content with any third party without your written consent. Your data is your asset, and we are its custodian."
                                    color="rose"
                                />
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            );

        case 'terms':
            return (
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal>
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-slate-100 p-10 md:p-14 relative overflow-hidden -mt-10 mb-12">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-600 to-slate-800"></div>
                            
                            <div className="mb-10 text-center relative z-10">
                                <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner rotate-3 hover:rotate-6 transition-transform duration-500">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Terms of Service</h2>
                                <p className="text-slate-500 font-medium">Please read carefully before using our services</p>
                            </div>

                            <div className="space-y-8 relative z-10">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                        Content Generation
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed text-sm">The ultimate responsibility for the generated content and its usage lies with the user. We provide the tool, but the oversight of the output is yours.</p>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                        Intellectual Property
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed text-sm">All intellectual property rights of the content generated by AI are reserved for the user. You fully own the texts you generate.</p>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-lg text-slate-800 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                        Acceptable Use
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed text-sm">The user agrees not to use this platform to generate illegal, offensive, racist, or violence-promoting content.</p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            );

        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans" dir="ltr">
        {/* Navbar */}
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">AI</div>
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">Smart Content</span>
                </div>
                <button onClick={() => onNavigate('landing')} className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                    <span>Back to Home</span>
                    <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </div>
        </nav>

        {/* Header */}
        <div className={`pt-32 pb-24 px-6 bg-gradient-to-br ${pageInfo.gradient} text-white relative overflow-hidden`} dir="ltr">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
                    {pageInfo.icon}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{pageInfo.title}</h1>
                <p className="text-lg text-white/80 font-medium">{pageInfo.subtitle}</p>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 animate-page-enter" dir="ltr">
            {renderContent()}
        </div>

        {/* Simple Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
            <p className="mb-4">All rights reserved © 2024 Smart Content</p>
            <div className="flex justify-center gap-6">
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy</button>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms</button>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition-colors">Contact Us</button>
            </div>
        </footer>
    </div>
  );
}

const ScrollReveal: React.FC<{ children?: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '50px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 filter blur-0' : 'opacity-0 translate-y-12 filter blur-sm'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const PolicySection = ({ icon, title, text, color }: any) => {
    const bgColors = {
        blue: 'bg-blue-100 text-blue-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        rose: 'bg-rose-100 text-rose-600'
    };

    return (
        <div className="flex items-start gap-6 group">
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${bgColors[color as keyof typeof bgColors]}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-slate-600 leading-loose text-justify text-base">{text}</p>
            </div>
        </div>
    );
}

const UpdateCard = ({ version, date, title, description, features, color, align }: any) => {
    const isRight = align === 'right';
    return (
        <div className={`flex flex-col md:flex-row gap-8 relative items-center md:items-start ${!isRight ? 'md:flex-row-reverse' : ''}`}>
            {/* Timeline Dot */}
            <div className={`absolute top-0 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10 hidden md:block left-1/2 -translate-x-1/2 ${
                color === 'blue' ? 'bg-blue-600' : color === 'purple' ? 'bg-purple-600' : 'bg-slate-600'
            }`}></div>

            <div className={`w-full md:w-1/2 ${isRight ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
               <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                   color === 'blue' ? 'bg-blue-100 text-blue-700' : color === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
               }`}>
                   Version {version}
               </span>
               <span className="block text-xs text-slate-400 font-bold mb-4">{date}</span>
            </div>

            <div className="w-full md:w-1/2">
                <div className={`bg-white p-8 rounded-3xl shadow-card border border-slate-100 hover:shadow-card-hover transition-all group ${
                    color === 'blue' ? 'hover:border-blue-200' : color === 'purple' ? 'hover:border-purple-200' : 'hover:border-slate-300'
                }`}>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm mb-6">{description}</p>
                    <ul className="space-y-2">
                        {features.map((f: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                                <svg className={`w-4 h-4 ${color === 'blue' ? 'text-blue-500' : color === 'purple' ? 'text-purple-500' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

const GuideStep = ({ number, title, desc, icon, action, align = 'left' }: any) => {
    return (
        <div className={`relative flex items-center justify-between md:justify-center group ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
            {/* Center Line Marker */}
            <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-white border-4 border-emerald-500 rounded-full z-10 transform -translate-x-1/2 shadow-lg shadow-emerald-500/30 group-hover:scale-125 transition-transform duration-300 hidden md:block"></div>
            <div className="absolute left-6 w-4 h-4 bg-white border-4 border-emerald-500 rounded-full z-10 transform -translate-x-1/2 shadow-lg shadow-emerald-500/30 md:hidden"></div>

            {/* Empty space for timeline balance */}
            <div className="hidden md:block w-5/12"></div>

            {/* Content Card */}
            <div className={`w-[calc(100%-3rem)] md:w-5/12 ml-12 md:ml-0 pl-4 md:pl-0`}>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] group-hover:-translate-y-1 transition-all duration-500 ease-out">
                    {/* Number Watermark */}
                    <div className="absolute -right-4 -top-6 text-9xl font-black text-slate-50 opacity-50 select-none z-0 group-hover:text-emerald-50/80 transition-colors duration-500 font-sans">
                        {number}
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                            {icon}
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">{title}</h3>
                        <p className="text-slate-500 leading-relaxed mb-6 font-medium text-sm md:text-base">
                            {desc}
                        </p>

                        <button 
                            onClick={action.onClick}
                            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors group/btn"
                        >
                            <span>{action.label}</span>
                            <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};