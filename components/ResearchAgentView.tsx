import React, { useEffect, useState } from 'react';
import { ResearchTask, Writer } from '../types';
import WriterSelector from './WriterSelector';

export default function ResearchAgentView() {
    const [tasks, setTasks] = useState<ResearchTask[]>([]);
    const [writers, setWriters] = useState<Writer[]>([]);
    const [prompt, setPrompt] = useState('');
    const [selectedWriter, setSelectedWriter] = useState<number | string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchWriters();
        const interval = setInterval(fetchTasks, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/agents/research/tasks');
            const json = await res.json();
            if (json.success) setTasks(json.data);
        } catch (e) { console.error(e); }
    };

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

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/agents/research/start', {
                method: 'POST',
                body: JSON.stringify({ 
                    prompt, 
                    writerId: selectedWriter ? Number(selectedWriter) : undefined 
                })
            });
            setPrompt('');
            fetchTasks();
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-page-enter w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">ایجنت محقق و نویسنده</h2>
                    <p className="text-slate-500 mt-2 text-lg">تحقیق عمیق و نگارش مقاله تخصصی با نویسنده انتخابی</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Side */}
                <div className="lg:col-span-5 sticky top-8">
                    {/* Fixed Overflow Issue: Moved decoration to absolute bg div, removed overflow-hidden from main card */}
                    <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative group">
                         <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -mr-10 -mt-10 transition-transform group-hover:scale-105"></div>
                         </div>
                        
                        <h3 className="font-bold text-xl text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </span>
                            شروع ماموریت جدید
                        </h3>
                        
                        <form onSubmit={handleStart} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">موضوع تحقیق و نگارش</label>
                                <textarea 
                                    required
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[160px] font-medium placeholder-slate-400 leading-relaxed"
                                    placeholder="مثلا: تاثیر هوش مصنوعی مولد بر آینده صنعت برنامه‌نویسی..."
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">نویسنده مسئول</label>
                                <WriterSelector 
                                    writers={writers}
                                    selectedId={selectedWriter}
                                    onChange={setSelectedWriter}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !prompt}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>در حال پردازش...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        <span>شروع فرآیند تحقیق</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Side */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-800 text-xl">ماموریت‌های فعال</h3>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{tasks.length}</span>
                    </div>
                    
                    {tasks.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center text-center">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <p className="text-slate-500 font-bold">هنوز تحقیقی ثبت نشده است</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {tasks.map((task, index) => {
                                const results = (task.results as any) || { progress: 0, logs: [] };
                                return (
                                    <div key={task.id} className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-card-enter stagger-${index % 5} hover:shadow-md transition-shadow`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-slate-800 text-lg line-clamp-1 w-3/4">{task.query}</h4>
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                                                task.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                task.status === 'failed' ? 'bg-red-100 text-red-700' : 
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></span>
                                                {task.status === 'completed' ? 'تکمیل شده' : task.status === 'failed' ? 'خطا' : 'در حال اجرا'}
                                            </span>
                                        </div>
                                        
                                        <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-700 ease-out ${task.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                style={{ width: `${results.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        
                                        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 font-mono h-32 overflow-y-auto custom-scrollbar border border-slate-200/50">
                                            {results.logs?.slice().reverse().map((log: string, i: number) => (
                                                <div key={i} className="mb-2 last:mb-0 border-b border-slate-200/50 pb-2 last:border-0 last:pb-0 flex gap-2">
                                                    <span className="text-blue-400 font-bold">›</span>
                                                    <span>{log}</span>
                                                </div>
                                            ))}
                                            {results.logs?.length === 0 && <span className="text-slate-400">در انتظار شروع...</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}