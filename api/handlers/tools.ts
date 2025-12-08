import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { GeminiService } from '../services/gemini-service';
import { Env, CompanySettings } from '../../types';

export const handleTools = async (request: Request, env: Env, db: DatabaseService) => {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/tools/', '');
    const method = request.method;
    const gemini = new GeminiService(env);

    if (method !== 'POST') return createErrorResponse('Method not allowed', 405);

    try {
        const body = await request.json() as any;

        if (path === 'seo') {
            if (!body.content) return createErrorResponse('Content is required', 400);
            const result = await gemini.analyzeSEO(body.content, body.keyword);
            return createResponse(result);
        }

        if (path === 'social') {
            if (!body.content) return createErrorResponse('Content is required', 400);
            const result = await gemini.generateSocialPosts(body.content);
            return createResponse(result);
        }

        if (path === 'quality') {
            if (!body.content) return createErrorResponse('Content is required', 400);
            
            const company = await db.queryOne<CompanySettings>('SELECT tone_of_voice FROM company_settings WHERE id = 1');
            const brandVoice = company?.tone_of_voice || 'Professional';
            
            const result = await gemini.checkQuality(body.content, brandVoice);
            return createResponse(result);
        }

        return createErrorResponse('Tool not found', 404);
    } catch (e: any) {
        return createErrorResponse(e.message || 'Tool execution failed');
    }
};