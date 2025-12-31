
import React, { useEffect, useState, useRef } from 'react';
import { ResearchTask, Writer } from '../types';
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

export default function ResearchAgentView() {
    const [tasks, setTasks] = useState<ResearchTask[]>([]);
    const [writers, setWriters] = useState<Writer[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    
    // Form State
    const [prompt, setPrompt] = useState('');
    const [selectedWriter, setSelectedWriter] = useState<number | string>('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchWriters();
        fetchSuggestions();
        const interval = setInterval(fetchTasks, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/agents/research/tasks');
            if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                const json = await res.json();
                if (json.success) setTasks(json.data);
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

    const fetchSuggestions = async () => {
        setSuggestionsLoading(true);
        try {
            const res = await fetch('/api/agents/research/suggest');
            if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setSuggestions(json.data);
                }
            }
        } catch (e) { console.error(e); }
        setSuggestionsLoading(false);
    };

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/agents/research/start', {
                method: 'POST',
                body: JSON.stringify({ 
                    prompt, 
                    writerId: selectedWriter ? Number(selectedWriter) : undefined,
                    customInstructions
                })
            });
            setPrompt('');
            setCustomInstructions('');
            fetchTasks();
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="w-full space-y-12 pb-20">
            {/* Header */}
            <ScrollObserver>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200/60 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Research & Writer Agent</h2>
                        </div>
                        <p className="text-slate-500 text-lg font-medium pl-5 max-w-2xl">
                            Deploy autonomous agents to conduct deep-dive research and draft comprehensive reports tailored to your brand.
                        </p>
                    </div>
                </div>
            </ScrollObserver>

            {/* SECTION 1: Mission Control (Full Width) */}
            <ScrollObserver delay={100}>
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden group">
                    {/* Decorative Top Border */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 opacity-80"></div>
                    
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center shadow-sm border border-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 leading-tight">New Research Mission</h3>
                            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-0.5">Define Parameters</p>
                        </div>
                    </div>

                    <form onSubmit={handleStart}>
                        <div className="grid grid-cols-1 gap-10">
                            {/* Topic Input & Suggestions */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Research Topic</label>
                                
                                <div className="relative group/input">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-2xl opacity-0 group-hover/input:opacity-50 transition duration-500 blur"></div>
                                    <textarea 
                                        required
                                        className="relative w-full rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-5 text-slate-800 transition-all min-h-[100px] text-lg font-medium placeholder-slate-400 leading-relaxed shadow-inner"
                                        placeholder="e.g. The impact of Generative AI on Enterprise Software Development in 2025..."
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                    />
                                </div>

                                {/* AI Suggestions Carousel */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            AI Suggestions for You
                                        </span>
                                        <button 
                                            type="button" 
                                            onClick={fetchSuggestions} 
                                            className="text-[10px] text-slate-400 hover:text-blue-600 transition-colors"
                                            disabled={suggestionsLoading}
                                        >
                                            {suggestionsLoading ? 'Thinking...' : 'Refresh Ideas'}
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                        {suggestions.length > 0 ? (
                                            suggestions.map((sug, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setPrompt(sug)}
                                                    className="snap-start flex-shrink-0 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-700 transition-all shadow-sm text-left max-w-[250px] whitespace-normal group"
                                                >
                                                    <span className="line-clamp-2">{sug}</span>
                                                </button>
                                            ))
                                        ) : (
                                            [1,2,3].map(i => (
                                                <div key={i} className="flex-shrink-0 w-48 h-12 bg-slate-100 rounded-xl animate-pulse"></div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Writer */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Assigned Writer</label>
                                    <WriterSelector 
                                        writers={writers}
                                        selectedId={selectedWriter}
                                        onChange={setSelectedWriter}
                                        disabled={loading}
                                    />
                                </div>

                                {/* Custom Instructions */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Research Focus & Guidelines</label>
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none h-[88px] placeholder-slate-400 leading-relaxed shadow-inner"
                                        placeholder="Specific angles to cover, competitors to analyze, or tone adjustments..."
                                        value={customInstructions}
                                        onChange={e => setCustomInstructions(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <button 
                                type="submit" 
                                disabled={loading || !prompt}
                                className="w-full relative overflow-hidden group bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg py-4 shadow-xl shadow-slate-900/10 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                <div className="flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            <span>Initializing Agents...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                            <span>Launch Research Mission</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </ScrollObserver>

            {/* SECTION 2: Active Missions List */}
            <ScrollObserver delay={200}>
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                        <h3 className="font-bold text-lg text-slate-800">Active Missions</h3>
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">{tasks.length}</span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <p className="text-slate-500 font-bold">No research tasks running</p>
                            <p className="text-xs text-slate-400 mt-1">Start a new mission above to see real-time progress.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tasks.map((task, index) => {
                                const results = (task.results as any) || { progress: 0, logs: [] };
                                const isCompleted = task.status === 'completed';
                                const isFailed = task.status === 'failed';
                                const isRunning = !isCompleted && !isFailed;

                                return (
                                    <div key={task.id} className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-6 animate-card-enter stagger-${index % 5} hover:shadow-md transition-shadow relative overflow-hidden`}>
                                        {/* Status Line */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-blue-600'}`}></div>
                                        
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Left: Info */}
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{task.query}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                        isCompleted ? 'bg-green-50 text-green-600' : 
                                                        isFailed ? 'bg-red-50 text-red-600' : 
                                                        'bg-blue-50 text-blue-600'
                                                    }`}>
                                                        {isCompleted ? 'Done' : isFailed ? 'Failed' : 'Active'}
                                                    </span>
                                                </div>
                                                
                                                {/* Progress Bar */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-700 ease-out relative ${isFailed ? 'bg-red-500' : 'bg-blue-600'}`}
                                                            style={{ width: `${results.progress || 0}%` }}
                                                        >
                                                            {isRunning && <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]"></div>}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500 w-8 text-right">{results.progress}%</span>
                                                </div>

                                                <div className="text-xs text-slate-400 flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        {new Date(task.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    <span>•</span>
                                                    <span>ID: #{task.id}</span>
                                                </div>
                                            </div>

                                            {/* Right: Logs Terminal */}
                                            <div className="w-full md:w-80 bg-slate-50 rounded-xl border border-slate-200 p-3 h-32 flex flex-col">
                                                <div className="flex-grow overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
                                                    {results.logs?.slice().reverse().map((log: string, i: number) => (
                                                        <div key={i} className="text-[10px] font-mono text-slate-600 leading-tight flex gap-2">
                                                            <span className="text-blue-400 font-bold">›</span>
                                                            <span>{log}</span>
                                                        </div>
                                                    ))}
                                                    {results.logs?.length === 0 && <span className="text-[10px] text-slate-400 italic">Initializing agent...</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ScrollObserver>
        </div>
    );
}
