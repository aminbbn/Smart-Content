
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

  async createAnnouncement(productName: string, featureName: string, description: string, customInstructions?: string): Promise<number> {
    await this.db.execute(
      `INSERT INTO feature_announcements (product_name, feature_name, description, custom_instructions, status, created_at) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP)`,
      [productName, featureName, description, customInstructions || '']
    );
    const res = await this.db.queryOne<{id: number}>('SELECT last_insert_rowid() as id');
    return res?.id || 0;
  }

  async researchAndWrite(announcementId: number, writerId?: number) {
    const jobId = await this.orchestrator.startJob('publisher');
    try {
      await this.orchestrator.log(jobId, "Starting feature announcement workflow...");
      
      const announcement = await this.db.queryOne<any>('SELECT * FROM feature_announcements WHERE id = ?', [announcementId]);
      
      // 1. Research Industry Standards
      const topic = `${announcement.product_name} ${announcement.feature_name} benefits and industry standards`;
      await this.orchestrator.log(jobId, `Researching context for: ${topic}`);
      await this.orchestrator.updateProgress(jobId, 20, "Analyzing industry context...");
      
      const research = await this.gemini.researchTopic(topic);
      
      // 2. Select Marketing Writer
      let writer: Writer | undefined;
      if (writerId) {
          writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [writerId]);
      }
      if (!writer) {
          writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
      }
      if (!writer) {
          const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
          writer = writers[0]; 
      }
      
      if (!writer) throw new Error("No writer found");

      await this.orchestrator.log(jobId, `Selected writer: ${writer.name}`);
      await this.orchestrator.updateProgress(jobId, 50, "Drafting announcement...");

      // 3. Write Announcement
      const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

      const prompt = `
        Write an exciting feature announcement blog post for:
        Product: "${announcement.product_name}"
        New Feature/Update: "${announcement.feature_name}"
        
        Feature Description (Release Notes):
        ${announcement.description}

        Custom Instructions:
        ${announcement.custom_instructions || 'None'}

        Industry Context/Benefits (Research Data):
        ${research.join('\n')}

        Company Context:
        Name: ${company?.name}
        Audience: ${company?.target_audience}
        Tone: ${company?.tone_of_voice}

        Goal: Write a compelling, high-converting announcement that highlights the value of this update to the user.
      `;

      const systemInstruction = `You are ${writer.name}, a product marketing expert. Your style is ${writer.style}.`;
      
      const content = await this.gemini.generateBlog(prompt, systemInstruction);
      const metadata = await this.gemini.extractMetadata(content);
      const slug = createSlug(metadata.title);

      await this.orchestrator.updateProgress(jobId, 80, "Finalizing content...");

      // 4. Save
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
  }
}
