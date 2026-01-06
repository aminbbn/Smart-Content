
import { ExecutionContext } from '@cloudflare/workers-types';
import { DatabaseService } from '../../database/db';
import { createResponse, createErrorResponse } from '../../utils/helpers';
import { DailyNewsAgent } from '../agents/daily-news-agent';
import { ResearchAgent } from '../agents/research-agent';
import { FeatureAnnouncementAgent } from '../agents/feature-announcement-agent';
import { Env, AgentJob } from '../../types';

export const handleAgents = async (request: Request, env: Env, db: DatabaseService, ctx: ExecutionContext) => {
  const url = new URL(request.url);
  // Robust path extraction: find everything after /api/agents/
  const match = url.pathname.match(/\/api\/agents\/(.+)/);
  const path = match ? match[1] : '';
  const method = request.method;

  try {
    // --- DAILY NEWS AGENT ---
    if (path === 'daily-news/fetch' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as any;
      const agent = new DailyNewsAgent(env, db);
      const { jobId, work } = await agent.startFetchNews(body);
      ctx.waitUntil(work); 
      return createResponse({ jobId, message: 'News fetch started' });
    }

    if (path === 'daily-news/generate-blog' && method === 'POST') {
      const body = await request.json().catch(() => ({})) as any;
      const agent = new DailyNewsAgent(env, db);
      const { jobId, work } = await agent.startGenerateBlog(body);
      ctx.waitUntil(work);
      return createResponse({ jobId, message: 'Blog generation started' });
    }

    // --- RESEARCH AGENT ---
    if (path === 'research/suggest' && method === 'GET') {
      const agent = new ResearchAgent(env, db);
      const suggestions = await agent.generateResearchSuggestions();
      return createResponse(suggestions);
    }

    if (path === 'research/start' && method === 'POST') {
      const body = await request.json() as any;
      if (!body.prompt) return createErrorResponse("Prompt required", 400);
      
      const agent = new ResearchAgent(env, db);
      const taskId = await agent.startResearch(
          body.prompt, 
          body.writerId, 
          body.customInstructions,
          body.scanVolume
      );
      
      ctx.waitUntil(agent.performResearch(taskId));
      return createResponse({ taskId, message: 'Research phase started' });
    }

    if (path === 'research/generate' && method === 'POST') {
        const body = await request.json() as any;
        if (!body.taskId) return createErrorResponse("Task ID required", 400);

        const agent = new ResearchAgent(env, db);
        const { jobId, work } = await (agent as any).generateReportWithJobId(body.taskId, {
            writerId: body.writerId,
            length: body.length,
            relation: body.relation
        });
        
        ctx.waitUntil(work);
        return createResponse({ jobId, message: 'Report generation started' });
    }

    if (path === 'research/tasks' && method === 'GET') {
      const tasks = await db.query('SELECT * FROM research_tasks ORDER BY created_at DESC');
      
      // MOCK DATA INJECTION
      if (tasks.length === 0) {
          const mockTasks = [
              { id: 1, query: "Impact of AI on Healthcare", status: "completed", created_at: new Date().toISOString(), results: JSON.stringify({ progress: 100, logs: ["Research started...", "Found 12 sources", "Drafting content", "Complete"] }) },
              { id: 2, query: "Sustainable Energy Trends 2025", status: "researched", created_at: new Date(Date.now() - 300000).toISOString(), results: JSON.stringify({ progress: 100, logs: ["Research started...", "Analyzing market data...", "Research Complete"], researchData: "Mock data..." }) },
              { id: 3, query: "History of the Internet", status: "failed", created_at: new Date(Date.now() - 800000).toISOString(), results: JSON.stringify({ progress: 20, logs: ["Research started...", "Error connecting to search tool"] }) }
          ];
          return createResponse(mockTasks);
      }

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
      
      // Phase 1 Start: Create record
      const id = await agent.createAnnouncement(
          body.productName, 
          body.featureName, 
          body.description,
          body.customInstructions
      );
      
      return createResponse({ id, message: 'Announcement draft created' });
    }

    if (path === 'feature-announcement/research' && method === 'POST') {
      const body = await request.json() as any;
      if (!body.id) return createErrorResponse("ID required", 400);
      
      const agent = new FeatureAnnouncementAgent(env, db);
      // Fire and forget research job, we can track via job list polling or basic status check
      ctx.waitUntil(agent.performMarketAnalysis(body.id, body.scanVolume || 3));
      
      return createResponse({ success: true, message: 'Market analysis started' });
    }

    if (path === 'feature-announcement/generate' && method === 'POST') {
      const body = await request.json() as any;
      if (!body.id) return createErrorResponse("ID required", 400);
      
      const agent = new FeatureAnnouncementAgent(env, db);
      const { jobId, work } = await agent.generateAnnouncement(body.id, {
          writerId: body.writerId,
          length: body.length,
          relation: body.relation
      });
      
      ctx.waitUntil(work);
      return createResponse({ jobId, message: 'Announcement generation started' });
    }
    
    if (path === 'feature-announcement/list' && method === 'GET') {
      const items = await db.query('SELECT * FROM feature_announcements ORDER BY created_at DESC');
      
      // MOCK DATA INJECTION
      if (items.length === 0) {
          return createResponse([
              { id: 1, product_name: "Mobile App", feature_name: "Dark Mode 2.0", description: "Improved contrast.", status: "processed", created_at: new Date().toISOString() },
              { id: 2, product_name: "Web Platform", feature_name: "Beta Dashboard", description: "New analytics view.", status: "draft", created_at: new Date(Date.now() - 86400000).toISOString() }
          ]);
      }

      return createResponse(items);
    }

    return createErrorResponse('Agent endpoint not found', 404);
  } catch (err: any) {
    console.error('Agent Handler Error:', err);
    return createErrorResponse(err.message || 'Internal Agent Error');
  }
};

export const handleJobs = async (request: Request, db: DatabaseService) => {
    // This function seems unused in routing but kept for reference
    return createErrorResponse('Use /api/agent-jobs endpoints instead');
};
