import React, { useEffect, useState } from 'react';

interface Product {
    name: string;
    description: string;
}

export default function CompanySettings() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        core_values: '',
        tone_of_voice: '',
        target_audience: '',
        product_info: [] as Product[]
    });

    // Preset tones for quick selection
    const tonePresets = [
        'رسمی و اداری',
        'دوستانه و صمیمی', 
        'خلاقانه و نوآور',
        'تخصصی و دقیق',
        'شوخ‌طبع و سرگرم‌کننده'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/company');
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
            await fetch('/api/settings/company', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            // Ideally show a toast here, but for now the button state handles feedback
        } catch (e) {
            console.error(e);
        }
        setSaving(false);
    };

    const addProduct = () => {
        setFormData(prev => ({
            ...prev,
            product_info: [...prev.product_info, { name: '', description: '' }]
        }));
    };

    const updateProduct = (index: number, field: keyof Product, value: string) => {
        const newProducts = [...formData.product_info];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setFormData(prev => ({ ...prev, product_info: newProducts }));
    };

    const removeProduct = (index: number) => {
        setFormData(prev => ({
            ...prev,
            product_info: prev.product_info.filter((_, i) => i !== index)
        }));
    };

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="w-full space-y-8 animate-page-enter pb-32">
            {/* Header */}
            <div className="border-b border-slate-200/60 pb-6">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">تنظیمات شرکت</h2>
                <p className="text-slate-500 mt-2 text-lg leading-relaxed max-w-3xl">
                    هویت برند و اطلاعات محصولات شما، پایه‌ی تولید محتوای هوشمند است. این اطلاعات به هوش مصنوعی کمک می‌کند تا دقیقاً با صدای شما صحبت کند.
                </p>
            </div>
            
            <div className="grid gap-8">
                {/* 1. Basic Info Card */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-105 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">اطلاعات پایه کسب‌وکار</h3>
                                <p className="text-xs text-slate-400">نام و زمینه فعالیت شرکت</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">نام شرکت</label>
                                    <input 
                                        type="text" 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="مثال: دیجی‌کالا"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">صنعت / حوزه فعالیت</label>
                                    <input 
                                        type="text" 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                        value={formData.industry}
                                        onChange={e => setFormData({...formData, industry: e.target.value})}
                                        placeholder="مثال: تجارت الکترونیک، تکنولوژی"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">توضیحات شرکت (Description)</label>
                                <textarea 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[100px] placeholder-slate-400"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="توضیح مختصری درباره ماموریت، چشم‌انداز و فعالیت‌های اصلی شرکت بنویسید..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Brand Identity Card */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/50 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-105 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">هویت برند و استراتژی</h3>
                                <p className="text-xs text-slate-400">لحن صحبت و مخاطبین هدف</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">لحن برند (Tone of Voice)</label>
                                <input 
                                    type="text" 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                    value={formData.tone_of_voice}
                                    onChange={e => setFormData({...formData, tone_of_voice: e.target.value})}
                                    placeholder="لحن مورد نظر خود را بنویسید یا از گزینه‌های زیر انتخاب کنید"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {tonePresets.map(tone => (
                                        <button
                                            key={tone}
                                            onClick={() => setFormData({...formData, tone_of_voice: tone})}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                                formData.tone_of_voice === tone
                                                ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                            }`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">ارزش‌های محوری (Core Concepts)</label>
                                    <textarea 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 p-4 text-slate-800 transition-all min-h-[120px] placeholder-slate-400"
                                        value={formData.core_values || ''}
                                        onChange={e => setFormData({...formData, core_values: e.target.value})}
                                        placeholder="سه تا پنج ارزش اصلی برند خود را بنویسید. مثال: نوآوری پیشرو، پایداری محیط زیست، شفافیت با مشتری..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">مخاطبین هدف</label>
                                    <textarea 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 p-4 text-slate-800 transition-all min-h-[120px] placeholder-slate-400"
                                        value={formData.target_audience}
                                        onChange={e => setFormData({...formData, target_audience: e.target.value})}
                                        placeholder="چه کسانی مخاطب اصلی شما هستند؟ (مثال: مدیران کسب‌وکارهای کوچک، برنامه‌نویسان جوان، علاقه‌مندان به تکنولوژی...)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Products Card */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50/50 rounded-bl-[4rem] -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">محصولات و خدمات</h3>
                                    <p className="text-xs text-slate-400">لیست مواردی که می‌خواهید درباره آنها محتوا تولید شود</p>
                                </div>
                            </div>
                            <button 
                                onClick={addProduct}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                افزودن محصول جدید
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.product_info.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <p className="text-slate-500 font-bold">هنوز محصولی ثبت نشده است</p>
                                    <p className="text-xs text-slate-400 mt-1">برای شروع دکمه "افزودن محصول جدید" را بزنید</p>
                                </div>
                            )}
                            
                            {formData.product_info.map((prod, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group relative">
                                    <button 
                                        onClick={() => removeProduct(idx)}
                                        className="absolute top-4 left-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="حذف محصول"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1 group-hover:text-emerald-600 transition-colors">نام محصول / خدمت</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-b-2 border-slate-100 focus:border-emerald-500 focus:outline-none py-2 font-bold text-slate-800 transition-colors"
                                                value={prod.name}
                                                onChange={e => updateProduct(idx, 'name', e.target.value)}
                                                placeholder="نام محصول را وارد کنید"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">توضیح کوتاه</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-emerald-500/20 py-2 px-3 text-sm text-slate-600"
                                                value={prod.description}
                                                onChange={e => updateProduct(idx, 'description', e.target.value)}
                                                placeholder="کاربرد اصلی این محصول چیست؟"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Save Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-50">
                <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 animate-slide-in ring-1 ring-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-500/30">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-bold text-sm">تغییرات شرکت</p>
                            <p className="text-xs text-slate-400">اطلاعات جدید را ذخیره کنید تا اعمال شود</p>
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
                                <span>ذخیره تغییرات</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}