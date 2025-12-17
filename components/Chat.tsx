import React, { useState, useEffect, useRef } from 'react';
import { Send, TrendingUp, TrendingDown, AlertCircle, X } from 'lucide-react';
import { sendPitchMessage } from '../services/geminiService';
import { Persona, PitchMessage, StartupDetails } from '../types';

interface Props {
  persona: Persona;
  startup: StartupDetails;
  initialMessage: string;
  onFinish: (history: PitchMessage[], finalScore: number) => void;
  onExit: () => void;
}

export const PitchArena: React.FC<Props> = ({ persona, startup, initialMessage, onFinish, onExit }) => {
  const [messages, setMessages] = useState<PitchMessage[]>([
    { id: 'init', role: 'model', text: initialMessage }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [interestScore, setInterestScore] = useState(50);
  const [isDealbreaker, setIsDealbreaker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    setMessages(prev => [...prev, newMsg]);

    try {
      const response = await sendPitchMessage(userText);

      // Update Score
      const newScore = Math.max(0, Math.min(100, interestScore + response.interest_change));
      setInterestScore(newScore);

      const botMsg: PitchMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.response,
        interestChange: response.interest_change
      };

      setMessages(prev => [...prev, botMsg]);

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
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-colors duration-1000 ${interestScore > 50 ? 'bg-emerald-500' : 'bg-red-500'}`} />
      
      {/* Header / Gauge */}
      <div className="bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 sticky top-0 z-20 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 flex-1">
             <div className={`w-12 h-12 rounded-2xl ${persona.color} flex items-center justify-center text-xl font-bold text-white shadow-lg`}>
               {persona.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">{persona.name}</h3>
              <p className="text-xs text-slate-400">{persona.role} • {persona.style}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs hidden md:block">
             <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1">
               <span>Interest Level</span>
               <span className={interestScore > 50 ? 'text-emerald-400' : 'text-amber-400'}>{interestScore}%</span>
             </div>
             <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${getGaugeColor(interestScore)}`}
                  style={{ width: `${interestScore}%` }}
                />
             </div>
          </div>

          <button onClick={onExit} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Mobile Gauge */}
        <div className="md:hidden mt-4">
           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ease-out ${getGaugeColor(interestScore)}`}
                style={{ width: `${interestScore}%` }}
              />
           </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col max-w-[90%] md:max-w-[70%]">
                  <div
                    className={`p-5 md:p-6 rounded-3xl text-sm md:text-base leading-relaxed shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* Interest Indicator for Bot Messages */}
                  {msg.role === 'model' && msg.interestChange !== undefined && (
                    <span className={`text-xs mt-2 ml-2 font-mono font-bold flex items-center gap-1 ${msg.interestChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {msg.interestChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {msg.interestChange > 0 ? '+' : ''}{msg.interestChange}% Interest
                    </span>
                  )}
              </div>
            </div>
          ))}
          
          {loading && (
             <div className="flex justify-start">
               <div className="bg-slate-900 border border-slate-800 rounded-3xl rounded-bl-sm px-6 py-4 text-sm text-slate-400 flex items-center gap-2">
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150" />
               </div>
             </div>
          )}
          
          {/* Dealbreaker Alert */}
          {isDealbreaker && (
            <div className="my-8 bg-red-950/30 border border-red-500/50 p-6 rounded-2xl flex items-center gap-4 text-red-200 animate-in fade-in zoom-in duration-300 mx-auto max-w-lg">
              <AlertCircle className="w-10 h-10 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-lg">Pitch Terminated</p>
                <p className="opacity-80">The investor has ended the meeting. View your report to see what went wrong.</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-950 border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          {isDealbreaker ? (
            <button 
              onClick={() => onFinish(messages, interestScore)}
              className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
            >
              View Performance Report
            </button>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response..."
                className="flex-1 bg-slate-900 text-white border-slate-800 rounded-xl px-6 py-4 focus:ring-2 focus:ring-violet-500 outline-none placeholder:text-slate-600 text-base shadow-inner"
                disabled={loading}
                autoFocus
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-violet-600 text-white p-4 rounded-xl hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-lg shadow-violet-900/20"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          )}
          
          {!isDealbreaker && messages.length > 2 && (
              <div className="text-center mt-3">
                <button 
                    onClick={() => onFinish(messages, interestScore)}
                    className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                    End Meeting Early & Get Report
                </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
