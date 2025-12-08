import { Database } from 'better-sqlite3';

// Navigation Types
export type AppView = 'landing' | 'auth' | 'dashboard' | 'updates' | 'blog' | 'guide' | 'support' | 'api' | 'privacy' | 'terms';

// Environment Bindings
export interface Env {
  DB: Database;
  GEMINI_API_KEY: string;
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
  is_active: number; // Boolean 0/1
  updated_at: string;
}

export interface ResearchTask {
  id: number;
  query: string;
  status: 'pending' | 'researching' | 'completed' | 'failed';
  results: string; // JSON result from Gemini
  created_at: string;
}

export interface FeatureAnnouncement {
  id: number;
  feature_name: string;
  description: string;
  status: 'draft' | 'processed';
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