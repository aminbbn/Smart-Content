
import React, { useState, useEffect, useRef } from 'react';
import { Blog } from '../types';
import { marked } from 'marked';
import TurndownService from 'turndown';

interface BlogEditorProps {
    blog: Blog;
    onClose: () => void;
    onSave: () => void;
}

// --- Professional Theme Definitions ---
const THEMES = [
    {
        id: 'modern',
        name: 'Modern Clean',
        previewColor: '#ffffff',
        css: `
            .editor-content { background: #ffffff; color: #334155; font-family: 'Inter', system-ui, sans-serif; }
            .editor-content h1 { font-size: 2.5rem; letter-spacing: -0.025em; font-weight: 800; color: #0f172a; margin-bottom: 1rem; line-height: 1.2; }
            .editor-content h2 { font-size: 1.75rem; letter-spacing: -0.015em; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 1rem; }
            .editor-content h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1.5rem; }
            .editor-content p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.5rem; color: #475569; }
            .editor-content blockquote { border-left: 4px solid #cbd5e1; padding-left: 1.5rem; font-style: italic; color: #64748b; margin: 2rem 0; }
            .editor-content a { color: #2563eb; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: #bfdbfe; transition: all 0.2s; }
            .editor-content a:hover { color: #1d4ed8; text-decoration-color: #2563eb; }
            .editor-content strong { color: #0f172a; font-weight: 700; }
            .editor-content ul, .editor-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
            .editor-content li { margin-bottom: 0.5rem; padding-left: 0.5rem; }
        `
    },
    {
        id: 'obsidian',
        name: 'Obsidian (True Dark)',
        previewColor: '#000000',
        css: `
            .editor-content { background: #000000; color: #d4d4d8; font-family: 'Inter', system-ui, sans-serif; }
            .editor-content h1 { 
                color: #ffffff; 
                font-size: 3rem; 
                font-weight: 800; 
                letter-spacing: -0.03em; 
                margin-bottom: 1.5rem; 
                line-height: 1.1;
                background: linear-gradient(to right, #fff, #9ca3af);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .editor-content h2 { 
                color: #fafafa; 
                font-size: 1.8rem; 
                font-weight: 700; 
                margin-top: 3rem; 
                margin-bottom: 1rem; 
                padding-bottom: 0.5rem; 
                border-bottom: 1px solid #27272a; 
            }
            .editor-content h3 { 
                color: #e4e4e7; 
                font-size: 1.4rem; 
                font-weight: 600; 
                margin-top: 2rem; 
            }
            .editor-content p { 
                font-size: 1.125rem; 
                line-height: 1.8; 
                margin-bottom: 1.5rem; 
                color: #d4d4d8; 
                font-weight: 400;
            }
            .editor-content blockquote { 
                border-left: 3px solid #a855f7; 
                padding: 1.5rem; 
                margin: 2.5rem 0; 
                background: #09090b; 
                color: #e9d5ff; 
                font-style: italic;
                border-radius: 0 8px 8px 0;
            }
            .editor-content a { 
                color: #c084fc; 
                text-decoration: none; 
                border-bottom: 1px solid rgba(192, 132, 252, 0.3); 
                transition: all 0.2s; 
            }
            .editor-content a:hover { 
                border-bottom-color: #c084fc; 
                color: #e9d5ff; 
            }
            .editor-content strong { 
                color: #fff; 
                font-weight: 700; 
            }
            .editor-content code { 
                background: #18181b; 
                border: 1px solid #27272a; 
                color: #a5b4fc; 
                padding: 0.2em 0.4em; 
                border-radius: 4px; 
                font-family: 'Fira Code', monospace; 
                font-size: 0.9em;
            }
            .editor-content hr {
                border: 0;
                border-top: 1px solid #27272a;
                margin: 3rem 0;
            }
        `
    },
    {
        id: 'midnight',
        name: 'Midnight Pro',
        previewColor: '#0f172a',
        css: `
            .editor-content { background: #0f172a; color: #94a3b8; font-family: 'Inter', sans-serif; }
            .editor-content h1 { background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3rem; font-weight: 900; margin-bottom: 1.5rem; }
            .editor-content h2 { font-size: 1.8rem; font-weight: 700; color: #e2e8f0; margin-top: 2.5rem; margin-bottom: 1rem; }
            .editor-content p { font-size: 1.125rem; line-height: 1.9; margin-bottom: 1.5rem; color: #cbd5e1; }
            .editor-content blockquote { background: rgba(30, 41, 59, 0.5); border-left: 4px solid #8b5cf6; padding: 1.5rem; border-radius: 0.75rem; color: #e2e8f0; font-weight: 500; margin: 2rem 0; }
            .editor-content a { color: #60a5fa; font-weight: 600; text-decoration: none; transition: color 0.2s; }
            .editor-content a:hover { color: #93c5fd; text-decoration: underline; }
            .editor-content strong { color: #f8fafc; }
        `
    },
    {
        id: 'newspaper',
        name: 'The New York',
        previewColor: '#fdfbf7',
        css: `
            .editor-content { background: #fdfbf7; color: #292524; font-family: 'Georgia', 'Cambria', serif; }
            .editor-content h1 { font-family: 'Playfair Display', serif; font-size: 3.5rem; font-weight: 900; color: #1c1917; margin-bottom: 1.5rem; line-height: 1.1; letter-spacing: -0.02em; border-bottom: 4px double #1c1917; padding-bottom: 1rem; }
            .editor-content h2 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: #1c1917; margin-top: 3rem; margin-bottom: 1rem; font-style: italic; }
            .editor-content h3 { font-family: 'Helvetica', sans-serif; font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #57534e; margin-top: 2rem; border-bottom: 1px solid #e7e5e4; padding-bottom: 0.5rem; display: inline-block; }
            .editor-content p { font-size: 1.25rem; line-height: 1.8; margin-bottom: 1.5rem; color: #292524; }
            .editor-content blockquote { font-family: 'Playfair Display', serif; font-size: 1.75rem; font-style: italic; color: #44403c; text-align: center; margin: 3rem 0; padding: 0 2rem; line-height: 1.4; }
            .editor-content a { color: #1c1917; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
            .editor-content strong { font-weight: 900; }
        `
    },
    {
        id: 'swiss',
        name: 'Swiss Design',
        previewColor: '#ffffff',
        css: `
            .editor-content { background: #ffffff; color: #000000; font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; }
            .editor-content h1 { font-size: 4rem; font-weight: 700; letter-spacing: -0.04em; line-height: 0.9; margin-bottom: 2rem; color: #000; text-transform: uppercase; word-wrap: break-word; }
            .editor-content h2 { font-size: 1.5rem; font-weight: 700; color: #000; border-top: 4px solid #000; padding-top: 1rem; margin-top: 3rem; margin-bottom: 1.5rem; text-transform: uppercase; }
            .editor-content p { font-size: 1.25rem; font-weight: 400; line-height: 1.5; margin-bottom: 1.5rem; text-indent: 0; max-width: 90%; }
            .editor-content blockquote { font-size: 2rem; font-weight: 700; padding: 0; margin: 3rem 0; border: none; color: #000; letter-spacing: -0.02em; line-height: 1.1; }
            .editor-content a { background: #000; color: #fff; text-decoration: none; padding: 0 4px; display: inline-block; transform: rotate(-1deg); }
            .editor-content ul { list-style: square; }
        `
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        previewColor: '#050505',
        css: `
            .editor-content { background: #050505; color: #e2e8f0; font-family: 'Courier New', monospace; border: 1px solid #333; }
            .editor-content h1 { color: #facc15; font-size: 2.5rem; text-transform: uppercase; text-shadow: 2px 2px 0px #be185d; margin-bottom: 2rem; border-bottom: 2px solid #be185d; padding-bottom: 1rem; }
            .editor-content h2 { color: #22d3ee; font-size: 1.75rem; text-transform: uppercase; margin-top: 3rem; margin-bottom: 1rem; text-shadow: 1px 1px 0px #0e7490; }
            .editor-content p { font-size: 1.1rem; line-height: 1.7; margin-bottom: 1.5rem; color: #94a3b8; }
            .editor-content blockquote { border: 1px solid #22d3ee; background: rgba(34, 211, 238, 0.05); padding: 1.5rem; color: #facc15; margin: 2rem 0; position: relative; }
            .editor-content blockquote:before { content: '>'; position: absolute; top: -10px; left: 10px; background: #050505; padding: 0 10px; color: #22d3ee; }
            .editor-content a { color: #f472b6; text-decoration: none; border-bottom: 1px dashed #f472b6; }
            .editor-content a:hover { background: #be185d; color: #fff; border-bottom: none; }
            .editor-content strong { color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.5); }
        `
    },
    {
        id: 'coffee',
        name: 'Coffee House',
        previewColor: '#fcf8f3',
        css: `
            .editor-content { background: #fcf8f3; color: #433422; font-family: 'Merriweather', serif; }
            .editor-content h1 { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 700; color: #2b1c0e; margin-bottom: 1.5rem; font-style: italic; }
            .editor-content h2 { font-size: 1.8rem; font-weight: 700; color: #5d4037; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #d7ccc8; padding-bottom: 0.5rem; }
            .editor-content p { font-size: 1.15rem; line-height: 2; margin-bottom: 1.5rem; color: #5d4037; }
            .editor-content blockquote { border-left: 4px solid #8d6e63; padding-left: 1.5rem; font-style: italic; color: #6d4c41; margin: 2rem 0; background: rgba(141, 110, 99, 0.05); border-radius: 0 8px 8px 0; padding: 1.5rem; }
            .editor-content a { color: #8d6e63; text-decoration: none; border-bottom: 1px dotted #8d6e63; font-weight: 700; }
            .editor-content strong { color: #3e2723; }
        `
    },
    {
        id: 'terminal',
        name: 'Retro Terminal',
        previewColor: '#0c0c0c',
        css: `
            .editor-content { background: #0c0c0c; color: #22c55e; font-family: 'Courier New', monospace; }
            .editor-content h1 { color: #4ade80; font-size: 2rem; font-weight: bold; margin-bottom: 2rem; text-transform: uppercase; border-bottom: 1px dashed #22c55e; padding-bottom: 1rem; }
            .editor-content h1:before { content: '> '; }
            .editor-content h2 { color: #4ade80; font-size: 1.5rem; font-weight: bold; margin-top: 3rem; margin-bottom: 1rem; text-decoration: underline; }
            .editor-content p { font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; color: #bbf7d0; }
            .editor-content blockquote { border: 1px dashed #15803d; padding: 1rem; color: #86efac; margin: 1.5rem 0; background: #052e16; }
            .editor-content a { background: #22c55e; color: #000; text-decoration: none; padding: 0 4px; font-weight: bold; }
            .editor-content strong { color: #fff; }
            .editor-content img, .editor-content video { filter: grayscale(100%) contrast(120%); border: 1px solid #22c55e; }
        `
    },
    {
        id: 'corporate',
        name: 'Corporate Blue',
        previewColor: '#f8fafc',
        css: `
            .editor-content { background: #f8fafc; color: #334155; font-family: 'Verdana', sans-serif; border-top: 8px solid #0f172a; }
            .editor-content h1 { color: #0f172a; font-family: 'Georgia', serif; font-size: 2.5rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
            .editor-content h2 { color: #1e3a8a; font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1rem; }
            .editor-content p { font-size: 1rem; line-height: 1.8; margin-bottom: 1.5rem; color: #475569; }
            .editor-content blockquote { background: #eff6ff; border-left: 4px solid #2563eb; padding: 1.5rem; color: #1e40af; margin: 2rem 0; }
            .editor-content a { color: #2563eb; font-weight: bold; text-decoration: none; }
            .editor-content a:hover { text-decoration: underline; }
        `
    },
    {
        id: 'brutalist',
        name: 'Neo Brutalism',
        previewColor: '#fff',
        css: `
            .editor-content { background: #fff; color: #000; font-family: 'Courier', monospace; border: 4px solid #000; box-shadow: 12px 12px 0px #000; margin: 2rem; }
            .editor-content h1 { background: #000; color: #fff; padding: 1.5rem; font-size: 2.5rem; text-transform: uppercase; font-weight: 900; margin: -25mm -25mm 2rem -25mm; border-bottom: 4px solid #000; }
            .editor-content h2 { background: #ff90e8; color: #000; border: 3px solid #000; display: inline-block; padding: 0.5rem 1rem; box-shadow: 4px 4px 0 #000; margin-top: 2rem; margin-bottom: 1rem; font-weight: 800; transform: rotate(-1deg); }
            .editor-content p { font-size: 1.1rem; font-weight: 600; line-height: 1.6; margin-bottom: 1.5rem; }
            .editor-content blockquote { border: 3px solid #000; padding: 1.5rem; background: #fff95b; color: #000; font-weight: 700; margin: 2rem 0; box-shadow: 6px 6px 0 #000; }
            .editor-content a { background: #2563eb; color: #fff; text-decoration: none; padding: 2px 6px; border: 2px solid #000; }
            .editor-content a:hover { background: #fff; color: #2563eb; }
        `
    },
    {
        id: 'pastel',
        name: 'Soft Pastel',
        previewColor: '#fff5f5',
        css: `
            .editor-content { background: #fff5f5; color: #5d5d81; font-family: 'Nunito', 'Segoe UI', sans-serif; }
            .editor-content h1 { color: #db7093; font-weight: 900; font-size: 3rem; margin-bottom: 1.5rem; text-shadow: 2px 2px 0px #fff; }
            .editor-content h2 { color: #8a63d2; background: #fff; padding: 0.5rem 1.5rem; border-radius: 50px; display: inline-block; margin-top: 2rem; margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(138, 99, 210, 0.1); }
            .editor-content p { font-size: 1.15rem; line-height: 1.9; margin-bottom: 1.5rem; color: #6b6b8e; }
            .editor-content blockquote { background: #e0c3fc; color: #fff; border-radius: 1.5rem; padding: 2rem; border: none; font-size: 1.2rem; font-weight: 700; margin: 2rem 0; }
            .editor-content a { color: #db7093; font-weight: 700; text-decoration: none; border-bottom: 2px dashed #db7093; }
        `
    },
    {
        id: 'high-contrast',
        name: 'High Contrast',
        previewColor: '#ffffff',
        css: `
            .editor-content { background: #ffffff; color: #000000; font-family: 'Verdana', sans-serif; }
            .editor-content h1 { font-size: 3rem; font-weight: 900; color: #000000; margin-bottom: 1.5rem; border-bottom: 5px solid #000000; padding-bottom: 0.5rem; }
            .editor-content h2 { font-size: 2rem; font-weight: 800; color: #000000; margin-top: 3rem; margin-bottom: 1rem; text-decoration: underline; text-decoration-thickness: 3px; }
            .editor-content p { font-size: 1.25rem; line-height: 1.6; margin-bottom: 1.5rem; font-weight: 500; }
            .editor-content blockquote { border: 4px solid #000000; padding: 1.5rem; font-weight: 700; margin: 2rem 0; background: transparent; }
            .editor-content a { color: #0000ff; text-decoration: underline; font-weight: 900; text-decoration-thickness: 2px; }
            .editor-content strong { font-weight: 900; color: #000; }
        `
    }
];

