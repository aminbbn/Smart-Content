
import React, { useEffect, useState, Suspense, useRef } from 'react';
import NotificationCenter from './NotificationCenter';
import { BlogTimelineChart, WriterPerformanceChart, StatusDistributionChart } from './Charts';

// Icons
const HomeIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BuildingIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ChipIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const NewsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
const FlaskIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const SpeakerIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChartIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;
const ActivityIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const WalletIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

// Lazy Load Components
const CompanySettings = React.lazy(() => import('./CompanySettings'));
const AgentSettings = React.lazy(() => import('./AgentSettings'));
const WritersManagement = React.lazy(() => import('./WritersManagement'));
const BlogLibrary = React.lazy(() => import('./BlogLibrary'));
const NewsList = React.lazy(() => import('./NewsList'));
const DailyNewsView = React.lazy(() => import('./DailyNewsView'));
const ResearchAgentView = React.lazy(() => import('./ResearchAgentView'));
const FeatureAnnouncementView = React.lazy(() => import('./FeatureAnnouncementView'));
const ContentCalendar = React.lazy(() => import('./ContentCalendar'));
const AnalyticsDashboard = React.lazy(() => import('./AnalyticsDashboard'));
const NotificationsView = React.lazy(() => import('./NotificationsView'));
const UsageView = React.lazy(() => import('./UsageView'));

// --- Utility: Scroll Trigger ---
interface ScrollTriggerProps {
    className?: string;
    delay?: number;
}

