import React, { useEffect, useState } from 'react';
import { NewsArticle } from '../types';
import { formatDate } from '../utils/helpers';

export default function NewsList() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/news-articles');
                const json = await res.json();
                if (json.success) setArticles(json.data);
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchNews();
    }, []);

    if (loading) return <div className="text-center py-8">در حال دریافت اخبار...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">اخبار و رویدادها</h2>
            <div className="grid gap-4">
                {articles.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">
                        هنوز خبری دریافت نشده است. (این بخش در فازهای بعدی فعال می‌شود)
                    </div>
                ) : articles.map(article => (
                    <div key={article.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800">{article.title}</h3>
                            <span className="text-xs text-slate-400">{formatDate(article.published_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{article.source}</p>
                        <a href={article.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">مشاهده منبع اصلی →</a>
                    </div>
                ))}
            </div>
        </div>
    );
}
