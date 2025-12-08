import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AuthPage({ onLogin, onBack }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#0f172a] overflow-hidden" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/40 z-0"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-float"></div>

      <div className="relative z-10 w-full max-w-5xl h-[600px] bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex animate-card-enter">
        {/* Visual Side (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-blue-600/90 to-indigo-800/90">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <button onClick={onBack} className="self-start text-white/80 hover:text-white flex items-center gap-2 transition-colors z-20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                بازگشت به خانه
            </button>

            <div className="relative z-10 space-y-6">
                <h2 className="text-4xl font-extrabold text-white leading-tight">
                    {isLogin ? 'خوش آمدید،' : 'شروع مسیر،'}
                    <br />
                    <span className="text-blue-200">به آینده تولید محتوا</span>
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
                    {isLogin 
                     ? 'وارد داشبورد خود شوید و مدیریت محتوای هوشمند را از سر بگیرید.' 
                     : 'حساب کاربری خود را بسازید و از قدرت هوش مصنوعی برای رشد کسب‌وکار خود استفاده کنید.'}
                </p>
            </div>

            <div className="flex gap-4 z-10">
                <div className="h-1.5 w-8 bg-white rounded-full"></div>
                <div className="h-1.5 w-8 bg-white/30 rounded-full"></div>
                <div className="h-1.5 w-8 bg-white/30 rounded-full"></div>
            </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
            <div className="absolute top-6 right-6 lg:hidden">
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="max-w-sm mx-auto w-full space-y-8">
                <div className="text-center lg:text-right">
                    <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{isLogin ? 'ورود به حساب' : 'ایجاد حساب کاربری'}</h3>
                    <p className="text-slate-400 text-sm">اطلاعات خود را برای دسترسی وارد کنید</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                         <div className="animate-slide-up">
                            <label className="block text-sm font-bold text-slate-700 mb-2">نام کامل</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none" placeholder="نام و نام خانوادگی" />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">آدرس ایمیل</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none" placeholder="name@company.com" />
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-bold text-slate-700">رمز عبور</label>
                             {isLogin && <a href="#" className="text-xs font-bold text-blue-600 hover:underline">فراموشی رمز؟</a>}
                        </div>
                        <input type="password" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-800 outline-none" placeholder="••••••••" />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2"
                    >
                        {loading ? (
                             <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>در حال پردازش...</span>
                             </>
                        ) : (
                            isLogin ? 'ورود به سیستم' : 'ثبت نام رایگان'
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-slate-500 text-sm">
                        {isLogin ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت نام کرده‌اید؟'}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="mr-2 font-bold text-blue-600 hover:underline"
                        >
                            {isLogin ? 'ثبت نام کنید' : 'وارد شوید'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
