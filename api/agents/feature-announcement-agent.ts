
import { Env, Writer, CompanySettings } from '../../types';
import { DatabaseService } from '../../database/db';
import { GeminiService } from '../services/gemini-service';
import { AgentOrchestrator } from './orchestrator';
import { createSlug } from '../../utils/helpers';

export class FeatureAnnouncementAgent {
  private gemini: GeminiService;
  private orchestrator: AgentOrchestrator;

  constructor(private env: Env, private db: DatabaseService) {
    this.gemini = new GeminiService(env);
    this.orchestrator = new AgentOrchestrator(db);
  }

  // Just Create Record
  async createAnnouncement(productName: string, featureName: string, description: string, customInstructions?: string): Promise<number> {
    await this.db.execute(
      `INSERT INTO feature_announcements (product_name, feature_name, description, custom_instructions, status, created_at) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP)`,
      [productName, featureName, description, customInstructions || '']
    );
    const res = await this.db.queryOne<{id: number}>('SELECT last_insert_rowid() as id');
    return res?.id || 0;
  }

  // Phase 1: Market Analysis
  async performMarketAnalysis(announcementId: number, scanVolume: number = 3) {
    const jobId = await this.orchestrator.startJob('researcher');
    try {
      await this.orchestrator.updateProgress(jobId, 10, "Analyzing product context...");
      
      const announcement = await this.db.queryOne<any>('SELECT * FROM feature_announcements WHERE id = ?', [announcementId]);
      if (!announcement) throw new Error("Announcement not found");

      // Search for industry standards and competitor features
      const topic = `${announcement.product_name} ${announcement.feature_name} features industry standards benefits`;
      await this.orchestrator.log(jobId, `Scanning market data for: ${topic}`);
      await this.orchestrator.updateProgress(jobId, 30, `Gathering ${scanVolume} insights from web...`);
      
      // Perform Gemini Research
      const research = await this.gemini.researchTopic(topic, scanVolume);
      
      await this.orchestrator.updateProgress(jobId, 80, "Synthesizing market context...");
      
      const researchData = research.join('\n\n');
      
      // Save Phase 1 Results
      await this.db.execute(
          "UPDATE feature_announcements SET research_data = ?, status = 'analyzed' WHERE id = ?", 
          [researchData, announcementId]
      );

      await this.orchestrator.log(jobId, "Market context analysis complete.");
      await this.orchestrator.completeJob(jobId, 'success', `Market analysis for ${announcement.feature_name} ready.`);

    } catch (error: any) {
      await this.orchestrator.log(jobId, `Error: ${error.message}`);
      await this.orchestrator.completeJob(jobId, 'failed', error.message);
    }
  }

  // Phase 2: Generation
  async generateAnnouncement(announcementId: number, options: { writerId?: number, length: string, relation: string }): Promise<{ jobId: number, work: Promise<void> }> {
    const jobId = await this.orchestrator.startJob('publisher');
    
    const work = async () => {
        try {
            await this.orchestrator.updateProgress(jobId, 10, "Loading context and writer...");
            const announcement = await this.db.queryOne<any>('SELECT * FROM feature_announcements WHERE id = ?', [announcementId]);
            if (!announcement) throw new Error("Announcement not found");

            // Select Writer
            let writer: Writer | undefined;
            if (options.writerId) {
                writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [options.writerId]);
            }
            if (!writer) writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
            if (!writer) {
                const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
                writer = writers[0]; 
            }
            if (!writer) throw new Error("No writer found");

            await this.orchestrator.log(jobId, `Selected writer: ${writer.name}`);
            await this.orchestrator.updateProgress(jobId, 40, "Drafting announcement...");

            const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

            // Config Logic
            let lengthInstruction = "1000 words, detailed breakdown";
            if (options.length === 'short') lengthInstruction = "500 words, punchy and direct";
            if (options.length === 'long') lengthInstruction = "1500+ words, extensive deep dive";

            let relationInstruction = "Focus on the feature, mention brand naturally.";
            if (options.relation === 'low') relationInstruction = "Focus purely on the tech/utility. Subtle branding.";
            if (options.relation === 'high') relationInstruction = "Heavy branding. Emphasize this as a key differentiator for the company.";

            const prompt = `
                Write an exciting feature announcement blog post for:
                Product: "${announcement.product_name}"
                New Feature/Update: "${announcement.feature_name}"
                
                Feature Description (Release Notes):
                ${announcement.description}

                Custom Instructions:
                ${announcement.custom_instructions || 'None'}

                Market Context (Research Data):
                ${announcement.research_data || 'No external research data available.'}

                Company Context:
                Name: ${company?.name}
                Audience: ${company?.target_audience}
                Tone: ${company?.tone_of_voice}

                CONFIGURATION:
                - Length: ${lengthInstruction}
                - Brand Relation: ${relationInstruction}

                Goal: Write a compelling, high-converting announcement that highlights the value of this update to the user.
            `;

            const systemInstruction = `You are ${writer.name}, a product marketing expert. Your style is ${writer.style}.`;
            
            const content = await this.gemini.generateBlog(prompt, systemInstruction);
            const metadata = await this.gemini.extractMetadata(content);
            const slug = createSlug(metadata.title);

            await this.orchestrator.updateProgress(jobId, 80, "Finalizing content...");

            // Save Blog
            await this.db.execute(
                `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
                [metadata.title, slug, content, writer.id]
            );

            await this.db.execute("UPDATE feature_announcements SET status = 'processed' WHERE id = ?", [announcementId]);
            
            await this.orchestrator.createNotification({
                type: 'success',
                category: 'announcement',
                title: 'Announcement Ready',
                message: `Draft for "${announcement.feature_name}" is ready.`,
                related_job_id: jobId,
                action_text: 'Review Draft'
            });

            await this.orchestrator.log(jobId, "Announcement created successfully.");
            await this.orchestrator.completeJob(jobId, 'success', `Announcement for ${announcement.feature_name} created.`);

        } catch (error: any) {
            await this.orchestrator.log(jobId, `Error: ${error.message}`);
            await this.orchestrator.completeJob(jobId, 'failed', error.message);
        }
    };

    return { jobId, work: work() };
  }
}
