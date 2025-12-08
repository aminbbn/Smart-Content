import React, { useEffect, useState } from 'react';

export default function AgentSettings() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        is_active: false,
        model_config: { temperature: 0.7, model_name: 'gemini-3-pro-preview' },
        schedule_config: { research: '0 9 * * *' }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/agents');
            const json = await res.json();
            if (json.success && json.data) {
                setFormData(json.data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings/agents', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    };

    const handleCronPreset = (preset: string) => {
        setFormData({
            ...formData,
            schedule_config: { ...formData.schedule_config, research: preset }
        });
    };

    const presets = [
        { label: 'هر روز ۹ صبح', value: '0 9 * * *' },
        { label: 'هر ۶ ساعت', value: '0 */6 * * *' },
        { label: 'شنبه‌ها صبح', value: '0 9 * * 6' },
    ];

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="w-full space-y-8 animate-page-enter pb-32">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">پیکربندی سیستم</h2>
                    <p className="text-slate-500 mt-2 text-lg">مدیریت هسته مرکزی هوش مصنوعی و زمان‌بندی‌ها</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                   <div className={`w-2 h-2 rounded-full ${formData.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                   <span className="text-sm font-bold text-slate-600">{formData.is_active ? 'سیستم فعال است' : 'سیستم غیرفعال'}</span>
                </div>
            </div>
            
            <div className="grid gap-8">
                {/* 1. Master Control Card (Hero) */}
                <div className={`relative overflow-hidden rounded-[2rem] p-1 transition-all duration-500 ${formData.is_active ? 'bg-gradient-to-r from-emerald-400 to-green-600 shadow-xl shadow-green-200/50' : 'bg-slate-200 shadow-card'}`}>
                    <div className="bg-white rounded-[1.8rem] p-8 h-full flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-500 ${formData.is_active ? 'bg-emerald-50 text-emerald-600 scale-100 rotate-0' : 'bg-slate-100 text-slate-400 scale-95 -rotate-12'}`}>
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-2xl mb-2">وضعیت عملیاتی</h3>
                                <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                                    {formData.is_active 
                                        ? 'سیستم در حال اجراست. ایجنت‌ها طبق برنامه زمان‌بندی شده وظایف خود را انجام می‌دهند.' 
                                        : 'سیستم متوقف شده است. هیچ وظیفه خودکاری اجرا نخواهد شد.'}
                                </p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={formData.is_active}
                                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                            />
                            <div className="w-24 h-12 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-10 after:w-10 after:transition-all after:shadow-md peer-checked:bg-emerald-500 shadow-inner group-hover:shadow-lg transition-all"></div>
                        </label>
                    </div>
                </div>

                {/* 2. Intelligence Engine Config */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Models Column */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-card border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            </span>
                            <h3 className="font-bold text-slate-800 text-xl">موتور هوش مصنوعی</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Flash Model Card */}
                            <div 
                                onClick={() => setFormData({...formData, model_config: {...formData.model_config, model_name: 'gemini-2.5-flash'}})}
                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${
                                    formData.model_config.model_name.includes('flash') 
                                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' 
                                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span className="font-bold text-slate-800">Gemini 2.5 Flash</span>
                                    </div>
                                    {formData.model_config.model_name.includes('flash') && (
                                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                    سریع‌ترین و مقرون‌به‌صرفه‌ترین مدل گوگل. مناسب برای کارهای با حجم بالا و پاسخ‌دهی سریع.
                                </p>
                                <div className="mt-auto flex gap-2">
                                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold">کم هزینه</span>
                                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold">پرسرعت</span>
                                </div>
                            </div>

                            {/* Pro Model Card */}
                            <div 
                                onClick={() => setFormData({...formData, model_config: {...formData.model_config, model_name: 'gemini-3-pro-preview'}})}
                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col ${
                                    formData.model_config.model_name.includes('pro') 
                                    ? 'border-purple-500 bg-purple-50/50 shadow-md ring-4 ring-purple-500/10' 
                                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                        <span className="font-bold text-slate-800">Gemini 3 Pro</span>
                                    </div>
                                    {formData.model_config.model_name.includes('pro') && (
                                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">✓</div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                    هوشمندترین مدل برای استدلال پیچیده، خلاقیت بالا و تولید محتوای طولانی با کیفیت انسانی.
                                </p>
                                <div className="mt-auto flex gap-2">
                                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold">هوش بالا</span>
                                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold">خلاق</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Temperature Column */}
                    <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-6">
                            <label className="font-bold text-slate-800 text-lg">درجه خلاقیت</label>
                            <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-mono font-bold text-lg border border-slate-200">
                                {formData.model_config.temperature}
                            </span>
                        </div>
                        
                        <div className="relative h-48 flex items-center justify-center">
                             {/* Vertical Slider Visualization */}
                             <div className="w-full">
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.1"
                                    className="w-full h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                                    value={formData.model_config.temperature}
                                    onChange={e => setFormData({
                                        ...formData, 
                                        model_config: {...formData.model_config, temperature: parseFloat(e.target.value)}
                                    })}
                                />
                                <div className="flex justify-between mt-4 px-1">
                                    <div className={`text-center transition-opacity duration-300 ${formData.model_config.temperature < 0.4 ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className="block text-xs font-bold text-slate-800">دقیق</span>
                                        <span className="block text-[10px] text-slate-400">منطقی</span>
                                    </div>
                                    <div className={`text-center transition-opacity duration-300 ${formData.model_config.temperature >= 0.4 && formData.model_config.temperature <= 0.7 ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className="block text-xs font-bold text-slate-800">متعادل</span>
                                        <span className="block text-[10px] text-slate-400">استاندارد</span>
                                    </div>
                                    <div className={`text-center transition-opacity duration-300 ${formData.model_config.temperature > 0.7 ? 'opacity-100' : 'opacity-40'}`}>
                                        <span className="block text-xs font-bold text-slate-800">خلاق</span>
                                        <span className="block text-[10px] text-slate-400">نوآورانه</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. Scheduler Config */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            <div>
                                <h3 className="font-bold text-slate-800 text-xl">زمان‌بندی خودکار</h3>
                                <p className="text-xs text-slate-500 mt-1">تنظیم چرخه فعالیت ایجنت تحقیق</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             {presets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => handleCronPreset(preset.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                        formData.schedule_config.research === preset.value
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md transform scale-105'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-white">
                        <label className="block text-sm font-bold text-slate-700 mb-4">عبارت زمان‌بندی (Cron Expression)</label>
                        
                        <div className="relative group max-w-2xl">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                <span className="text-slate-400 text-xs font-mono bg-slate-100 px-2 py-1 rounded">UTC Time</span>
                            </div>
                            {/* Improved Input Visibility */}
                            <input 
                                type="text" 
                                dir="ltr"
                                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-mono text-xl tracking-wider px-6 py-5 pl-24 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner placeholder-slate-300"
                                value={formData.schedule_config.research}
                                onChange={e => setFormData({
                                    ...formData, 
                                    schedule_config: {...formData.schedule_config, research: e.target.value}
                                })}
                                placeholder="* * * * *"
                            />
                            <div className="absolute inset-0 border-2 border-emerald-500 rounded-2xl opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p>فرمت استاندارد: <span className="font-mono bg-slate-100 px-1 rounded">دقیقه ساعت روز ماه هفته</span>. مثال: <span className="font-mono" dir="ltr">0 9 * * *</span> یعنی هر روز ساعت ۹ صبح.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-slide-in ring-1 ring-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-bold text-sm">تغییرات پیکربندی</p>
                            <p className="text-xs text-slate-400">برای اعمال روی ایجنت‌ها ذخیره کنید</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-8 py-3 bg-white text-slate-900 rounded-xl font-bold shadow-lg hover:bg-blue-50 transition-all active:scale-95 flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>در حال ذخیره...</span>
                            </>
                        ) : (
                            <>
                                <span>ذخیره و اعمال</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}