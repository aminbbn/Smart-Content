
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

  async startResearch(prompt: string, writerId?: number, customInstructions?: string, scanVolume: number = 5): Promise<number> {
    const initialData = { 
        progress: 0, 
        logs: [], 
        writerId,
        customInstructions,
        scanVolume,
        researchData: "" 
    };

    await this.db.execute(
      `INSERT INTO research_tasks (query, status, results, created_at) VALUES (?, 'pending', ?, CURRENT_TIMESTAMP)`,
      [prompt, JSON.stringify(initialData)]
    );
    const res = await this.db.queryOne<{id: number}>('SELECT last_insert_rowid() as id');
    return res?.id || 0;
  }

  // Phase 1: Research
  async performResearch(taskId: number) {
    const jobId = await this.orchestrator.startJob('researcher');
    try {
      await this.db.execute("UPDATE research_tasks SET status = 'researching' WHERE id = ?", [taskId]);
      
      const task = await this.db.queryOne<any>('SELECT * FROM research_tasks WHERE id = ?', [taskId]);
      const taskData = JSON.parse(task.results || '{}');
      const query = task.query;
      const scanDepth = taskData.scanVolume || 5;
      const insightsPerAngle = Math.max(1, Math.floor(scanDepth / 3)) + 1;

      const updateProgress = async (p: number, msg: string) => {
        taskData.progress = p;
        taskData.logs.push(msg);
        await this.db.execute("UPDATE research_tasks SET results = ? WHERE id = ?", [JSON.stringify(taskData), taskId]);
        await this.orchestrator.log(jobId, msg);
        await this.orchestrator.updateProgress(jobId, p, msg);
      };

      await updateProgress(10, `Starting deep research on: ${query} (Depth: ${scanDepth})`);

      // Phase 1: Context & Strategy
      const strategyPrompt = `Analyze this topic: "${query}" and the custom instructions: "${taskData.customInstructions || 'None'}". Plan 3 key research angles.`;
      await this.gemini.generateBlog(strategyPrompt, "You are a lead researcher.");
      await updateProgress(20, "Research strategy defined.");

      // Phase 2: Main Topic Research (Search)
      const mainInsights = await this.gemini.researchTopic(query, insightsPerAngle);
      await updateProgress(40, `Core data gathered from web (${insightsPerAngle} sources).`);

      // Phase 3: Trends & Stats
      const trendInsights = await this.gemini.researchTopic(`${query} latest statistics and future trends 2025`, insightsPerAngle);
      await updateProgress(70, "Statistical analysis complete.");

      // Phase 4: Competitor/Market Angle
      const marketInsights = await this.gemini.researchTopic(`${query} challenges and opportunities`, insightsPerAngle);
      await updateProgress(90, "Market context analyzed.");

      const allResearch = [...mainInsights, ...trendInsights, ...marketInsights].join("\n\n");
      
      // Store Research
      taskData.researchData = allResearch;
      taskData.progress = 100;
      taskData.logs.push("Research phase complete. Ready to write.");
      
      await this.db.execute("UPDATE research_tasks SET status = 'researched', results = ? WHERE id = ?", [JSON.stringify(taskData), taskId]);
      
      await this.orchestrator.completeJob(jobId, 'success', 'Research complete. Ready for report generation.');

    } catch (error: any) {
      await this.db.execute("UPDATE research_tasks SET status = 'failed' WHERE id = ?", [taskId]);
      await this.orchestrator.log(jobId, `Error: ${error.message}`);
      await this.orchestrator.completeJob(jobId, 'failed', error.message);
    }
  }

  // Phase 2: Generation Wrapper
  async generateReportWithJobId(taskId: number, options: { writerId?: number, length: string, relation: string }): Promise<{ jobId: number, work: Promise<void> }> {
      const jobId = await this.orchestrator.startJob('writer');
      
      const work = async () => {
        try {
            const task = await this.db.queryOne<any>('SELECT * FROM research_tasks WHERE id = ?', [taskId]);
            if (!task) throw new Error("Task not found");
            
            const taskData = JSON.parse(task.results || '{}');
            const query = task.query;
            const researchData = taskData.researchData || "No research data found.";

            await this.orchestrator.updateProgress(jobId, 10, "Loading research context...");

            // Select Writer
            let writerId = options.writerId || taskData.writerId;
            let writer: Writer | null = null;
            
            if (writerId) {
                writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [writerId]);
            } 
            if (!writer) writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
            if (!writer) {
                const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
                writer = writers[0];
            }
            if (!writer) throw new Error("No writer found");

            await this.orchestrator.log(jobId, `Writer assigned: ${writer.name}`);
            await this.orchestrator.updateProgress(jobId, 30, `Drafting report (${options.length}, ${options.relation} relation)...`);

            const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

            // Logic for Length
            let lengthInstruction = "1500-2000 words, comprehensive";
            if (options.length === 'short') lengthInstruction = "800-1000 words, concise summary";
            if (options.length === 'long') lengthInstruction = "2500+ words, extensive deep dive";

            // Logic for Relation
            let relationInstruction = "Mention the company contextually.";
            if (options.relation === 'low') relationInstruction = "Keep it purely educational/editorial. No sales pitch.";
            if (options.relation === 'high') relationInstruction = `Strongly connect findings to ${company?.name}'s solutions. High commercial intent.`;

            const prompt = `
                Create a comprehensive research article/report about: ${query}.
                
                RESEARCH DATA SOURCE (Use strictly):
                ${researchData}

                COMPANY CONTEXT:
                ${company?.name} - ${company?.industry}
                ${company?.product_info}

                CONFIGURATION:
                - Length: ${lengthInstruction}
                - Brand Relation: ${relationInstruction}
                - Custom Instructions: ${taskData.customInstructions || 'None'}

                WRITING RULES:
                - Maintain a ${writer.personality} tone and ${writer.style} style.
                - Structure with clear H2 and H3 headers.
                - Synthesize the research data into a coherent narrative.
                - Conclude with actionable takeaways.
            `;

            const systemInstruction = `You are ${writer.name}. Bio: ${writer.bio}. You are an expert researcher and writer.`;
            
            const content = await this.gemini.generateBlog(prompt, systemInstruction);
            
            await this.orchestrator.updateProgress(jobId, 80, "Optimizing metadata...");
            const metadata = await this.gemini.extractMetadata(content);
            const slug = createSlug(metadata.title);

            await this.db.execute(
                `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
                [metadata.title, slug, content, writer.id]
            );

            // Update Task to Completed
            taskData.progress = 100;
            taskData.logs.push(`Report generated: ${metadata.title}`);
            await this.db.execute("UPDATE research_tasks SET status = 'completed', results = ? WHERE id = ?", [JSON.stringify(taskData), taskId]);
            
            await this.orchestrator.createNotification({
                type: 'success',
                category: 'research',
                title: 'Report Ready',
                message: `Research report "${metadata.title}" created.`,
                related_job_id: jobId,
                action_text: 'Read Draft'
            });

            await this.orchestrator.completeJob(jobId, 'success', `Report "${metadata.title}" created.`);

        } catch (error: any) {
            await this.orchestrator.log(jobId, `Error: ${error.message}`);
            await this.orchestrator.completeJob(jobId, 'failed', error.message);
        }
      };

      return { jobId, work: work() };
  }
}
