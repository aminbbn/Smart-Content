
import React, { useEffect, useState, useRef } from 'react';
import { AgentJob, Writer } from '../types';
import JobProgress from './JobProgress';
import AgentActivityLog from './AgentActivityLog';
import WriterSelector from './WriterSelector';

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

// --- Main View ---

export default function DailyNewsView() {
    const [loadingAction, setLoadingAction] = useState<'fetch' | 'generate-blog' | null>(null);
    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [writers, setWriters] = useState<Writer[]>([]);
    
    // Configuration State
    const [config, setConfig] = useState({
        writerId: '' as string | number,
        newsCount: 5,
        length: 'medium' as 'short' | 'medium' | 'long',
        relation: 'medium' as 'low' | 'medium' | 'high',
        customInstructions: ''
    });

    useEffect(() => {
        fetchWriters();
    }, []);

    const fetchWriters = async () => {
        try {
            const res = await fetch('/api/writers');
            const json = await res.json();
            if (json.success) {
                setWriters(json.data);
                const def = json.data.find((w: Writer) => w.is_default);
                if (def) setConfig(prev => ({ ...prev, writerId: def.id }));
            }
        } catch (e) { console.error(e); }
    };

    const triggerAgent = async () => {
        if (loadingAction || activeJobId) return;
        setLoadingAction('fetch');
        setError(null);
        
        try {
            const fetchRes = await fetch(`/api/agents/daily-news/fetch`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newsCount: config.newsCount })
            });
            
            if (!fetchRes.ok) throw new Error("Failed to fetch news");
            const fetchJson = await fetchRes.json();
            
            if (fetchJson.data?.jobId) {
                setActiveJobId(fetchJson.data.jobId);
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (e: any) { 
            console.error("Action failed:", e);
            setError(e.message || "Connection failed");
            setLoadingAction(null);
        }
    };

    const triggerGeneration = async () => {
        if (loadingAction || activeJobId) return;
        setLoadingAction('generate-blog');
        setError(null);

        try {
            const res = await fetch(`/api/agents/daily-news/generate-blog`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error("Failed to start generation");
            const json = await res.json();
            
            if (json.data?.jobId) {
                setActiveJobId(json.data.jobId);
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (e: any) {
            setError(e.message);
            setLoadingAction(null);
        }
    }

    return (
        <div className="w-full space-y-12 pb-20">
            {/* Header */}
            <ScrollObserver>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Daily News Agent</h2>
                        </div>
                        <p className="text-slate-500 text-lg font-medium pl-5 max-w-2xl">
                            Automatically scan global sources, analyze trends, and generate comprehensive blog posts for your audience.
                        </p>
                    </div>
                </div>
            </ScrollObserver>

            {/* SECTION 1: Agent Configuration (Full Width) */}
            <ScrollObserver delay={100}>
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden group">
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-80"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shadow-sm border border-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 leading-tight">Agent Configuration</h3>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">Customize Output</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Side Inputs */}
                        <div className="space-y-8">
                            {/* Writer Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Select Persona</label>
                                <div className="relative group/writer">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-xl opacity-0 group-hover/writer:opacity-100 transition duration-500 blur"></div>
                                    <div className="relative bg-white rounded-xl">
                                        <WriterSelector 
                                            writers={writers} 
                                            selectedId={config.writerId}
                                            onChange={(id) => setConfig({...config, writerId: id})}
                                            disabled={activeJobId !== null}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* News Volume Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Scan Volume</label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                        {config.newsCount} Articles
                                    </span>
                                </div>
                                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300" style={{ width: `${(config.newsCount / 20) * 100}%` }}></div>
                                    <input 
                                        type="range" 
                                        min="1" max="20" 
                                        value={config.newsCount}
                                        onChange={(e) => setConfig({...config, newsCount: parseInt(e.target.value)})}
                                        disabled={activeJobId !== null}
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-300 font-bold font-mono">
                                    <span>1</span>
                                    <span>10</span>
                                    <span>20</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Inputs */}
                        <div className="space-y-8">
                            {/* Length & Relation */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Length</label>
                                    <SegmentedControl 
                                        options={['short', 'medium', 'long']} 
                                        value={config.length} 
                                        onChange={(val) => setConfig({...config, length: val})} 
                                        disabled={activeJobId !== null}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Brand Relation</label>
                                    <SegmentedControl 
                                        options={['low', 'medium', 'high']} 
                                        value={config.relation} 
                                        onChange={(val) => setConfig({...config, relation: val})} 
                                        disabled={activeJobId !== null}
                                    />
                                </div>
                            </div>

                            {/* Custom Instructions */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Extra Instructions</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none h-28 placeholder-slate-400 leading-relaxed shadow-inner"
                                    placeholder="Specific topics to focus on, forbidden words, or specific formatting requirements..."
                                    value={config.customInstructions}
                                    onChange={(e) => setConfig({...config, customInstructions: e.target.value})}
                                    disabled={activeJobId !== null}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={triggerAgent}
                            disabled={activeJobId !== null || loadingAction !== null}
                            className="flex-1 relative overflow-hidden group bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base py-4 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <div className="flex items-center justify-center gap-3">
                                {loadingAction === 'fetch' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                )}
                                <span>{loadingAction === 'fetch' ? 'Scanning Global News...' : 'Phase 1: Fetch News'}</span>
                            </div>
                        </button>
                        
                        <button
                            onClick={triggerGeneration}
                            disabled={activeJobId !== null || loadingAction !== null}
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-sm"
                        >
                            {loadingAction === 'generate-blog' ? (
                                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            )}
                            <span>{loadingAction === 'generate-blog' ? 'Writing Article...' : 'Phase 2: Generate Blog'}</span>
                        </button>
                    </div>
                </div>
            </ScrollObserver>

            {/* SECTION 2: Status & Errors (Only visible if active or error) */}
            <div className="space-y-6">
                {error && (
                    <ScrollObserver>
                        <div className="bg-red-50/80 backdrop-blur border border-red-200 text-red-800 px-6 py-4 rounded-2xl flex items-start justify-between shadow-lg shadow-red-500/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <span className="font-bold text-sm">{error}</span>
                            </div>
                            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">✕</button>
                        </div>
                    </ScrollObserver>
                )}

                {activeJobId && (
                    <div className="animate-scale-in">
                        <JobProgress 
                            jobId={activeJobId} 
                            onComplete={() => {
                                setActiveJobId(null);
                                setLoadingAction(null);
                            }}
                            onCancel={() => {
                                setActiveJobId(null);
                                setLoadingAction(null);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* SECTION 3: Live Logs (Full Width) */}
            <ScrollObserver delay={300}>
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                            <h3 className="font-bold text-lg text-slate-800">Live Agent Activity</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 font-mono">
                            TERM.LOG
                        </span>
                    </div>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100/50 p-1">
                        <AgentActivityLog 
                            limit={5} 
                            refreshInterval={3000} 
                            typeFilter="researcher" 
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                </div>
            </ScrollObserver>
        </div>
    );
}
