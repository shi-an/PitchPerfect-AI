import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Us</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Bridging the gap between visionary founders and funding through artificial intelligence.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-violet-400">Our Mission</h2>
          <p className="text-slate-300 leading-relaxed">
            Starting a company is hard. Fundraising is harder. We built PitchPerfect AI to democratize 
            access to high-quality pitch feedback. Not everyone has a network of VCs to practice with—but 
            everyone should have the chance to refine their story.
          </p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
           <div className="flex items-center gap-4 mb-4">
             <div className="h-12 w-1 bg-violet-500 rounded-full"></div>
             <div>
               <div className="text-3xl font-bold text-white">10k+</div>
               <div className="text-slate-400 text-sm">Pitches Simulated</div>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <div className="h-12 w-1 bg-fuchsia-500 rounded-full"></div>
             <div>
               <div className="text-3xl font-bold text-white">94%</div>
               <div className="text-slate-400 text-sm">User Confidence Boost</div>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Powered by Advanced AI</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          We utilize state-of-the-art Large Language Models to simulate diverse investor personalities.
          Our platform supports model interoperability, leveraging the best models for reasoning and roleplay.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 font-mono">
           <span className="bg-slate-900 px-3 py-1 rounded border border-slate-700">Gemini 2.5 Flash</span>
           <span className="bg-slate-900 px-3 py-1 rounded border border-slate-700">DeepSeek R1 (Coming Soon)</span>
           <span className="bg-slate-900 px-3 py-1 rounded border border-slate-700">GPT-4o (Enterprise)</span>
        </div>
      </div>
    </div>
  );
};
