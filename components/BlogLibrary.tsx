
import React, { useEffect, useState } from 'react';
import { Blog } from '../types';
import { formatDate } from '../utils/helpers';
import BlogEditor from './BlogEditor';

export default function BlogLibrary() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [filter, setFilter] = useState('all');

    // Scheduling State
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [scheduleTarget, setScheduleTarget] = useState<Blog | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('09:00');
    const [scheduling, setScheduling] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blogs');
            if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
                const json = await res.json();
                if (json.success) setBlogs(json.data);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handlePublish = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm('Are you sure you want to publish this article immediately?')) return;
        try {
            await fetch(`/api/blogs/${id}/publish`, { method: 'POST' });
            fetchBlogs();
        } catch(e) { console.error(e); }
    };

    const openScheduleModal = (blog: Blog, e: React.MouseEvent) => {
        e.stopPropagation();
        setScheduleTarget(blog);
        // Default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduleDate(tomorrow.toISOString().split('T')[0]);
        setIsScheduleOpen(true);
    };

    const submitSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleTarget || !scheduleDate) return;

        setScheduling(true);
        try {
            const dateTime = new Date(`${scheduleDate}T${scheduleTime}`);
            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blog_id: scheduleTarget.id,
                    scheduled_date: dateTime.toISOString()
                })
            });
            setIsScheduleOpen(false);
            fetchBlogs();
        } catch(e) { console.error(e); }
        setScheduling(false);
    };

    const handleSave = () => {
        fetchBlogs();
    };

    const filteredBlogs = blogs.filter(b => filter === 'all' || b.status === filter);

    if (selectedBlog) {
        return <BlogEditor blog={selectedBlog} onClose={() => setSelectedBlog(null)} onSave={handleSave} />;
    }

    return (
        <div className="space-y-8 animate-page-enter relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Library</h2>
                    <p className="text-slate-500">Manage, edit, and publish your generated articles</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter('published')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'published' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Published
                    </button>
                    <button 
                        onClick={() => setFilter('draft')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'draft' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Drafts
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.length === 0 ? (
                        <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-400 text-lg">No articles found</p>
                        </div>
                    ) : filteredBlogs.map((blog, index) => (
                        <div 
                            key={blog.id} 
                            onClick={() => setSelectedBlog(blog)}
                            className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group animate-card-enter stagger-${index % 5}`}
                        >
                            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                        blog.status === 'published' ? 'bg-green-100 text-green-700' :
                                        blog.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                                        'bg-blue-100 text-blue-700'
                                    }`}>
                                        {blog.status === 'published' ? 'Published' : blog.status === 'draft' ? 'Draft' : 'Scheduled'}
                                    </span>
                                </div>
                                <div className="absolute -bottom-6 left-6">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center text-xl font-bold text-slate-300 border border-slate-50">
                                        {(blog as any).writer_name?.[0] || 'A'}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 pt-8">
                                <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{blog.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        {(blog as any).writer_name || 'Anonymous'}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(blog.created_at).toLocaleDateString('en-US')}</span>
                                </div>
                                
                                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                                    <div className="text-xs font-bold text-slate-500">
                                        {blog.views} Views
                                    </div>
                                    <div className="flex gap-2">
                                        {blog.status === 'draft' && (
                                            <>
                                                <button 
                                                    onClick={(e) => handlePublish(blog.id, e)}
                                                    className="px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                                >
                                                    Publish
                                                </button>
                                                <button 
                                                    onClick={(e) => openScheduleModal(blog, e)}
                                                    className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                                    title="Schedule"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </button>
                                            </>
                                        )}
                                        <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Schedule Modal */}
            {isScheduleOpen && scheduleTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Schedule Article</h3>
                            <button onClick={() => setIsScheduleOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={submitSchedule} className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-bold text-slate-800 mb-4 line-clamp-1">"{scheduleTarget.title}"</p>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm font-medium"
                                    value={scheduleDate}
                                    onChange={e => setScheduleDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    required
                                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none text-sm font-medium"
                                    value={scheduleTime}
                                    onChange={e => setScheduleTime(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={scheduling}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
