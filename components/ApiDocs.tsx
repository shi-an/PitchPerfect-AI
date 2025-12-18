import React from 'react';
import { ArrowLeft, Terminal, Code, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ApiDocs: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-violet-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-violet-600/20 rounded-xl">
                <Terminal className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">开发者 API</h1>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8">
            <p className="text-lg text-slate-300 mb-6">
                通过 PitchPerfect API 将强大的路演模拟功能集成到您的孵化器、加速器或教育平台中。
            </p>
            
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-hidden relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 border-b border-slate-800 pb-4">
                    <span className="text-emerald-400 font-bold">POST</span>
                    <span className="font-mono">https://api.pitchperfect.ai/v1/simulation/start</span>
                </div>
                <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`{
  "startup": {
    "name": "My AI Startup",
    "description": "Revolutionizing pitch decks..."
  },
  "persona_id": "shark",
  "webhook_url": "https://myapp.com/webhook"
}`}
                </pre>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                <Code className="w-6 h-6 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">简单集成</h3>
                <p className="text-slate-400 text-sm">
                    RESTful 设计，标准的 JSON 响应。几行代码即可启动一个模拟会话。
                </p>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                <Terminal className="w-6 h-6 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Webhooks</h3>
                <p className="text-slate-400 text-sm">
                    通过 Webhook 实时接收模拟对话更新和最终分析报告。
                </p>
            </div>
        </div>
        
        <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                申请 API 访问权限 (即将推出)
            </button>
        </div>
      </div>
    </div>
  );
};
