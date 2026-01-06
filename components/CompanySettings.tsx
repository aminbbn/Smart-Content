
import React, { useEffect, useState, useRef } from 'react';

interface Product {
    name: string;
    description: string;
    image?: string;
}

export default function CompanySettings() {
    const [loading, setLoading] = useState(true);
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

    // Droplinked Sync States
    const [syncing, setSyncing] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [tempApiKey, setTempApiKey] = useState('');
    const [syncError, setSyncError] = useState<string | null>(null);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const ignoreNextChange = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const tonePresets = [
        'Formal & Professional',
        'Friendly & Casual', 
        'Creative & Innovative',
        'Technical & Precise',
        'Witty & Entertaining'
    ];

    useEffect(() => {
        fetchData();
        const localKey = localStorage.getItem('droplinked_api_key');
        if (localKey) setTempApiKey(localKey);
    }, []);

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
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings/company');
            const json = await res.json();
            if (json.success && json.data) {
                ignoreNextChange.current = true; 
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

    const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 6000); 
    };

    const handleCancelSync = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setSyncing(false);
        setSyncError("Sync cancelled by user");
    };

    const executeSync = async (keyOverride?: string) => {
        if (syncing) return; 
        
        // Reset previous controller
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setSyncing(true);
        setSyncError(null);
        
        const storedKey = localStorage.getItem('droplinked_api_key');
        const keyToUse = keyOverride || storedKey || '';

        // NOTE: We do NOT stop here if keyToUse is empty. 
        // We let the backend try to find the key in the database first.

        try {
            console.log("Starting Droplinked Sync...");
            
            // Race against a local timeout to prevent UI freeze
            const fetchPromise = fetch('/api/integrations/droplinked/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: keyToUse }),
                signal: controller.signal
            });

            const timeoutPromise = new Promise<Response>((_, reject) => 
                setTimeout(() => reject(new Error("Request timed out locally")), 15000)
            );

            const res = await Promise.race([fetchPromise, timeoutPromise]);
            
            console.log("Sync Response Status:", res.status);

            const rawText = await res.text();
            
            // --- DEBUG LOGGING ---
            console.log("%c[DEBUG] Raw Server Response:", "background: #222; color: #bada55; padding: 4px;", rawText);
            // ---------------------

            // If backend returns 401, it means it couldn't find the key in DB either.
            if (res.status === 401 || res.status === 403) {
                setSyncing(false);
                setShowKeyModal(true);
                if (keyToUse) {
                    setSyncError("Authentication failed. Please check your API Key.");
                }
                return;
            }

            let json;
            try {
                json = JSON.parse(rawText);
            } catch (e) {
                console.error("JSON Parse Error. Raw Text:", rawText);
                throw new Error(`Invalid JSON from server. Preview: ${rawText.substring(0, 50)}...`);
            }
            
            if (json.success) {
                // If we used an override key successfully, save it to local storage now
                if (keyOverride) {
                    localStorage.setItem('droplinked_api_key', keyOverride);
                }

                setFormData(prev => ({
                    ...prev,
                    name: json.data.company.name || prev.name,
                    description: json.data.company.description || prev.description,
                    product_info: [...prev.product_info, ...json.data.products] 
                }));
                setShowKeyModal(false);
                showToastMessage(`Synced! Found ${json.data.products?.length || 0} products.`);
            } else {
                const errMsg = json.error || 'Sync failed due to unknown error';
                setSyncError(errMsg);
                showToastMessage(errMsg, 'error');
            }
        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log("Sync aborted");
                return;
            }
            console.error("Sync Exception:", e);
            setSyncError(e.message);
            showToastMessage(e.message, 'error');
        } finally {
            if (abortControllerRef.current === controller) {
                setSyncing(false);
                abortControllerRef.current = null;
            }
        }
    };

    const handleSyncDroplinked = () => {
        executeSync();
    };

    const handleKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!tempApiKey.trim()) return;
        // Just execute, saving happens on success
        executeSync(tempApiKey);
    };

    const handleClearKey = () => {
        localStorage.removeItem('droplinked_api_key');
        setTempApiKey('');
        setSyncError(null);
    };

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="w-full space-y-8 animate-page-enter pb-10 relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-slide-up border ${
                    toast.type === 'success' 
                        ? 'bg-slate-900 text-white border-slate-800' 
                        : 'bg-white text-red-600 border-red-100'
                }`}>
                    {toast.type === 'success' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                    )}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Sync Overlay */}
            {syncing && (
                <div className="fixed inset-0 z-[70] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center cursor-wait">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold text-slate-800">Syncing with Droplinked...</h3>
                    <p className="text-slate-500 text-sm mt-1">Importing shop details and products</p>
                    <button 
                        onClick={handleCancelSync}
                        className="mt-6 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors shadow-sm"
                    >
                        Cancel Operation
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="border-b border-slate-200/60 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Company Settings</h2>
                    <p className="text-slate-500 mt-2 text-lg leading-relaxed max-w-3xl">
                        Your brand identity and product details are the foundation of smart content generation.
                    </p>
                </div>
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
                                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 group"
                                >
                                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group relative flex gap-4">
                                    <button 
                                        onClick={() => removeProduct(idx)}
                                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                                        title="Remove Product"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>

                                    {/* Product Image */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center relative group/img">
                                        {prod.image ? (
                                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        )}
                                        {/* Optional: Add hover upload capability here later */}
                                    </div>

                                    <div className="flex-grow space-y-2 min-w-0">
                                        <div>
                                            <input 
                                                type="text" 
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none py-1 font-bold text-slate-800 transition-colors text-sm placeholder-slate-400"
                                                value={prod.name}
                                                onChange={e => updateProduct(idx, 'name', e.target.value)}
                                                placeholder="Product Name"
                                            />
                                        </div>
                                        <div>
                                            <textarea
                                                className="w-full bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-500/20 py-2 px-3 text-xs text-slate-600 resize-none h-14"
                                                value={prod.description}
                                                onChange={e => updateProduct(idx, 'description', e.target.value)}
                                                placeholder="Brief description..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* API Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-in border border-slate-100">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Connect Droplinked</h3>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                                Enter your Droplinked API Key to automatically sync your shop information and products.
                            </p>
                        </div>

                        <form onSubmit={handleKeySubmit} className="space-y-4">
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API Key</label>
                                <input 
                                    type="password" 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3.5 text-slate-800 transition-all font-bold placeholder-slate-400 pr-10"
                                    placeholder="Enter your API key..."
                                    value={tempApiKey}
                                    onChange={e => setTempApiKey(e.target.value)}
                                    autoFocus
                                />
                                {tempApiKey && (
                                    <button 
                                        type="button" 
                                        onClick={handleClearKey} 
                                        className="absolute right-3 top-[38px] text-slate-400 hover:text-red-500 transition-colors"
                                        title="Clear stored key"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            
                            {syncError && (
                                <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-lg break-all">{syncError}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowKeyModal(false)}
                                    className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    Connect & Sync
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400">Key will be saved locally for this session.</p>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
