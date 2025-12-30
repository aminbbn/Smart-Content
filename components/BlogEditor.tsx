
import React, { useState } from 'react';
import { Blog } from '../types';

interface BlogEditorProps {
    blog: Blog;
    onClose: () => void;
    onSave: () => void;
}

export default function BlogEditor({ blog, onClose, onSave }: BlogEditorProps) {
    const [content, setContent] = useState(blog.content);
    const [title, setTitle] = useState(blog.title);
    const [activeTab, setActiveTab] = useState('write');
    const [seoResult, setSeoResult] = useState<any>(null);
    const [socialResult, setSocialResult] = useState<any>(null);
    const [qualityResult, setQualityResult] = useState<any>(null);
    const [loadingTool, setLoadingTool] = useState(false);

    const handleSave = async () => {
        // Mock save for now, normally would PUT to /api/blogs/:id
        onSave();
        onClose();
    };

    const runSeo = async () => {
        setLoadingTool(true);
        try {
            const res = await fetch('/api/tools/seo', {
                method: 'POST',
                body: JSON.stringify({ content, keyword: title.split(' ')[0] })
            });
            setSeoResult((await res.json()).data);
        } catch(e) { console.error(e); }
        setLoadingTool(false);
    };

    const runSocial = async () => {
        setLoadingTool(true);
        try {
            const res = await fetch('/api/tools/social', {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            setSocialResult((await res.json()).data);
        } catch(e) { console.error(e); }
        setLoadingTool(false);
    };

    const runQuality = async () => {
        setLoadingTool(true);
        try {
            const res = await fetch('/api/tools/quality', {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            setQualityResult((await res.json()).data);
        } catch(e) { console.error(e); }
        setLoadingTool(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col" dir="ltr">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <input 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        className="bg-transparent border-none text-lg font-bold text-slate-800 focus:ring-0 w-96"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save & Close</button>
                </div>
            </div>

            <div className="flex-grow flex overflow-hidden">
                {/* Editor Area */}
                <div className="flex-grow flex flex-col">
                    <div className="border-b border-slate-200 flex">
                        <button 
                            onClick={() => setActiveTab('write')}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'write' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600'}`}
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => setActiveTab('preview')}
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'preview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-600'}`}
                        >
                            Preview
                        </button>
                    </div>
                    {activeTab === 'write' ? (
                        <textarea 
                            className="flex-grow w-full p-8 resize-none focus:outline-none text-slate-800 leading-relaxed font-sans text-lg"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />
                    ) : (
                        <div className="flex-grow w-full p-8 overflow-y-auto prose prose-slate max-w-none">
                            <div className="whitespace-pre-wrap">{content}</div>
                        </div>
                    )}
                </div>

                {/* Sidebar Tools */}
                <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col overflow-y-auto">
                    <div className="p-4">
                        <h3 className="font-bold text-slate-800 mb-4">Smart Assistant</h3>
                        
                        {/* SEO Tool */}
                        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm">SEO & Keywords</span>
                                <button onClick={runSeo} disabled={loadingTool} className="text-xs text-blue-600">Analyze</button>
                            </div>
                            {seoResult ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-grow bg-slate-100 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{width: `${seoResult.score}%`}}></div>
                                        </div>
                                        <span className="text-xs font-bold">{seoResult.score}</span>
                                    </div>
                                    <ul className="text-xs text-slate-600 list-disc list-inside">
                                        {seoResult.suggestions?.slice(0, 3).map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            ) : <p className="text-xs text-slate-400">Not analyzed yet.</p>}
                        </div>

                        {/* Social Tool */}
                        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm">Social Media</span>
                                <button onClick={runSocial} disabled={loadingTool} className="text-xs text-blue-600">Generate</button>
                            </div>
                            {socialResult ? (
                                <div className="space-y-2">
                                    <div className="text-xs">
                                        <span className="font-bold block text-blue-500">Twitter/X:</span>
                                        <p className="text-slate-600 line-clamp-3">{socialResult.twitter}</p>
                                    </div>
                                    <div className="text-xs">
                                        <span className="font-bold block text-blue-700">LinkedIn:</span>
                                        <p className="text-slate-600 line-clamp-3">{socialResult.linkedin}</p>
                                    </div>
                                </div>
                            ) : <p className="text-xs text-slate-400">Not generated yet.</p>}
                        </div>

                        {/* Quality Tool */}
                        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm">Quality Check</span>
                                <button onClick={runQuality} disabled={loadingTool} className="text-xs text-blue-600">Check</button>
                            </div>
                            {qualityResult ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Naturalness:</span>
                                        <span className="font-bold text-green-600">{qualityResult.naturalness_score}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Brand Voice:</span>
                                        <span className="font-bold text-blue-600">{qualityResult.brand_score}%</span>
                                    </div>
                                </div>
                            ) : <p className="text-xs text-slate-400">Not checked yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
