
import React, { useEffect, useState, useRef } from 'react';
import { Notification } from '../types';

interface Props {
    align?: 'left' | 'right';
    onViewArchive?: () => void;
}

export default function NotificationCenter({ align = 'right', onViewArchive }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        
        // Click outside handler
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const json = await res.json();
            if (json.success) {
                setNotifications(json.data.notifications);
                setUnreadCount(json.data.unreadCount);
            }
        } catch (e) { console.error(e); }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            fetchNotifications();
        } catch (e) { console.error(e); }
    };

    const toggleOpen = () => {
        if (!isOpen && unreadCount > 0) {
            markAllRead();
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button 
                onClick={toggleOpen}
                className={`relative p-3 rounded-2xl transition-all duration-300 group ${
                    isOpen 
                    ? 'bg-blue-100 text-blue-600 shadow-inner' 
                    : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-transparent hover:border-slate-100 hover:shadow-sm'
                }`}
            >
                <svg className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    className={`absolute top-full mt-4 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/20 ring-1 ring-black/5 z-[100] overflow-hidden animate-card-enter transform origin-top ${
                        align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
                    }`}
                >
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                            {unreadCount > 0 && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                        </div>
                        <button 
                            onClick={markAllRead} 
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Mark all read
                        </button>
                    </div>
                    
                    <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </div>
                                <p className="text-sm font-medium">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 transition-all duration-200 hover:bg-slate-50 relative group ${
                                            notif.is_read ? 'opacity-60 hover:opacity-100' : 'bg-blue-50/20'
                                        }`}
                                    >
                                        {!notif.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
                                        )}
                                        <div className="flex gap-4">
                                            <div className={`mt-1.5 w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                                                notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                                notif.type === 'error' ? 'bg-red-100 text-red-600' :
                                                notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {notif.type === 'success' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> :
                                                 notif.type === 'error' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> :
                                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                                                        {new Date(notif.created_at).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-2.5">{notif.message}</p>
                                                {notif.action_text && (
                                                    <button className="text-xs bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-1">
                                                        {notif.action_text}
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                if (onViewArchive) onViewArchive();
                            }}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider w-full py-1 hover:bg-slate-100 rounded-lg"
                        >
                            View Full Archive
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
