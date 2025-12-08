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
      is_active INTEGER,
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
      feature_name TEXT,
      description TEXT,
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