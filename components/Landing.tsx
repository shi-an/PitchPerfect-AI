import React from 'react';
import { Play, ShieldCheck, Zap, BarChart } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const Landing: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 to-slate-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            现已支持多模型智能集成
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
            掌控你的路演 <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              在关键时刻之前
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            PitchPerfect AI 是您的全天候创业路演教练。通过模拟真实的高压投资人对话，
            为您提供关于商业模式、故事讲述及财务逻辑的即时深度反馈，助您在真正走进会议室前胸有成竹。
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
              <h3 className="text-xl font-bold text-white mb-2">动态情感模拟</h3>
              <p className="text-slate-400">告别死板的问答。AI 投资人的兴趣会根据您的回答实时波动，可视化“兴趣计”让您一眼看穿对方心理。</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-fuchsia-500/30 transition-colors">
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">多维实战场景</h3>
              <p className="text-slate-400">从只看数据的“冷血 VC”到关注愿景的“天使投资人”，甚至还有温柔引导的“导师模式”，全方位打磨您的应变能力。</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">深度复盘报告</h3>
              <p className="text-slate-400">路演结束后，即刻生成包含 SWOT 分析、融资决策及具体改进建议的专业报告，让每一次练习都有据可依。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
