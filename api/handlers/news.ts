import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { NewsArticle } from '../../types';

export const handleNews = async (request: Request, db: DatabaseService) => {
  const method = request.method;
  
  if (method === 'GET') {
    const articles = await db.query<NewsArticle>('SELECT * FROM news_articles ORDER BY published_at DESC LIMIT 50');
    // Parse content if it's JSON
    const parsed = articles.map(a => {
        try {
             // Assuming content might be JSON string sometimes? For now return as is or parse if needed
             return a;
        } catch(e) { return a; }
    });
    return createResponse(parsed);
  }

  return createErrorResponse('Method not allowed', 405);
};
