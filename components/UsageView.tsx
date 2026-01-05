
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface UsageViewProps {
    onAddBalance: () => void;
}

export default function UsageView({ onAddBalance }: UsageViewProps) {
    const [usageData, setUsageData] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock Data Simulation
        const timer = setTimeout(() => {
            const data = Array.from({length: 14}, (_, i) => ({
                date: new Date(Date.now() - (13-i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {month:'short', day:'numeric'}),
                cost: parseFloat((Math.random() * 2.5).toFixed(2)),
                tokens: Math.floor(Math.random() * 50000) + 10000
            }));
            setUsageData(data);

            const txs = [
                { id: 1, date: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'debit', amount: 0.45, description: 'Daily News Agent' },
                { id: 2, date: new Date(Date.now() - 3600000 * 24).toISOString(), type: 'debit', amount: 1.20, description: 'Research Task: AI Trends' },
                { id: 3, date: new Date(Date.now() - 3600000 * 48).toISOString(), type: 'credit', amount: 50.00, description: 'Balance Top-up' },
                { id: 4, date: new Date(Date.now() - 3600000 * 50).toISOString(), type: 'debit', amount: 0.85, description: 'Blog Generation' },
                { id: 5, date: new Date(Date.now() - 3600000 * 72).toISOString(), type: 'debit', amount: 0.15, description: 'SEO Analysis' },
            ];
            setTransactions(txs);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex h-64 w-full items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    const totalSpent = usageData.reduce((acc, curr) => acc + curr.cost, 0).toFixed(2);
    const totalTokens = usageData.reduce((acc, curr) => acc + curr.tokens, 0).toLocaleString();

    return (
        <div className="space-y-8 animate-page-enter pb-20">
            {/* Header with Balance Card Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Title & Balance Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Usage & Billing</h2>
                        <p className="text-slate-500 mt-2 text-lg">Track consumption and manage your wallet.</p>
                    </div>
                    
                    {/* Premium Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <p className="text-blue-100 font-bold mb-1 text-xs uppercase tracking-widest opacity-80">Available Balance</p>
                                <h3 className="text-5xl font-extrabold tracking-tight mb-4 flex items-baseline gap-1">
                                    <span>$50.00</span>
                                    <span className="text-lg font-medium text-blue-200">USD</span>
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-blue-50 bg-white/10 px-3 py-1.5 rounded-lg w-fit backdrop-blur-sm border border-white/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    Auto-recharge inactive
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold backdrop-blur-md transition-all shadow-sm hover:shadow-md">
                                    Invoices
                                </button>
                                <button 
                                    onClick={onAddBalance}
                                    className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Add Credits
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Stats */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4 mb-3 relative z-10">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Est. Cost (30d)</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800 relative z-10">${totalSpent}</div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center relative overflow-hidden group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4 mb-3 relative z-10">
                            <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                            </div>
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Total Tokens</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-800 relative z-10">{totalTokens}</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-8 rounded-[2rem] shadow-card border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-xl text-slate-800">Daily Consumption</h3>
                    <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors uppercase tracking-wide cursor-pointer">
                        <option>Last 14 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last 3 Months</option>
                    </select>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={usageData} margin={{top: 10, right: 0, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                                dy={15} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                                tickFormatter={(val) => `$${val}`} 
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: '#fff', 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                                    padding: '16px'
                                }} 
                                cursor={{fill: '#f8fafc'}}
                                formatter={(val: number) => [`$${val.toFixed(2)}`, 'Cost']}
                                labelStyle={{color: '#64748b', fontWeight: 600, fontSize: '12px', marginBottom: '8px'}}
                            />
                            <Bar 
                                dataKey="cost" 
                                fill="url(#barGradient)" 
                                radius={[6, 6, 0, 0]} 
                                barSize={40} 
                            >
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#60a5fa" />
                                    </linearGradient>
                                </defs>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-[2rem] shadow-card border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-slate-800">Transaction History</h3>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:border-blue-200">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="py-5 px-8 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                <th className="py-5 px-8 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="py-5 px-8 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="py-5 px-8 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-5 px-8 text-sm font-bold text-slate-700">
                                        {new Date(tx.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                                        <span className="block text-xs font-normal text-slate-400 mt-0.5">{new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className="text-sm font-bold text-slate-800">{tx.description}</span>
                                        <span className="block text-xs text-slate-400 mt-0.5">ID: #TX-{tx.id.toString().padStart(6, '0')}</span>
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                            tx.type === 'credit' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {tx.type === 'credit' ? 'Deposit' : 'Usage'}
                                        </span>
                                    </td>
                                    <td className={`py-5 px-8 text-right`}>
                                        <span className={`text-base font-extrabold ${
                                            tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                                        }`}>
                                            {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {transactions.length > 5 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center">
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">
                            Load More Transactions
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
