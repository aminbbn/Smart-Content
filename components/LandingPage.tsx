
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface Props {
  onNavigate: (view: AppView) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden relative font-sans text-slate-900" dir="ltr">
      {/* Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">AI</div>
                <span className="text-xl font-extrabold text-slate-800 tracking-tight">Smart Content</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
                <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 transition-colors">Features</button>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-600 transition-colors">How it Works</button>
                <button onClick={() => scrollToSection('stats')} className="hover:text-blue-600 transition-colors">Stats</button>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-blue-600 transition-colors">Pricing</button>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('auth')} className="text-slate-600 font-bold hover:text-blue-600 transition-colors hidden md:block">Login</button>
                <button 
                    onClick={() => onNavigate('auth')}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-sm"
                >
                    Get Started
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <div className="lg:w-1/2 text-center lg:text-left space-y-8 animate-slide-up relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold animate-page-enter hover:bg-blue-100 transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Gemini Pro 2.5 Enabled
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-slate-900 tracking-tight">
              <span className="block mb-2">Content Generation at</span>
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">Light Speed</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              An intelligent assistant that learns your brand voice, scans industry news on demand, and writes articles that Google loves.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <button 
                onClick={() => onNavigate('auth')}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <span>Create Free Account</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md">
                <svg className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                <span>View Demo</span>
              </button>
            </div>

            <div className="pt-8 opacity-80">
               <p className="font-bold text-slate-400 text-sm mb-4">Trusted by leading teams:</p>
               <div className="flex flex-wrap justify-center lg:justify-start gap-8 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  {['Digikala', 'Snapp', 'Divar', 'Torob', 'Bazaar'].map(name => (
                      <span key={name} className="text-xl font-black text-slate-300 hover:text-slate-600 cursor-default select-none">{name}</span>
                  ))}
               </div>
            </div>
          </div>

          {/* Visual Content - 4 Stage Animation */}
          <div className="lg:w-1/2 relative animate-page-enter delay-700 w-full perspective-1000">
             <HeroAnimation />
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section id="stats" className="bg-slate-900 py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800 divide-x-reverse">
                  <div className="p-4">
                      <div className="text-4xl font-extrabold text-blue-400 mb-2">2M+</div>
                      <div className="text-sm text-slate-400 font-medium">Words Generated</div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl font-extrabold text-purple-400 mb-2">500+</div>
                      <div className="text-sm text-slate-400 font-medium">Active Businesses</div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl font-extrabold text-emerald-400 mb-2">98%</div>
                      <div className="text-sm text-slate-400 font-medium">User Satisfaction</div>
                  </div>
                  <div className="p-4">
                      <div className="text-4xl font-extrabold text-amber-400 mb-2">24/7</div>
                      <div className="text-sm text-slate-400 font-medium">Online Support</div>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-slate-50 py-24 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
               <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Platform Features</span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Complete Content Toolkit</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">We removed the complexity of AI so you can focus on growing your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <FeatureCard 
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                  title="Smart Reporter"
                  desc="The system monitors the web for news related to your industry and suggests hot content ideas on demand."
                  color="blue"
                  delay="stagger-1"
               />
               <FeatureCard 
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                  title="Creative Writer"
                  desc="Define brand voice and personas to produce content that reads like it was written by top copywriters."
                  color="purple"
                  delay="stagger-2"
               />
               <FeatureCard 
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>}
                  title="SEO Specialist"
                  desc="All content is automatically optimized for SEO. From keywords to meta descriptions, everything is ready."
                  color="emerald"
                  delay="stagger-3"
               />
               <FeatureCard 
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                  title="Content Calendar"
                  desc="Plan and sleep soundly. The system automatically publishes content at the scheduled time."
                  color="amber"
                  delay="stagger-1"
               />
               <FeatureCard 
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                  title="Product Launch"
                  desc="Just enter the new product details to get engaging announcements for blogs, emails, and social media."
                  color="rose"
                  delay="stagger-2"
               />
               <FeatureCard 
                  icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  title="Performance Analytics"
                  desc="Complete statistical dashboard to monitor views, user engagement, and your smart writers' performance."
                  color="indigo"
                  delay="stagger-3"
               />
            </div>
         </div>
      </section>

      {/* Feature Deep Dive 1 */}
      <FeatureSpotlight 
        title="Turn News into Content, Instantly"
        description="Stop worrying about finding blog topics. Our smart assistant scours the web for industry news, identifies hot topics, and turns them into engaging articles."
        benefits={['Intelligent monitoring of trusted sources', 'Analysis and key point extraction', 'Content generation following writing principles']}
        image={
            <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">News Alert Found</h4>
                        <p className="text-xs text-slate-500">Source: TechCrunch • Just now</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-200">Generate Article</button>
                </div>
            </div>
        }
      />

      {/* Feature Deep Dive 2 */}
      <FeatureSpotlight 
        title="Writers with Real Personalities"
        description="Forget dry, robotic content. With Smart Content, you can define writers with specific personalities, tones, and styles so the audience never notices it's AI."
        benefits={['Define formal, friendly, or humorous tones', 'Mimic your brand writing style', 'Create content variety with multiple writers']}
        image={
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 transform -translate-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ali" className="w-10 h-10 rounded-full bg-slate-100" />
                        <div>
                            <p className="font-bold text-sm text-slate-800">Alex (Tech)</p>
                            <p className="text-xs text-slate-400">Tone: Technical & Precise</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed">
                        According to recent technical benchmarks...
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 transform translate-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" className="w-10 h-10 rounded-full bg-slate-100" />
                        <div>
                            <p className="font-bold text-sm text-slate-800">Sarah (Lifestyle)</p>
                            <p className="text-[10px] text-slate-400">Tone: Friendly & Warm</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed">
                        Hey friends! Today we're diving into...
                    </div>
                </div>
            </div>
        }
        reversed
        gradient="purple"
      />

      {/* How it Works */}
      <section id="how-it-works" className="py-24 relative bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20 space-y-4">
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">How it Works?</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">Three simple steps to complete content automation for your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-emerald-200 z-0"></div>

                <StepCard 
                    number="1"
                    title="Set Brand Identity"
                    desc="Enter company info, products, and brand voice so the AI speaks exactly like you."
                    icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .884-.56 1.613-1.355 1.904" /></svg>}
                    color="blue"
                />
                <StepCard 
                    number="2"
                    title="Activate Agents"
                    desc="Enable news, research, or writer agents to generate content on demand."
                    icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                    color="purple"
                />
                <StepCard 
                    number="3"
                    title="Publish & Grow"
                    desc="Review the prepared content and publish it to your blog or social media with one click."
                    icon={<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    color="emerald"
                />
            </div>
          </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900">Flexible Plans</h2>
               <p className="text-slate-500 max-w-2xl mx-auto text-lg">Start for free and upgrade as your business grows.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <PricingCard 
                    title="Starter"
                    price="Free"
                    period="Forever"
                    features={['5 articles/month', 'Access to Gemini Flash', '1 Smart Writer', 'Email Support', 'Basic Dashboard']}
                    buttonText="Start Free"
                    active={false}
                    onClick={() => onNavigate('auth')}
                />
                <PricingCard 
                    title="Professional"
                    price="$19"
                    currency="USD"
                    period="/month"
                    features={['30 articles/month', 'Access to Gemini Pro', '5 Smart Writers', 'Keyword Research', 'Priority Support', 'Advanced Calendar']}
                    buttonText="Start Trial"
                    active={true}
                    onClick={() => onNavigate('auth')}
                    popular
                />
                <PricingCard 
                    title="Enterprise"
                    price="Contact Us"
                    period=""
                    features={['Unlimited Articles', 'Custom Fine-tuned Model', 'Unlimited Writers', 'Direct API Access', 'Dedicated Account Manager', 'Guaranteed SLA']}
                    buttonText="Free Consultation"
                    active={false}
                    onClick={() => onNavigate('auth')}
                />
            </div>
          </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16 text-slate-900">What do successful teams say?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <TestimonialCard 
                     quote="Using this system, our blog traffic doubled in 3 months. The article quality is truly incredible."
                     author="Sarah M."
                     role="Marketing Manager"
                     image="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara"
                     delay="stagger-1"
                  />
                  <TestimonialCard 
                     quote="I no longer worry about filling the content calendar. The news agent always finds hot topics and writes them."
                     author="Ali H."
                     role="Chief Editor"
                     image="https://api.dicebear.com/7.x/avataaars/svg?seed=Ali"
                     delay="stagger-2"
                  />
                  <TestimonialCard 
                     quote="As a small startup, we couldn't afford a writer. This tool was our lifesaver."
                     author="Reza K."
                     role="Startup Founder"
                     image="https://api.dicebear.com/7.x/avataaars/svg?seed=Reza"
                     delay="stagger-3"
                  />
              </div>
          </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white relative">
          <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  <FaqItem 
                    question="Is the generated content unique?"
                    answer="Yes, our AI generates content from scratch every time, completely unique. It is also personalized based on your brand voice."
                    isOpen={openFaq === 0}
                    onClick={() => toggleFaq(0)}
                  />
                  <FaqItem 
                    question="Is it suitable for SEO?"
                    answer="Yes, all articles are produced following SEO principles, proper heading structures, and relevant keyword usage."
                    isOpen={openFaq === 1}
                    onClick={() => toggleFaq(1)}
                  />
                  <FaqItem 
                    question="Can I edit the content?"
                    answer="Yes, you have access to a full editor and can make any necessary changes before publishing."
                    isOpen={openFaq === 2}
                    onClick={() => toggleFaq(2)}
                  />
                  <FaqItem 
                    question="Does it support English/Persian fully?"
                    answer="Yes, our models are specifically optimized to produce fluent and natural content in multiple languages, including English and Persian."
                    isOpen={openFaq === 3}
                    onClick={() => toggleFaq(3)}
                  />
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[100px]"></div>
             <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[100px]"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10 text-white space-y-10">
              <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
                  Ready to transform <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">your content?</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">Start today and get your first article in less than 5 minutes. No credit card required.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button onClick={() => onNavigate('auth')} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-glow hover:shadow-glow-lg hover:-translate-y-1 active:translate-y-0 active:scale-95">
                      Get Started
                  </button>
                  <button className="px-10 py-5 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white rounded-2xl font-bold text-xl transition-all hover:bg-white/5">
                      Sales Consultation
                  </button>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-slate-800/50 pb-16 mb-12">
                <div className="col-span-1 md:col-span-5 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/50">AI</div>
                        <span className="font-bold text-white text-2xl tracking-tight">Smart Content</span>
                    </div>
                    <p className="text-base leading-relaxed text-slate-500 max-w-md">Comprehensive AI platform for generating, managing, and publishing high-quality text content. We help you find your brand voice.</p>
                    
                    <div className="pt-4">
                        <h5 className="text-white font-bold mb-4 text-sm">Subscribe to Newsletter</h5>
                        <div className="flex gap-2 max-w-sm">
                            <input type="email" placeholder="Enter your email" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white w-full focus:outline-none focus:border-blue-600 transition-colors" />
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold text-sm transition-colors">Subscribe</button>
                        </div>
                    </div>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                    <h4 className="text-white font-bold mb-6 text-lg">Product</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li><button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition-colors block py-1 w-full text-left">Features</button></li>
                        <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-400 transition-colors block py-1 w-full text-left">Pricing</button></li>
                        <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-400 transition-colors block py-1 w-full text-left">How it Works</button></li>
                    </ul>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                    <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li><button onClick={() => onNavigate('guide')} className="hover:text-blue-400 transition-colors block py-1 w-full text-left">User Guide</button></li>
                        <li><button onClick={() => onNavigate('privacy')} className="hover:text-blue-400 transition-colors block py-1 w-full text-left">Privacy Policy</button></li>
                        <li><button onClick={() => onNavigate('terms')} className="hover:text-blue-400 transition-colors block py-1 w-full text-left">Terms of Service</button></li>
                    </ul>
                </div>
                
                <div className="col-span-1 md:col-span-3">
                    <h4 className="text-white font-bold mb-6 text-lg">Contact Us</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            contact@smartcontent.ai
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            +1-888-888-8888
                        </li>
                        <li className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Tech Tower, Valley St, City
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center text-sm font-medium">
                <p>All rights reserved © 2024 Smart Content</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy</button>
                    <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms</button>
                </div>
            </div>
         </div>
      </footer>
    </div>
  );
}

