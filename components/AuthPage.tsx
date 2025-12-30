import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AuthPage({ onLogin, onBack }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call and success
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex font-sans bg-white" dir="ltr">
      {/* Visual Side (Left Side in LTR) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 text-white">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 animate-float"></div>
        </div>

        {/* Brand & Content */}
        <div className="relative z-10">
            <div 
                className="flex items-center gap-3 mb-20 cursor-pointer group w-fit" 
                onClick={onBack}
            >
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                    <span className="font-bold text-xl text-white">AI</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white group-hover:text-blue-200 transition-colors">Smart Content</span>
            </div>

            <div className="space-y-8 max-w-lg">
                <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
                    <span className="block text-blue-400 mb-2">Artificial Intelligence</span>
                    Your Creative Partner
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                    Generate text content, news, and accurate analysis in a fraction of a second with advanced language models. We removed the complexity so you can focus on creativity.
                </p>
                
                <div className="flex gap-4 pt-4">
                    <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold relative z-10 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col justify-center pl-4">
                        <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(i => <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                        </div>
                        <span className="text-sm text-slate-400">Trusted by 500+ top teams</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Links */}
        <div className="relative z-10 flex justify-between text-sm text-slate-500 border-t border-white/10 pt-8 mt-auto">
            <span>© 2024 Smart Content</span>
            <div className="flex gap-6">
                <button className="hover:text-white transition-colors">Privacy</button>
                <button className="hover:text-white transition-colors">Terms</button>
            </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <button 
            onClick={onBack}
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-800 flex items-center gap-2 transition-colors text-sm font-bold bg-slate-50 px-4 py-2 rounded-xl hover:bg-slate-100"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
        </button>

        <div className="w-full max-w-[400px] space-y-10 animate-slide-up">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {mode === 'login' ? 'Sign in to your account' : 'Create new account'}
                </h2>
                <p className="text-slate-500 font-medium">
                    {mode === 'login' 
                        ? 'Welcome back to your content dashboard' 
                        : 'Get started now, completely free'
                    }
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative shadow-inner">
                <div 
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${mode === 'login' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'}`}
                ></div>
                <button 
                    onClick={() => setMode('login')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl relative z-10 transition-colors duration-300 ${mode === 'login' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => setMode('register')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl relative z-10 transition-colors duration-300 ${mode === 'register' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Register
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'register' && (
                    <div className="animate-fade-in">
                        <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                className="w-full pl-4 pr-12 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 group-hover:bg-slate-100"
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <div className="absolute right-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                    <div className="relative group">
                        <input 
                            type="email" 
                            className="w-full pl-4 pr-12 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 group-hover:bg-slate-100"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <div className="absolute right-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center ml-1 mb-2">
                        <label className="block text-xs font-bold text-slate-700">Password</label>
                        {mode === 'login' && (
                            <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</button>
                        )}
                    </div>
                    <div className="relative group">
                        <input 
                            type="password" 
                            className="w-full pl-4 pr-12 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 group-hover:bg-slate-100"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                        <div className="absolute right-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Please wait...</span>
                        </>
                    ) : (
                        <>
                            <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </>
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}