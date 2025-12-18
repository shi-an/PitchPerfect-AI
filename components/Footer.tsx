import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">PitchPerfect AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              全球领先的创业路演模拟器。与 AI 投资人角色训练，
              获得实时反馈，在走进会议室之前就掌握你的路演。
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">产品</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">功能</Link></li>
              <li><Link to="/pricing" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">定价</Link></li>
              <li><Link to="/api-docs" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">法律</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">隐私</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">条款</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-violet-400 text-sm transition-colors">联系</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">© 2024 PitchPerfect AI. 保留所有权利。</p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};
