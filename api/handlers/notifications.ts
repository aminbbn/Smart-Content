import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { Notification } from '../../types';

export const handleNotifications = async (request: Request, db: DatabaseService) => {
    const method = request.method;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // GET /api/notifications
    if (method === 'GET' && pathParts.length === 3) {
        const notifications = await db.query<Notification>('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        const unreadCount = await db.queryOne<{c: number}>('SELECT count(*) as c FROM notifications WHERE is_read = 0');
        return createResponse({
            notifications,
            unreadCount: unreadCount?.c || 0
        });
    }

    // POST /api/notifications/read-all
    if (method === 'POST' && pathParts[3] === 'read-all') {
        await db.execute('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
        return createResponse({ success: true });
    }

    // POST /api/notifications/:id/read
    if (method === 'POST' && pathParts[4] === 'read') {
        const id = pathParts[3];
        await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        return createResponse({ success: true });
    }

    return createErrorResponse('Method not allowed', 405);
};