
import React, { useEffect, useState, useRef } from 'react';

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'saving' | 'error'>('idle');
    const [isEditing, setIsEditing] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    
    // API Access State
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [generatingKey, setGeneratingKey] = useState(false);

    // Agent/System Configuration State
    const [agentFormData, setAgentFormData] = useState({
        model_config: { 
            temperature: 0.7, 
            model_name: 'gemini-3-pro-preview',
            safety_level: 'medium',   // 'low' | 'medium' | 'high'
            citation_style: 'inline'  // 'inline' | 'footnote' | 'none'
        },
        integrations: {
            droplinked_api_key: ''
        }
    });

    // User Profile State
    const [userFormData, setUserFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        avatar_url: ''
    });

    const ignoreNextAgentChange = useRef(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    // Auto-save Logic for Agent Settings Only
    useEffect(() => {
        if (ignoreNextAgentChange.current) {
            ignoreNextAgentChange.current = false;
            return;
        }

        setSaveStatus('saving');
        const timer = setTimeout(async () => {
            try {
                await fetch('/api/settings/agents', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...agentFormData,
                        is_active: false, // Legacy field
                        schedule_config: {} // Legacy field
                    })
                });
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (e) {
                console.error(e);
                setSaveStatus('error');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [agentFormData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Agent Settings
            const resAgent = await fetch('/api/settings/agents');
            let dbDroplinkedKey = '';
            
            if (resAgent.ok) {
                const json = await resAgent.json();
                if (json.success && json.data) {
                    // Don't set ignoreNextAgentChange here yet, wait until we merge local storage
                    const currentConfig = json.data.model_config || {};
                    const integrations = json.data.integrations || {};
                    dbDroplinkedKey = integrations.droplinked_api_key || '';
                    
                    setAgentFormData(prev => ({
                        ...prev,
                        model_config: {
                            temperature: 0.7,
                            model_name: 'gemini-3-pro-preview',
                            safety_level: 'medium',
                            citation_style: 'inline',
                            ...currentConfig
                        },
                        integrations: {
                            droplinked_api_key: dbDroplinkedKey
                        }
                    }));
                }
            }

            // Fetch User Settings
            const resUser = await fetch('/api/settings/user');
            if (resUser.ok) {
                const json = await resUser.json();
                if (json.success && json.data) {
                    setUserFormData(json.data);
                    if (json.data.api_key) setApiKey(json.data.api_key);
                }
            }
            
            // Sync with Local Storage (Priority: Local Storage > DB if DB is empty, or just ensure consistency)
            const localKey = localStorage.getItem('droplinked_api_key');
            if (localKey && !dbDroplinkedKey) {
                setAgentFormData(prev => ({
                    ...prev,
                    integrations: { ...prev.integrations, droplinked_api_key: localKey }
                }));
            }
            
            // Determine ignore flag after setting initial state
            setTimeout(() => { ignoreNextAgentChange.current = true; }, 100);

        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const updateAgentConfig = (key: string, value: any) => {
        setAgentFormData(prev => ({
            ...prev,
            model_config: { ...prev.model_config, [key]: value }
        }));
    };

    const updateIntegration = (key: string, value: any) => {
        setAgentFormData(prev => ({
            ...prev,
            integrations: { ...prev.integrations, [key]: value }
        }));
    };
    
    const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleConnectDroplinked = () => {
        const key = agentFormData.integrations.droplinked_api_key;
        if(key) {
            localStorage.setItem('droplinked_api_key', key);
            setSaveStatus('saved');
            showToastMessage("Droplinked account connected successfully!");
            setTimeout(() => setSaveStatus('idle'), 2000);
            
            // Force a save to backend immediately
            fetch('/api/settings/agents', {
                method: 'POST',
                body: JSON.stringify({
                    ...agentFormData,
                    is_active: false,
                    schedule_config: {}
                })
            }).catch(e => console.error("Backend save failed", e));
        } else {
            showToastMessage("Please enter an API Key first", 'error');
        }
    };

    const handleImageError = (e: any) => {
        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userFormData.first_name || 'User'}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large. Please select an image under 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserFormData(prev => ({ ...prev, avatar_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setSaveStatus('saving');
        try {
            const res = await fetch('/api/settings/user', {
                method: 'POST',
                body: JSON.stringify(userFormData)
            });
            if (res.ok) {
                setSaveStatus('saved');
                setIsEditing(false);
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                throw new Error('Failed to save');
            }
        } catch (e) {
            console.error(e);
            setSaveStatus('error');
        }
    };

    const handleGenerateApiKey = async () => {
        if (apiKey && !confirm("Generating a new key will invalidate the old one. Continue?")) return;
        
        setGeneratingKey(true);
        try {
            const res = await fetch('/api/settings/user', {
                method: 'POST',
                body: JSON.stringify({ action: 'generate_api_key' })
            });
            const json = await res.json();
            if (json.success && json.data?.api_key) {
                setApiKey(json.data.api_key);
                setShowKey(true);
            }
        } catch (e) { console.error(e); }
        setGeneratingKey(false);
    };

    const copyToClipboard = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            alert("API Key copied to clipboard!");
        }
    };

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    const isPro = agentFormData.model_config.model_name.includes('pro');

    return (
        <div className="w-full space-y-8 animate-page-enter pb-10">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-slide-up border ${
                    toast.type === 'success' 
                        ? 'bg-slate-900 text-white border-slate-800' 
                        : 'bg-white text-red-600 border-red-100'
                }`}>
                    {toast.type === 'success' ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                    )}
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200/60 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings</h2>
                    <p className="text-slate-500 mt-2 text-lg">Manage account profile and system configuration</p>
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
                            <span className="text-sm font-bold text-emerald-600">Saved</span>
                        </>
                    )}
                    {saveStatus === 'error' && (
                        <>
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            <span className="text-sm font-bold text-red-600">Failed</span>
                        </>
                    )}
                </div>
            </div>
            
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. User Profile */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-xl">User Profile</h3>
                                <p className="text-xs text-slate-400">Personal account details</p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors border border-slate-200"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => { setIsEditing(false); fetchData(); }}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveProfile}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-200"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 flex-grow">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm overflow-hidden flex-shrink-0">
                                    {userFormData.avatar_url ? (
                                        <img 
                                            src={userFormData.avatar_url} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover" 
                                            onError={handleImageError}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-3xl bg-slate-200">
                                            {userFormData.first_name ? userFormData.first_name[0] : 'U'}
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-transform hover:scale-110 border-2 border-white"
                                        title="Upload Photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-lg font-bold text-slate-800">
                                    {userFormData.first_name} {userFormData.last_name}
                                </h4>
                                <p className="text-sm text-slate-500 mb-2">{userFormData.email}</p>
                                {isEditing && (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        Upload New Photo
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-2.5 text-slate-800 transition-all font-bold"
                                        value={userFormData.first_name}
                                        onChange={e => setUserFormData({...userFormData, first_name: e.target.value})}
                                        placeholder="Admin"
                                    />
                                ) : (
                                    <div className="text-sm font-bold text-slate-800 px-1 py-1">{userFormData.first_name || '-'}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-2.5 text-slate-800 transition-all font-bold"
                                        value={userFormData.last_name}
                                        onChange={e => setUserFormData({...userFormData, last_name: e.target.value})}
                                        placeholder="User"
                                    />
                                ) : (
                                    <div className="text-sm font-bold text-slate-800 px-1 py-1">{userFormData.last_name || '-'}</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                            {isEditing ? (
                                <input 
                                    type="email" 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-2.5 text-slate-800 transition-all font-bold"
                                    value={userFormData.email}
                                    onChange={e => setUserFormData({...userFormData, email: e.target.value})}
                                    placeholder="admin@company.com"
                                />
                            ) : (
                                <div className="text-sm font-bold text-slate-800 px-1 py-1">{userFormData.email || '-'}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            {isEditing ? (
                                <input 
                                    type="password" 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-2.5 text-slate-800 transition-all font-bold"
                                    value={userFormData.password}
                                    onChange={e => setUserFormData({...userFormData, password: e.target.value})}
                                    placeholder="••••••••"
                                />
                            ) : (
                                <div className="text-sm font-bold text-slate-800 px-1 py-1 flex items-center gap-2">
                                    <span>••••••••</span>
                                    <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Hidden</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Model Selection */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-xl">Model Intelligence</h3>
                            <p className="text-xs text-slate-400">Select the brain powering your agents</p>
                        </div>
                    </div>

                    <div className="space-y-3 flex-grow">
                        <div 
                            onClick={() => updateAgentConfig('model_name', 'gemini-3-flash-preview')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                agentFormData.model_config.model_name.includes('flash')
                                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20'
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Gemini 3 Flash</h4>
                                <p className="text-xs text-slate-500 mt-0.5">High speed, lower cost. Good for news.</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                agentFormData.model_config.model_name.includes('flash') ? 'border-blue-500' : 'border-slate-300'
                            }`}>
                                {agentFormData.model_config.model_name.includes('flash') && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                            </div>
                        </div>

                        <div 
                            onClick={() => updateAgentConfig('model_name', 'gemini-3-pro-preview')}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                agentFormData.model_config.model_name.includes('pro')
                                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-500/20'
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Gemini 3 Pro</h4>
                                <p className="text-xs text-slate-500 mt-0.5">Max reasoning & quality. Best for articles.</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                agentFormData.model_config.model_name.includes('pro') ? 'border-blue-600' : 'border-slate-300'
                            }`}>
                                {agentFormData.model_config.model_name.includes('pro') && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Performance Metrics</h4>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span>Reasoning Speed</span>
                                        <span>{isPro ? 'Medium' : 'Ultra Fast'}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${isPro ? 'bg-slate-400 w-[70%]' : 'bg-blue-500 w-[98%]'}`}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span>Quality & Context</span>
                                        <span>{isPro ? 'Superior' : 'Standard'}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${isPro ? 'bg-blue-600 w-[95%]' : 'bg-blue-400 w-[75%]'}`}></div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex-1 text-center">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Context Window</div>
                                        <div className="text-sm font-bold text-slate-800">1M Tokens</div>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex-1 text-center">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Knowledge Cutoff</div>
                                        <div className="text-sm font-bold text-slate-800">Sep 2024</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Creativity & Style */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 py-10 relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-xl">Creativity Level</h3>
                            <p className="text-xs text-slate-400">Controls randomness and innovation</p>
                        </div>
                    </div>

                    <div className="px-2 flex-grow flex flex-col">
                        <input 
                            type="range" 
                            min="0" max="1" step="0.1"
                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                            value={agentFormData.model_config.temperature}
                            onChange={e => updateAgentConfig('temperature', parseFloat(e.target.value))}
                        />
                        <div className="flex justify-between mt-4 mb-8">
                            <div className={`text-center transition-all ${agentFormData.model_config.temperature < 0.4 ? 'opacity-100 scale-110 font-bold text-blue-700' : 'opacity-40 text-slate-400'}`}>
                                <span className="text-xs">Precise</span>
                            </div>
                            <div className={`text-center transition-all ${agentFormData.model_config.temperature >= 0.4 && agentFormData.model_config.temperature <= 0.7 ? 'opacity-100 scale-110 font-bold text-blue-700' : 'opacity-40 text-slate-400'}`}>
                                <span className="text-xs">Balanced</span>
                            </div>
                            <div className={`text-center transition-all ${agentFormData.model_config.temperature > 0.7 ? 'opacity-100 scale-110 font-bold text-blue-700' : 'opacity-40 text-slate-400'}`}>
                                <span className="text-xs">Creative</span>
                            </div>
                        </div>

                        {/* Dynamic Description Box */}
                        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/60 flex-grow flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Selected Mode</span>
                                <span className="text-blue-700 font-bold bg-white px-2 py-0.5 rounded shadow-sm text-xs border border-blue-100">{agentFormData.model_config.temperature} Temp</span>
                            </div>
                            <h4 className="text-lg font-bold mb-2 text-blue-800">
                                {agentFormData.model_config.temperature < 0.4 ? "Deterministic & Factual" : 
                                 agentFormData.model_config.temperature > 0.7 ? "Imaginative & Diverse" : 
                                 "Balanced & Coherent"}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {agentFormData.model_config.temperature < 0.4 ? "The model will favor the most probable tokens. This minimizes hallucinations and is perfect for coding, math, or factual reporting." : 
                                 agentFormData.model_config.temperature > 0.7 ? "The model explores less probable tokens, resulting in unique and creative outputs. Great for brainstorming, storytelling, and ad copy." : 
                                 "The gold standard for most content. It maintains factual accuracy while allowing for engaging sentence structures and natural flow."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 4. Safety & Formatting */}
                <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 py-10 relative overflow-hidden flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-xl">Safety & Style</h3>
                            <p className="text-xs text-slate-400">Content filtering and citations</p>
                        </div>
                    </div>

                    <div className="space-y-8 flex-grow">
                        {/* Safety Dropdown */}
                        <div>
                            <div className="flex justify-between items-baseline mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Safety Filter</label>
                                <span className="text-[10px] text-slate-400">Block sensitive content</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-1.5 rounded-2xl">
                                {['low', 'medium', 'high'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateAgentConfig('safety_level', level)}
                                        className={`py-4 rounded-xl text-xs font-bold capitalize transition-all flex flex-col items-center gap-1 ${
                                            agentFormData.model_config.safety_level === level 
                                            ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' 
                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                        }`}
                                    >
                                        <span>{level}</span>
                                        <span className="text-[9px] opacity-60 font-normal">
                                            {level === 'low' ? 'Min. Filter' : level === 'high' ? 'Strict' : 'Standard'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Citation Style */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Citation Style</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => updateAgentConfig('citation_style', 'inline')}
                                    className={`px-5 py-4 rounded-xl border text-left transition-all group ${
                                        agentFormData.model_config.citation_style === 'inline' 
                                        ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500/20' 
                                        : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="block text-sm font-bold">Inline Links</span>
                                        {agentFormData.model_config.citation_style === 'inline' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                    </div>
                                    <span className={`block text-[10px] ${agentFormData.model_config.citation_style === 'inline' ? 'opacity-80' : 'opacity-60'}`}>Hyperlinked text within body</span>
                                </button>
                                <button
                                    onClick={() => updateAgentConfig('citation_style', 'footnote')}
                                    className={`px-5 py-4 rounded-xl border text-left transition-all group ${
                                        agentFormData.model_config.citation_style === 'footnote' 
                                        ? 'border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500/20' 
                                        : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="block text-sm font-bold">Footnotes</span>
                                        {agentFormData.model_config.citation_style === 'footnote' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                    </div>
                                    <span className={`block text-[10px] ${agentFormData.model_config.citation_style === 'footnote' ? 'opacity-80' : 'opacity-60'}`}>References listed at bottom</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Droplinked Integration Section */}
            <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                    </div>
                    
                    <div className="flex-grow">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Droplinked Integration</h3>
                            <p className="text-slate-500 text-sm mt-1">Connect your shop to automatically sync products and generate content.</p>
                        </div>

                        <div className="w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shop API Key</label>
                            <div className="flex gap-3">
                                <div className="relative flex-grow">
                                    <input 
                                        type="password"
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                        placeholder="e.g. 8f3a9b2c..."
                                        value={agentFormData.integrations?.droplinked_api_key || ''}
                                        onChange={e => updateIntegration('droplinked_api_key', e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleConnectDroplinked}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap flex-shrink-0"
                                >
                                    Connect Account
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium mb-8">
                                <span className="text-blue-500">Secure:</span> Your key is encrypted and stored safely.
                            </p>

                            {/* Divider */}
                            <div className="h-px bg-slate-100 my-6"></div>

                            {/* Informational Section for New Users */}
                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm mb-2">New to Droplinked?</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                            Droplinked is a cutting-edge decentralized commerce platform that empowers you to sell physical & digital goods using NFTs. Featuring blockchain-based partnership terms, it enables secure co-selling and global reach without geographical limitations.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <a 
                                                href="https://droplinked.com/onboarding?entry=signup" 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                Create Free Account
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                            <a 
                                                href="https://droplinked.com/" 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors flex items-center gap-2"
                                            >
                                                Visit Website
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Developer API Section */}
            <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 pointer-events-none opacity-50"></div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </div>
                    </div>
                    
                    <div className="flex-grow">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Developer API Access</h3>
                                <p className="text-slate-500 text-sm mt-1">Access the Smart Content System programmatically.</p>
                            </div>
                            <button
                                onClick={() => window.open('/api', '_blank')}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors flex items-center gap-2"
                            >
                                API Documentation
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </button>
                        </div>

                        <div className="w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform API Key</label>
                            
                            {apiKey ? (
                                <div className="flex gap-3">
                                    <div className="relative flex-grow">
                                        <input 
                                            type={showKey ? "text" : "password"}
                                            readOnly
                                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-mono font-medium"
                                            value={apiKey}
                                        />
                                        <button 
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showKey ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-sm"
                                        title="Copy to Clipboard"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                    <button 
                                        onClick={handleGenerateApiKey}
                                        disabled={generatingKey}
                                        className="px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl font-bold transition-all shadow-sm"
                                        title="Regenerate Key"
                                    >
                                        <svg className={`w-5 h-5 ${generatingKey ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleGenerateApiKey}
                                    disabled={generatingKey}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2"
                                >
                                    {generatingKey ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                            Generate API Key
                                        </>
                                    )}
                                </button>
                            )}
                            
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                <span className="text-blue-500">Warning:</span> Keep this key secret. It provides full access to your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
