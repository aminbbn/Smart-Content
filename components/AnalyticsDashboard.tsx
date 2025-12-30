import React, { useEffect, useState } from 'react';
import { BlogTimelineChart, WriterPerformanceChart, StatusDistributionChart } from './Charts';

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulating data fetch with mock data to avoid 404 in sandbox
        const timer = setTimeout(() => {
            setData({
                totals: {
                    total_views: 12540,
                    total_posts: 45,
                    avg_views: 278
                },
                top_blogs: [
                    { title: "The Future of Generative AI in 2025", views: 1205, published_at: new Date().toISOString() },
                    { title: "10 Tips for Better Prompt Engineering", views: 980, published_at: new Date().toISOString() },
                    { title: "Why Python is winning the AI race", views: 850, published_at: new Date().toISOString() },
                    { title: "Smart Home Trends for Q4", views: 720, published_at: new Date().toISOString() },
                    { title: "Digital Marketing Strategies for Startups", views: 650, published_at: new Date().toISOString() }
                ],
                writer_performance: [
                    { name: "Sara Danish", total_views: 5400, post_count: 15 },
                    { name: "Ali Novin", total_views: 4200, post_count: 18 },
                    { name: "Dr. Ramin", total_views: 2940, post_count: 12 }
                ],
                recent_growth: Array.from({length: 10}, (_, i) => ({
                    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {month:'short', day:'numeric'}),
                    views: Math.floor(Math.random() * 500) + 100
                })).reverse(),
                content_status: [
                    { name: 'published', value: 25 },
                    { name: 'draft', value: 10 },
                    { name: 'scheduled', value: 5 }
                ],
                recent_drafts: [
                    { title: "Understanding Large Language Models", created_at: new Date().toISOString(), writer: "Sara Danish" },
                    { title: "React vs Vue: A 2024 Comparison", created_at: new Date().toISOString(), writer: "Ali Novin" },
                    { title: "Q3 Financial Report Summary", created_at: new Date().toISOString(), writer: "Dr. Ramin" }
                ]
            });
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Default empty state to prevent crashes and ensure rendering
    const safeData = data || {
        totals: { total_views: 0, total_posts: 0, avg_views: 0 },
        top_blogs: [],
        writer_performance: [],
        recent_growth: [],
        content_status: [],
        recent_drafts: []
    };

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center flex-col gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-400 font-medium text-sm">Loading statistics...</span>
        </div>
    );

    if (error && !data) return (
        <div className="flex h-96 w-full items-center justify-center flex-col gap-6 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm m-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-slate-700 mb-2">Something went wrong</p>
                <p className="text-sm text-slate-500">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-page-enter pb-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Analytics</h2>
                <p className="text-slate-500">Monitor content performance and user engagement</p>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-4xl font-bold text-slate-800 mb-1">{safeData.totals.total_views}</h3>
                    <p className="text-sm text-slate-500">Total Views</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
                    </div>
                    <h3 className="text-4xl font-bold text-slate-800 mb-1">{safeData.totals.total_posts}</h3>
                    <p className="text-sm text-slate-500">Content Created</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Fixed</span>
                    </div>
                    <h3 className="text-4xl font-bold text-slate-800 mb-1">{safeData.totals.avg_views}</h3>
                    <p className="text-sm text-slate-500">Avg Views</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Views Growth</h3>
                    <div className="h-[300px]">
                        <BlogTimelineChart data={safeData.recent_growth} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Content Status</h3>
                    <div className="h-[300px]">
                        <StatusDistributionChart data={safeData.content_status} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Posts */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Most Popular Articles</h3>
                    {safeData.top_blogs.length > 0 ? (
                        <div className="space-y-6">
                            {safeData.top_blogs.map((blog: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-sm">{i+1}</div>
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px] group-hover:text-blue-600 transition-colors">{blog.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full rounded-full" style={{width: `${Math.min(100, (blog.views / (safeData.top_blogs[0].views || 1)) * 100)}%`}}></div>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 w-12 text-left">{blog.views}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
                             <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             <span className="text-sm font-medium">No articles found</span>
                        </div>
                    )}
                </div>

                {/* Writer Performance */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Writer Performance</h3>
                    {safeData.writer_performance.length > 0 ? (
                        <div className="space-y-6">
                            {safeData.writer_performance.map((w: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">{w.name[0]}</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{w.name}</p>
                                            <p className="text-xs text-slate-400">{w.post_count} articles</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-slate-900">{w.total_views}</span>
                                        <span className="text-xs text-slate-400">Total Views</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100">
                             <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                             <span className="text-sm font-medium">No data available</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}