
import React, { useEffect, useState } from 'react';
import { AgentJob } from '../types';

interface AgentActivityLogProps {
  limit?: number;
  refreshInterval?: number;
  typeFilter?: string;
  refreshTrigger?: number;
}

export default function AgentActivityLog({ 
  limit = 5, 
  refreshInterval = 3000, 
  typeFilter, 
  refreshTrigger = 0 
}: AgentActivityLogProps) {
  const [jobs, setJobs] = useState<AgentJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // SIMPLE POLLING (No Streams)
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/agent-jobs?limit=${limit}`);
        
        // Handle non-JSON responses (like 404 HTML pages) gracefully to avoid parsing errors
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             return; // Silently fail for non-JSON responses
        }

        if (!res.ok) throw new Error(`Status: ${res.status}`);
        
        const json = await res.json();
        // Handle both array and { data: [] } formats from API wrapper
        const list = Array.isArray(json) ? json : (json.data || []);
        
        // Ensure we have an array
        if (Array.isArray(list)) {
            let filtered = list;
            if (typeFilter) {
                filtered = list.filter((j: AgentJob) => j.agent_type === typeFilter);
            }
            setJobs(filtered);
        }
        setError(null);
      } catch (e) {
        console.error("Log Poll Error:", e);
        // Don't show error to user immediately to avoid flickering, just log it
      }
    };

    fetchJobs(); // Initial load
    const interval = setInterval(fetchJobs, refreshInterval); 
    return () => clearInterval(interval);
  }, [limit, refreshInterval, typeFilter, refreshTrigger]);

  if (error) return <div className="text-red-500 text-sm p-4 text-center">{error}</div>;
  if (jobs.length === 0) return <div className="text-slate-400 text-sm p-4 text-center">No activity recorded yet.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        Agent Activity Log
      </h3>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {jobs.map((job) => (
          <div key={job.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${job.status === 'success' ? 'bg-green-500' : job.status === 'running' ? 'bg-blue-500 animate-pulse' : job.status === 'failed' ? 'bg-red-500' : 'bg-slate-300'}`}></span>
              <div>
                <p className="font-medium text-slate-800">
                    {job.agent_type === 'researcher' ? 'Research' : 
                     job.agent_type === 'writer' ? 'Writing' : 
                     job.agent_type === 'publisher' ? 'Publishing' : job.agent_type}
                </p>
                <p className="text-xs text-slate-400">{new Date(job.created_at || job.started_at || Date.now()).toLocaleTimeString('en-US')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[150px]">{job.message}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'success' ? 'bg-green-100 text-green-700' : job.status === 'running' ? 'bg-blue-100 text-blue-700' : job.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                {job.status === 'success' ? 'Completed' : job.status === 'running' ? 'Running' : job.status === 'failed' ? 'Failed' : 'Cancelled'}
                </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
