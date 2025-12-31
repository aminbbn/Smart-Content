
import React, { useEffect, useState, useRef } from 'react';

interface Product {
    name: string;
    description: string;
}

export default function CompanySettings() {
    const [loading, setLoading] = useState(true);
    // Initialize as 'idle' so nothing shows until a user interaction
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        core_values: '',
        tone_of_voice: '',
        target_audience: '',
        product_info: [] as Product[]
    });

    // Ref to prevent auto-save on initial fetch
    const ignoreNextChange = useRef(true);

    // Preset tones for quick selection
    const tonePresets = [
        'Formal & Professional',
        'Friendly & Casual', 
        'Creative & Innovative',
        'Technical & Precise',
        'Witty & Entertaining'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    // Auto-save Logic
    useEffect(() => {
        if (ignoreNextChange.current) {
            ignoreNextChange.current = false;
            return;
        }

        setSaveStatus('saving');
        const timer = setTimeout(async () => {
            try {
                await fetch('/api/settings/company', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                setSaveStatus('saved');
            } catch (e) {
                console.error(e);
                setSaveStatus('error');
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [formData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/company');
            const json = await res.json();
            if (json.success && json.data) {
                ignoreNextChange.current = true; // Prevent triggering auto-save
                setFormData(json.data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
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

    const handleSyncDroplinked = () => {
        alert("Droplinked Product Sync: Feature coming in Phase 3. API key must be configured in Settings first.");
    };

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="w-full space-y-8 animate-page-enter pb-10">
            {/* Header */}
            <div className="border-b border-slate-200/60 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Company Settings</h2>
                    <p className="text-slate-500 mt-2 text-lg leading-relaxed max-w-3xl">
                        Your brand identity and product details are the foundation of smart content generation.
                    </p>
                </div>
                {/* Status Indicator */}
                <div className="flex items-center gap-2 mb-1 min-w-[140px] justify-end h-6">
                    {saveStatus === 'saving' && (
                        <>
                            <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="text-sm font-bold text-slate-400">Saving...</span>
                        </>
                    )}
                    {saveStatus === 'saved' && (
                        <>
                            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm font-bold text-emerald-600">Changes Saved</span>
                        </>
                    )}
                    {saveStatus === 'error' && (
                        <>
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            <span className="text-sm font-bold text-red-600">Save Failed</span>
                        </>
                    )}
                </div>
            </div>
            
            <div className="grid gap-8">
                {/* 1. Basic Info Card */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-105 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Basic Business Info</h3>
                                <p className="text-xs text-slate-400">Company name and industry</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. Amazon"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                                    <input 
                                        type="text" 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                        value={formData.industry}
                                        onChange={e => setFormData({...formData, industry: e.target.value})}
                                        placeholder="e.g. E-commerce, Technology"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Company Description</label>
                                <textarea 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[100px] placeholder-slate-400"
                                    value={formData.description || ''}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Briefly describe your company's mission, vision, and core activities..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Brand Identity Card */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-105 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Brand Identity & Strategy</h3>
                                <p className="text-xs text-slate-400">Tone of voice and target audience</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tone of Voice</label>
                                <input 
                                    type="text" 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                    value={formData.tone_of_voice}
                                    onChange={e => setFormData({...formData, tone_of_voice: e.target.value})}
                                    placeholder="Enter desired tone or select from options"
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {tonePresets.map(tone => (
                                        <button
                                            key={tone}
                                            onClick={() => setFormData({...formData, tone_of_voice: tone})}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                                formData.tone_of_voice === tone
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm ring-1 ring-blue-500/20'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                        >
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Core Values</label>
                                    <textarea 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[120px] placeholder-slate-400"
                                        value={formData.core_values || ''}
                                        onChange={e => setFormData({...formData, core_values: e.target.value})}
                                        placeholder="List 3-5 core values. E.g., Innovation, Sustainability, Transparency..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                                    <textarea 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[120px] placeholder-slate-400"
                                        value={formData.target_audience}
                                        onChange={e => setFormData({...formData, target_audience: e.target.value})}
                                        placeholder="Who is your main audience? (e.g., Small business owners, young developers, tech enthusiasts...)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Products Card */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[4rem] -mr-10 -mt-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Products & Services</h3>
                                    <p className="text-xs text-slate-400">List items you want content generated for</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleSyncDroplinked}
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Sync from Droplinked
                                </button>
                                <button 
                                    onClick={addProduct}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add New Product
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.product_info.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <p className="text-slate-500 font-bold">No products registered yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Click "Add New Product" to start</p>
                                </div>
                            )}
                            
                            {formData.product_info.map((prod, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group relative">
                                    <button 
                                        onClick={() => removeProduct(idx)}
                                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove Product"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1 group-hover:text-blue-600 transition-colors">Product/Service Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-b-2 border-slate-100 focus:border-blue-500 focus:outline-none py-2 font-bold text-slate-800 transition-colors"
                                                value={prod.name}
                                                onChange={e => updateProduct(idx, 'name', e.target.value)}
                                                placeholder="Enter product name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">Short Description</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500/20 py-2 px-3 text-sm text-slate-600"
                                                value={prod.description}
                                                onChange={e => updateProduct(idx, 'description', e.target.value)}
                                                placeholder="What is the main use case?"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
