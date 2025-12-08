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

  async createAnnouncement(featureName: string, description: string): Promise<number> {
    await this.db.execute(
      `INSERT INTO feature_announcements (feature_name, description, status, created_at) VALUES (?, ?, 'draft', CURRENT_TIMESTAMP)`,
      [featureName, description]
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
      await this.orchestrator.log(jobId, "Researching industry standards...");
      const research = await this.gemini.researchTopic(`Industry standards and benefits for: ${announcement.feature_name}`);
      
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

      // 3. Write Announcement
      await this.orchestrator.log(jobId, "Drafting announcement...");
      const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

      const prompt = `
        Write an exciting feature announcement blog post for our new feature: "${announcement.feature_name}".
        
        Feature Description:
        ${announcement.description}

        Industry Context/Benefits (Research):
        ${research.join('\n')}

        Company: ${company?.name}
        Tone: Enthusiastic, Professional, Innovative.
      `;

      const systemInstruction = `You are ${writer.name}, a product marketing expert. Write a compelling announcement that drives adoption.`;
      
      const content = await this.gemini.generateBlog(prompt, systemInstruction);
      const metadata = await this.gemini.extractMetadata(content);
      const slug = createSlug(metadata.title);

      // 4. Save
      await this.db.execute(
        `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
        [metadata.title, slug, content, writer.id]
      );

      await this.db.execute("UPDATE feature_announcements SET status = 'processed' WHERE id = ?", [announcementId]);
      
      await this.orchestrator.log(jobId, "Announcement created successfully.");
      await this.orchestrator.completeJob(jobId, 'success');

    } catch (error: any) {
      await this.orchestrator.log(jobId, `Error: ${error.message}`);
      await this.orchestrator.completeJob(jobId, 'failed');
    }
  }
}