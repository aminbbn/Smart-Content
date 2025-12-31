import React, { useEffect, useState } from 'react';
import { ContentCalendar as CalendarType, Blog } from '../types';

export default function ContentCalendar() {
    const [events, setEvents] = useState<CalendarType[]>([]);
    const [drafts, setDrafts] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedBlogId, setSelectedBlogId] = useState<number | string>('');
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [searchQuery, setSearchQuery] = useState('');
    const [scheduling, setScheduling] = useState(false);

    useEffect(() => {
        fetchCalendar();
        fetchDrafts();
    }, [currentDate]); 

    const fetchCalendar = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/calendar');
            const json = await res.json();
            if (json.success) setEvents(json.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const fetchDrafts = async () => {
        try {
            const res = await fetch('/api/blogs?status=draft');
            const json = await res.json();
            if (json.success) setDrafts(json.data);
        } catch (e) { console.error(e); }
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        setIsModalOpen(true);
        setSearchQuery('');
        setSelectedBlogId('');
        setSelectedTime('09:00');
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBlogId || !selectedDate) return;

        setScheduling(true);
        try {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const scheduledDateTime = new Date(selectedDate);
            scheduledDateTime.setHours(hours, minutes);

            await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blog_id: Number(selectedBlogId),
                    scheduled_date: scheduledDateTime.toISOString()
                })
            });
            
            setIsModalOpen(false);
            fetchCalendar(); 
            fetchDrafts(); 
        } catch (error) {
            console.error('Scheduling failed', error);
        }
        setScheduling(false);
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const filteredDrafts = drafts.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6 animate-page-enter relative pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Content Calendar</h2>
                    <p className="text-slate-500">Plan your publishing schedule</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-bold text-slate-800 min-w-[140px] text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 auto-rows-fr">
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="min-h-[140px] bg-slate-50/30 border-b border-r border-slate-100 last:border-r-0"></div>
                    ))}
                    
                    {days.map(day => {
                        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                        const dayEvents = events.filter(e => new Date(e.scheduled_date).toDateString() === dateStr);
                        const isToday = new Date().toDateString() === dateStr;

                        return (
                            <div 
                                key={day} 
                                className={`min-h-[140px] border-b border-r border-slate-100 p-3 relative group transition-all hover:bg-slate-50 ${isToday ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                                        isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-700'
                                    }`}>
                                        {day}
                                    </span>
                                    <button 
                                        onClick={() => handleDayClick(day)}
                                        className="text-slate-300 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100"
                                        title="Add Schedule"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    {dayEvents.map(ev => (
                                        <div key={ev.id} className="bg-white border border-blue-100 text-slate-700 shadow-sm p-2 rounded-lg text-xs font-medium truncate flex items-center gap-1.5 group/event hover:border-blue-300 transition-colors cursor-default">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <span className="truncate">{ev.title || 'Untitled'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Enhanced Scheduling Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-5xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100 flex flex-col h-[85vh] md:h-auto md:max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-2xl text-slate-800 tracking-tight">Schedule Content</h3>
                                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                            {/* Left Side: Draft Browser */}
                            <div className="flex-1 flex flex-col p-6 border-r border-slate-100 bg-slate-50/50 overflow-hidden">
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Available Drafts</label>
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            placeholder="Search by title..." 
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-800 placeholder-slate-400 shadow-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                </div>
                                
                                <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                    {filteredDrafts.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <p className="text-sm font-medium">No drafts matching your search.</p>
                                        </div>
                                    ) : (
                                        filteredDrafts.map(draft => (
                                            <div 
                                                key={draft.id}
                                                onClick={() => setSelectedBlogId(draft.id)}
                                                className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group relative ${
                                                    selectedBlogId === draft.id 
                                                    ? 'bg-white border-blue-500 shadow-lg ring-1 ring-blue-500/20 z-10' 
                                                    : 'bg-white border-transparent hover:border-blue-200 shadow-sm hover:shadow-md'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-grow">
                                                        <h4 className={`font-bold text-sm mb-1 leading-snug ${selectedBlogId === draft.id ? 'text-blue-700' : 'text-slate-800'}`}>
                                                            {draft.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{(draft as any).writer_name || 'AI Assistant'}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{new Date(draft.created_at).toLocaleDateString()}</span>
                                                        </p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                        selectedBlogId === draft.id ? 'border-blue-500 bg-blue-500' : 'border-slate-200 bg-slate-50 group-hover:border-blue-300'
                                                    }`}>
                                                        {selectedBlogId === draft.id && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Configuration */}
                            <div className="w-full lg:w-96 p-6 bg-white flex flex-col flex-shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.03)] z-10">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    Publishing Details
                                </h4>

                                <form onSubmit={handleSchedule} className="flex flex-col h-full">
                                    <div className="space-y-6 flex-grow">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selected Date</label>
                                            <div className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold flex items-center gap-3">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Publish Time</label>
                                            <div className="relative">
                                                <input 
                                                    type="time" 
                                                    className="w-full px-4 py-3.5 pl-12 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 shadow-sm"
                                                    value={selectedTime}
                                                    onChange={(e) => setSelectedTime(e.target.value)}
                                                />
                                                <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                                The selected blog will be automatically published to your connected channels at the specified time.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                        <button 
                                            type="submit"
                                            disabled={!selectedBlogId || scheduling}
                                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
                                        >
                                            {scheduling ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Confirm Schedule
                                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}