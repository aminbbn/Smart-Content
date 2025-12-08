import React, { useEffect, useState, Suspense } from 'react';
import NotificationCenter from './NotificationCenter';
import { BlogTimelineChart, WriterPerformanceChart, StatusDistributionChart } from './Charts';

// Icons
const HomeIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BuildingIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ChipIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DocIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const NewsIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
const FlaskIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const SpeakerIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChartIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;
const ActivityIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

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
const MonitoringDashboard = React.lazy(() => import('./MonitoringDashboard'));
const NotificationsView = React.lazy(() => import('./NotificationsView'));

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ articles: 0, blogs: 0, writers: 0, active_jobs: 0 });
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats').then(res => res.json()).then(data => {
        if(data.success) setStats(data.data);
    }).catch(console.error);
    
    fetch('/api/analytics').then(res => res.json()).then(data => {
        if(data.success) setChartData(data.data);
    }).catch(console.error);

    fetch('/api/seed').catch(console.error);
  }, []);

  const renderContent = () => {
    return (
        <Suspense fallback={
          <div className="flex h-96 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="text-slate-400 font-medium animate-pulse">در حال بارگذاری سیستم...</div>
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
                    case 'monitoring': return <MonitoringDashboard />;
                    case 'notifications': return <NotificationsView />;
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
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-[-4px]' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
    >
        <span className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className={`text-sm font-medium ${activeTab === id ? 'font-bold' : ''}`}>{label}</span>
        {activeTab === id && <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white/50"></span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F3F6F8] text-slate-800 flex font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-white fixed h-full z-30 hidden md:flex flex-col shadow-2xl shadow-slate-200/50 rounded-l-[0px]">
        {/* Brand Section */}
        <div className="p-8 pb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/30">AI</div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none mb-1">اسمارت کانتنت</h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full self-start">نسخه ۲.۵</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1 flex-grow overflow-y-auto custom-scrollbar pb-6">
            <div className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-2">داشبورد اصلی</div>
            <NavItem id="overview" label="نمای کلی" icon={<HomeIcon />} />
            <NavItem id="analytics" label="آمار و تحلیل" icon={<ChartIcon />} />
            <NavItem id="calendar" label="تقویم محتوایی" icon={<CalendarIcon />} />
            
            <div className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-6">دستیاران هوشمند</div>
            <NavItem id="agent-daily" label="اخبار روزانه" icon={<NewsIcon />} />
            <NavItem id="agent-research" label="تحقیق و نگارش" icon={<FlaskIcon />} />
            <NavItem id="agent-feature" label="معرفی محصول" icon={<SpeakerIcon />} />

            <div className="px-4 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-6">مدیریت سیستم</div>
            <NavItem id="blogs" label="کتابخانه محتوا" icon={<DocIcon />} />
            <NavItem id="writers" label="نویسندگان" icon={<UsersIcon />} />
            <NavItem id="monitoring" label="مانیتورینگ" icon={<ActivityIcon />} />
            <NavItem id="company" label="تنظیمات شرکت" icon={<BuildingIcon />} />
            <NavItem id="agents" label="پیکربندی" icon={<ChipIcon />} />
        </nav>

        {/* User Profile Snippet */}
        <div className="p-4 m-4 mt-0 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full" />
                </div>
            </div>
            <div className="flex-grow">
                <p className="text-sm font-bold text-slate-800">مدیر سیستم</p>
                <p className="text-xs text-slate-500">admin@company.com</p>
            </div>
            <button className="text-slate-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full glass z-40 px-4 h-16 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">AI</div>
            <span className="font-bold text-slate-800">اسمارت کانتنت</span>
         </div>
         <div className="flex items-center gap-3">
             <NotificationCenter align="left" onViewArchive={() => setActiveTab('notifications')} />
             <button onClick={() => {}} className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow md:mr-72 p-4 md:p-10 pt-20 md:pt-10 overflow-y-auto animate-page-enter min-h-screen">
        {/* Top Header Bar */}
        <div className="flex justify-between items-center mb-8">
            <div>
                 <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                    {activeTab === 'overview' ? 'داشبورد مدیریت' : 
                     activeTab === 'agent-daily' ? 'اخبار روزانه' : 
                     activeTab === 'agent-research' ? 'دستیار تحقیق' : 
                     activeTab === 'blogs' ? 'کتابخانه محتوا' : 
                     activeTab === 'notifications' ? 'مرکز اعلان‌ها' : 
                     'پنل مدیریت'}
                 </h2>
                 <p className="text-xs text-slate-400 font-medium mt-1">
                    {new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                 </p>
            </div>
            <div className="flex items-center gap-4">
                <NotificationCenter align="left" onViewArchive={() => setActiveTab('notifications')} />
            </div>
        </div>

        {renderContent()}
      </main>
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
                    trend === 'ثابت' ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-600'
                }`}>
                    {trend.includes('+') && <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
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

const Overview = ({ stats, chartData, setActiveTab }: any) => {
    // Force data structure for charts to avoid "undefined" errors during loading
    const displayData = chartData || {
        recent_growth: [],
        content_status: [],
        writer_performance: [],
        recent_drafts: []
    };

    return (
        <div className="space-y-8 animate-page-enter w-full">
            {/* Welcome Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden animate-slide-in">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold mb-2">سلام، مدیر عزیز 👋</h2>
                        <p className="text-blue-100 text-lg opacity-90 max-w-xl leading-relaxed">
                            سیستم هوشمند شما در حال حاضر <span className="font-bold text-white border-b border-white/30">{stats.active_jobs} وظیفه فعال</span> دارد و آماده دستورات جدید است.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button 
                                onClick={() => setActiveTab('agent-research')}
                                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <FlaskIcon />
                                <span>تحقیق جدید</span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('agent-daily')}
                                className="bg-blue-800/50 text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all active:scale-95"
                            >
                                بررسی اخبار
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="اخبار پردازش شده" 
                    value={stats.articles} 
                    icon={<NewsIcon />} 
                    colorClass="text-blue-600 bg-blue-100" 
                    trend="+12%"
                    delay="stagger-1"
                />
                <StatCard 
                    title="محتوای تولید شده" 
                    value={stats.blogs} 
                    icon={<DocIcon />} 
                    colorClass="text-emerald-600 bg-emerald-100" 
                    trend="+8.5%"
                    delay="stagger-2"
                />
                <StatCard 
                    title="نویسندگان فعال" 
                    value={stats.writers} 
                    icon={<UsersIcon />} 
                    colorClass="text-purple-600 bg-purple-100" 
                    trend="ثابت"
                    delay="stagger-3"
                />
                <StatCard 
                    title="وظایف در صف" 
                    value={stats.active_jobs || 0} 
                    icon={<ActivityIcon />} 
                    colorClass="text-amber-600 bg-amber-100" 
                    trend="-2"
                    delay="stagger-4"
                />
            </div>

            {/* Charts Section - ALWAYS RENDERED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-card-enter">
                {/* Views Area Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-card border border-slate-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">روند بازدیدها</h3>
                        <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">۳۰ روز گذشته</span>
                    </div>
                    <div className="h-[300px]">
                        <BlogTimelineChart data={displayData.recent_growth} />
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">وضعیت محتوا</h3>
                        <button onClick={() => setActiveTab('blogs')} className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">مدیریت</button>
                    </div>
                    <div className="h-[300px]">
                        <StatusDistributionChart data={displayData.content_status} />
                    </div>
                </div>
            </div>

            {/* Performance & Recent Activity - ALWAYS RENDERED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-card-enter">
                {/* Writer Performance Bar Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-card border border-slate-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">عملکرد نویسندگان</h3>
                        <button onClick={() => setActiveTab('writers')} className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">مدیریت</button>
                    </div>
                    <div className="h-[300px]">
                        <WriterPerformanceChart data={displayData.writer_performance} />
                    </div>
                </div>

                {/* Recent Drafts List */}
                <div className="bg-white p-8 rounded-3xl shadow-card border border-slate-100/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">آخرین پیش‌نویس‌ها</h3>
                        <button onClick={() => setActiveTab('blogs')} className="text-xs text-slate-400 hover:text-slate-600">مشاهده همه</button>
                    </div>
                    <div className="flex-grow space-y-4">
                        {displayData.recent_drafts && displayData.recent_drafts.length > 0 ? (
                            displayData.recent_drafts.map((draft: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <DocIcon />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{draft.title}</h4>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <span>{draft.writer || 'نویسنده هوشمند'}</span>
                                            <span>•</span>
                                            <span>{new Date(draft.created_at).toLocaleDateString('fa-IR')}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                    <DocIcon />
                                </div>
                                <p>هنوز پیش‌نویسی ندارید</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => setActiveTab('agent-daily')}
                        className="mt-6 w-full py-2.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        تولید محتوای جدید
                    </button>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100/50 md:col-span-2 animate-card-enter">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">دسترسی سریع</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => setActiveTab('agent-daily')} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-right flex flex-col items-center justify-center gap-3 h-32">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <NewsIcon />
                            </div>
                            <span className="font-bold text-slate-700 text-sm group-hover:text-blue-700">اخبار روزانه</span>
                        </button>
                        <button onClick={() => setActiveTab('agent-feature')} className="p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group text-right flex flex-col items-center justify-center gap-3 h-32">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <SpeakerIcon />
                            </div>
                            <span className="font-bold text-slate-700 text-sm group-hover:text-purple-700">معرفی محصول</span>
                        </button>
                        <button onClick={() => setActiveTab('calendar')} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group text-right flex flex-col items-center justify-center gap-3 h-32">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <CalendarIcon />
                            </div>
                            <span className="font-bold text-slate-700 text-sm group-hover:text-emerald-700">تقویم محتوا</span>
                        </button>
                        <button onClick={() => setActiveTab('analytics')} className="p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group text-right flex flex-col items-center justify-center gap-3 h-32">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                <ChartIcon />
                            </div>
                            <span className="font-bold text-slate-700 text-sm group-hover:text-amber-700">آمار و تحلیل</span>
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between animate-card-enter overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                    
                    <div>
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/10">
                            <ChipIcon />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Gemini 2.5 Pro</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            مدل زبانی هوشمند شما فعال است. برای تنظیمات پیشرفته کلیک کنید.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setActiveTab('agents')}
                        className="mt-6 w-full py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>پیکربندی</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}