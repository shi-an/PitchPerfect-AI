import React, { useEffect, useState } from 'react';
import { Rocket, Briefcase, Glasses, User, ArrowRight } from 'lucide-react';
import { Persona, StartupDetails } from '../types';
import { getUserConfig, saveUserConfig, listUserStartups } from '../services/storageService';

interface Props {
  onStart: (persona: Persona, details: StartupDetails) => void;
}

const PERSONAS: Persona[] = [
  {
    id: 'shark',
    name: '凯文「鲨鱼」',
    role: '风险投资人',
    description: '冷酷无情：只看利润、获客成本与用户生命周期价值。厌恶空话。',
    style: '简短、强势、以数据为中心。',
    icon: 'shark',
    color: 'bg-red-500'
  },
  {
    id: 'visionary',
    name: '伊拉拉·月',
    role: '天使投资人',
    description: '寻找登月项目，关注“为什么”与人类影响。',
    style: '鼓舞人心、抽象、充满好奇。',
    icon: 'star',
    color: 'bg-purple-500'
  },
  {
    id: 'skeptic',
    name: '戴夫·运营',
    role: '技术创始人',
    description: '前 CTO，深挖技术栈与可行性。',
    style: '细致、怀疑、技术导向。',
    icon: 'code',
    color: 'bg-blue-500'
  }
];

export const SetupScreen: React.FC<Props> = ({ onStart }) => {
  const [details, setDetails] = useState<StartupDetails>({ name: '', description: '' });
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);

  const canStart = details.name.length > 2 && details.description.length > 10;

  useEffect(() => {
    const run = async () => {
      try {
        const startups = await listUserStartups();
        if (startups && startups.items?.length) {
          const defId = startups.defaultStartupId || startups.items[0]?.id;
          const def = startups.items.find(s => s.id === defId) || startups.items[0];
          if (def) setDetails({ name: def.name, description: def.description });
        } else {
          const cfg = await getUserConfig();
          if (cfg?.savedStartup?.name && cfg?.savedStartup?.description) {
            setDetails({ name: cfg.savedStartup.name, description: cfg.savedStartup.description });
          }
          if (cfg?.defaultPersonaId) {
            const found = PERSONAS.find(p => p.id === cfg.defaultPersonaId);
            if (found) setSelectedPersona(found);
          }
        }
        const cfg2 = await getUserConfig();
        if (cfg2?.defaultPersonaId) {
          const found2 = PERSONAS.find(p => p.id === cfg2.defaultPersonaId);
          if (found2) setSelectedPersona(found2);
        }
      } catch {}
    };
    run();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 w-full animate-in zoom-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">初始化模拟</h2>
        <p className="text-slate-400">配置你的会话参数</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Col: Startup Info */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">1</span>
            创业项目资料
          </h3>
          <div className="space-y-4">
            <div className="group">
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block group-focus-within:text-violet-400 transition-colors">公司名称</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                placeholder="例如：宠物出行的优步"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-slate-800 outline-none text-white transition-all placeholder:text-slate-600 shadow-sm"
              />
            </div>
            
            <div className="group">
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block group-focus-within:text-violet-400 transition-colors">电梯演讲</label>
              <textarea
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                placeholder="我们通过自动驾驶车辆帮助宠物通勤上班……"
                className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-slate-800 outline-none text-white transition-all resize-none placeholder:text-slate-600 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Persona */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">2</span>
            选择投资人
          </h3>
          <div className="space-y-3">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`w-full relative flex items-center p-4 rounded-xl border transition-all duration-300 text-left group ${
                  selectedPersona.id === p.id
                    ? 'bg-slate-800 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02] ring-1 ring-violet-500'
                    : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-1'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center mr-4 shrink-0 shadow-lg transition-transform group-hover:scale-110`}>
                  {p.id === 'shark' && <Briefcase className="text-white w-5 h-5" />}
                  {p.id === 'visionary' && <Rocket className="text-white w-5 h-5" />}
                  {p.id === 'skeptic' && <Glasses className="text-white w-5 h-5" />}
                </div>
                <div>
                  <h3 className={`font-bold transition-colors ${selectedPersona.id === p.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">{p.role} • {p.style}</p>
                </div>
                {selectedPersona.id === p.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-4">
             <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500 flex items-center justify-between">
               <span className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> 系统状态
               </span>
               <span className="font-mono text-violet-400">
                 {(() => {
                   const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('model_provider') : null;
                   const provider = (stored || (process.env.MODEL_PROVIDER || 'deepseek')).toLowerCase();
                   if (provider === 'deepseek') {
                     return process.env.DEEPSEEK_API_KEY ? 'DeepSeek Chat 在线' : 'DeepSeek Chat 未配置';
                   }
                   return process.env.GEMINI_API_KEY ? 'Gemini 2.5 Flash 在线' : 'Gemini 2.5 Flash 未配置';
                 })()}
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center animate-in fade-in" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={async () => {
            if (!canStart) return;
            try {
              await saveUserConfig({ savedStartup: details, defaultPersonaId: selectedPersona.id });
            } catch {}
            onStart(selectedPersona, details);
          }}
          disabled={!canStart}
          className={`px-12 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2 ${
            canStart 
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95 shadow-violet-900/50 hover:shadow-violet-900/70' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'
          }`}
        >
          进入会议室
          {canStart && <ArrowRight className="w-5 h-5 animate-pulse" />}
        </button>
      </div>
    </div>
  );
};
