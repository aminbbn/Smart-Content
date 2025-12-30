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

        // MOCK DATA INJECTION
        if (items.length === 0) {
            const today = new Date();
            const mockEvents = [
                { id: 1, blog_id: 101, title: "Product Launch: AI Suite", scheduled_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString(), status: "pending", created_at: new Date().toISOString() },
                { id: 2, blog_id: 102, title: "Weekly Tech Round-up", scheduled_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString(), status: "pending", created_at: new Date().toISOString() },
                { id: 3, blog_id: 103, title: "Interview with CEO", scheduled_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 9).toISOString(), status: "pending", created_at: new Date().toISOString() },
                { id: 4, blog_id: 104, title: "Tips for SEO Optimization", scheduled_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12).toISOString(), status: "pending", created_at: new Date().toISOString() },
                { id: 5, blog_id: 105, title: "Community Spotlight", scheduled_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString(), status: "pending", created_at: new Date().toISOString() }
            ];
            return createResponse(mockEvents);
        }

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