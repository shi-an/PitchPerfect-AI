import { GoogleGenAI, Type } from "@google/genai";
import { Persona, StartupDetails, PitchResponse, PitchReport } from "../types";

function getProvider(): string {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('model_provider') : null;
    return (stored || process.env.MODEL_PROVIDER || 'deepseek').toLowerCase();
  } catch {
    return (process.env.MODEL_PROVIDER || 'deepseek').toLowerCase();
  }
}

const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const deepseekKey = process.env.DEEPSEEK_API_KEY || '';
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null as any;

// Cache the chat history for the session
let currentChatSession: any = null;
let deepseekMessages: Array<{ role: string; content: string }> = [];

export const startPitchSession = async (persona: Persona, startup: StartupDetails): Promise<string> => {
  const provider = getProvider();
  const systemPrompt = `
    你是 ${persona.name}，身份是 ${persona.role}。
    个性：${persona.description}。
    说话风格：${persona.style}。
    你正在聆听名为 "${startup.name}" 的创业项目路演，简介为 "${startup.description}"。
    目标：作为真实且严苛的投资人，提出尖锐问题，询问市场规模、竞争与收入。
    规则：
    1. 每轮用 1–2 句简短回答。
    2. 用户表达含糊时直接指出问题。
    3. 根据回答质量调整“兴趣分”。
    4. 荒谬回答需大幅降低兴趣。
    仅输出 JSON，且严格符合给定 schema，不得包含代码块或任何额外说明。
    输入可能为中文或英文，需完全理解；回复必须使用中文。
  `;

  if (provider === 'deepseek' && deepseekKey) {
    deepseekMessages = [
      { role: 'system', content: `${systemPrompt}\n请严格仅返回 JSON：{"response": "...", "interest_change": 0, "is_dealbreaker": false}` },
      { role: 'user', content: '创始人已进入会议室，请开始会议。' }
    ];
    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: deepseekMessages,
          temperature: 0.7
        })
      });
      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const jsonText = extractJson(raw);
      try {
        const parsed = JSON.parse(jsonText) as PitchResponse;
        return parsed.response;
      } catch {
        return jsonText || "开始吧，说说你们的项目。";
      }
    } catch {
      return "开始吧，说说你们的项目。";
    }
  } else if (ai) {
    currentChatSession = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING, description: "Your verbal response to the founder." },
            interest_change: { type: Type.INTEGER, description: "Integer between -15 and 15. How much your interest changed based on the last answer." },
            is_dealbreaker: { type: Type.BOOLEAN, description: "True if the founder just said something disqualifying." }
          },
          required: ["response", "interest_change", "is_dealbreaker"]
        }
      }
    });

    try {
      const result = await currentChatSession.sendMessage({ message: "创始人已进入会议室，请开始会议。" });
      const raw = result.text || "";
      const jsonText = extractJson(raw);
      const data = JSON.parse(jsonText) as PitchResponse;
      return data.response;
    } catch {
      return "开始吧，说说你们的项目。";
    }
  } else {
    return "开始吧，说说你们的项目。";
  }
};

function extractJson(input: string): string {
  const block = /```json([\s\S]*?)```/i.exec(input);
  if (block && block[1]) return block[1].trim();
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return input.slice(start, end + 1);
  }
  return input;
}

function normalizeResponse(obj: any): PitchResponse {
  const response = typeof obj.response === "string" ? obj.response : "请具体说明你的要点、数据或假设。";
  let change = typeof obj.interest_change === "number" ? obj.interest_change : parseInt(obj.interest_change || "0", 10);
  if (isNaN(change)) change = 0;
  if (change > 15) change = 15;
  if (change < -15) change = -15;
  const deal = !!obj.is_dealbreaker;
  return { response, interest_change: change, is_dealbreaker: deal };
}

export const sendPitchMessage = async (message: string): Promise<PitchResponse> => {
  const provider = getProvider();
  if (provider === 'deepseek' && deepseekKey) {
    deepseekMessages.push({ role: 'user', content: message });
    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: deepseekMessages,
          temperature: 0.7
        })
      });
      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const jsonText = extractJson(raw);
      try {
        const parsed = JSON.parse(jsonText);
        const normalized = normalizeResponse(parsed);
        deepseekMessages.push({ role: 'assistant', content: normalized.response });
        return normalized;
      } catch {
        const cleaned = jsonText.replace(/```json|```/gi, '').trim();
        const fallbackText = cleaned || "好的，请继续具体说明你的商业要点或关键数据。";
        deepseekMessages.push({ role: 'assistant', content: fallbackText });
        return { response: fallbackText, interest_change: 0, is_dealbreaker: false };
      }
    } catch {
      return { response: "网络或解析异常，请继续阐述你的要点。", interest_change: 0, is_dealbreaker: false };
    }
  }
  
  if (!currentChatSession) throw new Error("Session not started");
  
  try {
    const result = await currentChatSession.sendMessage({ message });
    const raw = result.text || "";
    const jsonText = extractJson(raw);
    try {
      const parsed = JSON.parse(jsonText);
      return normalizeResponse(parsed);
    } catch {
      const cleaned = jsonText
        .replace(/```json|```/gi, '')
        .trim();
      const fallbackText = cleaned || "好的，请继续具体说明你的商业要点或关键数据。";
      return { response: fallbackText, interest_change: 0, is_dealbreaker: false };
    }
  } catch {
    return { response: "网络或解析异常，请继续阐述你的要点。", interest_change: 0, is_dealbreaker: false };
  }
};

export const generateAnalysisReport = async (history: string[], finalScore: number): Promise<PitchReport> => {
  const provider = getProvider();
  if (provider === 'deepseek' && deepseekKey) {
    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是路演分析助手。仅输出严格 JSON。' },
            { role: 'user', content: `请根据以下路演对话生成中文反馈报告并返回 JSON：\n最终兴趣分：${finalScore}/100。\n对话摘要：\n${history.join('\n')}\nJSON 格式：{"score": number, "feedback": string, "funding_decision": "Funded"|"Passed"|"Ghosted", "strengths": string[], "weaknesses": string[]}` }
          ],
          temperature: 0.3
        })
      });
      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const jsonText = extractJson(raw);
      try {
        return JSON.parse(jsonText) as PitchReport;
      } catch {
        return {
          score: finalScore,
          feedback: "报告生成失败，但路演已完成。",
          funding_decision: "Passed",
          strengths: ["沟通清晰"],
          weaknesses: ["数据支撑不足"]
        };
      }
    } catch {
      return {
        score: finalScore,
        feedback: "报告生成失败，但路演已完成。",
        funding_decision: "Passed",
        strengths: ["沟通清晰"],
        weaknesses: ["数据支撑不足"]
      };
    }
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze this pitch transcript and generate a funding decision report.
        Final Interest Score: ${finalScore}/100.
        Transcript Summary: ${history.join('\n')}
        
        Return JSON.
        All textual fields (feedback, strengths, weaknesses) must be in Chinese.
        Keep funding_decision as one of "Funded", "Passed", "Ghosted".
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            funding_decision: { type: Type.STRING, enum: ["Funded", "Passed", "Ghosted"] },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
 
    return JSON.parse(response.text) as PitchReport;
  } catch {
    return {
        score: finalScore,
        feedback: "Analysis failed, but good effort.",
        funding_decision: "Passed",
        strengths: ["Persistence"],
        weaknesses: ["Tech issues"]
    }
  }
};
