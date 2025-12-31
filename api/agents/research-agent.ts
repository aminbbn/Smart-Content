
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

  async generateResearchSuggestions(): Promise<string[]> {
    try {
      const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');
      const prompt = `
        Based on the following company profile, suggest 4 specific, high-value, and trending research topics for content marketing.
        Focus on industry analysis, future predictions, or problem-solving deep dives.
        
        Company: ${company?.name || 'Tech Company'}
        Industry: ${company?.industry || 'Technology'}
        Description: ${company?.description || ''}
        Target Audience: ${company?.target_audience || 'Professionals'}
        
        Return ONLY a raw JSON array of strings. Do not include markdown formatting.
        Example: ["The Future of AI in Healthcare", "Sustainable Supply Chain Strategies"]
      `;
      
      // We use generateBlog method as a generic text generator here since it's just a wrapper around generateContent
      const response = await this.gemini.generateBlog(prompt, "You are a senior content strategist."); 
      
      const cleanText = response.replace(/```json\n?|\n?```/g, '').trim();
      const start = cleanText.indexOf('[');
      const end = cleanText.lastIndexOf(']');
      
      if (start !== -1 && end !== -1) {
          return JSON.parse(cleanText.substring(start, end + 1));
      }
      return [];
    } catch (error) {
      console.error("Suggestion Error:", error);
      return [
        "Emerging trends in your industry",
        "Impact of AI on operational efficiency",
        "Customer retention strategies for 2025",
        "Comparative analysis of market leaders"
      ];
    }
  }

  async startResearch(prompt: string, writerId?: number, customInstructions?: string): Promise<number> {
    // We store customInstructions in the results JSON for now to keep schema simple
    const initialData = { 
        progress: 0, 
        logs: [], 
        writerId,
        customInstructions 
    };

    await this.db.execute(
      `INSERT INTO research_tasks (query, status, results, created_at) VALUES (?, 'pending', ?, CURRENT_TIMESTAMP)`,
      [prompt, JSON.stringify(initialData)]
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
        await this.orchestrator.updateProgress(jobId, p, msg);
      };

      await updateProgress(10, `Starting deep research on: ${query}`);

      // Phase 1: Context & Strategy
      const strategyPrompt = `Analyze this topic: "${query}" and the custom instructions: "${taskData.customInstructions || 'None'}". Plan 3 key research angles.`;
      await this.gemini.generateBlog(strategyPrompt, "You are a lead researcher."); // Warm up / Strategy
      await updateProgress(20, "Research strategy defined.");

      // Phase 2: Main Topic Research (Search)
      const mainInsights = await this.gemini.researchTopic(query);
      await updateProgress(40, "Core data gathered from web.");

      // Phase 3: Trends & Stats
      const trendInsights = await this.gemini.researchTopic(`${query} latest statistics and future trends 2025`);
      await updateProgress(60, "Statistical analysis complete.");

      // Phase 4: Competitor/Market Angle
      const marketInsights = await this.gemini.researchTopic(`${query} challenges and opportunities`);
      await updateProgress(75, "Market context analyzed.");

      const allResearch = [...mainInsights, ...trendInsights, ...marketInsights].join("\n\n");
      
      // Select Writer
      let writer: Writer | null = null;
      if (taskData.writerId) {
        writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [taskData.writerId]);
      } 
      if (!writer) writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
      if (!writer) {
        const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
        writer = writers[0];
      }

      if (!writer) throw new Error("No writer found");

      await updateProgress(85, `Drafting comprehensive report with writer: ${writer.name}`);
      const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

      // Generate Blog/Report
      const prompt = `
        Create a comprehensive, deep-dive research article about: ${query}.
        
        RESEARCH DATA (Use this as your source of truth):
        ${allResearch}

        COMPANY CONTEXT:
        ${company?.name} - ${company?.industry}
        ${company?.product_info}

        CUSTOM INSTRUCTIONS:
        ${taskData.customInstructions || 'None'}

        WRITING RULES:
        - Integrate the research data, statistics, and trends naturally.
        - Cite sources where possible (based on the research data provided).
        - Maintain a ${writer.personality} tone and ${writer.style} style.
        - Structure with clear H2 and H3 headers.
        - Conclude with actionable takeaways.
      `;

      const systemInstruction = `You are ${writer.name}. Bio: ${writer.bio}. You are an expert researcher and writer.`;
      
      const content = await this.gemini.generateBlog(prompt, systemInstruction);
      const metadata = await this.gemini.extractMetadata(content);
      const slug = createSlug(metadata.title);

      await this.db.execute(
        `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
        [metadata.title, slug, content, writer.id]
      );

      await updateProgress(100, "Research mission accomplished.");
      await this.db.execute("UPDATE research_tasks SET status = 'completed' WHERE id = ?", [taskId]);
      
      await this.orchestrator.createNotification({
          type: 'success',
          category: 'research',
          title: 'Research Complete',
          message: `Deep dive on "${metadata.title}" is ready.`,
          related_job_id: jobId,
          action_text: 'Read Report'
      });

      await this.orchestrator.completeJob(jobId, 'success', 'Research report generated.');

    } catch (error: any) {
      await this.db.execute("UPDATE research_tasks SET status = 'failed' WHERE id = ?", [taskId]);
      await this.orchestrator.log(jobId, `Error: ${error.message}`);
      await this.orchestrator.completeJob(jobId, 'failed', error.message);
    }
  }
}
