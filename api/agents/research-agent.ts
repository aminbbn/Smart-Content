import { Env, Writer, CompanySettings } from '../../types';
import { DatabaseService } from '../../database/db';
import { GeminiService } from '../services/gemini-service';
import { AgentOrchestrator } from './orchestrator';
import { createSlug } from '../../utils/helpers';

export class ResearchAgent {
  private gemini: GeminiService;
  private orchestrator: AgentOrchestrator;

  constructor(private env: Env, private db: DatabaseService) {
    this.gemini = new GeminiService(env);
    this.orchestrator = new AgentOrchestrator(db);
  }

  async startResearch(prompt: string, writerId?: number): Promise<number> {
    await this.db.execute(
      `INSERT INTO research_tasks (query, status, results, created_at) VALUES (?, 'pending', ?, CURRENT_TIMESTAMP)`,
      [prompt, JSON.stringify({ progress: 0, logs: [], writerId })]
    );
    const res = await this.db.queryOne<{id: number}>('SELECT last_insert_rowid() as id');
    return res?.id || 0;
  }

  async executeResearch(taskId: number) {
    const jobId = await this.orchestrator.startJob('researcher');
    try {
      await this.db.execute("UPDATE research_tasks SET status = 'researching' WHERE id = ?", [taskId]);
      
      const task = await this.db.queryOne<any>('SELECT * FROM research_tasks WHERE id = ?', [taskId]);
      const taskData = JSON.parse(task.results || '{}');
      const query = task.query;

      const updateProgress = async (p: number, msg: string) => {
        taskData.progress = p;
        taskData.logs.push(msg);
        await this.db.execute("UPDATE research_tasks SET results = ? WHERE id = ?", [JSON.stringify(taskData), taskId]);
        await this.orchestrator.log(jobId, msg);
      };

      await updateProgress(10, `Starting research on: ${query}`);

      // Phase 1: Main Topic Research
      const mainInsights = await this.gemini.researchTopic(query);
      await updateProgress(30, "Analyzed main topic.");

      // Phase 2: Applications & Trends
      const trendInsights = await this.gemini.researchTopic(`${query} future trends and applications`);
      await updateProgress(50, "Analyzed trends.");

      // Phase 3: Case Studies
      const caseStudyInsights = await this.gemini.researchTopic(`${query} case studies and real world examples`);
      await updateProgress(70, "Gathered case studies.");

      const allResearch = [...mainInsights, ...trendInsights, ...caseStudyInsights].join("\n\n");
      
      // Select Writer
      let writer: Writer | null = null;
      if (taskData.writerId) {
        writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [taskData.writerId]);
      } 
      
      if (!writer) {
        // Fallback to default, then first available
        writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
      }

      if (!writer) {
        const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
        writer = writers[0];
      }

      if (!writer) throw new Error("No writer found");

      await updateProgress(80, `Drafting content with writer: ${writer.name}`);
      const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

      // Generate Blog
      const prompt = `
        Create a deep-dive research article about: ${query}.
        
        Research Data:
        ${allResearch}

        Company Context:
        ${company?.name} - ${company?.product_info}

        Instructions:
        - Integrate the research data naturally.
        - Mention our company products where they solve problems identified in the research.
        - Maintain a ${writer.personality} tone.
      `;

      const systemInstruction = `You are ${writer.name}. Bio: ${writer.bio}. Write a high-quality, researched article.`;
      
      const content = await this.gemini.generateBlog(prompt, systemInstruction);
      const metadata = await this.gemini.extractMetadata(content);
      const slug = createSlug(metadata.title);

      await this.db.execute(
        `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
        [metadata.title, slug, content, writer.id]
      );

      await updateProgress(100, "Research and writing completed.");
      await this.db.execute("UPDATE research_tasks SET status = 'completed' WHERE id = ?", [taskId]);
      await this.orchestrator.completeJob(jobId, 'success');

    } catch (error: any) {
      await this.db.execute("UPDATE research_tasks SET status = 'failed' WHERE id = ?", [taskId]);
      await this.orchestrator.log(jobId, `Error: ${error.message}`);
      await this.orchestrator.completeJob(jobId, 'failed');
    }
  }
}