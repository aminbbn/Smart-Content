import { Env, CompanySettings, AgentSettings, Writer, NewsArticle } from '../../types';
import { DatabaseService } from '../../database/db';
import { GeminiService } from '../services/gemini-service';
import { AgentOrchestrator } from './orchestrator';
import { createSlug } from '../../utils/helpers';

export class DailyNewsAgent {
  private gemini: GeminiService;
  private orchestrator: AgentOrchestrator;

  constructor(private env: Env, private db: DatabaseService) {
    this.gemini = new GeminiService(env);
    this.orchestrator = new AgentOrchestrator(db);
  }

  async startFetchNews(): Promise<{ jobId: number, work: Promise<void> }> {
    const jobId = await this.orchestrator.startJob('researcher');
    
    const work = async () => {
      try {
        await this.orchestrator.updateProgress(jobId, 10, "آماده‌سازی برای جستجوی اخبار...");
        
        const companySettings = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');
        const industry = companySettings?.industry || "Technology and AI";
        
        await this.orchestrator.log(jobId, `Target Industry: ${industry}`);
        await this.orchestrator.updateProgress(jobId, 30, `جستجو در گوگل برای: ${industry}`);
        
        const articles = await this.gemini.searchNews(`latest important news stories about ${industry}`);
        
        if (articles.length === 0) {
            const msg = "نتیجه‌ای در جستجو یافت نشد (ممکن است مشکل از API Key یا مدل باشد)";
            await this.orchestrator.log(jobId, msg);
            await this.orchestrator.completeJob(jobId, 'failed', msg);
            await this.orchestrator.createNotification({
                type: 'warning',
                category: 'news',
                title: 'خبری یافت نشد',
                message: msg,
                related_job_id: jobId
            });
            return;
        }

        await this.orchestrator.log(jobId, `Found ${articles.length} potential articles.`);
        await this.orchestrator.updateProgress(jobId, 60, "پردازش و ذخیره نتایج...");
        
        let newCount = 0;
        for (const article of articles) {
          if (!article.url) continue;
          
          const exists = await this.db.queryOne('SELECT id FROM news_articles WHERE url = ?', [article.url]);
          if (!exists) {
            await this.db.execute(
              `INSERT INTO news_articles (title, url, source, content, published_at, created_at, status) 
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'new')`,
              [article.title, article.url, article.source, article.content || '', article.published_at]
            );
            newCount++;
            await this.orchestrator.log(jobId, `Saved: ${article.title}`);
          } else {
             await this.orchestrator.log(jobId, `Skipped duplicate: ${article.title}`);
          }
        }

        await this.orchestrator.updateProgress(jobId, 100, "تکمیل شد");
        await this.orchestrator.log(jobId, `Operation complete. ${newCount} new articles added.`);
        await this.orchestrator.completeJob(jobId, 'success', `با موفقیت ${newCount} خبر جدید یافت شد.`);

        await this.orchestrator.createNotification({
            type: 'success',
            category: 'news',
            title: 'دریافت اخبار تکمیل شد',
            message: `${newCount} خبر جدید به سیستم اضافه شد.`,
            related_job_id: jobId
        });

      } catch (error: any) {
        const errorMsg = error.message || "خطای ناشناخته";
        await this.orchestrator.log(jobId, `CRITICAL ERROR: ${errorMsg}`);
        await this.orchestrator.completeJob(jobId, 'failed', `خطا: ${errorMsg.substring(0, 50)}...`);
        await this.orchestrator.createNotification({
            type: 'error',
            category: 'news',
            title: 'خطا در دریافت اخبار',
            message: errorMsg,
            related_job_id: jobId
        });
      }
    };

    return { jobId, work: work() };
  }

