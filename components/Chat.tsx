import React, { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, TrendingDown, AlertCircle, X, StopCircle, Info } from 'lucide-react';
import { sendPitchMessage } from '../services/geminiService';
import { Persona, PitchMessage, StartupDetails } from '../types';

interface Props {
  persona: Persona;
  startup: StartupDetails;
  initialMessage: string;
  onFinish: (history: PitchMessage[], finalScore: number, interestTrajectory: number[]) => void;
  onExit: () => void;
  onProgress?: (history: PitchMessage[], score: number, trajectory: number[]) => void;
  initialHistory?: PitchMessage[];
  initialScore?: number;
  initialTrajectory?: number[];
}

export const PitchArena: React.FC<Props> = ({ persona, startup, initialMessage, onFinish, onExit, onProgress, initialHistory, initialScore, initialTrajectory }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [messages, setMessages] = useState<PitchMessage[]>(() => {
    if (initialHistory && initialHistory.length > 0) return initialHistory;
    return [{ id: 'init', role: 'model', text: initialMessage }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interestScore, setInterestScore] = useState(initialScore ?? 50);
  const [interestHistory, setInterestHistory] = useState<number[]>(initialTrajectory && initialTrajectory.length > 0 ? initialTrajectory : [initialScore ?? 50]); // Start at provided or 50
  const [isDealbreaker, setIsDealbreaker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount and after sending (unless dealbreaker)
  useEffect(() => {
      if (!isDealbreaker && !loading) {
          inputRef.current?.focus();
      }
  }, [loading, isDealbreaker]);

  const handleSend = async () => {
    if (!input.trim() || loading || isDealbreaker) return;

    const userText = input;
    setInput('');
    setLoading(true);

    const newMsg: PitchMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };

    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);

    try {
      // Small artificial delay for "thinking" feel if API is too fast
      const responsePromise = sendPitchMessage(userText);
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 800));
      
      const [response] = await Promise.all([responsePromise, minDelayPromise]);

      // Update Score
      const newScore = Math.max(0, Math.min(100, interestScore + response.interest_change));
      setInterestScore(newScore);
      const nextTrajectory = [...interestHistory, newScore];
      setInterestHistory(nextTrajectory);

      const botMsg: PitchMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.response,
        interestChange: response.interest_change
      };

      const updatedMessages = [...nextMessages, botMsg];
      setMessages(updatedMessages);
      
      // Auto-save progress
      onProgress && onProgress(updatedMessages, newScore, nextTrajectory);

      if (response.is_dealbreaker || newScore <= 10) {
        setIsDealbreaker(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGaugeColor = (score: number) => {
    if (score > 75) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (score > 40) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-slate-950 relative overflow-hidden">
      
      {/* Background Ambient Elements */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-colors duration-1000 ${
        persona.id === 'mentor' ? 'bg-emerald-500' : (interestScore > 50 ? 'bg-emerald-500' : 'bg-red-500')
      }`} />
      
      {/* Header / Gauge */}
      <div className="bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 sticky top-0 z-20 shadow-xl transition-all duration-300 relative">
        {showInfo && (
            <div className="absolute top-full left-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl z-30 w-64 animate-in slide-in-from-top-2">
                <h4 className="font-bold text-white text-sm mb-2">项目资料</h4>
                <div className="space-y-2">
                    <div>
                        <div className="text-xs text-slate-500 uppercase">名称</div>
                        <div className="text-sm text-slate-300">{startup.name}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 uppercase">简介</div>
                        <div className="text-sm text-slate-300 line-clamp-4">{startup.description}</div>
                    </div>
                </div>
            </div>
        )}
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 flex-1">
             <div className={`w-12 h-12 rounded-2xl ${persona.color} flex items-center justify-center text-xl font-bold text-white shadow-lg transition-transform hover:scale-105`}>
               {persona.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white leading-tight">{persona.name}</h3>
                <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-slate-500 hover:text-violet-400 transition-colors"
                >
                    <Info className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400">{persona.role}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs hidden md:block">
             {persona.id !== 'mentor' && (
             <>
             <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
               <span>兴趣水平</span>
               <span className={`transition-colors duration-500 ${interestScore > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{interestScore}%</span>
             </div>
             <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${getGaugeColor(interestScore)}`}
                  style={{ width: `${interestScore}%` }}
                />
             </div>
             </>
             )}
          </div>

          <button 
            onClick={onExit} 
            className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors border border-transparent hover:border-slate-700"
            title="退出会话"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Gauge */}
        {persona.id !== 'mentor' && (
        <div className="md:hidden mt-4">
           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${getGaugeColor(interestScore)}`}
                style={{ width: `${interestScore}%` }}
              />
           </div>
        </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[90%] md:max-w-[70%] ${msg.role === 'user' ? 'message-enter-user' : 'message-enter'}`}>
                  <div
                    className={`p-5 md:p-6 rounded-3xl text-sm md:text-base leading-relaxed shadow-lg transition-all ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-sm hover:border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* Interest Indicator for Bot Messages */}
                  {msg.role === 'model' && msg.interestChange !== undefined && index > 0 && persona.id !== 'mentor' && (
                    <span className={`text-xs mt-2 ml-2 font-mono font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-2 ${msg.interestChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {msg.interestChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        兴趣 {msg.interestChange > 0 ? '+' : ''}{msg.interestChange}%
                    </span>
                  )}
              </div>
            </div>
          ))}
          
          {loading && (
             <div className="flex justify-start animate-in fade-in">
               <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-bl-sm px-6 py-5 text-sm text-slate-400 flex items-center gap-2 shadow-lg">
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
               </div>
             </div>
          )}
          
          {/* Dealbreaker Alert */}
          {isDealbreaker && (
            <div className="my-8 bg-red-950/40 border border-red-500/50 p-6 rounded-2xl flex items-center gap-4 text-red-200 animate-in zoom-in duration-500 mx-auto max-w-lg shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <div className="bg-red-500/20 p-3 rounded-full shrink-0">
                  <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-lg text-white">路演已终止</p>
                <p className="opacity-80 text-sm">投资人已失去兴趣。查看你的报告以改进。</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-900 relative z-20">
        <div className="max-w-4xl mx-auto">
          {isDealbreaker ? (
            <button 
              onClick={() => onFinish(messages, interestScore, interestHistory)}
              className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all shadow-lg hover:shadow-white/20 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              查看表现报告
            </button>
          ) : (
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入你的回答…"
                className="flex-1 bg-slate-900 text-white border-slate-800 rounded-xl px-6 py-4 focus:ring-2 focus:ring-violet-500 outline-none placeholder:text-slate-600 text-base shadow-inner transition-all focus:border-violet-500/50"
                disabled={loading}
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-violet-600 text-white p-4 rounded-xl hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-900/20 active:scale-95 hover:shadow-violet-900/40"
              >
                {loading ? <StopCircle className="w-6 h-6 animate-pulse" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          )}
          
          {!isDealbreaker && messages.length > 2 && (
              <div className="text-center mt-3">
                <button 
                    onClick={() => onFinish(messages, interestScore, interestHistory)}
                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-2 px-4 rounded-full hover:bg-slate-900"
                >
                    提前结束并获取报告
                </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