const HeroAnimation = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 5000); // 5 seconds per slide to allow animations to finish
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: "News Monitoring", desc: "Smart web search", color: "blue" },
    { title: "Data Analysis", desc: "Key points extraction", color: "purple" },
    { title: "Creative Writing", desc: "On-brand content", color: "amber" },
    { title: "Auto Publishing", desc: "Schedule & Post", color: "emerald" }
  ];

  return (
    <div className="relative w-full max-w-[500px] mx-auto perspective-1000">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br blur-3xl opacity-30 transition-colors duration-1000 rounded-full -z-10 scale-110 
            ${step === 0 ? 'from-blue-400 to-indigo-400' : 
              step === 1 ? 'from-purple-400 to-pink-400' : 
              step === 2 ? 'from-amber-400 to-orange-400' : 
              'from-emerald-400 to-teal-400'}`}
        ></div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl border-4 border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden relative aspect-[4/3] transform transition-all hover:scale-[1.02] duration-500 flex flex-col">
            
            {/* Visual Area (Top 2/3) */}
            <div className="flex-grow relative overflow-hidden bg-slate-50/50">
               {step === 0 && <SearchVisual />}
               {step === 1 && <AnalysisVisual />}
               {step === 2 && <WritingVisual />}
               {step === 3 && <PublishVisual />}
            </div>

            {/* Info Area (Bottom 1/3) */}
            <div className="p-6 bg-white border-t border-slate-100 relative z-20">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 key={step} className="text-2xl font-extrabold text-slate-800 animate-slide-in">{steps[step].title}</h3>
                        <p key={`desc-${step}`} className="text-slate-500 font-medium text-sm animate-slide-in" style={{animationDelay: '100ms'}}>{steps[step].desc}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
                        step === 0 ? 'bg-blue-100 text-blue-600' :
                        step === 1 ? 'bg-purple-100 text-purple-600' :
                        step === 2 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                        {step === 0 && <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                        {step === 1 && <svg className="w-6 h-6 animate-spin" style={{animationDuration: '3s'}} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                        {step === 2 && <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                        {step === 3 && <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                </div>

                <div className="flex gap-2">
                    {steps.map((s, i) => (
                        <div 
                            key={i}
                            className="h-1.5 rounded-full flex-grow bg-slate-100 overflow-hidden relative cursor-pointer"
                            onClick={() => setStep(i)}
                        >
                            <div className={`absolute inset-0 transition-all duration-300 ${
                                step === i 
                                ? `w-full ${s.color === 'blue' ? 'bg-blue-500' : s.color === 'purple' ? 'bg-purple-500' : s.color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}` 
                                : i < step ? 'w-full bg-slate-300' : 'w-0'
                            }`}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
}

// --- Visual Sub-Components ---

const SearchVisual = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        {/* Search Bar */}
        <div className="w-full h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center px-4 mb-8 relative overflow-hidden">
            <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <div className="h-2 w-32 bg-slate-100 rounded"></div>
            {/* Shimmer on search bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2s_infinite]"></div>
        </div>

        {/* Result Cards - Appearing Sequentially triggered by the scanner */}
        <div className="w-full space-y-3 relative">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 animate-slide-in" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex-shrink-0"></div>
                <div className="flex-grow space-y-2 py-1">
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 animate-slide-in" style={{animationDelay: '0.8s', animationFillMode: 'both'}}>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex-shrink-0"></div>
                <div className="flex-grow space-y-2 py-1">
                    <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                    <div className="h-2 w-1/3 bg-slate-100 rounded"></div>
                </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex gap-3 animate-slide-in" style={{animationDelay: '1.4s', animationFillMode: 'both'}}>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex-shrink-0"></div>
                <div className="flex-grow space-y-2 py-1">
                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                </div>
            </div>
        </div>

        {/* Scan Line - Laser Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-[scan_2s_linear_infinite]"></div>
    </div>
);

const AnalysisVisual = () => (
    <div className="absolute inset-0 flex items-center justify-center">
        {/* Network Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

        {/* Central Brain/Core */}
        <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-purple-500/20 animate-float">
            <div className="absolute inset-0 rounded-full border-2 border-purple-100 animate-ping opacity-20"></div>
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
        </div>

        {/* Floating Data Points - Implosion Effect */}
        {[...Array(8)].map((_, i) => (
            <div 
                key={i}
                className="absolute w-2 h-2 bg-purple-400 rounded-full shadow-glow"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 45}deg) translate(140px)`,
                    animation: `implode 3s infinite ${i * 0.1}s`
                }}
            ></div>
        ))}
        
        {/* Connecting Lines Ring */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
             <div className="w-[240px] h-[240px] border border-dashed border-purple-400 rounded-full animate-[spin_20s_linear_infinite]"></div>
        </div>
    </div>
);

