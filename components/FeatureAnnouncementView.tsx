
import React, { useEffect, useState, useRef } from 'react';
import { FeatureAnnouncement, Writer } from '../types';
import WriterSelector from './WriterSelector';
import AgentActivityLog from './AgentActivityLog';
import JobProgress from './JobProgress';

// --- Utility Components ---

const ScrollObserver = ({ children, delay = 0, className = "" }: { children?: React.ReactNode, delay?: number, className?: string }) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.15, rootMargin: "50px" });
        
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={ref} 
            className={`transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) transform ${
                visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.98]'
            } ${className}`} 
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const SegmentedControl = ({ options, value, onChange, disabled }: { options: string[], value: string, onChange: (val: any) => void, disabled?: boolean }) => {
    return (
        <div className="relative flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shadow-inner w-full">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => !disabled && onChange(opt)}
                    disabled={disabled}
                    className={`flex-1 relative z-10 py-3 text-xs font-bold capitalize transition-colors duration-300 ${
                        value === opt ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                    {opt}
                </button>
            ))}
            {/* Sliding Pill Background */}
            <div 
                className="absolute top-1.5 bottom-1.5 bg-white rounded-lg shadow-sm border border-black/5 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
                style={{ 
                    left: `${(options.indexOf(value) * 100) / options.length + 1}%`, 
                    width: `${98 / options.length}%` 
                }}
            />
        </div>
    );
};

export default function FeatureAnnouncementView() {
    const [items, setItems] = useState<FeatureAnnouncement[]>([]);
    const [writers, setWriters] = useState<Writer[]>([]);
    const [products, setProducts] = useState<{name: string}[]>([]);
    
    // UI State
    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [loadingAction, setLoadingAction] = useState<'create' | 'research' | 'generate' | null>(null);
    const [currentAnnouncementId, setCurrentAnnouncementId] = useState<number | null>(null);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    // Form State
    const [selectedProduct, setSelectedProduct] = useState('');
    const [featureName, setFeatureName] = useState('');
    const [description, setDescription] = useState('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [selectedWriter, setSelectedWriter] = useState<number | string>('');
    
    // New Configs
    const [config, setConfig] = useState({
        scanVolume: 3,
        length: 'medium' as 'short' | 'medium' | 'long',
        relation: 'medium' as 'low' | 'medium' | 'high'
    });

    useEffect(() => {
        fetchItems();
        fetchWriters();
        fetchProducts();
        const interval = setInterval(fetchItems, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/agents/feature-announcement/list');
            if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                const json = await res.json();
                if (json.success) setItems(json.data);
            }
        } catch (e) { console.error(e); }
    };

    const fetchWriters = async () => {
        try {
            const res = await fetch('/api/writers');
            if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                const json = await res.json();
                if (json.success) {
                    setWriters(json.data);
                    const def = json.data.find((w: Writer) => w.is_default);
                    if (def) setSelectedWriter(def.id);
                }
            }
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/settings/company');
            if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                const json = await res.json();
                if (json.success && json.data.product_info) {
                    setProducts(json.data.product_info);
                    if (json.data.product_info.length > 0) {
                        setSelectedProduct(json.data.product_info[0].name);
                    }
                }
            }
        } catch (e) { console.error(e); }
    };

    const triggerPhase1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingAction('research');
        try {
            // 1. Create Draft
            const createRes = await fetch('/api/agents/feature-announcement/create', {
                method: 'POST',
                body: JSON.stringify({ 
                    productName: selectedProduct,
                    featureName, 
                    description,
                    customInstructions,
                })
            });
            const createJson = await createRes.json();
            
            if (createJson.success && createJson.data.id) {
                const newId = createJson.data.id;
                setCurrentAnnouncementId(newId);
                
                // 2. Trigger Research (Fire & Forget mostly, but we simulate loading)
                await fetch('/api/agents/feature-announcement/research', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        id: newId,
                        scanVolume: config.scanVolume
                    })
                });
                
                // Clear Form
                setFeatureName('');
                setDescription('');
                setCustomInstructions('');
                
                // Simulate "Analyzing" time or rely on status update
                setTimeout(() => setLoadingAction(null), 1500);
                fetchItems();
            }
        } catch (e) { console.error(e); setLoadingAction(null); }
    };

    const triggerPhase2 = async () => {
        // Use current session ID or most recent 'analyzed' one
        const targetId = currentAnnouncementId || items.find(i => i.status === 'analyzed' || i.status === 'draft')?.id;
        if (!targetId) return;

        setLoadingAction('generate');
        try {
            const res = await fetch('/api/agents/feature-announcement/generate', {
                method: 'POST',
                body: JSON.stringify({ 
                    id: targetId,
                    writerId: selectedWriter ? Number(selectedWriter) : undefined,
                    length: config.length,
                    relation: config.relation
                })
            });
            const json = await res.json();
            
            if (json.success && json.data.jobId) {
                setActiveJobId(json.data.jobId);
            }
        } catch (e) { console.error(e); setLoadingAction(null); }
    };

    // Derived State
    const activeItem = items.find(i => i.id === currentAnnouncementId);
    const isAnalyzed = activeItem?.status === 'analyzed';
    const isProcessed = activeItem?.status === 'processed';
    // Phase 2 is ready if we have an ID and it's not currently processing another job
    const isPhase2Ready = !!(currentAnnouncementId || items.find(i => i.status === 'analyzed'));

    return (
        <div className="w-full space-y-12 pb-20">
            {/* Header */}
            <ScrollObserver>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Product Launch Agent</h2>
                        </div>
                        <p className="text-slate-500 text-lg font-medium pl-5 max-w-2xl">
                            Turn your release notes into compelling marketing announcements. Select a product, add details, and let AI do the rest.
                        </p>
                    </div>
                </div>
            </ScrollObserver>

            {/* SECTION 1: Launch Configuration (Full Width) */}
            <ScrollObserver delay={100}>
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden group">
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-80"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shadow-sm border border-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 leading-tight">New Announcement</h3>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">Define Launch Details</p>
                        </div>
                    </div>

                    <form onSubmit={triggerPhase1}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                            {/* Left Col */}
                            <div className="space-y-6">
                                {/* Product Selector */}
                                <div className="space-y-3 relative">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Target Product</label>
                                    <div className="relative">
                                        <button 
                                            type="button"
                                            onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                                            className="w-full text-left bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 flex justify-between items-center hover:bg-white hover:border-blue-300 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                        >
                                            <span className={`font-bold ${selectedProduct ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {selectedProduct || 'Select a product from settings...'}
                                            </span>
                                            <svg className={`w-5 h-5 text-slate-400 transition-transform ${isProductDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                        
                                        {isProductDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-20 max-h-48 overflow-y-auto animate-slide-in">
                                                {products.length > 0 ? (
                                                    products.map((p, i) => (
                                                        <div 
                                                            key={i} 
                                                            onClick={() => { setSelectedProduct(p.name); setIsProductDropdownOpen(false); }}
                                                            className="px-4 py-3 hover:bg-blue-50 hover:text-blue-700 cursor-pointer font-medium text-slate-600 transition-colors border-b border-slate-50 last:border-0"
                                                        >
                                                            {p.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-slate-400 text-sm">No products found in settings.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 block mb-3">Update Title / Version</label>
                                    <input 
                                        required
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                        placeholder="e.g. v2.0 Dark Mode Update"
                                        value={featureName}
                                        onChange={e => setFeatureName(e.target.value)}
                                        disabled={loadingAction !== null || activeJobId !== null}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 block mb-3">Technical Details</label>
                                    <textarea 
                                        required
                                        className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[140px] font-medium placeholder-slate-400 leading-relaxed resize-none shadow-inner"
                                        placeholder="List the key features, improvements, and technical changes..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        disabled={loadingAction !== null || activeJobId !== null}
                                    />
                                </div>
                            </div>

                            {/* Right Col - Config */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Assigned Writer</label>
                                    <WriterSelector 
                                        writers={writers}
                                        selectedId={selectedWriter}
                                        onChange={setSelectedWriter}
                                        disabled={loadingAction !== null || activeJobId !== null}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Market Scan Volume</label>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{config.scanVolume} Sources</span>
                                    </div>
                                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300" style={{ width: `${(config.scanVolume / 20) * 100}%` }}></div>
                                        <input type="range" min="1" max="20" value={config.scanVolume} onChange={(e) => setConfig({...config, scanVolume: parseInt(e.target.value)})} disabled={loadingAction !== null || activeJobId !== null} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Length</label>
                                        <SegmentedControl options={['short', 'medium', 'long']} value={config.length} onChange={(val) => setConfig({...config, length: val})} disabled={loadingAction !== null || activeJobId !== null} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Brand Relation</label>
                                        <SegmentedControl options={['low', 'medium', 'high']} value={config.relation} onChange={(val) => setConfig({...config, relation: val})} disabled={loadingAction !== null || activeJobId !== null} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1 block mb-3">Custom Instructions (Optional)</label>
                                    <textarea 
                                        className="w-full rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-sm text-slate-600 transition-all min-h-[80px] placeholder-slate-400 resize-none"
                                        placeholder="Specific tone requests, call to actions, or things to emphasize..."
                                        value={customInstructions}
                                        onChange={e => setCustomInstructions(e.target.value)}
                                        disabled={loadingAction !== null || activeJobId !== null}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Two-Phase Action Bar */}
                        <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                            <button 
                                type="submit" 
                                disabled={loadingAction !== null || activeJobId !== null || !featureName}
                                className={`flex-1 relative overflow-hidden group rounded-xl font-bold text-base py-4 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                                    isAnalyzed ? 'bg-slate-100 text-slate-400 border border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
                                }`}
                            >
                                {loadingAction === 'research' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className={`w-5 h-5 ${isAnalyzed ? 'text-slate-400' : 'text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                )}
                                <span>{isAnalyzed ? 'Market Analysis Complete' : 'Phase 1: Analyze Market'}</span>
                            </button>

                            <button 
                                type="button"
                                onClick={triggerPhase2}
                                disabled={loadingAction !== null || !isPhase2Ready || activeJobId !== null}
                                className={`flex-1 py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-sm border ${
                                    isPhase2Ready 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-blue-200' 
                                    : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                                {loadingAction === 'generate' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                )}
                                <span>Phase 2: Generate Announcement</span>
                            </button>
                        </div>
                    </form>
                </div>
            </ScrollObserver>

            {/* Active Job Progress */}
            {activeJobId && (
                <div className="animate-scale-in">
                    <JobProgress 
                        jobId={activeJobId} 
                        onComplete={() => {
                            setActiveJobId(null);
                            setLoadingAction(null);
                            fetchItems();
                            // If just finished gen, reset flow
                            if (loadingAction === 'generate') setCurrentAnnouncementId(null);
                        }}
                    />
                </div>
            )}

            {/* SECTION 2: Live Activity */}
            <ScrollObserver delay={200}>
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                            <h3 className="font-bold text-lg text-slate-800">Live Agent Activity</h3>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100/50 p-1">
                        <AgentActivityLog 
                            limit={3} 
                            refreshInterval={3000} 
                            typeFilter="publisher" 
                        />
                    </div>
                </div>
            </ScrollObserver>

            {/* SECTION 3: Recent Announcements Grid */}
            <ScrollObserver delay={300}>
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h3 className="font-bold text-lg text-slate-800">Recent Announcements</h3>
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">{items.length}</span>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <p className="text-slate-500 font-bold">No announcements yet</p>
                            <p className="text-xs text-slate-400 mt-1">Fill out the form above to create your first one.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {items.map((item, index) => (
                                <div key={item.id} className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-card-enter stagger-${index % 5} hover:shadow-md transition-shadow relative overflow-hidden group ${item.id === currentAnnouncementId ? 'ring-2 ring-blue-500/20' : ''}`}>
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner flex-shrink-0 border border-white">
                                            {item.product_name ? item.product_name.charAt(0) : item.feature_name.charAt(0)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{item.feature_name}</h4>
                                                <div className="flex gap-2">
                                                    {item.status === 'analyzed' && (
                                                        <button 
                                                            onClick={() => setCurrentAnnouncementId(item.id)}
                                                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        >
                                                            Resume Phase 2
                                                        </button>
                                                    )}
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                        item.status === 'processed' ? 'bg-green-50 text-green-600' : 
                                                        item.status === 'analyzed' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.status === 'processed' ? 'Ready' : item.status === 'analyzed' ? 'Analyzed' : 'Draft'}
                                                    </span>
                                                </div>
                                            </div>
                                            {item.product_name && <p className="text-xs font-bold text-blue-500 mb-2 uppercase tracking-wide">{item.product_name}</p>}
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{item.description}</p>
                                            
                                            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-4 border-t border-slate-50">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                                {item.status === 'processed' && (
                                                    <button className="ml-auto text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors">
                                                        Read Draft
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollObserver>
        </div>
    );
}
