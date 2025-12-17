import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">PitchPerfect AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The world's most advanced startup pitch simulator. Train with AI personas, 
              get real-time feedback, and master your pitch before you walk into the room.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-violet-400 text-sm">Features</a></li>
              <li><a href="#" className="text-slate-400 hover:text-violet-400 text-sm">Pricing</a></li>
              <li><a href="#" className="text-slate-400 hover:text-violet-400 text-sm">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-violet-400 text-sm">Privacy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-violet-400 text-sm">Terms</a></li>
              <li><a href="#" className="text-slate-400 hover:text-violet-400 text-sm">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">© 2024 PitchPerfect AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Github className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
            <Twitter className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
            <Linkedin className="w-5 h-5 text-slate-500 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
};