const WritingVisual = () => (
    <div className="absolute inset-0 p-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-xl shadow-lg border border-slate-100 p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Simulated Typing Content */}
            <div className="space-y-3">
                {/* Heading */}
                <div className="h-4 bg-slate-800 rounded w-0 animate-[width-grow_0.5s_forwards] mb-4"></div>
                
                {/* Paragraph Lines */}
                <div className="relative">
                    <div className="h-2 bg-slate-200 rounded w-0 animate-[width-grow_0.8s_forwards_0.5s]"></div>
                </div>
                <div className="relative">
                    <div className="h-2 bg-slate-200 rounded w-0 animate-[width-grow_0.8s_forwards_1.3s]"></div>
                </div>
                <div className="relative">
                    <div className="h-2 bg-slate-200 rounded w-0 animate-[width-grow_0.8s_forwards_2.1s]"></div>
                </div>
                <div className="relative">
                    <div className="h-2 bg-slate-200 rounded w-0 animate-[width-grow_0.5s_forwards_2.9s] max-w-[70%]"></div>
                    {/* Blinking Cursor at the end of the last line */}
                    <div className="absolute top-0 left-[72%] h-2 w-0.5 bg-amber-500 animate-[pulse_0.8s_infinite] opacity-0 animate-[fade-in_0.1s_forwards_3.4s]"></div>
                </div>
            </div>
        </div>
    </div>
);

