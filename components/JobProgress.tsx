import React, { useEffect, useState } from 'react';
import { AgentJob } from '../types';

interface JobProgressProps {
  jobId: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function JobProgress({ jobId, onComplete, onCancel }: JobProgressProps) {
  const [job, setJob] = useState<AgentJob | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent-jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          const jobData = data.data || data;
          setJob(jobData);
          
          if (jobData.status === 'success' || jobData.status === 'failed' || jobData.status === 'cancelled') {
            clearInterval(interval);
            if (jobData.status === 'success' && onComplete) {
                setTimeout(onComplete, 2000);
            }
          }
        }
      } catch (e) { console.error(e); }
    }, 1000);
    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  const handleCancel = async () => {
      if (!onCancel) return;
      setCancelling(true);
      try {
          await fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
      } catch(e) { console.error(e); }
      if (onCancel) onCancel();
  };

  if (!job) return (
    <div className="mt-4 p-6 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 animate-pulse">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
        <span className="text-sm font-medium">در حال دریافت وضعیت...</span>
    </div>
  );

  const isSuccess = job.status === 'success';
  const isError = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';
  const isRunning = job.status === 'running' || job.status === 'queued';

  return (
    <div className={`mt-6 p-6 rounded-3xl border shadow-lg shadow-slate-200/50 transition-all duration-500 animate-slide-in overflow-hidden relative ${
        isSuccess ? 'bg-white border-green-100' :
        isError ? 'bg-white border-red-100' :
        isCancelled ? 'bg-slate-50 border-slate-200' :
        'bg-white border-blue-100'
    }`}>
      {/* Background Glow */}
      {isRunning && <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500/20 to-transparent animate-pulse"></div>}
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSuccess ? 'bg-green-100 text-green-600' :
                isError ? 'bg-red-100 text-red-600' :
                isCancelled ? 'bg-slate-200 text-slate-500' :
                'bg-blue-100 text-blue-600'
            }`}>
                {isSuccess ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> :
                 isError ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> :
                 isCancelled ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> :
                 <span className="w-4 h-4 rounded-sm bg-blue-600 animate-spin"></span>
                }
            </div>
            <div>
                <h4 className="font-bold text-slate-800 text-base">
                    {isSuccess ? 'عملیات با موفقیت انجام شد' : isError ? 'عملیات ناموفق بود' : isCancelled ? 'لغو شده' : 'در حال پردازش...'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">ID: #{job.id}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <span className={`text-2xl font-extrabold ${
                isSuccess ? 'text-green-500' : isError ? 'text-red-500' : 'text-blue-600'
            }`}>{job.progress}%</span>
            
            {isRunning && onCancel && (
                <button 
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="text-xs bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-bold"
                >
                    {cancelling ? '...' : 'لغو عملیات'}
                </button>
            )}
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden relative">
        <div 
            className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${
                isSuccess ? 'bg-green-500' : isError ? 'bg-red-500' : isCancelled ? 'bg-slate-400' : 'bg-blue-600'
            }`} 
            style={{ width: `${job.progress}%` }}
        >
            {/* Shimmer Effect */}
            {isRunning && (
                <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -skew-x-12"></div>
            )}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <p className={`font-medium ${isError ? 'text-red-600' : 'text-slate-600'}`}>
            {job.message || (isError ? 'خطایی رخ داد' : 'لطفا صبر کنید...')}
        </p>
        <span className="text-xs text-slate-400">
            {isRunning ? 'تخمین زمان باقی‌مانده: محاسبه...' : isSuccess ? 'تکمیل شده' : ''}
        </span>
      </div>
    </div>
  );
}