  async startGenerateBlog(writerId?: number): Promise<{ jobId: number, work: Promise<void> }> {
    const jobId = await this.orchestrator.startJob('writer');
    
    const work = async () => {
      try {
        await this.orchestrator.updateProgress(jobId, 10, "بررسی اخبار موجود...");
        await this.orchestrator.log(jobId, "Starting daily blog generation...");

        const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');
        const articles = await this.db.query<NewsArticle>('SELECT * FROM news_articles WHERE status = "new" ORDER BY published_at DESC LIMIT 5');
        
        if (articles.length < 1) {
          const msg = "تعداد اخبار جدید کافی نیست (حداقل ۱ خبر لازم است)";
          await this.orchestrator.log(jobId, msg);
          await this.orchestrator.completeJob(jobId, 'failed', msg);
          await this.orchestrator.createNotification({
            type: 'warning',
            category: 'blog',
            title: 'تولید بلاگ متوقف شد',
            message: msg,
            related_job_id: jobId
          });
          return;
        }

        await this.orchestrator.updateProgress(jobId, 30, "انتخاب نویسنده هوشمند...");
        
        let writer: Writer | undefined;
        if (writerId) {
             writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [writerId]);
        } 
        
        if (!writer) {
            // Try default
            writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
        }
        
        if (!writer) {
             // Fallback to first
             const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
             writer = writers[0];
        }

        if (!writer) {
            writer = { name: 'AI Assistant', bio: 'Generic AI', personality: '{}', style: '{}', id: 0, is_default: 0, created_at: '' };
        }

        await this.orchestrator.log(jobId, `Selected writer: ${writer.name}`);

        await this.orchestrator.updateProgress(jobId, 50, "در حال نگارش محتوا توسط مدل هوش مصنوعی...");
        const newsContext = articles.map((a) => `- ${a.title} (${a.source}): ${a.url}`).join('\n');
        const prompt = `
          Write a comprehensive daily news round-up blog post about the following latest updates:
          ${newsContext}

          Context about our company:
          Name: ${company?.name}
          Industry: ${company?.industry}
          Target Audience: ${company?.target_audience}
          Products: ${company?.product_info}

          Instructions:
          - Analyze how these news items impact the industry.
          - Mention our company naturally if relevant to our products (soft sell).
          - Use the specific persona defined in the system instructions.
          - Length: 1000-1500 words.
          - Format: Markdown.
        `;

        const systemInstruction = `
          You are ${writer.name}. 
          Bio: ${writer.bio}.
          Personality: ${writer.personality}.
          Writing Style: ${writer.style}.
        `;

        const content = await this.gemini.generateBlog(prompt, systemInstruction);

        await this.orchestrator.updateProgress(jobId, 80, "استخراج متادیتا و سئو...");
        const metadata = await this.gemini.extractMetadata(content);
        const slug = createSlug(metadata.title);

        await this.orchestrator.updateProgress(jobId, 90, "ذخیره بلاگ در سیستم...");
        await this.db.execute(
          `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
          [metadata.title, slug, content, writer.id]
        );

        for (const a of articles) {
          await this.db.execute('UPDATE news_articles SET status = "processed" WHERE id = ?', [a.id]);
        }

        await this.orchestrator.updateProgress(jobId, 100, "تکمیل شد");
        await this.orchestrator.log(jobId, "Blog generated successfully.");
        await this.orchestrator.completeJob(jobId, 'success', 'تولید بلاگ با موفقیت انجام شد');
        
        await this.orchestrator.createNotification({
            type: 'success',
            category: 'blog',
            title: 'بلاگ روزانه آماده شد',
            message: `مقاله "${metadata.title}" با موفقیت تولید شد.`,
            related_job_id: jobId
        });

      } catch (error: any) {
        const errorMsg = error.message || "خطای ناشناخته";
        await this.orchestrator.log(jobId, `Error: ${errorMsg}`);
        await this.orchestrator.completeJob(jobId, 'failed', `خطا: ${errorMsg.substring(0, 50)}...`);
        await this.orchestrator.createNotification({
            type: 'error',
            category: 'blog',
            title: 'خطا در تولید بلاگ',
            message: errorMsg,
            related_job_id: jobId
        });
      }
    };

    return { jobId, work: work() };
  }
}