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
            Now supporting Gemini 2.5 & DeepSeek Integration
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
            Master Your Pitch <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Before It Counts
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice your startup pitch with ruthless AI investors. Get instant feedback on your 
            storytelling, financials, and answers to tough questions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-900" />
              Start Simulation
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 text-white rounded-xl font-bold border border-slate-700 hover:bg-slate-800 transition-all">
              View Demo
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
              <p className="text-slate-400">Dynamic conversations that react to your vagueness or confidence. The "Interest Meter" never lies.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-fuchsia-500/30 transition-colors">
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Diverse Personas</h3>
              <p className="text-slate-400">From "The Shark" who wants margins to "The Visionary" who wants moonshots. Train for every scenario.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Detailed Analytics</h3>
              <p className="text-slate-400">Receive a comprehensive term sheet or rejection letter with actionable feedback on your performance.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
