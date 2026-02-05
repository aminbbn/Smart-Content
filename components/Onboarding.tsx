
import React, { useState, useEffect } from 'react';

interface OnboardingProps {
    onComplete: () => void;
}

// --- Text Animation Component ---
const StaggeredText = ({ text, className = "", delay = 0, isTitle = false }: { text: string, className?: string, delay?: number, isTitle?: boolean }) => {
    const words = text.split(" ");
    return (
        <div className={`flex flex-wrap gap-x-[0.3em] ${className}`}>
            {words.map((word, i) => (
                <span 
                    key={i} 
                    className="inline-block opacity-0 animate-[text-blur-in_0.8s_cubic-bezier(0.2,0.9,0.2,1)_forwards]"
                    style={{ animationDelay: `${delay + (i * (isTitle ? 0.1 : 0.03))}s` }}
                >
                    {word}
                </span>
            ))}
        </div>
    );
};

// --- Visual Components ---

const VisualOverview = () => (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
        <style>{`
            @keyframes draw-line {
                0% { stroke-dashoffset: 100; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes bar-fill {
                0% { height: 0; }
                100% { height: var(--h); }
            }
        `}</style>
        
        {/* Background Blobs with complex movement */}
        <div className="absolute top-0 left-10 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute top-10 right-10 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-[float_10s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute -bottom-8 left-20 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-[float_12s_ease-in-out_infinite_1s]"></div>

        {/* Main Interface Mockup */}
        <div className="relative w-72 h-52 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 flex flex-col overflow-hidden transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-transform duration-1000 ease-out z-10 animate-[float_6s_ease-in-out_infinite]">
            {/* Header */}
            <div className="h-10 bg-slate-50/50 border-b border-slate-100 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                </div>
                <div className="ml-auto w-20 h-2 bg-slate-200 rounded-full opacity-50"></div>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-5 flex-1 relative overflow-hidden">
                {/* Simulated Chart */}
                <div className="absolute bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M0 40 L0 30 Q10 20 20 30 T40 25 T60 15 T80 20 T100 5 L100 40 Z" fill="url(#grad1)" />
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="flex gap-4 items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-bold text-xs animate-[pop-in_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_0.5s_both]">AI</div>
                    <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-3/4 bg-slate-200 rounded-full animate-[width-grow_1s_ease-out_0.6s_both]"></div>
                        <div className="h-2.5 w-1/2 bg-slate-100 rounded-full animate-[width-grow_1s_ease-out_0.8s_both]"></div>
                    </div>
                </div>

                {/* Animated Bars */}
                <div className="flex items-end gap-2 h-16 mt-2 ml-1">
                    {[40, 70, 50, 90, 60, 80].map((h, i) => (
                        <div 
                            key={i} 
                            className="flex-1 bg-slate-100 rounded-t-sm relative overflow-hidden group"
                        >
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-blue-500/80 rounded-t-sm transition-all duration-1000"
                                style={{ 
                                    height: `${h}%`,
                                    animation: `bar-fill 1s cubic-bezier(0.4, 0, 0.2, 1) ${1 + (i * 0.1)}s both`
                                }}
                            ></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Floating Stat Card */}
        <div className="absolute top-16 -right-6 bg-white/90 backdrop-blur p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 z-20 animate-[float_5s_ease-in-out_infinite_1s]">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Efficiency</div>
                    <div className="text-sm font-bold text-slate-800">+145%</div>
                </div>
            </div>
        </div>
    </div>
);

const VisualNews = () => (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
        {/* Radar Sweep Animation */}
        <style>{`
            @keyframes radar-sweep {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes blip {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(2); opacity: 0; }
            }
        `}</style>

        {/* Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-[300px] h-[300px] border border-slate-200 rounded-full absolute"></div>
            <div className="w-[200px] h-[200px] border border-slate-200 rounded-full absolute"></div>
            <div className="w-[100px] h-[100px] border border-slate-200 rounded-full absolute"></div>
            <div className="w-full h-[1px] bg-slate-200 absolute"></div>
            <div className="h-full w-[1px] bg-slate-200 absolute"></div>
        </div>

        {/* Radar Scanner */}
        <div className="absolute w-[300px] h-[300px] rounded-full overflow-hidden animate-[radar-sweep_4s_linear_infinite] origin-center">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-transparent absolute top-0 left-0 origin-bottom-right rounded-tl-full blur-sm"></div>
        </div>

        {/* Central Pulse */}
        <div className="relative z-10 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 ring-4 ring-white">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>

        {/* Detected Signals */}
        {[0, 1, 2].map(i => (
            <div 
                key={i}
                className="absolute"
                style={{
                    top: i === 0 ? '25%' : i === 1 ? '70%' : '35%',
                    left: i === 0 ? '70%' : i === 1 ? '25%' : '20%',
                }}
            >
                <div className="absolute -inset-2 rounded-full border border-blue-500/50 animate-[blip_2s_infinite]" style={{animationDelay: `${i*0.8}s`}}></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg relative z-10"></div>
                
                {/* Pop-up Card */}
                <div 
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-xl border border-white/50 w-32 opacity-0 animate-[pop-in_0.5s_forwards]"
                    style={{animationDelay: `${i * 0.8 + 0.2}s`}}
                >
                    <div className="h-1.5 w-8 bg-red-400 rounded-full mb-1.5"></div>
                    <div className="h-1 w-full bg-slate-200 rounded-full mb-1"></div>
                    <div className="h-1 w-2/3 bg-slate-200 rounded-full"></div>
                </div>
            </div>
        ))}
    </div>
);

const VisualResearch = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <style>{`
            @keyframes type-line {
                0% { width: 0; opacity: 0.5; }
                100% { width: 100%; opacity: 1; }
            }
            @keyframes scan-vertical {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
        `}</style>

        {/* Source Documents Layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 bg-white rounded-lg shadow-xl border border-slate-100 transform -rotate-6 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 bg-white rounded-lg shadow-xl border border-slate-100 transform rotate-6 z-0"></div>

        {/* Main Processing Document */}
        <div className="relative z-10 bg-slate-900 w-48 h-64 rounded-xl shadow-2xl border border-slate-800 p-5 overflow-hidden flex flex-col transform transition-transform hover:scale-105 duration-500">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="ml-auto text-[8px] text-slate-500 font-mono">RESEARCH.MD</div>
            </div>

            {/* Typing Content */}
            <div className="space-y-2.5 flex-1">
                <div className="h-2 w-1/2 bg-blue-500/50 rounded-sm mb-4 animate-[width-grow_0.5s_ease-out_0.2s_both]"></div>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div 
                        key={i} 
                        className={`h-1.5 bg-slate-700/50 rounded-sm ${i%2===0 ? 'w-full' : 'w-5/6'}`}
                        style={{
                            animation: `type-line 0.5s ease-out ${0.5 + i * 0.15}s both`
                        }}
                    ></div>
                ))}
            </div>

            {/* Analysis Box */}
            <div className="mt-auto pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center text-[9px] text-blue-400 font-mono mb-1">
                    <span>CONFIDENCE</span>
                    <span>98%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[width-grow_1.5s_ease-out_2s_both] w-[98%]"></div>
                </div>
            </div>

            {/* Laser Scan Line */}
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none border-t border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-[scan-vertical_2.5s_linear_infinite]"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute -right-4 top-20 bg-white p-2.5 rounded-xl shadow-lg animate-[float_4s_ease-in-out_infinite_0.5s]">
            <span className="text-xl">💡</span>
        </div>
        <div className="absolute -left-2 bottom-12 bg-white p-2.5 rounded-xl shadow-lg animate-[float_4s_ease-in-out_infinite_1.5s]">
            <span className="text-xl">📊</span>
        </div>
    </div>
);

