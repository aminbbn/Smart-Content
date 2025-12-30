
import React, { useState, useRef, useEffect } from 'react';
import { Writer } from '../types';

interface WriterSelectorProps {
    writers: Writer[];
    selectedId: number | string;
    onChange: (id: number | string) => void;
    disabled?: boolean;
}

export default function WriterSelector({ writers, selectedId, onChange, disabled }: WriterSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedWriter = writers.find(w => w.id === Number(selectedId));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: number | string) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full rounded-xl border-2 flex items-center justify-between px-4 py-3 transition-all ${
                    isOpen 
                    ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white' 
                    : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedWriter ? (
                        <>
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-100 shadow-sm">
                                {selectedWriter.avatar_url ? (
                                    <img src={selectedWriter.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                                        {selectedWriter.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-start truncate">
                                <span className="font-bold text-slate-800 text-sm truncate">{selectedWriter.name}</span>
                                {selectedWriter.is_default ? (
                                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 rounded">Default</span>
                                ) : (
                                    <span className="text-[10px] text-slate-400">Writer</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-200 shadow-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-slate-800 text-sm">Smart Select (Auto)</span>
                                <span className="text-[10px] text-slate-400">System picks best writer</span>
                            </div>
                        </>
                    )}
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-slide-in max-h-72 overflow-y-auto custom-scrollbar">
                    <div 
                        onClick={() => handleSelect('')}
                        className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedId === '' ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">Smart Select (Auto)</span>
                            <span className="text-[10px] text-slate-400">Based on topic context</span>
                        </div>
                        {selectedId === '' && <svg className="w-5 h-5 text-blue-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    
                    <div className="h-px bg-slate-100 my-1 mx-3"></div>

                    {writers.map(writer => (
                        <div 
                            key={writer.id}
                            onClick={() => handleSelect(writer.id)}
                            className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${Number(selectedId) === writer.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                        >
                             <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-100">
                                {writer.avatar_url ? (
                                    <img src={writer.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                                        {writer.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{writer.name}</span>
                                <div className="flex items-center gap-2">
                                     <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{writer.bio}</span>
                                     {writer.is_default === 1 && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">Default</span>}
                                </div>
                            </div>
                            {Number(selectedId) === writer.id && <svg className="w-5 h-5 text-blue-600 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
