
// Navigation Types
export type AppView = 'landing' | 'auth' | 'dashboard' | 'updates' | 'blog' | 'guide' | 'support' | 'api' | 'privacy' | 'terms';

// Environment Bindings
export interface Env {
  DB: any; // Using any to avoid importing 'better-sqlite3' in shared types which breaks browser
  API_KEY: string; // Updated to match standard naming
}

// Database Entities

export interface NewsArticle {
  id: number;
  title: string;
  url: string;
  source: string;
  content: string; // JSON or Text
  published_at: string;
  created_at: string;
  status: 'new' | 'processed' | 'archived';
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  writer_id: number;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  created_at: string;
  views: number;
  seo_score?: number; // 0-100
  seo_data?: string; // JSON: keywords, meta_desc
  social_data?: string; // JSON: twitter, linkedin posts
}

export interface Writer {
  id: number;
  name: string;
  bio: string;
  personality: string; // JSON: traits, voice
  style: string; // JSON: sentence structure preferences
  avatar_url?: string;
  is_default: number; // 0 or 1
  created_at: string;
}

export interface CompanySettings {
  id: number;
  name: string;
  industry: string;
  description?: string;
  core_values?: string;
  tone_of_voice: string;
  target_audience: string;
  product_info: string; // JSON: list of products/services
  updated_at: string;
}

export interface AgentSettings {
  id: number;
  model_config: string; // JSON: temperature, model_name
  schedule_config: string; // JSON: cron expressions
  integrations?: string; // JSON: droplinked_api_key, etc.
  is_active: number; // Boolean 0/1
  updated_at: string;
}

export interface UserSettings {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  avatar_url?: string;
  api_key?: string;
  credit_balance?: number; // Added credit balance
  updated_at: string;
}

export interface ResearchTask {
  id: number;
  query: string;
  status: 'pending' | 'researching' | 'researched' | 'completed' | 'failed';
  results: string; // JSON result from Gemini
  created_at: string;
}

export interface FeatureAnnouncement {
  id: number;
  product_name?: string;
  feature_name: string;
  description: string;
  custom_instructions?: string;
  research_data?: string; // Phase 1 results
  status: 'draft' | 'analyzed' | 'processed'; // Added 'analyzed' state
  created_at: string;
}

export interface AgentJob {
  id: number;
  agent_type: 'researcher' | 'writer' | 'editor' | 'publisher';
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
  logs: string; // Text logs
  progress: number; // 0-100
  message: string; // Current step description
  started_at: string;
  finished_at?: string;
  created_at?: string;
}

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  category: string;
  title: string;
  message: string;
  action_text?: string;
  action_url?: string;
  related_job_id?: number;
  is_read: number; // 0 or 1
  created_at: string;
}

export interface ContentCalendar {
  id: number;
  blog_id: number;
  title?: string; // Joined from blogs
  scheduled_date: string;
  status: 'pending' | 'published';
  created_at: string;
}

export interface BlogAnalytics {
  id: number;
  blog_id: number;
  views: number;
  shares: number;
  comments: number;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
