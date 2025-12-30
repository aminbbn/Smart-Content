
import React, { useEffect, useState } from 'react';
import { AgentJob, Writer } from '../types';
import JobProgress from './JobProgress';
import AgentActivityLog from './AgentActivityLog';
import WriterSelector from './WriterSelector';

export default function DailyNewsView() {
    const [loadingAction, setLoadingAction] = useState<'fetch' | 'generate-blog' | null>(null);
    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [writers, setWriters] = useState<Writer[]>([]);
    const [selectedWriter, setSelectedWriter] = useState<number | string>('');

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
                if (def) setSelectedWriter(def.id);
            }
        } catch (e) { console.error(e); }
    };

    const triggerAction = async (action: 'fetch' | 'generate-blog') => {
        if (loadingAction || activeJobId) return;
        
        setLoadingAction(action);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); 

        try {
            const body = action === 'generate-blog' ? { writerId: selectedWriter ? Number(selectedWriter) : undefined } : {};

            const res = await fetch(`/api/agents/daily-news/${action}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}`);
            }

            const json = await res.json();
            
            if (!json.success) {
                throw new Error(json.error || json.message || "Operation failed");
            }

            if (json.data?.jobId) {
                setActiveJobId(json.data.jobId);
                setRefreshTrigger(prev => prev + 1);
            } else {
                throw new Error("No Job ID returned from server");
            }

        } catch (e: any) { 
            console.error("Action failed:", e);
            if (e.name === 'AbortError') {
                setError("Timeout: Server took too long to respond.");
            } else {
                setError(e.message || "Connection failed");
            }
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="space-y-8 animate-page-enter w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Daily News Agent</h2>
                    <p className="text-slate-500 font-medium">Automatic news gathering and daily blog generation</p>
                </div>
                {(activeJobId || loadingAction) && (
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse border border-blue-200 shadow-sm">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-glow"></span>
                        {loadingAction ? 'Sending request...' : 'Agent is active...'}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-start justify-between animate-slide-in shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-full">
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <span className="font-bold block mb-1">Execution Error</span>
                            <span className="text-sm opacity-90">{error}</span>
                        </div>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Search Card */}
                <button 
                    onClick={() => triggerAction('fetch')}
                    disabled={loadingAction !== null || activeJobId !== null}
                    className={`relative p-8 rounded-3xl shadow-card transition-all duration-300 group text-left border flex flex-col h-full ${
                        (loadingAction || activeJobId) 
                        ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200' 
                        : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-card-hover hover:-translate-y-1'
                    }`}
                >
                    {/* Decoration Container */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full w-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-blue-100 rounded-2xl text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            </div>
                            {loadingAction === 'fetch' && <span className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">
                            {loadingAction === 'fetch' ? 'Connecting...' : 'Fetch New News'}
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm mb-6 flex-grow">
                            Search Google, extract headlines, and store industry-relevant news in the database.
                        </p>
                        
                        <div className="flex items-center text-blue-600 font-bold text-sm opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            Start Process
                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l7-7m0 0l-7-7m7 7H3" /></svg>
                        </div>
                    </div>
                </button>

                {/* Generate Blog Card */}
                <div 
                    className={`relative p-8 rounded-3xl shadow-card transition-all duration-300 border bg-white border-slate-100 hover:border-emerald-300 hover:shadow-card-hover group`}
                >
                     <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110 pointer-events-none"></div>
                     </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            {loadingAction === 'generate-blog' && <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">
                            {loadingAction === 'generate-blog' ? 'Requesting...' : 'Generate Daily Blog'}
                        </h3>
                        <p className="text-slate-500 leading-relaxed text-sm mb-4">
                            Analyze gathered news, select suitable writer, and draft a complete article.
                        </p>

                        <div className="mt-auto mb-4" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Select Writer</label>
                            <WriterSelector 
                                writers={writers}
                                selectedId={selectedWriter}
                                onChange={setSelectedWriter}
                                disabled={loadingAction !== null || activeJobId !== null}
                            />
                        </div>

                        <button
                            onClick={() => triggerAction('generate-blog')}
                            disabled={loadingAction !== null || activeJobId !== null}
                            className="flex items-center justify-center w-full py-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Generation Process
                            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l7-7m0 0l-7-7m7 7H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {activeJobId && (
                <div className="animate-slide-in">
                    <JobProgress 
                        jobId={activeJobId} 
                        onComplete={() => setActiveJobId(null)}
                        onCancel={() => setActiveJobId(null)}
                    />
                </div>
            )}

            <div className="pt-8 border-t border-slate-200">
                <AgentActivityLog 
                    limit={10} 
                    refreshInterval={3000} 
                    typeFilter="researcher" 
                    refreshTrigger={refreshTrigger}
                />
            </div>
        </div>
    );
}
