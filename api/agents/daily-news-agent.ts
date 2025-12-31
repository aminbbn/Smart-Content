
import { Env, CompanySettings, AgentSettings, Writer, NewsArticle } from '../../types';
import { DatabaseService } from '../../database/db';
import { GeminiService } from '../services/gemini-service';
import { AgentOrchestrator } from './orchestrator';
import { createSlug } from '../../utils/helpers';

interface GenerateOptions {
    writerId?: number;
    newsCount?: number;
    length?: 'short' | 'medium' | 'long';
    relation?: 'low' | 'medium' | 'high';
    customInstructions?: string;
}

interface FetchOptions {
    newsCount?: number;
}

export class DailyNewsAgent {
  private gemini: GeminiService;
  private orchestrator: AgentOrchestrator;

  constructor(private env: Env, private db: DatabaseService) {
    this.gemini = new GeminiService(env);
    this.orchestrator = new AgentOrchestrator(db);
  }

  async startFetchNews(options?: FetchOptions): Promise<{ jobId: number, work: Promise<void> }> {
    const jobId = await this.orchestrator.startJob('researcher');
    
    const work = async () => {
      try {
        await this.orchestrator.updateProgress(jobId, 10, "Initializing company profile analysis...");
        
        const companySettings = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');
        
        // Smart Query Construction
        let query = "";
        let industry = companySettings?.industry || "Technology";
        let products = [];
        
        try {
            products = companySettings?.product_info ? JSON.parse(companySettings.product_info) : [];
        } catch(e) {}

        if (products.length > 0) {
            const productKeywords = products.map((p: any) => p.name).join(' OR ');
            query = `latest news about ${industry} AND (${productKeywords})`;
        } else {
            query = `latest important trends and news in ${industry} industry`;
        }
        
        await this.orchestrator.log(jobId, `Context: ${industry}`);
        await this.orchestrator.log(jobId, `Generated Query: ${query}`);
        
        await this.orchestrator.updateProgress(jobId, 30, `Scanning global sources for: ${industry}`);
        
        // Use options.newsCount if available, default to 5, max 10 for fetch
        const articles = await this.gemini.searchNews(query);
        
        if (articles.length === 0) {
            const msg = "No relevant news found. Check industry settings or try again later.";
            await this.orchestrator.log(jobId, msg);
            await this.orchestrator.completeJob(jobId, 'failed', msg);
            return;
        }

        await this.orchestrator.log(jobId, `Analyzed ${articles.length} sources.`);
        await this.orchestrator.updateProgress(jobId, 60, "Processing and filtering results...");
        
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
          }
        }

        await this.orchestrator.updateProgress(jobId, 100, "Fetch complete");
        await this.orchestrator.log(jobId, `Operation complete. ${newCount} new articles archived.`);
        await this.orchestrator.completeJob(jobId, 'success', `Found ${newCount} new articles matching your profile.`);

      } catch (error: any) {
        const errorMsg = error.message || "Unknown error";
        await this.orchestrator.log(jobId, `CRITICAL: ${errorMsg}`);
        await this.orchestrator.completeJob(jobId, 'failed', errorMsg);
      }
    };

    return { jobId, work: work() };
  }

  async startGenerateBlog(options: GenerateOptions = {}): Promise<{ jobId: number, work: Promise<void> }> {
    const jobId = await this.orchestrator.startJob('writer');
    
    const work = async () => {
      try {
        await this.orchestrator.updateProgress(jobId, 10, "Analyzing content database...");
        
        const limit = options.newsCount || 5;
        const articles = await this.db.query<NewsArticle>(`SELECT * FROM news_articles WHERE status = "new" ORDER BY published_at DESC LIMIT ?`, [limit]);
        
        if (articles.length < 1) {
            // Fallback to processed articles if no new ones
            await this.orchestrator.log(jobId, "No 'new' articles found, using recent history...");
            const recentArticles = await this.db.query<NewsArticle>(`SELECT * FROM news_articles ORDER BY published_at DESC LIMIT ?`, [limit]);
            if (recentArticles.length < 1) {
                const msg = "Insufficient data to generate blog.";
                await this.orchestrator.completeJob(jobId, 'failed', msg);
                return;
            }
            articles.push(...recentArticles);
        }

        await this.orchestrator.updateProgress(jobId, 30, "Assigning writer persona...");
        
        let writer: Writer | undefined;
        if (options.writerId) {
             writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE id = ?', [options.writerId]);
        } 
        if (!writer) writer = await this.db.queryOne<Writer>('SELECT * FROM writers WHERE is_default = 1');
        if (!writer) {
             const writers = await this.db.query<Writer>('SELECT * FROM writers LIMIT 1');
             writer = writers[0];
        }
        
        // Writer Fallback
        if (!writer) {
             writer = { name: 'AI Editor', bio: 'Professional editor', personality: 'Neutral', style: 'Standard', id: 0, is_default: 0, created_at: '' };
        }

        await this.orchestrator.log(jobId, `Writer assigned: ${writer.name}`);

        const company = await this.db.queryOne<CompanySettings>('SELECT * FROM company_settings WHERE id = 1');

        await this.orchestrator.updateProgress(jobId, 50, "Drafting content with human touch...");
        
        const newsContext = articles.map((a) => `- ${a.title} (${a.source}): ${a.url}`).join('\n');
        
        // Logic for Length
        let lengthInstruction = "1000-1500 words";
        if (options.length === 'short') lengthInstruction = "500-800 words, concise";
        if (options.length === 'long') lengthInstruction = "2000+ words, deep dive";

        // Logic for Relation
        let relationInstruction = "Mention the company briefly.";
        if (options.relation === 'low') relationInstruction = "Do not mention the company unless strictly necessary. Keep it editorial.";
        if (options.relation === 'high') relationInstruction = `Strongly connect the news to ${company?.name}'s products. Be promotional but valuable.`;

        const prompt = `
          Write a Daily News Digest blog post.
          
          LATEST NEWS DATA:
          ${newsContext}

          COMPANY PROFILE:
          Name: ${company?.name}
          Industry: ${company?.industry}
          Target Audience: ${company?.target_audience}
          Products: ${company?.product_info}

          CONFIGURATION:
          - Length: ${lengthInstruction}
          - Brand Integration: ${relationInstruction}
          - User Custom Instructions: ${options.customInstructions || 'None'}

          CORE INSTRUCTIONS:
          1. Synthesize the news into a cohesive narrative, don't just list them.
          2. Adopt the persona of the writer strictly.
          3. Remove any "As an AI" disclaimers.
          4. Ensure the tone matches the writer's personality (e.g. if Witty, use humor).
          5. Use Markdown formatting.
        `;

        const systemInstruction = `
          You are ${writer.name}. 
          Your Bio: ${writer.bio}.
          Your Personality: ${writer.personality}.
          Your Style: ${writer.style}.
          You are writing for ${company?.name}.
        `;

        const content = await this.gemini.generateBlog(prompt, systemInstruction);

        await this.orchestrator.updateProgress(jobId, 80, "Optimizing for SEO and removing AI footprint...");
        const metadata = await this.gemini.extractMetadata(content);
        const slug = createSlug(metadata.title);

        await this.orchestrator.updateProgress(jobId, 90, "Finalizing and saving...");
        await this.db.execute(
          `INSERT INTO blogs (title, slug, content, writer_id, status, created_at, views) VALUES (?, ?, ?, ?, 'draft', CURRENT_TIMESTAMP, 0)`,
          [metadata.title, slug, content, writer.id]
        );

        // Mark articles as processed
        for (const a of articles) {
          if (a.id) await this.db.execute('UPDATE news_articles SET status = "processed" WHERE id = ?', [a.id]);
        }

        await this.orchestrator.updateProgress(jobId, 100, "Content ready");
        await this.orchestrator.log(jobId, "Blog saved to Drafts.");
        await this.orchestrator.completeJob(jobId, 'success', `Blog "${metadata.title}" created successfully.`);
        
        await this.orchestrator.createNotification({
            type: 'success',
            category: 'blog',
            title: 'Daily Blog Ready',
            message: `Article "${metadata.title}" is ready for review.`,
            related_job_id: jobId,
            action_text: 'Edit Blog'
        });

      } catch (error: any) {
        await this.orchestrator.log(jobId, `Error: ${error.message}`);
        await this.orchestrator.completeJob(jobId, 'failed', error.message);
      }
    };

    return { jobId, work: work() };
  }
}
