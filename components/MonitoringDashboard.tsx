import React, { useEffect, useState } from 'react';

export default function MonitoringDashboard() {
    const [health, setHealth] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [healthRes, metricsRes] = await Promise.all([
                fetch('/api/monitoring/health'),
                fetch('/api/monitoring/metrics')
            ]);
            
            if (!healthRes.ok || !metricsRes.ok) {
                 throw new Error('خطا در دریافت اطلاعات مانیتورینگ');
            }

            const healthJson = await healthRes.json();
            const metricsJson = await metricsRes.json();

            if (healthJson.success) setHealth(healthJson.data);
            if (metricsJson.success) setMetrics(metricsJson.data);
            
            if (!healthJson.success || !metricsJson.success) {
                console.warn('Partial monitoring data received');
            }

        } catch (e: any) { 
            console.error(e); 
            setError(e.message || 'خطا در برقراری ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Default values to ensure render matches UI expectations
    const safeHealth = health || {
        status: 'unknown',
        uptime: 0,
        components: {
            database: { status: 'unknown', latency_ms: 0 },
            api: { status: 'unknown' }
        }
    };

    const safeMetrics = metrics || {
        jobs: [],
        content: { total_blogs: 0, total_news: 0, total_research: 0 },
        failures: []
    };

    if (loading && !health && !metrics) return (
        <div className="flex h-64 w-full items-center justify-center flex-col gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-400 font-medium text-sm">در حال بررسی وضعیت سیستم...</span>
        </div>
    );

    if (error && !health && !metrics) return (
        <div className="flex h-96 w-full items-center justify-center flex-col gap-6 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm m-4">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-slate-700 mb-2">خطا در سیستم مانیتورینگ</p>
                <p className="text-sm text-slate-500">{error}</p>
            </div>
            <button 
                onClick={fetchData} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                تلاش مجدد
            </button>
        </div>
    );

    const isHealthy = safeHealth.status === 'healthy';

    return (
        <div className="space-y-8 animate-page-enter pb-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">مانیتورینگ سیستم</h2>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </span>
                    <p className={`text-sm font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                        {isHealthy ? 'سیستم فعال و سالم است' : 'سیستم دارای اختلال است'}
                    </p>
                </div>
            </div>

            {/* System Status Banner */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="border-l border-slate-700 pl-8">
                        <p className="text-slate-400 text-sm mb-1">زمان فعالیت (Uptime)</p>
                        <h3 className="text-3xl font-bold font-mono">{Math.floor(safeHealth.uptime / 60)}m</h3>
                    </div>
                    <div className="border-l border-slate-700 pl-8">
                        <p className="text-slate-400 text-sm mb-1">پاسخگویی دیتابیس</p>
                        <h3 className={`text-3xl font-bold font-mono ${safeHealth.components.database.latency_ms < 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {safeHealth.components.database.latency_ms}ms
                        </h3>
                    </div>
                    <div className="border-l border-slate-700 pl-8">
                        <p className="text-slate-400 text-sm mb-1">وضعیت API</p>
                        <h3 className="text-xl font-bold text-blue-400">{safeHealth.components.api.status}</h3>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">آخرین بررسی</p>
                        <h3 className="text-lg font-bold font-mono">{new Date().toLocaleTimeString('fa-IR')}</h3>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">آمار منابع</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">مقالات خبری ذخیره شده</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{safeMetrics.content.total_news}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${Math.min(100, safeMetrics.content.total_news * 2)}%`}}></div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">وبلاگ‌های تولید شده</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{safeMetrics.content.total_blogs}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${Math.min(100, safeMetrics.content.total_blogs * 5)}%`}}></div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 font-medium">تسک‌های تحقیق</span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{safeMetrics.content.total_research}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: `${Math.min(100, safeMetrics.content.total_research * 5)}%`}}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-6">وضعیت جاب‌های ایجنت</h3>
                    <div className="flex flex-wrap gap-4 mb-6">
                        {safeMetrics.jobs.length > 0 ? safeMetrics.jobs.map((job: any) => (
                            <div key={job.status} className={`flex-1 min-w-[100px] p-4 rounded-xl border text-center ${
                                job.status === 'success' ? 'bg-green-50 border-green-100 text-green-700' :
                                job.status === 'failed' ? 'bg-red-50 border-red-100 text-red-700' : 
                                'bg-blue-50 border-blue-100 text-blue-700'
                            }`}>
                                <span className="block text-xs font-bold uppercase mb-2 opacity-70">{job.status}</span>
                                <span className="text-3xl font-bold">{job.count}</span>
                            </div>
                        )) : (
                            <div className="w-full text-center text-slate-400 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                هنوز هیچ جابی اجرا نشده است
                            </div>
                        )}
                    </div>
                    {safeMetrics.failures.length > 0 ? (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                آخرین خطاها
                            </h4>
                            <div className="space-y-2">
                                {safeMetrics.failures.slice(0, 3).map((fail: any) => (
                                    <div key={fail.id} className="text-xs text-red-600 font-mono truncate border-b border-red-100 pb-1 last:border-0">
                                        [{new Date(fail.started_at).toLocaleTimeString()}] {fail.agent_type}: {(fail.logs || '').substring(0, 50)}...
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                         <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center justify-center text-green-700 text-sm font-bold gap-2">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             هیچ خطایی ثبت نشده است
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
}