const ScrollTrigger = ({ children, className = "", delay = 0 }: React.PropsWithChildren<ScrollTriggerProps>) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={ref} 
            className={`transition-all duration-700 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(20);
  const [addingBalance, setAddingBalance] = useState(false);
  
  // Initialize with MOCK DATA immediately, updated by useEffect
  const [stats, setStats] = useState<any>({ 
      articles: 142, 
      blogs: 38, 
      writers: 4, 
      active_jobs: 2,
      droplinked: null 
  });

  const [user, setUser] = useState({
      name: 'System Admin',
      email: 'admin@company.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      credit_balance: 0
  });
  
  const [chartData, setChartData] = useState<any>({
      recent_growth: Array.from({length: 15}, (_, i) => ({
          date: new Date(Date.now() - (14-i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {month:'short', day:'numeric'}),
          views: Math.floor(Math.random() * 800) + 200
      })),
      content_status: [
          { name: 'published', value: 25 },
          { name: 'draft', value: 10 },
          { name: 'scheduled', value: 3 }
      ],
      writer_performance: [
          { name: 'Sara', total_views: 12500, post_count: 15, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
          { name: 'Ali', total_views: 8900, post_count: 12, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali' },
          { name: 'Ramin', total_views: 6400, post_count: 8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramin' },
          { name: 'AI', total_views: 3200, post_count: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI' }
      ],
      recent_drafts: [
          { title: "Generative AI Trends 2025", writer: "Sara Danish", created_at: new Date().toISOString() },
          { title: "Marketing Automation Guide", writer: "Ali Novin", created_at: new Date(Date.now() - 86400000).toISOString() },
          { title: "Q3 Financial Analysis", writer: "Dr. Ramin", created_at: new Date(Date.now() - 172800000).toISOString() }
      ]
  });

  useEffect(() => {
      const fetchStats = async () => {
          try {
              const res = await fetch('/api/stats');
              if (res.ok) {
                  const json = await res.json();
                  if (json.success) {
                      setStats(json.data);
                  }
              }
          } catch(e) { console.error("Failed to fetch dashboard stats", e); }
      };

      const fetchUser = async () => {
          try {
              const res = await fetch('/api/settings/user');
              if (res.ok) {
                  const json = await res.json();
                  if (json.success && json.data) {
                      setUser({
                          name: `${json.data.first_name} ${json.data.last_name}`.trim() || 'System Admin',
                          email: json.data.email || 'admin@company.com',
                          avatar_url: json.data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                          credit_balance: json.data.credit_balance || 0
                      });
                  }
              }
          } catch(e) { console.error("Failed to fetch user data", e); }
      };

      fetchStats();
      fetchUser();
  }, [activeTab]);

  const handleAddBalance = async () => {
      setAddingBalance(true);
      try {
          const res = await fetch('/api/settings/user', {
              method: 'POST',
              body: JSON.stringify({ action: 'add_balance', amount: balanceAmount })
          });
          const json = await res.json();
          if (json.success) {
              setUser(prev => ({ ...prev, credit_balance: json.data.new_balance }));
              setShowBalanceModal(false);
          }
      } catch (e) { console.error(e); }
      setAddingBalance(false);
  };

  const renderContent = () => {
    return (
        <Suspense fallback={
          <div className="flex h-96 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-slate-400 font-medium animate-pulse">Loading system...</div>
            </div>
          </div>
        }>
            {(() => {
                switch(activeTab) {
                    case 'company': return <CompanySettings />;
                    case 'agents': return <AgentSettings />;
                    case 'writers': return <WritersManagement />;
                    case 'blogs': return <BlogLibrary />;
                    case 'news': return <NewsList />;
                    case 'agent-daily': return <DailyNewsView />;
                    case 'agent-research': return <ResearchAgentView />;
                    case 'agent-feature': return <FeatureAnnouncementView />;
                    case 'calendar': return <ContentCalendar />;
                    case 'analytics': return <AnalyticsDashboard />;
                    case 'notifications': return <NotificationsView />;
                    case 'usage': return <UsageView onAddBalance={() => setShowBalanceModal(true)} />;
                    default: return <Overview stats={stats} chartData={chartData} setActiveTab={setActiveTab} />;
                }
            })()}
        </Suspense>
    );
  };

  const NavItem = ({ id, label, icon }: any) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
            activeTab === id 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-[4px]' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
    >
        <span className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className={`text-sm font-medium ${activeTab === id ? 'font-bold' : ''}`}>{label}</span>
        {activeTab === id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50"></span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F3F6F8] text-slate-800 flex font-sans" dir="ltr">
      {/* Sidebar */}
      <aside className="w-72 bg-white fixed h-full z-30 hidden md:flex flex-col shadow-2xl shadow-slate-200/50 rounded-r-[0px]">
        {/* Brand Section */}
        <div className="p-8 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">AI</div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none mb-1">Smart Content</h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full self-start">v2.5</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1 flex-grow overflow-y-auto custom-scrollbar pb-6">
            <div className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">Main Dashboard</div>
            <NavItem id="overview" label="Overview" icon={<HomeIcon />} />
            <NavItem id="analytics" label="Analytics" icon={<ChartIcon />} />
            <NavItem id="calendar" label="Content Calendar" icon={<CalendarIcon />} />
            <NavItem id="usage" label="Usage & Billing" icon={<WalletIcon />} />
            
            <div className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-6">Smart Agents</div>
            <NavItem id="agent-daily" label="Daily News" icon={<NewsIcon />} />
            <NavItem id="agent-research" label="Research & Write" icon={<FlaskIcon />} />
            <NavItem id="agent-feature" label="Product Launch" icon={<SpeakerIcon />} />

            <div className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-6">System Management</div>
            <NavItem id="blogs" label="Content Library" icon={<DocIcon />} />
            <NavItem id="writers" label="Writers" icon={<UsersIcon />} />
            <NavItem id="company" label="Company Settings" icon={<BuildingIcon />} />
            <NavItem id="agents" label="Settings" icon={<ChipIcon />} />
        </nav>

        {/* User Profile Snippet - Redesigned */}
        <div className="p-4 mt-auto">
            <div className="bg-white rounded-3xl p-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 relative group overflow-hidden transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:border-blue-100/50">
                
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-blue-100/50"></div>

                <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 p-0.5 shadow-sm">
                            <img src={user.avatar_url} alt="User" className="w-full h-full object-cover rounded-[10px]" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{user.name}</h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{user.email}</p>
                    </div>
                    <button className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>

                <div className="relative z-10 bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center justify-between group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-all">
                    <div>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Balance</p>
                        <p className="text-sm font-black text-slate-800 group-hover:text-blue-700 transition-colors">${user.credit_balance.toFixed(2)}</p>
                    </div>
                    <button 
                        onClick={() => setShowBalanceModal(true)}
                        className="w-8 h-8 flex items-center justify-center bg-white text-blue-600 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95"
                        title="Quick Add Funds"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full glass z-40 px-4 h-16 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">AI</div>
            <span className="font-bold text-slate-800">Smart Content</span>
         </div>
         <div className="flex items-center gap-3">
             <button onClick={() => setShowBalanceModal(true)} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
                 <span>${user.credit_balance.toFixed(0)}</span>
                 <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center">+</span>
             </button>
             <NotificationCenter align="right" onViewArchive={() => setActiveTab('notifications')} />
             <button onClick={() => {}} className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow md:ml-72 p-4 md:p-10 pt-20 md:pt-10 overflow-y-auto animate-page-enter min-h-screen">
        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-8">
            <div>
                 <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {activeTab === 'overview' ? 'Dashboard Overview' : 
                     activeTab === 'agent-daily' ? 'Daily News' : 
                     activeTab === 'agent-research' ? 'Research Assistant' : 
                     activeTab === 'blogs' ? 'Content Library' : 
                     activeTab === 'notifications' ? 'Notifications Center' : 
                     activeTab === 'agents' ? 'Settings' :
                     activeTab === 'company' ? 'Company Profile' :
                     activeTab === 'writers' ? 'Writers' :
                     activeTab === 'calendar' ? 'Calendar' :
                     activeTab === 'analytics' ? 'Analytics' :
                     activeTab === 'usage' ? 'Usage & Billing' :
                     'Management Panel'}
                 </h2>
                 <p className="text-xs text-slate-400 font-medium mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
            </div>
            <div className="flex items-center gap-4">
                {/* Credit Display (Desktop) */}
                <div className="hidden md:flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Credit Balance</span>
                        <span className="text-sm font-extrabold text-slate-800">${user.credit_balance.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={() => setShowBalanceModal(true)}
                        className="ml-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-lg shadow-blue-200"
                        title="Add Balance"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                <NotificationCenter align="right" onViewArchive={() => setActiveTab('notifications')} />
            </div>
        </div>

        {renderContent()}
      </main>

      {/* Add Balance Modal */}
      {showBalanceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scale-in border border-slate-100 relative">
                  <button onClick={() => setShowBalanceModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800">Add Credit</h3>
                      <p className="text-slate-500 mt-1">Top up your balance to continue using AI agents</p>
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-3">
                          {[10, 20, 50].map((amt) => (
                              <button
                                  key={amt}
                                  onClick={() => setBalanceAmount(amt)}
                                  className={`py-3 rounded-xl font-bold border-2 transition-all ${
                                      balanceAmount === amt 
                                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                      : 'border-slate-100 text-slate-600 hover:border-blue-200'
                                  }`}
                              >
                                  ${amt}
                              </button>
                          ))}
                      </div>

                      <div className="relative">
                          <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                          <input 
                              type="number" 
                              className="w-full pl-8 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-800 transition-all"
                              value={balanceAmount}
                              onChange={(e) => setBalanceAmount(parseFloat(e.target.value))}
                          />
                      </div>

                      <button 
                          onClick={handleAddBalance}
                          disabled={addingBalance}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {addingBalance ? (
                              <>
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Processing...
                              </>
                          ) : (
                              `Pay $${balanceAmount.toFixed(2)}`
                          )}
                      </button>
                      
                      <p className="text-center text-xs text-slate-400">Secure payment powered by Stripe (Simulation)</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

const StatCard = ({ title, value, icon, colorClass, trend, delay }: any) => (
    <div className={`bg-white p-6 rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden animate-card-enter ${delay}`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${colorClass.split(' ')[0].replace('text', 'bg')}/20`}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3.5 rounded-2xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    trend.includes('+') ? 'bg-green-50 text-green-600' : 
                    trend === 'Fixed' ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-600'
                }`}>
                    {trend.includes('+') && <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    {trend}
                </div>
            )}
        </div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        
        {/* Decoration */}
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 ${colorClass.split(' ')[0].replace('text', 'bg')} filter blur-xl group-hover:opacity-10 transition-opacity`}></div>
    </div>
);

