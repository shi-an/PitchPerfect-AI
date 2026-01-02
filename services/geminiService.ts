import { Persona, StartupDetails, PitchResponse, PitchReport } from "../types";

// Helper to get headers with Auth token
const getHeaders = () => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper to get provider
export const getModelProvider = () => {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('model_provider') : null;
    return (stored || 'deepseek').toLowerCase();
  } catch {
    return 'deepseek';
  }
};

// Local state to track conversation history and context for the current session
let conversationHistory: Array<{ role: 'user' | 'model'; text: string }> = [];
let currentContext: { persona: Persona | null; startup: StartupDetails | null } = {
  persona: null,
  startup: null
};

export const startPitchSession = async (persona: Persona, startup: StartupDetails): Promise<string> => {
  const provider = getModelProvider();
  
  // Save context
  currentContext = { persona, startup };
  
  // Reset history
  conversationHistory = [
    { role: 'user', text: '创始人已进入会议室，请开始会议。' }
  ];

  try {
    const response = await fetch('/api/ai/start', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ persona, startup, provider })
    });

    if (!response.ok) {
      throw new Error('Failed to start session');
    }

    const data = await response.json();
    
    // Add AI response to history
    if (data.response) {
      conversationHistory.push({ role: 'model', text: data.response });
      return data.response;
    }
    
    return "开始吧，说说你们的项目。";
  } catch (error) {
    console.error("Start Session Error:", error);
    return "开始吧，说说你们的项目。";
  }
};

export const sendPitchMessage = async (
    message: string, 
    context?: { persona: Persona; startup: StartupDetails },
    history?: Array<{ role: 'user' | 'model'; text: string }>
): Promise<PitchResponse> => {
  const provider = getModelProvider();
  
  // Use provided context or fallback to local state
  const activePersona = context?.persona || currentContext.persona;
  const activeStartup = context?.startup || currentContext.startup;
  const activeHistory = history || conversationHistory;
  
  if (!activePersona || !activeStartup) {
     return { response: "会话已失效，请刷新重试。", interest_change: 0, is_dealbreaker: false };
  }

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        message, 
        history: activeHistory,
        persona: activePersona,
        startup: activeStartup,
        provider 
      })
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const data = await response.json();
    
    // Update local history if we are using it (though PitchArena manages its own state now)
    if (!history) {
        conversationHistory.push({ role: 'user', text: message });
        conversationHistory.push({ role: 'model', text: data.response });
    }
    
    return data;
  } catch (error) {
    console.error("Send Message Error:", error);
    return { response: "网络异常，请重试。", interest_change: 0, is_dealbreaker: false };
  }
};

export const generateAnalysisReport = async (historyStrings: string[], finalScore: number): Promise<PitchReport> => {
  const provider = getModelProvider();
  
  // We use the internal structured conversationHistory for better quality
  // historyStrings is ignored in favor of the structured data we have
  
  try {
    const response = await fetch('/api/ai/report', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        history: conversationHistory, 
        score: finalScore, 
        provider 
      })
    });

    if (!response.ok) throw new Error('Report generation failed');
    
    return await response.json();
  } catch (error) {
     return {
        score: finalScore,
        feedback: "报告生成失败，但路演已完成。",
        funding_decision: "Passed",
        strengths: ["沟通清晰"],
        weaknesses: ["数据支撑不足"]
      };
  }
};
