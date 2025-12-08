import React, { useEffect, useState } from 'react';
import { Blog } from '../types';
import { formatDate } from '../utils/helpers';
import BlogEditor from './BlogEditor';

export default function BlogLibrary() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blogs');
            const json = await res.json();
            if (json.success) setBlogs(json.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handlePublish = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm('آیا از انتشار این مقاله مطمئن هستید؟')) return;
        try {
            await fetch(`/api/blogs/${id}/publish`, { method: 'POST' });
            fetchBlogs();
        } catch(e) { console.error(e); }
    };

    const handleSave = () => {
        fetchBlogs();
    };

    const filteredBlogs = blogs.filter(b => filter === 'all' || b.status === filter);

    if (selectedBlog) {
        return <BlogEditor blog={selectedBlog} onClose={() => setSelectedBlog(null)} onSave={handleSave} />;
    }

    return (
        <div className="space-y-8 animate-page-enter">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">کتابخانه محتوا</h2>
                    <p className="text-slate-500">مدیریت، ویرایش و انتشار مقالات تولید شده</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        همه
                    </button>
                    <button 
                        onClick={() => setFilter('published')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'published' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        منتشر شده
                    </button>
                    <button 
                        onClick={() => setFilter('draft')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'draft' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        پیش‌نویس
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
                            <p className="text-slate-400 text-lg">مقاله‌ای یافت نشد</p>
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
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {blog.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
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
                                        {(blog as any).writer_name || 'ناشناس'}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDate(blog.created_at)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                                    <div className="text-xs font-bold text-slate-500">
                                        {blog.views} بازدید
                                    </div>
                                    <div className="flex gap-2">
                                        {blog.status !== 'published' && (
                                            <button 
                                                onClick={(e) => handlePublish(blog.id, e)}
                                                className="px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                انتشار
                                            </button>
                                        )}
                                        <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                            ویرایش
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}