const ActionCard = ({ icon, title, desc, onClick, color, delay }: any) => {
    const bgMap = {
        blue: 'bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white',
        purple: 'bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white',
        emerald: 'bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white',
        amber: 'bg-amber-50 group-hover:bg-amber-600 text-amber-600 group-hover:text-white',
    };

    return (
        <ScrollTrigger delay={delay}>
            <button 
                onClick={onClick}
                className="w-full text-left bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col justify-between overflow-hidden relative"
            >
                <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${bgMap[color as keyof typeof bgMap].split(' ')[0]}`}></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${bgMap[color as keyof typeof bgMap]}`}>
                        {icon}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white/20 group-hover:text-slate-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                </div>
                
                <div className="relative z-10">
                    <h4 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">{title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
                </div>
            </button>
        </ScrollTrigger>
    );
}

const DroplinkedSection = ({ data }: { data: any }) => {
    return (
        <ScrollTrigger>
            <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2rem] shadow-2xl opacity-100 transition-all duration-500 group-hover:shadow-blue-900/30"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 rounded-[2rem]"></div>
                
                <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Header Side */}
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-2xl font-extrabold text-white tracking-tight">Droplinked Integration</h3>
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Active
                                </div>
                            </div>
                            <p className="text-blue-200/80 text-sm font-medium">Syncing product data directly from your shop.</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 w-full md:w-auto">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                                <div className="text-3xl font-bold text-white mb-1">{data.products_count || 0}</div>
                                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wide">Products</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                                <div className="text-3xl font-bold text-white mb-1">{data.blogs_published || 0}</div>
                                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wide">Generated Blogs</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 transition-colors">
                                <div className="text-lg font-bold text-white mb-1 pt-1.5">
                                    {data.last_sync ? new Date(data.last_sync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                                </div>
                                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wide">Last Sync</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollTrigger>
    );
};