const PublishVisual = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-[260px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center transform transition-all animate-[pop-in_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            
            {/* Success Icon with Checkmark Animation */}
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-[spin_1.5s_linear_1] opacity-0" style={{animationFillMode: 'forwards'}}></div>
                <svg className="w-8 h-8 animate-[check_0.5s_ease-out_1.5s_both]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            
            {/* Text State Change */}
            <div className="relative h-8 overflow-hidden mb-2">
                <h4 className="font-bold text-slate-800 absolute w-full animate-[slide-up-out_0.5s_forwards_1.2s]">Publishing...</h4>
                <h4 className="font-bold text-green-600 absolute w-full translate-y-10 animate-[slide-up-in_0.5s_forwards_1.2s]">Published!</h4>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-green-500 w-0 animate-[width-grow_1.2s_ease-in-out_forwards]"></div>
            </div>
            
            {/* Confetti Particles */}
            <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-[pop-in_0.3s_forwards_1.5s] opacity-0"></div>
            <div className="absolute -top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-[pop-in_0.3s_forwards_1.6s] opacity-0"></div>
            <div className="absolute bottom-4 -right-4 w-2 h-2 bg-red-400 rounded-full animate-[pop-in_0.3s_forwards_1.7s] opacity-0"></div>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, color, delay }: any) => {
   const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
      rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
      indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
   };

   return (
      <div className={`bg-white p-8 rounded-[2rem] shadow-card border border-slate-100 group hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 animate-card-enter ${delay} h-full`}>
         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
         </div>
         <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
         <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
      </div>
   );
}

