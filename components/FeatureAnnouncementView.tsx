
import React, { useEffect, useState } from 'react';
import { FeatureAnnouncement, Writer } from '../types';
import WriterSelector from './WriterSelector';

export default function FeatureAnnouncementView() {
    const [items, setItems] = useState<FeatureAnnouncement[]>([]);
    const [writers, setWriters] = useState<Writer[]>([]);
    const [featureName, setFeatureName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedWriter, setSelectedWriter] = useState<number | string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchWriters();
        const interval = setInterval(fetchItems, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/agents/feature-announcement/list');
            const json = await res.json();
            if (json.success) setItems(json.data);
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/agents/feature-announcement/create', {
                method: 'POST',
                body: JSON.stringify({ 
                    featureName, 
                    description,
                    writerId: selectedWriter ? Number(selectedWriter) : undefined
                })
            });
            setFeatureName('');
            setDescription('');
            fetchItems();
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-page-enter w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Product Announcement Agent</h2>
                    <p className="text-slate-500 mt-2 text-lg">Create engaging announcements for new features and products</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Side */}
                <div className="lg:col-span-4 sticky top-8">
                    {/* Fixed Overflow Issue */}
                    <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 p-8 relative group">
                        <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -mr-10 -mt-10 pointer-events-none"></div>
                        </div>
                        
                        <h3 className="font-bold text-xl text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </span>
                            Create New Announcement
                        </h3>
                        
                        <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Feature / Product Name</label>
                                <input 
                                    required
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                    placeholder="e.g. New Mobile App Version"
                                    value={featureName}
                                    onChange={e => setFeatureName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Technical Description & Capabilities</label>
                                <textarea 
                                    required
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all min-h-[160px] font-medium placeholder-slate-400 leading-relaxed"
                                    placeholder="List key features, benefits, and important changes here..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Writer</label>
                                <WriterSelector 
                                    writers={writers}
                                    selectedId={selectedWriter}
                                    onChange={setSelectedWriter}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading || !featureName}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                        <span>Generate Announcement</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Side */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-800 text-xl">Recent Announcements</h3>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 flex flex-col items-center justify-center text-center hover:border-blue-300 transition-colors group">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-300">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <h4 className="text-xl font-bold text-slate-700 mb-2">No announcements yet</h4>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                                Enter your new product details in the form on the left to have AI write an engaging announcement for you.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {items.map((item, index) => (
                                <div key={item.id} className={`bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-card-hover transition-all group relative animate-card-enter stagger-${index % 5}`}>
                                    <div className="absolute top-6 right-6">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                                            item.status === 'processed' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'processed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                            {item.status === 'processed' ? 'Generated' : 'Processing'}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-4 pr-2">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-inner flex-shrink-0">
                                            {item.feature_name.charAt(0)}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-700 transition-colors">{item.feature_name}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2 pl-12">{item.description}</p>
                                            
                                            <div className="flex items-center gap-4 border-t border-slate-50 pt-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(item.created_at).toLocaleDateString('en-US')}
                                                </div>
                                                {item.status === 'processed' && (
                                                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors ml-auto flex items-center gap-1">
                                                        View Full Text
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
            </div>
        </div>
    );
}
