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
        <h2 className="text-4xl font-bold text-white mb-4">Invest in Your Success</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Choose the plan that fits your fundraising stage. Practice makes perfect.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-slate-700 transition-colors">
          <div className="mb-4 bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Bootstrapper</h3>
          <div className="text-3xl font-bold text-white mb-6">$0 <span className="text-sm text-slate-500 font-normal">/mo</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              3 Pitches per day
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              Standard Personas
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              Basic Feedback Report
            </li>
            <li className="flex items-center gap-3 text-slate-500 text-sm">
              <X className="w-4 h-4 shrink-0" />
              History Retention (7 days)
            </li>
          </ul>

          <button onClick={onSubscribe} className="w-full py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 border border-violet-500 rounded-3xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(139,92,246,0.15)] transform md:-translate-y-4">
          <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
            Most Popular
          </div>
          <div className="mb-4 bg-violet-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Seed Round</h3>
          <div className="text-3xl font-bold text-white mb-6">$29 <span className="text-sm text-slate-500 font-normal">/mo</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              Unlimited Pitches
            </li>
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              All Premium Personas
            </li>
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              DeepSeek & GPT-4 Analysis
            </li>
            <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              Pitch Deck Upload (PDF)
            </li>
             <li className="flex items-center gap-3 text-white text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              Permanent History
            </li>
          </ul>

          <button onClick={onSubscribe} className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-900/20">
            Upgrade Now
          </button>
        </div>

        {/* Enterprise */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-slate-700 transition-colors">
          <div className="mb-4 bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Accelerator</h3>
          <div className="text-3xl font-bold text-white mb-6">$99 <span className="text-sm text-slate-500 font-normal">/seat</span></div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              Team Management
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              Custom Custom Personas
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              API Access
            </li>
            <li className="flex items-center gap-3 text-slate-300 text-sm">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              Dedicated Success Manager
            </li>
          </ul>

          <button onClick={onSubscribe} className="w-full py-3 rounded-xl border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};
