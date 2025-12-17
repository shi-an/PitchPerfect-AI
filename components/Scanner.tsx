import React, { useState } from 'react';
import { Rocket, Briefcase, Glasses, User, ArrowRight } from 'lucide-react';
import { Persona, StartupDetails } from '../types';

interface Props {
  onStart: (persona: Persona, details: StartupDetails) => void;
}

const PERSONAS: Persona[] = [
  {
    id: 'shark',
    name: 'Kevin "The Shark"',
    role: 'Venture Capitalist',
    description: 'Ruthless. Cares about margins, CAC, and LTV. Hates buzzwords.',
    style: 'Short, aggressive, numbers-focused.',
    icon: 'shark',
    color: 'bg-red-500'
  },
  {
    id: 'visionary',
    name: 'Elara Moon',
    role: 'Angel Investor',
    description: 'Looks for moonshots. Cares about the "Why" and human impact.',
    style: 'Inspirational, abstract, curious.',
    icon: 'star',
    color: 'bg-purple-500'
  },
  {
    id: 'skeptic',
    name: 'Dave Ops',
    role: 'Technical Founder',
    description: 'Former CTO. Drills into the tech stack and feasibility.',
    style: 'Detailed, skeptical, technical.',
    icon: 'code',
    color: 'bg-blue-500'
  }
];

export const SetupScreen: React.FC<Props> = ({ onStart }) => {
  const [details, setDetails] = useState<StartupDetails>({ name: '', description: '' });
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);

  const canStart = details.name.length > 2 && details.description.length > 10;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 w-full animate-in zoom-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Initialize Simulation</h2>
        <p className="text-slate-400">Configure your session parameters</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Col: Startup Info */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">1</span>
            Startup Profile
          </h3>
          <div className="space-y-4">
            <div className="group">
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block group-focus-within:text-violet-400 transition-colors">Company Name</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                placeholder="e.g. Uber for Dogs"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-slate-800 outline-none text-white transition-all placeholder:text-slate-600 shadow-sm"
              />
            </div>
            
            <div className="group">
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block group-focus-within:text-violet-400 transition-colors">Elevator Pitch</label>
              <textarea
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                placeholder="We help dogs commute to work by connecting them with autonomous vehicles..."
                className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-slate-800 outline-none text-white transition-all resize-none placeholder:text-slate-600 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Persona */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs">2</span>
            Select Investor
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
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> System Status</span>
                <span className="font-mono text-violet-400">Gemini 2.5 Flash Online</span>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center animate-in fade-in" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={() => canStart && onStart(selectedPersona, details)}
          disabled={!canStart}
          className={`px-12 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2 ${
            canStart 
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95 shadow-violet-900/50 hover:shadow-violet-900/70' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'
          }`}
        >
          ENTER THE ROOM
          {canStart && <ArrowRight className="w-5 h-5 animate-pulse" />}
        </button>
      </div>
    </div>
  );
};
