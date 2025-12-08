import { ExecutionContext } from '@cloudflare/workers-types';
import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { DailyNewsAgent } from '../agents/daily-news-agent';
import { ResearchAgent } from '../agents/research-agent';
import { FeatureAnnouncementAgent } from '../agents/feature-announcement-agent';
import { Env, AgentJob } from '../../types';

export const handleAgents = async (request: Request, env: Env, db: DatabaseService, ctx: ExecutionContext) => {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/agents/', '');
  const method = request.method;

  try {
    // --- DAILY NEWS AGENT ---
    if (path === 'daily-news/fetch' && method === 'POST') {
      const agent = new DailyNewsAgent(env, db);
      const { jobId, work } = await agent.startFetchNews();
      ctx.waitUntil(work); 
      return createResponse({ jobId, message: 'News fetch started' });
    }

    if (path === 'daily-news/generate-blog' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as any;
      const agent = new DailyNewsAgent(env, db);
      const { jobId, work } = await agent.startGenerateBlog(body.writerId);
      ctx.waitUntil(work);
      return createResponse({ jobId, message: 'Blog generation started' });
    }

    // --- RESEARCH AGENT ---
    if (path === 'research/start' && method === 'POST') {
      const body = await request.json() as any;
      if (!body.prompt) return createErrorResponse("Prompt required", 400);
      
      const agent = new ResearchAgent(env, db);
      const taskId = await agent.startResearch(body.prompt, body.writerId);
      ctx.waitUntil(agent.executeResearch(taskId));
      return createResponse({ taskId, message: 'Research task started' });
    }

    if (path === 'research/tasks' && method === 'GET') {
      const tasks = await db.query('SELECT * FROM research_tasks ORDER BY created_at DESC');
      const parsed = tasks.map((t: any) => {
          try { 
              return { ...t, results: t.results ? JSON.parse(t.results) : { progress: 0, logs: [] } }; 
          } catch (e) { 
              return { ...t, results: { progress: 0, logs: ['Log parsing failed'] } }; 
          }
      });
      return createResponse(parsed);
    }

    // --- FEATURE ANNOUNCEMENT AGENT ---
    if (path === 'feature-announcement/create' && method === 'POST') {
      const body = await request.json() as any;
      const agent = new FeatureAnnouncementAgent(env, db);
      const id = await agent.createAnnouncement(body.featureName, body.description);
      ctx.waitUntil(agent.researchAndWrite(id, body.writerId));
      return createResponse({ id, message: 'Announcement creation started' });
    }
    
    if (path === 'feature-announcement/list' && method === 'GET') {
      const items = await db.query('SELECT * FROM feature_announcements ORDER BY created_at DESC');
      return createResponse(items);
    }

    return createErrorResponse('Agent endpoint not found', 404);
  } catch (err: any) {
    console.error('Agent Handler Error:', err);
    return createErrorResponse(err.message || 'Internal Agent Error');
  }
};

export const handleJobs = async (request: Request, db: DatabaseService) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/'); 
    const id = pathParts.length > 3 ? pathParts[3] : null;

    try {
        if (id) {
             const job = await db.queryOne<AgentJob>('SELECT * FROM agent_jobs WHERE id = ?', [id]);
             if (!job) return createErrorResponse('Job not found', 404);
             return createResponse(job);
        } 
        else {
            const limitParam = url.searchParams.get('limit');
            const limit = limitParam ? parseInt(limitParam, 10) : 50;
            const safeLimit = Math.min(Math.max(limit, 1), 100);
            
            const jobs = await db.query<AgentJob>(
                `SELECT * FROM agent_jobs ORDER BY created_at DESC LIMIT ?`, 
                [safeLimit]
            );
            
            return createResponse(jobs);
        }
    } catch (err: any) {
        console.error("HandleJobs Error:", err);
        return createErrorResponse('Failed to fetch jobs');
    }
};