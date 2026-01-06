
import Database from 'better-sqlite3';
import { logger } from '../utils/logger';

const db = new Database('local.db');
db.pragma('journal_mode = WAL');

// Initialize Schema
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY,
      name TEXT,
      industry TEXT,
      description TEXT,
      core_values TEXT,
      tone_of_voice TEXT,
      target_audience TEXT,
      product_info TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS agent_settings (
      id INTEGER PRIMARY KEY,
      model_config TEXT,
      schedule_config TEXT,
      integrations TEXT,
      is_active INTEGER,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      password TEXT,
      avatar_url TEXT,
      api_key TEXT,
      credit_balance REAL DEFAULT 50.00,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS writers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      bio TEXT,
      personality TEXT,
      style TEXT,
      avatar_url TEXT,
      is_default INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      slug TEXT,
      excerpt TEXT,
      content TEXT,
      writer_id INTEGER,
      status TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      views INTEGER DEFAULT 0,
      seo_score INTEGER,
      seo_data TEXT,
      social_data TEXT
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      url TEXT,
      source TEXT,
      content TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS research_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      status TEXT,
      results TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feature_announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      feature_name TEXT,
      description TEXT,
      custom_instructions TEXT,
      research_data TEXT,
      status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agent_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_type TEXT,
      status TEXT,
      logs TEXT,
      progress INTEGER,
      message TEXT,
      started_at TEXT,
      finished_at TEXT,
      result TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      category TEXT,
      title TEXT,
      message TEXT,
      action_text TEXT,
      action_url TEXT,
      related_job_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content_calendar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blog_id INTEGER,
      scheduled_date TEXT,
      status TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations for existing databases
  try { db.exec("ALTER TABLE company_settings ADD COLUMN description TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE company_settings ADD COLUMN core_values TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE writers ADD COLUMN is_default INTEGER DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE feature_announcements ADD COLUMN product_name TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE feature_announcements ADD COLUMN custom_instructions TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE feature_announcements ADD COLUMN research_data TEXT"); } catch (e) {} // New Migration
  try { db.exec("ALTER TABLE agent_settings ADD COLUMN integrations TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE user_settings ADD COLUMN api_key TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE user_settings ADD COLUMN credit_balance REAL DEFAULT 50.00"); } catch (e) {}
  
  // --- AUTO SEEDING ---
  
  // Seed User Settings
  const userCount = db.prepare('SELECT count(*) as count FROM user_settings').get() as { count: number };
  if (userCount.count === 0) {
      db.prepare(`INSERT INTO user_settings (id, first_name, last_name, email, password, avatar_url, credit_balance, updated_at) VALUES (1, 'Admin', 'User', 'admin@company.com', 'password123', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 50.00, CURRENT_TIMESTAMP)`).run();
      logger.info('Seeded user settings');
  }

  const writerCount = db.prepare('SELECT count(*) as count FROM writers').get() as { count: number };
  if (writerCount.count === 0) {
      const writers = [
        {
            name: 'Sara Danish',
            bio: 'Senior tech journalist with a focus on AI.',
            personality: JSON.stringify({ traits: ['Analytical', 'Formal', 'Precise'] }),
            style: JSON.stringify({ sentence_length: 'medium', vocabulary: 'technical' }),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara'
        },
        {
            name: 'Ali Novin',
            bio: 'Enthusiastic blogger covering startup news.',
            personality: JSON.stringify({ traits: ['Energetic', 'Casual', 'Optimistic'] }),
            style: JSON.stringify({ sentence_length: 'short', vocabulary: 'engaging' }),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali'
        },
        {
            name: 'Dr. Ramin Farhadi',
            bio: 'Computer science professor and deep tech analyst.',
            personality: JSON.stringify({ traits: ['Academic', 'Deep', 'Thoughtful'] }),
            style: JSON.stringify({ sentence_length: 'long', vocabulary: 'sophisticated' }),
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramin'
        }
      ];

      const insertWriter = db.prepare(`INSERT INTO writers (name, bio, personality, style, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`);
      writers.forEach(w => insertWriter.run(w.name, w.bio, w.personality, w.style, w.avatar_url));
      logger.info('Seeded writers');
  }

  const blogCount = db.prepare('SELECT count(*) as count FROM blogs').get() as { count: number };
  if (blogCount.count === 0) {
      const sampleBlogs = [
          { title: "The Rise of Generative AI", content: "Content...", writer_id: 1, status: 'published', views: 1540 },
          { title: "Top 10 Marketing Trends", content: "Content...", writer_id: 2, status: 'draft', views: 0 },
          { title: "Introduction to Quantum Computing", content: "Content...", writer_id: 3, status: 'published', views: 890 },
          { title: "Web Assembly: The Future?", content: "Content...", writer_id: 1, status: 'scheduled', views: 0 },
          { title: "Sustainable Tech: Green Computing", content: "Content...", writer_id: 1, status: 'draft', views: 0 },
          { title: "Microservices vs Monolith Architecture", content: "Content...", writer_id: 3, status: 'draft', views: 0 },
          { title: "The Psychology of Color in UI Design", content: "Content...", writer_id: 2, status: 'draft', views: 0 },
          { title: "Cybersecurity Best Practices 2025", content: "Content...", writer_id: 3, status: 'draft', views: 0 },
          { title: "Remote Work Culture: A Guide", content: "Content...", writer_id: 1, status: 'draft', views: 0 },
          { title: "Getting Started with Rust", content: "Content...", writer_id: 3, status: 'draft', views: 0 },
          { title: "AI in Healthcare: Opportunities & Risks", content: "Content...", writer_id: 1, status: 'draft', views: 0 },
          { title: "Effective Email Marketing Strategies", content: "Content...", writer_id: 2, status: 'draft', views: 0 }
      ];

      const insertBlog = db.prepare(`INSERT INTO blogs (title, slug, content, writer_id, status, views, created_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`);
      sampleBlogs.forEach(blog => {
          const slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          insertBlog.run(blog.title, slug, blog.content, blog.writer_id, blog.status, blog.views);
      });
      logger.info('Seeded blogs');
  }

} catch (error) {
  logger.error('Failed to initialize database schema', { error });
}

export class DatabaseService {
  query<T>(query: string, params: any[] = []): T[] {
    try {
      const stmt = db.prepare(query);
      return stmt.all(...params) as T[];
    } catch (error) {
      logger.error('Database query error', { query, error });
      throw error;
    }
  }

  queryOne<T>(query: string, params: any[] = [], useCache = false): T | undefined {
    try {
      const stmt = db.prepare(query);
      return stmt.get(...params) as T;
    } catch (error) {
      logger.error('Database queryOne error', { query, error });
      throw error;
    }
  }

  execute(query: string, params: any[] = []): Database.RunResult {
    try {
      const stmt = db.prepare(query);
      return stmt.run(...params);
    } catch (error) {
      logger.error('Database execute error', { query, error });
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const row = db.prepare('SELECT 1 as val').get();
      return !!row;
    } catch (error) {
      return false;
    }
  }
}

export const dbInstance = new DatabaseService();
