import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">关于我们</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          通过人工智能，连接富有远见的创始人与融资机会。
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-violet-400">我们的使命</h2>
          <p className="text-slate-300 leading-relaxed">
            创业很难，融资更难。我们打造 PitchPerfect AI，旨在让每个人都能获得高质量的路演反馈。
            并非每个人都拥有可练习的 VC 网络，但每个人都应该有机会打磨自己的故事。
          </p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
           <div className="flex items-center gap-4 mb-4">
             <div className="h-12 w-1 bg-violet-500 rounded-full"></div>
             <div>
               <div className="text-3xl font-bold text-white">10k+</div>
               <div className="text-slate-400 text-sm">已完成路演模拟</div>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <div className="h-12 w-1 bg-fuchsia-500 rounded-full"></div>
             <div>
               <div className="text-3xl font-bold text-white">94%</div>
               <div className="text-slate-400 text-sm">用户信心提升</div>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">由先进 AI 驱动</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          我们使用最先进的大语言模型来模拟多样的投资人性格。
          平台支持模型互操作，充分发挥不同模型在推理与角色扮演上的优势。
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-mono">
         <span className="bg-slate-900 px-3 py-1 rounded border border-slate-700">Gemini 2.5 Flash</span>
          <span className="bg-slate-900 px-3 py-1 rounded border border-slate-700">DeepSeek R1（即将上线）</span>
          <span className="bg-slate-900 px-3 py-1 rounded border border-slate-700">GPT-4o（企业版）</span>
      </div>
      </div>
    </div>
  );
};