const VisualLaunch = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <style>{`
            @keyframes dash-flow {
                to { stroke-dashoffset: 0; }
            }
            @keyframes packet-travel {
                0% { offset-distance: 0%; opacity: 0; transform: scale(0.5); }
                10% { opacity: 1; transform: scale(1); }
                90% { opacity: 1; transform: scale(1); }
                100% { offset-distance: 100%; opacity: 0; transform: scale(0.5); }
            }
            @keyframes ping-ring {
                0% { transform: scale(0.8); opacity: 0.5; }
                100% { transform: scale(1.5); opacity: 0; }
            }
        `}</style>

        {/* Connecting Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {/* Paths from center to nodes */}
            <path d="M50% 50% L20% 30%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash-flow_1s_linear_infinite]" />
            <path d="M50% 50% L80% 30%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash-flow_1.5s_linear_infinite]" />
            <path d="M50% 50% L50% 80%" stroke="url(#lineGrad)" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash-flow_1.2s_linear_infinite]" />
        </svg>

        {/* Central Hub */}
        <div className="relative z-20 w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30 group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 animate-pulse transition-opacity"></div>
            <div className="absolute -inset-4 border border-slate-200 rounded-full animate-[ping-ring_2s_ease-out_infinite]"></div>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
        </div>

        {/* Satellites */}
        {[
            { top: '30%', left: '20%', color: 'bg-blue-400', delay: 0 },
            { top: '30%', left: '80%', color: 'bg-pink-500', delay: 0.5 },
            { top: '80%', left: '50%', color: 'bg-indigo-500', delay: 1.0 }
        ].map((pos, i) => (
            <div 
                key={i}
                className="absolute w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center z-10 animate-[float_4s_ease-in-out_infinite]"
                style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)', animationDelay: `${pos.delay}s` }}
            >
                <div className={`w-6 h-6 rounded-full ${pos.color} opacity-80`}></div>
                {/* Incoming Packet Simulation */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-full h-full rounded-xl border-2 ${pos.color.replace('bg-', 'border-')} opacity-0 animate-[ping_1s_ease-out_infinite]`} style={{animationDelay: `${pos.delay + 1}s`}}></div>
                </div>
            </div>
        ))}
    </div>
);

const VisualLibrary = () => (
    <div className="relative w-full h-full flex items-center justify-center">
        <style>{`
            @keyframes card-stack {
                0% { transform: translateY(-100px) scale(0.9); opacity: 0; }
                20% { opacity: 1; }
                100% { transform: translateY(var(--y)) scale(var(--s)); opacity: 1; }
            }
            @keyframes check-draw {
                0% { stroke-dashoffset: 20; opacity: 0; }
                100% { stroke-dashoffset: 0; opacity: 1; }
            }
        `}</style>

        <div className="relative w-56 h-64 perspective-1000">
            {/* Stacked Cards */}
            {[2, 1, 0].map((i) => (
                <div 
                    key={i}
                    className="absolute inset-0 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-5 flex flex-col origin-bottom"
                    style={{
                        '--y': `${i * 15}px`,
                        '--s': `${1 - i * 0.05}`,
                        zIndex: 3 - i,
                        animation: `card-stack 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.2}s backwards`
                    } as any}
                >
                    {/* Card Content */}
                    <div className="flex justify-between items-center mb-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${i === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        {i === 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-full animate-[fade-in_0.3s_ease-out_1.5s_backwards]">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" strokeDasharray="20" strokeDashoffset="20" className="animate-[check-draw_0.5s_ease-out_1.6s_forwards]" />
                                </svg>
                                Saved
                            </div>
                        )}
                    </div>
                    <div className="space-y-2.5">
                        <div className={`h-2.5 rounded-full ${i===0 ? 'bg-slate-800 w-3/4' : 'bg-slate-200 w-1/2'}`}></div>
                        <div className={`h-2.5 rounded-full ${i===0 ? 'bg-slate-200 w-full' : 'bg-slate-100 w-2/3'}`}></div>
                    </div>
                    
                    {/* Bottom Meta */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2 opacity-60">
                        <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                        <div className="h-1.5 w-12 bg-slate-200 rounded-full"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- Main Component ---

export default function Onboarding({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(0);

    const slides = [
        {
            title: "Welcome to Smart Content",
            desc: "Your comprehensive AI-powered platform for generating, managing, and publishing high-quality content. Let's get you set up for success.",
            visual: <VisualOverview />,
            bg: "from-blue-50 to-indigo-50",
            accent: "text-blue-600"
        },
        {
            title: "1. Daily News Agent",
            desc: "Stay ahead of the curve. This agent monitors global news sources 24/7 and instantly drafts relevant articles tailored to your industry trends.",
            visual: <VisualNews />,
            bg: "from-sky-50 to-blue-50",
            accent: "text-sky-600"
        },
        {
            title: "2. Research & Write Agent",
            desc: "Deep dive into any topic. Give it a subject, and it will conduct extensive research, analyze data, and write a comprehensive report or blog post.",
            visual: <VisualResearch />,
            bg: "from-violet-50 to-purple-50",
            accent: "text-violet-600"
        },
        {
            title: "3. Product Launch Agent",
            desc: "Launching something new? Just input the features, and this agent will craft the perfect announcement campaign to maximize impact.",
            visual: <VisualLaunch />,
            bg: "from-amber-50 to-orange-50",
            accent: "text-amber-600"
        },
        {
            title: "Content Library",
            desc: "Your central hub. Access, edit, and schedule all your AI-generated drafts. Review history and publish directly to your channels.",
            visual: <VisualLibrary />,
            bg: "from-emerald-50 to-teal-50",
            accent: "text-emerald-600"
        }
    ];

    const handleNext = () => {
        if (step < slides.length - 1) {
            setStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-4 animate-fade-in font-sans" dir="ltr">
            {/* Global Styles for Animations */}
            <style>{`
                @keyframes text-blur-in {
                    0% { filter: blur(12px); opacity: 0; transform: translateY(10px); }
                    100% { filter: blur(0); opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-[550px] relative animate-scale-in border border-slate-100 z-10 ring-1 ring-slate-900/5">
                
                {/* Left Side - Visual */}
                <div className={`w-full md:w-1/2 p-10 flex items-center justify-center relative transition-colors duration-700 bg-gradient-to-br ${slides[step].bg} overflow-hidden group`}>
                    {/* Abstract Background Patterns */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10 mix-blend-overlay animate-[pulse_4s_infinite]"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -ml-10 -mb-10 mix-blend-overlay animate-[pulse_6s_infinite_1s]"></div>
                    
                    <div className="relative z-10 w-full h-full animate-slide-in" key={`visual-${step}`}>
                        {slides[step].visual}
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white relative">
                    {/* Progress Indicator */}
                    <div className="absolute top-10 left-10 md:left-16 flex gap-2">
                        {slides.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === step ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`}
                            ></div>
                        ))}
                    </div>

                    <div className="mt-8" key={`text-${step}`}>
                        <span className={`text-xs font-bold uppercase tracking-widest mb-4 block ${slides[step].accent} animate-[fade-in_0.5s_ease-out_0.2s_both]`}>
                            Step {step + 1} of {slides.length}
                        </span>
                        
                        {/* Improved Title Typography with Staggered Blur Effect */}
                        <div className="mb-6 h-20 md:h-24">
                            <StaggeredText 
                                text={slides[step].title} 
                                className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight"
                                isTitle
                            />
                        </div>
                        
                        {/* Improved Description */}
                        <div className="mb-10 min-h-[5rem]">
                            <StaggeredText 
                                text={slides[step].desc} 
                                className="text-lg text-slate-500 leading-relaxed font-medium"
                                delay={0.4}
                            />
                        </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex gap-2"></div>
                        <button 
                            onClick={handleNext}
                            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 group"
                        >
                            <span>{step === slides.length - 1 ? "Get Started" : "Next"}</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
