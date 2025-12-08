import React, { useEffect, useState } from 'react';
import { ContentCalendar as CalendarType } from '../types';

export default function ContentCalendar() {
    const [events, setEvents] = useState<CalendarType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCalendar();
    }, []);

    const fetchCalendar = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/calendar');
            const json = await res.json();
            if (json.success) setEvents(json.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // Use simulated dates for demo visualization since we lack real dates in DB often
    const today = new Date();
    const currentMonth = today.toLocaleDateString('fa-IR', { month: 'long', year: 'numeric' });
    const daysInMonth = 30;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-6 animate-page-enter">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">تقویم محتوایی</h2>
                    <p className="text-slate-500">برنامه‌ریزی زمانی انتشار مطالب</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">ماهانه</button>
                    <button className="px-4 py-2 text-slate-500 hover:text-slate-700 rounded-lg text-sm font-bold">هفتگی</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-slate-800">{currentMonth}</h3>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4 text-center mb-6">
                    {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'].map(d => (
                        <div key={d} className="font-bold text-slate-400 text-sm">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-4">
                    {days.map(day => {
                        // Find events for this day
                        const dayEvents = events.filter(e => {
                            const date = new Date(e.scheduled_date);
                            return date.getDate() === day;
                        });
                        
                        const isToday = day === today.getDate();

                        return (
                            <div 
                                key={day} 
                                className={`min-h-[120px] rounded-xl border p-3 transition-all group relative ${
                                    isToday ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                                }`}
                            >
                                <span className={`text-sm font-bold mb-2 block ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{day}</span>
                                
                                <div className="space-y-2">
                                    {dayEvents.map(ev => (
                                        <div key={ev.id} className="bg-blue-100 text-blue-700 text-[10px] p-1.5 rounded font-bold truncate cursor-pointer hover:bg-blue-200 transition-colors">
                                            {ev.title || 'بدون عنوان'}
                                        </div>
                                    ))}
                                    {/* Simulated Event for Demo */}
                                    {day === 12 && <div className="bg-purple-100 text-purple-700 text-[10px] p-1.5 rounded font-bold truncate">رونمایی محصول</div>}
                                </div>

                                <button className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-slate-100 text-slate-400 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex hover:bg-blue-500 hover:text-white">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}