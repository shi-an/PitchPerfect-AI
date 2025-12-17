import React from 'react';
import { Check, X, Zap, Crown, Building2 } from 'lucide-react';
import { ViewState } from '../types';

interface Props {
  onSubscribe: () => void;
}

export const Pricing: React.FC<Props> = ({ onSubscribe }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">为你的成功投资</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          选择契合你筹资阶段的方案。熟能生巧。
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-slate-700 transition-colors">
          <div className="mb-4 bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">起步版</h3>
          <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm text-slate-500 font-normal">/月</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              每日 3 次路演
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              标准角色
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              基础反馈报告
            </li>
            <li className="flex items-center gap-3 text-slate-500 text-sm">
              <X className="w-4 h-4 shrink-0" />
              历史保留（7 天）
            </li>
          </ul>

          <button onClick={onSubscribe} className="w-full py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors">
            当前方案
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 border border-violet-500 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(139,92,246,0.15)] transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
            最受欢迎
          </div>
          <div className="mb-4 bg-violet-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">种子轮</h3>
          <div className="text-3xl font-bold text-white mb-6">$29 <span className="text-sm text-slate-500 font-normal">/月</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              无限次路演
            </li>
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              全部高级角色
            </li>
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              DeepSeek 与 GPT-4 分析
            </li>
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              支持上传路演材料（PDF）
            </li>
             <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              永久历史记录
            </li>
          </ul>

          <button onClick={onSubscribe} className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-900/20">
            立即升级
          </button>
        </div>

        {/* Enterprise */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-slate-700 transition-colors">
          <div className="mb-4 bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">加速器版</h3>
          <div className="text-3xl font-bold text-white mb-6">$99 <span className="text-sm text-slate-500 font-normal">/席位</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              团队管理
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              自定义角色
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              API 访问
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              专属成功经理
            </li>
          </ul>

          <button onClick={onSubscribe} className="w-full py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors">
            联系销售
          </button>
        </div>
      </div>
    </div>
  );
};