export default function BlogEditor({ blog, onClose, onSave }: BlogEditorProps) {
    const [title, setTitle] = useState(blog.title);
    
    // Theme State
    const [activeTheme, setActiveTheme] = useState(THEMES[0]);

    // Tools State
    const [seoResult, setSeoResult] = useState<any>(null);
    const [socialResult, setSocialResult] = useState<any>(null);
    const [qualityResult, setQualityResult] = useState<any>(null);
    
    const [loadingSeo, setLoadingSeo] = useState(false);
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [loadingQuality, setLoadingQuality] = useState(false);
    
    const [saving, setSaving] = useState(false);
    
    // Modals State
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    const [showSourceModal, setShowSourceModal] = useState(false);
    const [sourceContent, setSourceContent] = useState('');
    
    const editorRef = useRef<HTMLDivElement>(null);
    const savedRange = useRef<Range | null>(null);

    // Initial Load: Convert Markdown to HTML for WYSIWYG
    useEffect(() => {
        if (editorRef.current) {
            // Check if content looks like HTML already (basic check)
            const isHTML = /<[a-z][\s\S]*>/i.test(blog.content);
            if (isHTML) {
                editorRef.current.innerHTML = blog.content;
            } else {
                // Convert Markdown to HTML using marked
                const html = marked.parse(blog.content) as string;
                editorRef.current.innerHTML = html;
            }
        }
    }, [blog.content]);

    // Save/Restore Selection Helpers
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            savedRange.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        const sel = window.getSelection();
        if (sel && savedRange.current) {
            sel.removeAllRanges();
            sel.addRange(savedRange.current);
        }
    };

    // Command Executor for Toolbar
    const execCmd = (command: string, value: string | undefined = undefined) => {
        // 1. Ensure focus is on the editor before executing
        if (editorRef.current) {
            editorRef.current.focus();
        }
        
        // 2. Execute command
        document.execCommand(command, false, value);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const htmlContent = editorRef.current?.innerHTML || '';
            
            const res = await fetch(`/api/blogs/${blog.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: htmlContent, // Saving HTML directly for better fidelity
                    status: blog.status
                })
            });
            
            if (res.ok) {
                onSave();
                onClose();
            } else {
                alert("Failed to save changes.");
            }
        } catch (e) {
            console.error("Save failed", e);
            alert("Connection error occurred.");
        }
        setSaving(false);
    };

    const handleViewSource = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            const turndownService = new TurndownService();
            const markdown = turndownService.turndown(html);
            setSourceContent(markdown);
            setShowSourceModal(true);
        }
    };

    // --- Media Management ---

    // Global Click Handler for Editor (Handles Delete Buttons)
    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Check if clicked element is our delete button or inside it
        const deleteBtn = target.closest('.delete-media-btn');
        if (deleteBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the wrapper and remove it
            const wrapper = deleteBtn.closest('.media-wrapper');
            if (wrapper) {
                wrapper.remove();
            }
        }
    };

    const openImageModal = () => {
        saveSelection(); // Capture where the cursor is
        setShowImageModal(true);
        setImageUrl('');
    };

    const confirmInsertImage = () => {
        if (!imageUrl) return;
        
        if (editorRef.current) editorRef.current.focus();
        restoreSelection();
        
        // Insert HTML with Wrapper and Delete Button
        const imgHtml = `
            <div class="media-wrapper relative group my-6 block select-none" contenteditable="false">
                <div class="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100">
                    <img src="${imageUrl}" class="w-full h-auto block" alt="Inserted Image"/>
                    <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors pointer-events-none"></div>
                </div>
                <div class="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button class="delete-media-btn bg-white text-red-500 hover:bg-red-50 p-2 rounded-xl shadow-xl border border-slate-200 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer" title="Delete Image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-1 1-1h4c1 0 1 1 1 1v2"></path></svg>
                    </button>
                </div>
            </div>
            <p><br></p>
        `;
        
        document.execCommand('insertHTML', false, imgHtml);
        
        setShowImageModal(false);
        setImageUrl('');
    };

    const openVideoModal = () => {
        saveSelection();
        setShowVideoModal(true);
        setVideoUrl('');
    };

    const confirmInsertVideo = () => {
        if (!videoUrl) return;

        if (editorRef.current) editorRef.current.focus();
        restoreSelection();

        let embedCode = '';
        // Basic detection
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            let videoId = '';
            if (videoUrl.includes('v=')) videoId = videoUrl.split('v=')[1]?.split('&')[0];
            else if (videoUrl.includes('youtu.be/')) videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
            
            if (videoId) {
                embedCode = `<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
        } 
        
        if (!embedCode) {
            embedCode = `<video controls class="w-full h-full object-contain" src="${videoUrl}"></video>`;
        }

        const wrapperHtml = `
            <div class="media-wrapper relative group my-8 block select-none" contenteditable="false">
                <div class="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-black aspect-video relative">
                    ${embedCode}
                    <div class="absolute inset-0 bg-transparent pointer-events-none group-hover:bg-black/10 transition-colors z-10"></div>
                </div>
                <div class="absolute top-3 left-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button class="delete-media-btn bg-white text-red-500 hover:bg-red-50 p-2 rounded-xl shadow-xl border border-slate-200 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer" title="Delete Video">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-1 1-1h4c1 0 1 1 1 1v2"></path></svg>
                    </button>
                </div>
            </div>
            <p><br></p>
        `;
        
        document.execCommand('insertHTML', false, wrapperHtml);
        setShowVideoModal(false);
        setVideoUrl('');
    };

    const addCodeBlock = () => {
        const selection = window.getSelection();
        const text = selection ? selection.toString() : '';
        // Insert a styled Code Block
        const html = `<pre class="bg-slate-900 text-blue-100 p-6 rounded-xl font-mono text-sm overflow-x-auto my-6 shadow-inner border border-slate-700/50 relative group" spellcheck="false"><div class="absolute top-3 right-3 flex gap-1.5 opacity-50"><div class="w-2.5 h-2.5 rounded-full bg-red-500"></div><div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div class="w-2.5 h-2.5 rounded-full bg-green-500"></div></div><code>${text || '// Write your code here...'}</code></pre><p><br></p>`;
        
        if (editorRef.current) editorRef.current.focus();
        document.execCommand('insertHTML', false, html);
    };

    // Tool Runners
    const getEditorText = () => editorRef.current?.innerText || '';

    const runSeo = async () => {
        const text = getEditorText();
        if (text.length < 50) {
            setSeoResult({ score: 0, suggestions: ["Add more content to analyze."] });
            return;
        }
        setLoadingSeo(true);
        setSeoResult(null);
        try {
            const res = await fetch('/api/tools/seo', {
                method: 'POST',
                body: JSON.stringify({ content: text, keyword: title.split(' ')[0] })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setSeoResult(json.data);
            } else {
                throw new Error(json.error || "Failed to analyze");
            }
        } catch(e) { 
            console.error(e);
            setSeoResult({ error: true });
        } finally {
            setLoadingSeo(false);
        }
    };

    const runSocial = async () => {
        const text = getEditorText();
        if (text.length < 50) {
            setSocialResult({ error: "Content too short for social posts." });
            return;
        }
        setLoadingSocial(true);
        setSocialResult(null);
        try {
            const res = await fetch('/api/tools/social', {
                method: 'POST',
                body: JSON.stringify({ content: text })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setSocialResult(json.data);
            } else {
                throw new Error(json.error || "Failed to generate");
            }
        } catch(e) { 
            console.error(e);
            setSocialResult({ error: "Generation failed. Try again." });
        } finally {
            setLoadingSocial(false);
        }
    };

    const runQuality = async () => {
        const text = getEditorText();
        if (text.length < 50) {
            setQualityResult({ naturalness_score: 0, brand_score: 0 });
            return;
        }
        setLoadingQuality(true);
        setQualityResult(null);
        try {
            const res = await fetch('/api/tools/quality', {
                method: 'POST',
                body: JSON.stringify({ content: text })
            });
            const json = await res.json();
            if (json.success && json.data) {
                setQualityResult(json.data);
            } else {
                throw new Error(json.error || "Check failed");
            }
        } catch(e) { 
            console.error(e);
            setQualityResult({ error: true });
        } finally {
            setLoadingQuality(false);
        }
    };

    // Toolbar Button Component
    const ToolBtn = ({ cmd, arg, icon, label, isActive = false, onClick }: any) => (
        <button
            onMouseDown={(e) => { 
                e.preventDefault(); // CRITICAL: Prevents focus loss from editor
                if (onClick) onClick();
                else execCmd(cmd, arg); 
            }}
            className={`p-2 rounded-lg transition-all group relative flex items-center justify-center ${
                isActive 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={label}
        >
            {icon}
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {label}
            </span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 bg-[#F1F5F9] flex flex-col" dir="ltr">
            {/* Dynamic CSS Injection based on Active Theme */}
            <style>{`
                /* Base Reset for Editor Content */
                .editor-content {
                    width: 210mm;
                    min-height: 297mm;
                    margin-left: auto;
                    margin-right: auto;
                    padding: 25mm;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    outline: none;
                    transition: all 0.3s ease;
                }
                
                /* Injected Theme CSS */
                ${activeTheme.css}

                /* Consistent Media Styles (Overrides any theme specific resets) */
                .editor-content img { border-radius: 1rem; max-width: 100%; height: auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); margin: 2em 0; display: block; }
                .editor-content video { border-radius: 1rem; max-width: 100%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); display: block; margin: 2em 0; }
                .editor-content .media-wrapper { position: relative; margin: 2.5em 0; }
                .editor-content pre { margin: 2em 0; text-align: left; }
                
                /* List Tweaks */
                .editor-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .editor-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
            `}</style>

            {/* 1. Top Navigation Bar */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-40 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <input 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        className="bg-transparent border-none text-lg font-bold text-slate-800 focus:ring-0 w-96 px-2 placeholder-slate-300 truncate"
                        placeholder="Untitled Document"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleViewSource}
                        className="px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                        title="View Markdown Source"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        Source
                    </button>
                    <span className="text-xs text-slate-400 font-medium px-2">{saving ? 'Saving...' : 'Saved to Cloud'}</span>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save & Close'}
                    </button>
                </div>
            </div>

            {/* 2. Main Workspace Layout */}
            <div className="flex-grow flex overflow-hidden">
                
                {/* 2a. Editor Scroll Area */}
                <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col items-center bg-slate-100/50 relative">
                    
                    {/* Sticky Toolbar Container */}
                    <div className="sticky top-6 z-50 mb-6 mt-6">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-slate-200/50 rounded-2xl px-3 py-2 flex items-center gap-2 ring-1 ring-slate-900/5">
                            {/* Text Styles */}
                            <div className="flex gap-1 pr-2 border-r border-slate-200/60">
                                <ToolBtn cmd="formatBlock" arg="H1" label="Heading 1" icon={<span className="font-black text-sm px-1 font-serif">H1</span>} />
                                <ToolBtn cmd="formatBlock" arg="H2" label="Heading 2" icon={<span className="font-bold text-sm px-1 font-serif">H2</span>} />
                                <ToolBtn cmd="formatBlock" arg="P" label="Paragraph" icon={<span className="font-medium text-sm px-1 font-serif">¶</span>} />
                            </div>
                            
                            {/* Formatting */}
                            <div className="flex gap-1 px-2 border-r border-slate-200/60">
                                <ToolBtn cmd="bold" label="Bold" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" /></svg>} />
                                <ToolBtn cmd="italic" label="Italic" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
                                <ToolBtn cmd="underline" label="Underline" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.5 19c0-5-2.5-9-5.5-9S6.5 14 6.5 19c0 1.5.5 2.5 1 3h9c.5-.5 1-1.5 1-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6.5 19h11" /></svg>} />
                            </div>

                            {/* Alignment */}
                            <div className="flex gap-1 px-2 border-r border-slate-200/60">
                                <ToolBtn cmd="justifyLeft" label="Align Left" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>} />
                                <ToolBtn cmd="justifyCenter" label="Align Center" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg>} />
                            </div>

                            {/* Lists */}
                            <div className="flex gap-1 px-2 border-r border-slate-200/60">
                                <ToolBtn cmd="insertUnorderedList" label="Bullet List" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M2 6h.01M2 12h.01M2 18h.01" /></svg>} />
                                <ToolBtn cmd="insertOrderedList" label="Numbered List" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01" /></svg>} />
                            </div>

                            {/* Rich Media */}
                            <div className="flex gap-1 pl-2">
                                <ToolBtn onClick={openImageModal} label="Add Image" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                                <ToolBtn onClick={openVideoModal} label="Add Video" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />
                                <ToolBtn onClick={addCodeBlock} label="Code Block" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
                            </div>
                        </div>
                    </div>

                    {/* A4 Document Page */}
                    <div className="pb-32 px-8">
                        <div 
                            className="editor-content"
                            contentEditable
                            ref={editorRef}
                            onClick={handleEditorClick}
                            onInput={() => { /* Handle changes if needed for auto-save later */ }}
                            placeholder="Start writing your amazing content here..."
                            spellCheck={false}
                        >
                        </div>
                    </div>
                </div>

                {/* 2b. Right Sidebar (AI Tools + Themes) */}
                <div className="w-80 border-l border-slate-200 bg-white shadow-[-5px_0_20px_rgba(0,0,0,0.02)] flex flex-col z-20 flex-shrink-0">
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-5 space-y-8">
                        
                        {/* 1. Theme Preview Section */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                                </span>
                                Theme Preview
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setActiveTheme(theme)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                                            activeTheme.id === theme.id 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20' 
                                            : 'border-slate-100 hover:bg-slate-50 text-slate-600 hover:border-slate-200'
                                        }`}
                                    >
                                        <span 
                                            className="w-4 h-4 rounded-full border border-slate-200 shadow-sm flex-shrink-0" 
                                            style={{ background: theme.previewColor }}
                                        ></span>
                                        <span className="text-xs font-bold truncate">{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 w-full"></div>

                        {/* 2. AI Assistant Section */}
                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </span>
                                AI Tools
                            </h3>

                            {/* SEO Tool */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-xs text-slate-500">SEO Analysis</span>
                                    <button onClick={runSeo} disabled={loadingSeo} className="text-[10px] bg-white border border-slate-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 font-bold transition-colors">
                                        {loadingSeo ? 'Running...' : 'Analyze'}
                                    </button>
                                </div>
                                {seoResult ? (
                                    seoResult.error ? (
                                        <p className="text-[10px] text-red-500 font-bold italic text-center py-2">Analysis failed. Try adding more text.</p>
                                    ) : (
                                        <div className="space-y-3 animate-fade-in">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                        <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className="text-green-500 transition-all duration-1000" strokeDasharray={`${seoResult.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                    </svg>
                                                    <span className="absolute text-[10px] font-bold text-slate-700">{seoResult.score}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-slate-700">Optimization Score</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-2 rounded-lg border border-slate-100">
                                                <ul className="text-[10px] text-slate-600 space-y-1 list-disc list-inside">
                                                    {seoResult.suggestions?.slice(0, 2).map((s: string, i: number) => <li key={i} className="line-clamp-2">{s}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                ) : <p className="text-[10px] text-slate-400 italic">Check your content's SEO score.</p>}
                            </div>

                            {/* Social Tool */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-xs text-slate-500">Social Media</span>
                                    <button onClick={runSocial} disabled={loadingSocial} className="text-[10px] bg-white border border-slate-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 font-bold transition-colors">
                                        {loadingSocial ? '...' : 'Generate'}
                                    </button>
                                </div>
                                {socialResult ? (
                                    socialResult.error ? (
                                        <p className="text-[10px] text-red-500 italic text-center py-2">{socialResult.error}</p>
                                    ) : (
                                        <div className="space-y-2 animate-fade-in">
                                            <div className="bg-white p-2 rounded-lg border border-slate-100">
                                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded uppercase font-bold">Twitter</span>
                                                <p className="text-[10px] text-slate-600 mt-1 line-clamp-3">{socialResult.twitter}</p>
                                            </div>
                                        </div>
                                    )
                                ) : <p className="text-[10px] text-slate-400 italic">Generate social posts.</p>}
                            </div>

                            {/* Quality Tool */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-xs text-slate-500">Quality Check</span>
                                    <button onClick={runQuality} disabled={loadingQuality} className="text-[10px] bg-white border border-slate-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 font-bold transition-colors">
                                        {loadingQuality ? '...' : 'Check'}
                                    </button>
                                </div>
                                {qualityResult ? (
                                    qualityResult.error ? (
                                        <p className="text-[10px] text-red-500 italic text-center py-2">Check failed.</p>
                                    ) : (
                                        <div className="space-y-2 animate-fade-in">
                                            <div className="flex justify-between text-[10px] items-center bg-white p-2 rounded border border-slate-100">
                                                <span className="text-slate-600 font-bold">Naturalness</span>
                                                <span className="font-bold text-green-600">{qualityResult.naturalness_score}%</span>
                                            </div>
                                        </div>
                                    )
                                ) : <p className="text-[10px] text-slate-400 italic">Verify content quality.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Source Code Modal */}
            {showSourceModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-0 shadow-2xl animate-scale-in flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                Markdown Source
                            </h3>
                            <button onClick={() => setShowSourceModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="flex-grow p-0 overflow-hidden relative">
                            <textarea 
                                readOnly
                                className="w-full h-full p-6 font-mono text-sm text-slate-700 bg-slate-50 resize-none outline-none"
                                value={sourceContent}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(sourceContent);
                                    alert("Copied to clipboard!");
                                }}
                                className="absolute top-4 right-4 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Copy
                            </button>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setShowSourceModal(false)} 
                                className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Image Insert Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">Insert Image</h3>
                            <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image URL</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm placeholder-slate-400"
                                    placeholder="https://example.com/image.png"
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Live Preview Area */}
                            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 min-h-[160px] flex items-center justify-center group">
                                {imageUrl ? (
                                    <img 
                                        src={imageUrl} 
                                        alt="Preview" 
                                        className="max-h-48 object-contain shadow-sm"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement?.classList.add('error-state');
                                        }}
                                        onLoad={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'block';
                                            (e.target as HTMLImageElement).parentElement?.classList.remove('error-state');
                                        }}
                                    />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-xs font-bold">No image selected</span>
                                    </div>
                                )}
                                <div className="hidden error-state:flex absolute inset-0 flex-col items-center justify-center bg-red-50 text-red-500">
                                    <span className="text-xs font-bold">Invalid Image URL</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowImageModal(false)} 
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmInsertImage} 
                                    disabled={!imageUrl}
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Insert Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Video Insert Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-0 shadow-2xl animate-scale-in overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </div>
                                Embed Video
                            </h3>
                            <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Input Area */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Video Source</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    </div>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium placeholder-slate-400"
                                        placeholder="Paste YouTube or MP4 link here..."
                                        value={videoUrl}
                                        onChange={e => setVideoUrl(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Live Preview Area - Cinematic 16:9 */}
                            <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${videoUrl ? 'shadow-xl ring-4 ring-slate-100' : 'border-2 border-dashed border-slate-200 bg-slate-50'}`}>
                                <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                                    {videoUrl ? (
                                        (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) ? (
                                            <iframe 
                                                width="100%" 
                                                height="100%" 
                                                src={`https://www.youtube.com/embed/${videoUrl.includes('v=') ? videoUrl.split('v=')[1]?.split('&')[0] : videoUrl.split('/').pop()}?autoplay=0`} 
                                                title="Video Preview"
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                                className="absolute inset-0 w-full h-full"
                                            ></iframe>
                                        ) : (
                                            <video 
                                                controls 
                                                className="w-full h-full object-contain" 
                                                src={videoUrl}
                                                onError={(e) => (e.target as HTMLVideoElement).poster = "https://via.placeholder.com/640x360?text=Invalid+Video+URL"}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-50 w-full h-full">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                                <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <span className="text-sm font-bold">Preview will appear here</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowVideoModal(false)} 
                                    className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmInsertVideo} 
                                    disabled={!videoUrl}
                                    className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                >
                                    <span>Insert Video</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
