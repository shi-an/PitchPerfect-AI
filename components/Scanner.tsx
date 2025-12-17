import React, { useState } from 'react';
import { Rocket, Briefcase, Glasses, User } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-6 md:p-12 w-full animate-in fade-in zoom-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Initialize Simulation</h2>
        <p className="text-slate-400">Configure your session parameters</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Col: Startup Info */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4">1. Startup Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Company Name</label>
              <input
                type="text"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
                placeholder="e.g. Uber for Dogs"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all placeholder:text-slate-600"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Elevator Pitch</label>
              <textarea
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                placeholder="We help dogs commute to work..."
                className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all resize-none placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Persona */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-400 mb-4">2. Select Investor</h3>
          <div className="space-y-3">
            {PERSONAS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`w-full relative flex items-center p-4 rounded-xl border transition-all duration-200 text-left ${
                  selectedPersona.id === p.id
                    ? 'bg-slate-800 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)] scale-[1.02]'
                    : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center mr-4 shrink-0 shadow-lg`}>
                  {p.id === 'shark' && <Briefcase className="text-white w-5 h-5" />}
                  {p.id === 'visionary' && <Rocket className="text-white w-5 h-5" />}
                  {p.id === 'skeptic' && <Glasses className="text-white w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.role} • {p.style}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4">
             <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500 flex items-center justify-between">
                <span>Model: </span>
                <span className="font-mono text-violet-400">Gemini 2.5 Flash</span>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => canStart && onStart(selectedPersona, details)}
          disabled={!canStart}
          className={`px-12 py-4 rounded-xl font-bold text-lg tracking-wide shadow-lg transition-all ${
            canStart 
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95 shadow-violet-900/50' 
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          ENTER THE ROOM
        </button>
      </div>
    </div>
  );
};
