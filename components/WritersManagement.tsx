
import React, { useEffect, useState } from 'react';
import { Writer } from '../types';

interface WriterUI extends Omit<Writer, 'personality' | 'style'> {
  personality: any;
  style: any;
}

export default function WritersManagement() {
    const [writers, setWriters] = useState<WriterUI[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editWriter, setEditWriter] = useState<Partial<WriterUI> | null>(null);

    const emptyWriter = {
        name: '',
        bio: '',
        personality: { traits: [] },
        style: { sentence_length: 'medium', vocabulary: 'standard' },
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random()
    };

    useEffect(() => {
        fetchWriters();
    }, []);

    const fetchWriters = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/writers');
            const json = await res.json();
            if (json.success) setWriters(json.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this writer?')) return;
        try {
            await fetch(`/api/writers/${id}`, { method: 'DELETE' });
            fetchWriters();
        } catch(e) { console.error(e); }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await fetch(`/api/writers/${id}/set-default`, { method: 'POST' });
            fetchWriters();
        } catch(e) { console.error(e); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const method = editWriter?.id ? 'PUT' : 'POST';
        const url = editWriter?.id ? `/api/writers/${editWriter.id}` : '/api/writers';
        
        try {
            await fetch(url, {
                method,
                body: JSON.stringify(editWriter)
            });
            setIsModalOpen(false);
            fetchWriters();
        } catch(e) { console.error(e); }
        setSaving(false);
    };

    const openModal = (writer: Partial<WriterUI> | null = null) => {
        setEditWriter(writer ? writer : { ...emptyWriter, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}` });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-page-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Writers Management</h2>
                    <p className="text-slate-500">Define different personas for content generation</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add New Writer
                </button>
            </div>

            {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {writers.map((writer, index) => (
                        <div key={writer.id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col hover:shadow-md transition-all animate-card-enter stagger-${index % 5} relative overflow-hidden group ${writer.is_default ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-100'}`}>
                            {writer.is_default ? (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                    Default
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleSetDefault(writer.id)}
                                    className="absolute top-3 right-3 text-slate-300 hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Set as Default"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                </button>
                            )}

                            <div className="flex items-start gap-4 mb-4">
                                <img src={writer.avatar_url} alt={writer.name} className="w-16 h-16 rounded-2xl bg-slate-100 object-cover" />
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{writer.name}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(writer.personality as any).traits?.slice(0, 2).map((t: string, i: number) => (
                                            <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-grow">{writer.bio}</p>
                            
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                                <button 
                                    onClick={() => openModal(writer)}
                                    className="py-2.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(writer.id)}
                                    className="py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editWriter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editWriter.id ? 'Edit Writer' : 'New Writer'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Writer Name</label>
                                <input 
                                    required
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                    value={editWriter.name}
                                    onChange={e => setEditWriter({...editWriter, name: e.target.value})}
                                    placeholder="e.g. John Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Bio & Style</label>
                                <textarea 
                                    required
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-4 text-slate-800 transition-all font-medium placeholder-slate-400 min-h-[120px]"
                                    value={editWriter.bio}
                                    onChange={e => setEditWriter({...editWriter, bio: e.target.value})}
                                    placeholder="Describe this writer's style and background..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Personality Traits (comma separated)</label>
                                <input 
                                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 px-4 py-3 text-slate-800 transition-all font-bold placeholder-slate-400"
                                    value={(editWriter.personality as any).traits?.join(', ') || ''}
                                    onChange={e => setEditWriter({
                                        ...editWriter, 
                                        personality: { traits: e.target.value.split(',').map(t => t.trim()) }
                                    })}
                                    placeholder="e.g. Precise, Witty, Formal"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        editWriter.id ? 'Save Changes' : 'Add Writer'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
