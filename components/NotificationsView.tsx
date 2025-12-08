import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

export default function NotificationsView() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            const json = await res.json();
            if (json.success) setNotifications(json.data.notifications);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch(e) { console.error(e); }
    };
    
    const markAllRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch(e) { console.error(e); }
    };

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-page-enter max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">آرشیو اعلان‌ها</h2>
                    <p className="text-slate-500">تاریخچه پیام‌های سیستم و وضعیت عملیات‌ها</p>
                </div>
                <button 
                    onClick={markAllRead}
                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    علامت‌گذاری همه به عنوان خوانده شده
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </div>
                        <p className="text-slate-500 font-bold text-lg">هیچ اعلانی یافت نشد</p>
                        <p className="text-slate-400 text-sm mt-2">اعلان‌های جدید سیستم در اینجا نمایش داده می‌شوند.</p>
                    </div>
                ) : (
                    notifications.map((notif, index) => (
                        <div 
                            key={notif.id} 
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className={`p-6 rounded-2xl border transition-all duration-300 relative group cursor-pointer animate-card-enter stagger-${index % 10} ${
                                notif.is_read 
                                ? 'bg-white border-slate-100 opacity-80 hover:opacity-100 hover:shadow-md hover:border-slate-200' 
                                : 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                        >
                            {!notif.is_read && (
                                <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-glow"></div>
                            )}
                            
                            <div className="flex gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                                    notif.type === 'success' ? 'bg-green-50 text-green-600' :
                                    notif.type === 'error' ? 'bg-red-50 text-red-600' :
                                    notif.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {notif.type === 'success' ? <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> :
                                     notif.type === 'error' ? <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> :
                                     <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                </div>
                                
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`text-lg font-bold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h4>
                                        <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            {new Date(notif.created_at).toLocaleString('fa-IR')}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed mb-4 text-base">{notif.message}</p>
                                    
                                    {notif.action_text && (
                                        <div className="flex justify-end pt-2">
                                            <a href={notif.action_url || '#'} className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                                                {notif.action_text}
                                                <svg className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}