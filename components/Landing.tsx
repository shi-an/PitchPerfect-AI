import React from 'react';
import { Play, ShieldCheck, Zap, BarChart } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const Landing: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-900 to-slate-900 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            现已支持多模型智能集成
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
            掌控你的路演 <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              在关键时刻之前
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            用强悍的 AI 投资人练习你的创业路演。即时获得关于故事讲述、
            财务指标以及高压问答的反馈。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-900" />
              开始模拟
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 text-white rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition-all">
              查看演示
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-violet-500/30 transition-colors">
              <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Simulation</h3>
              <p className="text-slate-400">对话会根据你的表达是否清晰、自信而动态变化。“兴趣计”一目了然。</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-fuchsia-500/30 transition-colors">
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">多元投资人角色</h3>
              <p className="text-slate-400">从只看利润的“鲨鱼”到追求登月的“愿景家”，为每种场景做好训练。</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">详细分析</h3>
              <p className="text-slate-400">获得全面的条款清单或拒绝原因，并附可执行的改进建议。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
