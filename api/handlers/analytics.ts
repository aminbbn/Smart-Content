import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';

export const handleAnalytics = async (request: Request, db: DatabaseService) => {
    const method = request.method;

    if (method === 'GET') {
        // 1. Total Stats
        const totals = await db.queryOne<{views: number, blogs: number}>(
            `SELECT SUM(views) as views, COUNT(*) as blogs FROM blogs`
        );

        // 2. Top Performing Blogs
        const topBlogs = await db.query(
            `SELECT title, views, published_at FROM blogs ORDER BY views DESC LIMIT 5`
        );

        // 3. Views over time
        const recentBlogs = await db.query(
            `SELECT published_at as date, views FROM blogs WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT 10`
        );

        // 4. Writer Performance
        const writerPerf = await db.query(
            `SELECT w.name, SUM(b.views) as total_views, COUNT(b.id) as post_count 
             FROM writers w 
             JOIN blogs b ON w.id = b.writer_id 
             GROUP BY w.id`
        );

        // 5. Status Distribution
        const statusDist = await db.query(
            `SELECT status as name, count(*) as value FROM blogs GROUP BY status`
        );

        // 6. Recent Drafts
        const recentDrafts = await db.query(
            `SELECT b.title, b.created_at, w.name as writer 
             FROM blogs b 
             LEFT JOIN writers w ON b.writer_id = w.id 
             WHERE b.status = 'draft' 
             ORDER BY b.created_at DESC LIMIT 5`
        );

        return createResponse({
            totals: {
                total_views: totals?.views || 0,
                total_posts: totals?.blogs || 0,
                avg_views: totals?.blogs ? Math.round((totals.views || 0) / totals.blogs) : 0
            },
            top_blogs: topBlogs,
            writer_performance: writerPerf,
            recent_growth: recentBlogs,
            content_status: statusDist,
            recent_drafts: recentDrafts
        });
    }

    return createErrorResponse('Method not allowed', 405);
};