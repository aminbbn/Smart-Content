import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4" dir="rtl">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full text-center animate-scale-in">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-red-50/50">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-3 text-slate-800">خطای غیرمنتظره</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">سیستم با مشکلی مواجه شده است. لطفا صفحه را مجددا بارگذاری کنید.</p>
            
            <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono mb-6 overflow-hidden">
                <details>
                    <summary className="cursor-pointer font-bold mb-2 hover:text-slate-900 transition-colors flex items-center gap-2">
                        <span>مشاهده جزئیات فنی</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="mt-2 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar p-2 bg-white rounded border border-slate-100">
                        {this.state.error?.toString()}
                    </div>
                </details>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span>بازنشانی صفحه</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}