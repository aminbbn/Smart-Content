
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const EmptyChartMessage = ({ message = "No data to display" }) => (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
        <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
        <span className="text-sm font-bold opacity-60">{message}</span>
    </div>
);

// Helper for safe responsive container
const SafeResponsiveContainer = ({ children }: { children?: React.ReactNode }) => (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
        </ResponsiveContainer>
    </div>
);

export const BlogTimelineChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return <EmptyChartMessage message="No views recorded yet" />;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <SafeResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                    />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        itemStyle={{ color: '#1e293b', fontWeight: 700, fontSize: '14px' }}
                        labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }} />
                </AreaChart>
            </SafeResponsiveContainer>
        </div>
    );
};

export const WriterPerformanceChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return <EmptyChartMessage message="No performance data yet" />;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <SafeResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <Tooltip 
                        cursor={{fill: '#f8fafc'}} 
                        contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Bar dataKey="total_views" fill="url(#barGradient)" radius={[0, 4, 4, 0]} barSize={20}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                    </Bar>
                </BarChart>
            </SafeResponsiveContainer>
        </div>
    );
};

const STATUS_COLORS = {
    'published': '#10b981', // Green
    'draft': '#f59e0b', // Amber
    'scheduled': '#3b82f6' // Blue
};

export const StatusDistributionChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return <EmptyChartMessage message="No content found" />;

    // Map status names for display
    const formatData = data.map(d => ({
        ...d,
        displayName: d.name === 'published' ? 'Published' : d.name === 'draft' ? 'Draft' : 'Scheduled'
    }));

    const total = formatData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="relative w-full h-full">
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <SafeResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={formatData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="displayName"
                            stroke="none"
                            cornerRadius={6}
                        >
                            {formatData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={(STATUS_COLORS as any)[entry.name] || '#94a3b8'} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgb(0 0 0 / 0.15)'}} 
                            itemStyle={{fontWeight: 700, color: '#334155'}}
                        />
                    </PieChart>
                </SafeResponsiveContainer>
            </div>
            {/* Center Text for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-slate-800">{total}</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Total</span>
            </div>
        </div>
    );
};