const StepCard = ({ number, title, desc, icon, color }: any) => {
    return (
        <div className="relative z-10 bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 text-center group hover:-translate-y-2 transition-transform duration-300 h-full">
            <div className={`w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg ${
                color === 'blue' ? 'bg-blue-600 shadow-blue-200' :
                color === 'purple' ? 'bg-purple-600 shadow-purple-200' : 'bg-emerald-600 shadow-emerald-200'
            }`}>
                {icon}
            </div>
            <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 rounded-bl-2xl rounded-tr-2xl flex items-center justify-center font-black text-slate-300 text-xl group-hover:text-slate-800 transition-colors">
                {number}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

const PricingCard = ({ title, price, currency, period, features, buttonText, active, popular, onClick }: any) => {
    return (
        <div className={`p-8 rounded-[2.5rem] relative transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ${
            active 
            ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 border border-slate-700' 
            : 'bg-white text-slate-900 shadow-card border border-slate-100 hover:shadow-xl'
        }`}>
            {popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Popular
                </div>
            )}
            
            <div className="text-center mb-8">
                <h3 className={`text-xl font-bold mb-2 ${active ? 'text-slate-300' : 'text-slate-500'}`}>{title}</h3>
                <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-extrabold">{price}</span>
                    {currency && <span className="text-xs opacity-70 flex flex-col items-start leading-none"><span>{currency}</span><span>{period}</span></span>}
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                        <svg className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className={active ? 'opacity-90' : 'text-slate-600'}>{feature}</span>
                    </li>
                ))}
            </ul>

            <button 
                onClick={onClick}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                active 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}>
                {buttonText}
            </button>
        </div>
    );
}

