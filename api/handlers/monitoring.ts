import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { logger } from '../../utils/logger';

export const handleMonitoring = async (request: Request, db: DatabaseService) => {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/monitoring/', '');
    
    if (request.method !== 'GET') return createErrorResponse('Method not allowed', 405);

    try {
        if (path === 'health') {
            const dbStart = performance.now();
            const dbConnected = await db.testConnection();
            const dbLatency = performance.now() - dbStart;

            // Safe access to process.uptime if available (Node env), otherwise 0
            const uptime = typeof process !== 'undefined' && (process as any).uptime ? (process as any).uptime() : 0;

            return createResponse({
                status: dbConnected ? 'healthy' : 'degraded',
                uptime: uptime,
                timestamp: new Date().toISOString(),
                components: {
                    database: {
                        status: dbConnected ? 'connected' : 'disconnected',
                        latency_ms: Math.round(dbLatency)
                    },
                    api: {
                        status: 'operational'
                    }
                }
            });
        }

        if (path === 'metrics') {
            // Get Agent Job Stats
            const jobStats = await db.query(
                `SELECT status, count(*) as count FROM agent_jobs GROUP BY status`
            );
            
            // Get Content Stats
            const contentStats = await db.queryOne(
                `SELECT 
                    (SELECT count(*) FROM blogs) as total_blogs,
                    (SELECT count(*) FROM news_articles) as total_news,
                    (SELECT count(*) FROM research_tasks) as total_research`
            );

            // Recent Errors (from agent jobs logs for now, as we don't have a separate error table in D1)
            const recentFailures = await db.query(
                `SELECT id, agent_type, started_at, logs FROM agent_jobs WHERE status = 'failed' ORDER BY started_at DESC LIMIT 5`
            );

            return createResponse({
                jobs: jobStats,
                content: contentStats,
                failures: recentFailures
            });
        }

        return createErrorResponse('Endpoint not found', 404);
    } catch (e: any) {
        logger.error('Monitoring handler error', e);
        return createErrorResponse('Monitoring check failed');
    }
};