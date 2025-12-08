import { DatabaseService } from '../../database/db';
import { AgentJob } from '../../types';

export class AgentOrchestrator {
  constructor(private db: DatabaseService) {}

  async startJob(agentType: AgentJob['agent_type']): Promise<number> {
    try {
      // Fail-Safe: Execute Insert
      // We explicitly await the insert to catch DB errors immediately
      await this.db.execute(
        `INSERT INTO agent_jobs (agent_type, status, logs, progress, message, started_at) 
         VALUES (?, 'running', '', 0, 'Starting...', CURRENT_TIMESTAMP)`,
        [agentType]
      );
      
      // Get ID immediately
      const result = await this.db.queryOne<{id: number}>('SELECT last_insert_rowid() as id');
      
      if (!result?.id) {
         throw new Error("Failed to retrieve job ID after insertion.");
      }
      
      return result.id;
    } catch (e: any) {
      console.error("[Orchestrator] Failed to start job:", e);
      // Throw simplified error for the frontend
      throw new Error(`Job initialization failed: ${e.message}`);
    }
  }

  async updateProgress(jobId: number, progress: number, message: string) {
    try {
        await this.db.execute(
          'UPDATE agent_jobs SET progress = ?, message = ? WHERE id = ?',
          [progress, message, jobId]
        );
    } catch (e) { console.error("Update progress failed", e); }
  }

  async log(jobId: number, message: string) {
    try {
        const job = await this.db.queryOne<AgentJob>('SELECT logs FROM agent_jobs WHERE id = ?', [jobId]);
        const currentLogs = job?.logs || '';
        const newLog = `[${new Date().toLocaleTimeString()}] ${message}\n`;
        
        await this.db.execute(
          'UPDATE agent_jobs SET logs = ? WHERE id = ?',
          [currentLogs + newLog, jobId]
        );
    } catch (e) { console.error("Log failed", e); }
  }

  async completeJob(jobId: number, status: 'success' | 'failed', finalMessage?: string) {
    try {
        const message = finalMessage || (status === 'success' ? 'Completed' : 'Failed');
        await this.db.execute(
          `UPDATE agent_jobs SET status = ?, progress = ?, message = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [status, status === 'success' ? 100 : 0, message, jobId]
        );
    } catch (e) { console.error("Complete job failed", e); }
  }

  async createNotification(data: {
    type: 'success' | 'error' | 'info' | 'warning';
    category: string;
    title: string;
    message: string;
    action_text?: string;
    action_url?: string;
    related_job_id?: number;
  }) {
    try {
        await this.db.execute(
          `INSERT INTO notifications (type, category, title, message, action_text, action_url, related_job_id, is_read, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
          [data.type, data.category, data.title, data.message, data.action_text, data.action_url, data.related_job_id]
        );
    } catch (e) { console.error("Create notification failed", e); }
  }
}