
import React, { useState } from 'react';
import { Check, X, Zap, Crown, Building2, CreditCard, Loader2 } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { upgradeUserPlan } from '../services/authService';

interface Props {
  onSubscribe: () => void;
}

export const Pricing: React.FC<Props> = ({ onSubscribe }) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null); // 'PRO' or 'ENTERPRISE'
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  const handleAction = (plan: 'FREE' | 'PRO' | 'ENTERPRISE') => {
    if (!user) {
        onSubscribe(); // Redirect to login
        return;
    }
    
    if (user.plan === plan) return; // Already on this plan
    
    if (plan === 'FREE') {
        // Downgrade logic? Or just ignore for now
        toast.info('请联系客服进行降级操作。');
        return;
    }
    
    setShowPayment(plan);
  };

  const processPayment = async () => {
      if (!showPayment) return;
      setLoading(true);
      try {
          // Simulate API delay
          await new Promise(r => setTimeout(r, 1500));
          await upgradeUserPlan(showPayment as 'PRO' | 'ENTERPRISE');
          await refreshUser();
          toast.success('支付成功！您的账户已升级。');
          setShowPayment(null);
      } catch (e) {
          toast.error('升级失败，请稍后重试。');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-in fade-in slide-in-from-bottom-4 relative">
      {/* Payment Modal */}
      {showPayment && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full animate-in zoom-in-95">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-violet-400" />
                      扫码支付
                  </h3>
                  
                  <div className="space-y-6 mb-8">
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                          <div className="text-sm text-slate-400 mb-1">订阅方案</div>
                          <div className="font-bold text-white text-lg">
                              {showPayment === 'PRO' ? '种子轮 (Pro)' : '加速器版 (Enterprise)'}
                          </div>
                          <div className="text-violet-400 font-bold">
                              {showPayment === 'PRO' ? '¥ 199.00 / 月' : '¥ 699.00 / 月'}
                          </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                          <div className="flex bg-slate-800 p-1 rounded-lg mb-4 w-full">
                              <button
                                  onClick={() => setPaymentMethod('wechat')}
                                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                      paymentMethod === 'wechat' 
                                      ? 'bg-emerald-600 text-white shadow' 
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                              >
                                  微信支付
                              </button>
                              <button
                                  onClick={() => setPaymentMethod('alipay')}
                                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                      paymentMethod === 'alipay' 
                                      ? 'bg-blue-600 text-white shadow' 
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                              >
                                  支付宝
                              </button>
                          </div>
                          
                          <div className={`bg-white p-4 rounded-xl mb-4 border-4 ${paymentMethod === 'wechat' ? 'border-emerald-500' : 'border-blue-500'}`}>
                             {/* QR Codes */}
                             <img 
                                src={paymentMethod === 'wechat' ? "/wechat_pay.png" : "/alipay.png"} 
                                alt={`${paymentMethod === 'wechat' ? 'WeChat' : 'Alipay'} QR Code`} 
                                className="w-48 h-48 object-contain"
                                onError={(e) => {
                                    // Fallback if image not found
                                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://pitchperfect.ai/pay/${showPayment}?method=${paymentMethod}`;
                                }}
                             />
                          </div>
                          <p className="text-sm text-slate-400">
                              请使用<span className={paymentMethod === 'wechat' ? 'text-emerald-400' : 'text-blue-400'}>
                                  {paymentMethod === 'wechat' ? '微信' : '支付宝'}
                              </span>扫码支付
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowPayment(null)}
                        className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                          取消
                      </button>
                      <button 
                        onClick={processPayment}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '我已支付'}
                      </button>
                  </div>
              </div>
          </div>
      )}

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
          <div className="text-3xl font-bold text-white mb-6">¥ 0 <span className="text-sm text-slate-500 font-normal">/月</span></div>
          
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

          <button 
            onClick={() => handleAction('FREE')} 
            className={`w-full py-3 rounded-xl border font-medium transition-colors ${
                user?.plan === 'FREE' 
                ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-default' 
                : 'border-slate-700 text-white hover:bg-slate-800'
            }`}
            disabled={user?.plan === 'FREE'}
          >
            {user?.plan === 'FREE' ? '当前方案' : '选择方案'}
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
              高级 AI 分析报告
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

          <button 
            onClick={() => handleAction('PRO')} 
            className={`w-full py-3 rounded-xl font-bold transition-colors shadow-lg shadow-violet-900/20 ${
                user?.plan === 'PRO'
                ? 'bg-slate-800 border border-slate-600 text-slate-400 cursor-default shadow-none'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
            disabled={user?.plan === 'PRO'}
          >
            {user?.plan === 'PRO' ? '当前方案' : '立即升级'}
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

          <button 
            onClick={() => handleAction('ENTERPRISE')} 
            className={`w-full py-3 rounded-xl border font-medium transition-colors ${
                user?.plan === 'ENTERPRISE'
                ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-default'
                : 'border-slate-700 text-white hover:bg-slate-800'
            }`}
            disabled={user?.plan === 'ENTERPRISE'}
          >
            {user?.plan === 'ENTERPRISE' ? '当前方案' : '联系销售'}
          </button>
        </div>
      </div>
    </div>
  );
};
