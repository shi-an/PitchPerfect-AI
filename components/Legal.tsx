import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LegalPage: React.FC<{ title: string; type: 'privacy' | 'terms' }> = ({ title, type }) => {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-violet-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">{title}</h1>
        
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
            <p className="text-slate-300 leading-relaxed">
              生效日期：2024年1月1日
            </p>

            {type === 'privacy' ? (
              <>
                <h3 className="text-xl font-bold text-white">1. 信息收集</h3>
                <p className="text-slate-400">
                  我们收集的信息仅用于改进您的路演模拟体验。这包括您的模拟对话记录、评分数据以及您主动提供的创业项目资料。
                  所有的 AI 对话数据均通过加密传输，并严格遵守数据保护法规。
                </p>
                
                <h3 className="text-xl font-bold text-white">2. 数据使用</h3>
                <p className="text-slate-400">
                  您的数据将用于：
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>生成个性化的路演反馈报告</li>
                    <li>训练和优化我们的 AI 投资人模型（仅限脱敏数据）</li>
                    <li>提供客户支持和技术服务</li>
                  </ul>
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white">1. 服务条款</h3>
                <p className="text-slate-400">
                  欢迎使用 PitchPerfect AI。通过访问或使用我们的服务，即表示您同意受这些条款的约束。如果您不同意这些条款的任何部分，则无权访问该服务。
                </p>
                
                <h3 className="text-xl font-bold text-white">2. 用户责任</h3>
                <p className="text-slate-400">
                  您对自己在平台上的所有活动负责。您同意不上传任何非法的、侵犯他人权益的或包含恶意软件的内容。
                  模拟结果仅供参考，不构成实际的投资建议。
                </p>
              </>
            )}

            <h3 className="text-xl font-bold text-white">联系我们</h3>
            <p className="text-slate-400">
              如果您对本{title}有任何疑问，请联系我们：support@pitchperfect.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
