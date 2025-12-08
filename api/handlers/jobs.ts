import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { AgentJob } from '../../types';

export const handleJobStatus = async (request: Request, db: DatabaseService) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[3]; // /api/jobs/:id/progress

    if (!jobId) return createErrorResponse('Job ID required', 400);

    try {
        const job = await db.queryOne<AgentJob>('SELECT id, status, progress, message, logs, finished_at FROM agent_jobs WHERE id = ?', [jobId]);
        
        if (!job) return createErrorResponse('Job not found', 404);

        return createResponse({
            id: job.id,
            status: job.status,
            progress: job.progress,
            message: job.message,
            logs: job.logs,
            finished_at: job.finished_at
        });
    } catch (e: any) {
        return createErrorResponse(e.message);
    }
};

export const handleJobCancel = async (request: Request, db: DatabaseService) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const jobId = pathParts[3];

    if (!jobId) return createErrorResponse('Job ID required', 400);

    await db.execute('UPDATE agent_jobs SET status = "cancelled", message = "Cancelled by user" WHERE id = ?', [jobId]);
    return createResponse({ success: true });
};
// REMOVED: handleJobStream (Destructive rewrite to prevent streaming usage)