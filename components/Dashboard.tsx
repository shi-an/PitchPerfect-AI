import React, { useEffect, useState } from 'react';
import { generateAnalysisReport } from '../services/geminiService';
import { PitchReport, PitchMessage } from '../types';
import { Loader2, CheckCircle, XCircle, Trophy, RefreshCw, AlertCircle, LineChart as ChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

interface Props {
  messages: PitchMessage[];
  finalScore: number;
  interestTrajectory?: number[];
  onRestart: () => void;
  existingReport?: PitchReport; // Support loading history
  onReportGenerated?: (report: PitchReport) => void; // Callback to save history
}

export const FeedbackReport: React.FC<Props> = ({ messages, finalScore, interestTrajectory, onRestart, existingReport, onReportGenerated }) => {
  const [report, setReport] = useState<PitchReport | null>(existingReport || null);

  useEffect(() => {
    // If we have an existing report (from history), use it and don't regenerate
    if (existingReport) {
        setReport(existingReport);
        return;
    }

    // Otherwise generate new report
    const fetchReport = async () => {
      const historyStrings = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`);
      const data = await generateAnalysisReport(historyStrings, finalScore);
      setReport(data);
      if (onReportGenerated) {
        onReportGenerated(data);
      }
    };
    fetchReport();
  }, [existingReport]); // Only depend on existingReport to prevent loops

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-300">
        <Loader2 className="w-16 h-16 animate-spin text-violet-500 mb-6" />
        <h2 className="text-2xl font-bold text-white">正在生成条款清单</h2>
        <p className="text-slate-500 mt-2">AI 正在分析你的表现…</p>
      </div>
    );
  }

  const isFunded = report.funding_decision === 'Funded';
  
  // Prepare chart data
  const chartData = interestTrajectory ? interestTrajectory.map((score, index) => ({
      turn: index,
      score: score
  })) : [];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Banner */}
      <div className={`p-8 md:p-12 rounded-3xl mb-12 text-center border-2 shadow-2xl relative overflow-hidden ${isFunded ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-red-950/30 border-red-500/50'}`}>
        <div className={`absolute inset-0 opacity-10 blur-3xl ${isFunded ? 'bg-emerald-500' : 'bg-red-500'}`} />
        
        <div className="relative z-10">
            {isFunded ? <Trophy className="w-20 h-20 text-emerald-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" /> : <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />}
            
            <h2 className="text-5xl md:text-7xl font-bold mb-4 text-white tracking-tight">
            {({ Funded: '获投', Passed: '未获投', Ghosted: '已失联' } as any)[report.funding_decision] || report.funding_decision}
            </h2>
            
            <div className="inline-flex items-center gap-3 bg-slate-900/50 px-6 py-2 rounded-full border border-slate-700">
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">最终兴趣分</span>
                <span className={`text-xl font-bold ${isFunded ? 'text-emerald-400' : 'text-red-400'}`}>{report.score}/100</span>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Main Feedback - Left Col */}
        <div className="md:col-span-8 space-y-8">
            
            {/* Interest Chart */}
            {chartData.length > 0 && (
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <h3 className="text-white font-bold mb-6 uppercase text-sm tracking-wider flex items-center gap-2">
                    <ChartIcon className="w-4 h-4 text-violet-400" />
                    互动轨迹
                </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="turn" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#a78bfa' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                <h3 className="text-violet-400 font-bold mb-4 uppercase text-sm tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400" />
                    投资人反馈
                </h3>
                <p className="text-slate-200 text-lg leading-relaxed">"{report.feedback}"</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-emerald-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> 加分点
                    </h3>
                    <ul className="space-y-3">
                    {report.strengths.map((s, i) => (
                        <li key={i} className="text-slate-300 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span> 
                        {s}
                        </li>
                    ))}
                    </ul>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-red-400 font-bold mb-4 uppercase text-xs tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> 致命问题
                    </h3>
                    <ul className="space-y-3">
                    {report.weaknesses.map((w, i) => (
                        <li key={i} className="text-slate-300 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span> 
                        {w}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Sidebar Actions - Right Col */}
        <div className="md:col-span-4 space-y-4">
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 text-center">
                <h4 className="text-white font-bold mb-2">准备再试一次？</h4>
                <p className="text-slate-400 text-sm mb-6">将这些经验应用到下一次模拟。</p>
                <button 
                    onClick={onRestart}
                    className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                    <RefreshCw className="w-5 h-5" />
                    开始新模拟
                </button>
             </div>
             
             <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">路演统计</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">时长</span>
                        <span className="text-white font-mono">12m 30s</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">对话轮数</span>
                        <span className="text-white font-mono">{messages.length}</span>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
