import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { NewsArticle } from '../../types';

export const handleNews = async (request: Request, db: DatabaseService) => {
  const method = request.method;
  
  if (method === 'GET') {
    const articles = await db.query<NewsArticle>('SELECT * FROM news_articles ORDER BY published_at DESC LIMIT 50');
    
    // MOCK DATA INJECTION
    if (articles.length === 0) {
        const mockNews = [
            { id: 1, title: "Google Releases Gemini 1.5 Pro", url: "https://example.com/1", source: "TechCrunch", content: "Google has announced...", published_at: new Date().toISOString(), created_at: new Date().toISOString(), status: "new" },
            { id: 2, title: "AI Regulation Talks Heat Up in EU", url: "https://example.com/2", source: "The Verge", content: "European lawmakers...", published_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString(), status: "new" },
            { id: 3, title: "NVIDIA Stock Hits Record High", url: "https://example.com/3", source: "Bloomberg", content: "Chip maker sees...", published_at: new Date(Date.now() - 7200000).toISOString(), created_at: new Date().toISOString(), status: "processed" },
            { id: 4, title: "OpenAI Announces New Partnerships", url: "https://example.com/4", source: "Reuters", content: "The AI company...", published_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date().toISOString(), status: "new" },
            { id: 5, title: "Apple Integates Generative AI into iOS", url: "https://example.com/5", source: "9to5Mac", content: "The new update...", published_at: new Date(Date.now() - 100000000).toISOString(), created_at: new Date().toISOString(), status: "archived" }
        ];
        return createResponse(mockNews);
    }

    const parsed = articles.map(a => {
        try {
             return a;
        } catch(e) { return a; }
    });
    return createResponse(parsed);
  }

  return createErrorResponse('Method not allowed', 405);
};