const TestimonialCard = ({ quote, author, role, image, delay }: any) => {
    return (
        <div className={`bg-white p-8 rounded-[2rem] border border-slate-100 relative group hover:-translate-y-2 transition-all duration-500 shadow-sm hover:shadow-card-hover animate-card-enter ${delay}`}>
            {/* Quote Icon Background */}
            <div className="absolute top-6 left-6 text-slate-100 group-hover:text-blue-50 transition-colors">
                <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
            </div>

            <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-8 font-medium text-lg min-h-[80px]">"{quote}"</p>
                <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                    <img src={image} alt={author} className="w-14 h-14 rounded-2xl bg-slate-100 object-cover ring-4 ring-slate-50" />
                    <div>
                        <h4 className="font-bold text-slate-900 text-base">{author}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">{role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const FaqItem = ({ question, answer, isOpen, onClick }: any) => {
    return (
        <div 
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen 
                ? 'bg-white border-blue-200 shadow-lg shadow-blue-50' 
                : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
        >
            <button 
                onClick={onClick}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 transition-colors"
            >
                <span className={`text-lg ${isOpen ? 'text-blue-700' : 'text-slate-700'}`}>{question}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-blue-600 text-white rotate-45' : 'bg-slate-100 text-slate-400'
                }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 text-slate-500 leading-relaxed border-t border-slate-50 mt-2 text-base">
                    {answer}
                </div>
            </div>
        </div>
    );
}

const FeatureSpotlight = ({ title, description, benefits, image, reversed, gradient }: any) => {
    return (
        <section className="py-24 relative overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${reversed ? 'lg:flex-row-reverse' : ''}`}>
                    {/* Text Content */}
                    <div className="lg:w-1/2 space-y-8 animate-slide-up">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                            {title}
                        </h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            {description}
                        </p>
                        <ul className="space-y-4">
                            {benefits.map((benefit: string, i: number) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${gradient === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Visual Content */}
                    <div className="lg:w-1/2 relative w-full perspective-1000">
                        {/* Decorative Background */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr opacity-20 blur-3xl rounded-full -z-10 ${
                            gradient === 'purple' 
                            ? 'from-purple-200 via-pink-200 to-transparent' 
                            : 'from-blue-200 via-cyan-200 to-transparent'
                        }`}></div>
                        
                        <div className="transform transition-transform hover:scale-[1.02] duration-500">
                            {image}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
