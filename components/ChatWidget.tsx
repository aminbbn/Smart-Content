
import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    error?: boolean;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { 
            id: 'init-1', 
            role: 'model', 
            text: 'Hello! 👋 I\'m the Smart Content AI. I can answer questions about features, pricing, or how to get started.', 
            timestamp: Date.now() 
        }
    ]);
    const [loading, setLoading] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current;
            scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, loading, isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userText = input.trim();
        const tempId = Date.now().toString();
        
        // Optimistic UI Update
        const userMsg: Message = { id: tempId, role: 'user', text: userText, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Safety Watchdog: 15s (Must be longer than backend 12s timeout)
        const safetyTimer = setTimeout(() => {
            setLoading(prevLoading => {
                if (prevLoading) {
                    setMessages(prev => [...prev, { 
                        id: Date.now().toString(), 
                        role: 'model', 
                        text: "I'm having trouble connecting to the server. Please check your internet or try again later.", 
                        timestamp: Date.now(),
                        error: true
                    }]);
                    return false;
                }
                return prevLoading;
            });
        }, 15000);

        try {
            // Prepare history: FILTER out errors and empty messages
            const history = messages
                .filter(m => !m.error && m.text && m.text.trim().length > 0)
                .slice(-6) // Keep only recent context
                .map(m => ({ 
                    role: m.role, 
                    text: m.text 
                }));
            
            const res = await fetch('/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    history: history
                })
            });

            clearTimeout(safetyTimer);

            if (!res.ok) {
                throw new Error(`Server Error (${res.status})`);
            }

            const json = await res.json();
            
            if (json.success && json.data?.reply) {
                setMessages(prev => [...prev, { 
                    id: Date.now().toString(), 
                    role: 'model', 
                    text: json.data.reply, 
                    timestamp: Date.now() 
                }]);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error: any) {
            console.error("Chat Error:", error);
            // Only add error message if the safety timer hasn't already handled it
            setLoading(prevLoading => {
                if (prevLoading) {
                     setMessages(prev => [...prev, { 
                        id: Date.now().toString(), 
                        role: 'model', 
                        text: "Connection failed. Please try again.", 
                        timestamp: Date.now(),
                        error: true
                    }]);
                    return false;
                }
                return false;
            });
        } finally {
            clearTimeout(safetyTimer);
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 font-sans pointer-events-none">
            {/* Chat Window Container */}
            <div 
                className={`w-[380px] max-w-[calc(100vw-32px)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-bottom-right transform pointer-events-auto ${
                    isOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
                }`}
            >
                <div className="bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col h-[600px] max-h-[80vh] ring-1 ring-black/5">
                    
                    {/* Header */}
                    <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center shadow-lg relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 mix-blend-overlay"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-glow">
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SmartSupport" alt="Bot" className="w-full h-full scale-90" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">Support Assistant</h3>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    <p className="text-[10px] font-medium uppercase tracking-wider">Online</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white backdrop-blur-sm"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div 
                        className="flex-grow overflow-y-auto px-5 py-6 space-y-6 bg-slate-50/50 scroll-smooth relative" 
                        ref={scrollRef}
                    >
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                            >
                                <div 
                                    className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm relative group transition-all duration-200 ${
                                        msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-[1.25rem] rounded-br-sm' 
                                        : msg.error
                                            ? 'bg-red-50 text-red-600 border border-red-200 rounded-[1.25rem] rounded-bl-sm'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-[1.25rem] rounded-bl-sm'
                                    }`}
                                >
                                    {msg.text}
                                    <span className={`text-[9px] font-medium absolute -bottom-5 ${msg.role === 'user' ? 'right-0 text-slate-400' : 'left-0 text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap delay-75`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white border border-slate-100 rounded-[1.25rem] rounded-bl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5 h-[46px]">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                        <form 
                            onSubmit={handleSend}
                            className="relative flex items-center group"
                        >
                            <input 
                                ref={inputRef}
                                type="text" 
                                placeholder="Type your question..." 
                                className="w-full bg-slate-50 text-slate-800 text-sm font-medium px-5 py-3.5 pr-14 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] outline-none transition-all placeholder:text-slate-400"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || loading}
                                className={`absolute right-2 p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
                                    !input.trim() || loading 
                                    ? 'bg-transparent text-slate-300 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95'
                                }`}
                            >
                                {loading ? (
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                )}
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <p className="text-[10px] text-slate-400 font-medium">Powered by Gemini Pro • Answers may vary</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Launcher Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 pointer-events-auto relative overflow-hidden group z-[100] ${
                    isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 animate-[float_4s_ease-in-out_infinite]'
                }`}
            >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? (
                    <svg className="w-6 h-6 text-white transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="w-8 h-8 text-white transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                )}
                {!isOpen && <span className="absolute top-0 right-0 flex h-4 w-4 transform -translate-y-1 translate-x-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                </span>}
            </button>
        </div>
    );
}
