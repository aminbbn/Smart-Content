import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { ContentCalendar } from '../../types';

export const handleCalendar = async (request: Request, db: DatabaseService) => {
    const method = request.method;

    if (method === 'GET') {
        // Fetch scheduled items, join with blog table for titles
        const query = `
            SELECT c.*, b.title 
            FROM content_calendar c 
            LEFT JOIN blogs b ON c.blog_id = b.id 
            ORDER BY c.scheduled_date ASC
        `;
        const items = await db.query<ContentCalendar>(query);
        return createResponse(items);
    }

    if (method === 'POST') {
        const body = await request.json() as any;
        const { blog_id, scheduled_date } = body;
        
        if (!blog_id || !scheduled_date) return createErrorResponse('Missing fields', 400);

        // Update blog status
        await db.execute('UPDATE blogs SET status = "scheduled", published_at = ? WHERE id = ?', [scheduled_date, blog_id]);

        // Add to calendar
        await db.execute(
            'INSERT INTO content_calendar (blog_id, scheduled_date, status, created_at) VALUES (?, ?, "pending", CURRENT_TIMESTAMP)',
            [blog_id, scheduled_date]
        );

        return createResponse({ success: true }, 'Scheduled successfully');
    }

    return createErrorResponse('Method not allowed', 405);
};