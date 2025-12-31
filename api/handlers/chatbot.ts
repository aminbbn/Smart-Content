
import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { GeminiService } from '../services/gemini-service';
import { Env, UserSettings } from '../../types';

export const handleSupportChat = async (request: Request, env: Env, db: DatabaseService) => {
    // 1. Global Safety Net
    try {
        if (request.method !== 'POST') return createErrorResponse('Method not allowed', 405);

        let apiKey = env.API_KEY || process.env.API_KEY;

        // Try to fetch from DB if env var is missing
        if (!apiKey) {
            try {
                const userSettings = await db.queryOne<UserSettings>('SELECT api_key FROM user_settings WHERE id = 1');
                if (userSettings && userSettings.api_key) {
                    apiKey = userSettings.api_key;
                }
            } catch (dbError) {
                console.warn("DB lookup for API key failed, defaulting to simulation.");
            }
        }

        let body: any = {};
        try {
            body = await request.json();
        } catch (e) {
            return createErrorResponse('Invalid JSON body', 400);
        }

        const { message, history } = body;

        // Validating message
        if (!message || typeof message !== 'string') {
            return createResponse({ reply: "I didn't catch that. Could you say it again?" });
        }

        // Initialize Service safely
        let gemini;
        try {
            gemini = new GeminiService({ ...env, API_KEY: apiKey || '' });
        } catch (e) {
            console.error("Gemini Service Init Failed:", e);
            // Fallback object if service crashes
            return createResponse({ 
                reply: "I'm currently undergoing maintenance (Service Init Error). Please try again in a moment." 
            });
        }
        
        // Call Chat safely
        const reply = await gemini.chatSupport(message, history || []);
        return createResponse({ reply });

    } catch (e: any) {
        console.error("Critical Chat Handler Error:", e);
        // ALWAYS return a success 200 with a fallback message to prevent UI hang
        return createResponse({ 
            reply: "I'm having a temporary system issue. Please check your settings or try again." 
        });
    }
};