const Overview = ({ stats, chartData, setActiveTab }: any) => {
    // Force data structure for charts to avoid "undefined" errors during loading
    const displayData = chartData || {
        recent_growth: [],
        content_status: [],
        writer_performance: [],
        recent_drafts: []
    };

    return (
        <div className="space-y-8 w-full">
            {/* Welcome Hero - Uses ScrollTrigger wrapped internally or handles entry via standard CSS */}
            <div className="animate-slide-in">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-3xl font-extrabold mb-2">Hello, Admin 👋</h2>
                            <p className="text-blue-100 text-lg opacity-90 max-w-xl leading-relaxed">
                                Your intelligent system currently has <span className="font-bold text-white border-b border-white/30">{stats.active_jobs} active tasks</span> and is ready for new commands.
                            </p>
                            <div className="mt-8 flex gap-3">
                                <button 
                                    onClick={() => setActiveTab('agent-research')}
                                    className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    <FlaskIcon />
                                    <span>New Research</span>
                                </button>
                                <button 
                                    onClick={() => setActiveTab('agent-daily')}
                                    className="bg-blue-800/50 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all active:scale-95"
                                >
                                    Check News
                                </button>
                            </div>
                        </div>
                        {/* Abstract visualization */}
                        <div className="hidden lg:block relative w-48 h-48">
                            <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse-slow"></div>
                            <div className="absolute inset-4 bg-white/10 rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
                            <div className="absolute inset-8 bg-white/10 rounded-full animate-pulse-slow" style={{animationDelay: '2s'}}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-20 h-20 text-white opacity-90 animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Background patterns */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Droplinked Section - Only appears if connected */}
            {stats.droplinked && <DroplinkedSection data={stats.droplinked} />}

            {/* Stats Grid - Using Staggered Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Processed News" value={stats.articles} icon={<NewsIcon />} colorClass="text-blue-600 bg-blue-100" trend="+12%" delay="delay-[100ms]" />
                <StatCard title="Generated Content" value={stats.blogs} icon={<DocIcon />} colorClass="text-emerald-600 bg-emerald-100" trend="+8.5%" delay="delay-[200ms]" />
                <StatCard title="Active Writers" value={stats.writers} icon={<UsersIcon />} colorClass="text-purple-600 bg-purple-100" trend="Fixed" delay="delay-[300ms]" />
            </div>

            {/* Quick Actions - PREMIUM REDESIGN */}
            <ScrollTrigger>
                <div className="mb-8">
                    <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                        Quick Actions
                        <span className="h-px bg-slate-200 flex-grow ml-4"></span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ActionCard 
                            title="Daily News" 
                            desc="Fetch & generate news blog" 
                            icon={<NewsIcon />} 
                            color="blue" 
                            onClick={() => setActiveTab('agent-daily')}
                            delay={0}
                        />
                        <ActionCard 
                            title="Product Launch" 
                            desc="Announce new features" 
                            icon={<SpeakerIcon />} 
                            color="purple" 
                            onClick={() => setActiveTab('agent-feature')}
                            delay={100}
                        />
                        <ActionCard 
                            title="Content Calendar" 
                            desc="Schedule upcoming posts" 
                            icon={<CalendarIcon />} 
                            color="emerald" 
                            onClick={() => setActiveTab('calendar')}
                            delay={200}
                        />
                        <ActionCard 
                            title="Analytics" 
                            desc="View detailed reports" 
                            icon={<ChartIcon />} 
                            color="amber" 
                            onClick={() => setActiveTab('analytics')}
                            delay={300}
                        />
                    </div>
                </div>
            </ScrollTrigger>

            {/* Main Content Grid - REDESIGNED SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Views Trend - Keeps existing clean style but wrapped for animation */}
                <div className="lg:col-span-2">
                    <ScrollTrigger>
                        <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100/50 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 text-lg">Views Trend</h3>
                                <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 font-medium">Last 30 Days</span>
                            </div>
                            <div className="h-[320px]">
                                <BlogTimelineChart data={displayData.recent_growth} />
                            </div>
                        </div>
                    </ScrollTrigger>
                </div>

                {/* Content Status - REDESIGNED */}
                <div className="lg:col-span-1">
                    <ScrollTrigger delay={100}>
                        <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100/50 h-full flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                            
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <h3 className="font-bold text-slate-800 text-lg">Content Status</h3>
                                <button onClick={() => setActiveTab('blogs')} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                            </div>
                            <p className="text-slate-400 text-xs mb-6 relative z-10">Distribution of all articles</p>
                            
                            <div className="flex-grow flex flex-col justify-center relative">
                                <div className="h-[220px] relative z-10">
                                    <StatusDistributionChart data={displayData.content_status} />
                                </div>
                                
                                {/* Custom Legend */}
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                                            <span className="text-slate-600 font-medium">Published</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{displayData.content_status.find((s:any)=>s.name==='published')?.value || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>
                                            <span className="text-slate-600 font-medium">Draft</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{displayData.content_status.find((s:any)=>s.name==='draft')?.value || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                                            <span className="text-slate-600 font-medium">Scheduled</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{displayData.content_status.find((s:any)=>s.name==='scheduled')?.value || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollTrigger>
                </div>
            </div>

            {/* Performance & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Writer Performance - REDESIGNED */}
                <div className="lg:col-span-2">
                    <ScrollTrigger delay={200}>
                        <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100/50 h-full">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Top Writers</h3>
                                    <p className="text-xs text-slate-400 mt-1">Based on total article views</p>
                                </div>
                                <button onClick={() => setActiveTab('writers')} className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors">
                                    View All
                                </button>
                            </div>
                            
                            {/* Custom Bar Chart Replacement for Premium Look */}
                            <div className="space-y-6">
                                {displayData.writer_performance.map((writer: any, index: number) => {
                                    const maxViews = Math.max(...displayData.writer_performance.map((w: any) => w.total_views));
                                    const percent = (writer.total_views / maxViews) * 100;
                                    
                                    return (
                                        <div key={index} className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                                                        {writer.avatar ? <img src={writer.avatar} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[10px] font-bold text-slate-400">{writer.name[0]}</div>}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm group-hover:text-purple-700 transition-colors">{writer.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{writer.total_views.toLocaleString()} <span className="font-normal text-slate-400">views</span></span>
                                            </div>
                                            <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-purple-200 group-hover:shadow-md transition-all duration-1000 ease-out relative"
                                                    style={{ width: `${percent}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollTrigger>
                </div>

                {/* Recent Drafts List */}
                <div className="lg:col-span-1">
                    <ScrollTrigger delay={300}>
                        <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 text-lg">Recent Drafts</h3>
                                <button onClick={() => setActiveTab('blogs')} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">View All</button>
                            </div>
                            <div className="flex-grow space-y-4">
                                {displayData.recent_drafts && displayData.recent_drafts.length > 0 ? (
                                    displayData.recent_drafts.map((draft: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-amber-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                <DocIcon />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h4 className="text-sm font-bold text-slate-700 truncate group-hover:text-amber-700 transition-colors">{draft.title}</h4>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                                    <span>{draft.writer || 'Smart Writer'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>{new Date(draft.created_at).toLocaleDateString('en-US')}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                            <DocIcon />
                                        </div>
                                        <p>No drafts yet</p>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setActiveTab('agent-daily')}
                                className="mt-6 w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Create New Content
                            </button>
                        </div>
                    </ScrollTrigger>
                </div>
            </div>
        </div>
    );
}
