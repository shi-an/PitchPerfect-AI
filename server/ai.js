import { GoogleGenAI } from "@google/genai";

const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const deepseekKey = process.env.DEEPSEEK_API_KEY || '';

const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

// Helper to extract JSON from potentially messy output
function extractJson(input) {
  if (!input) return null;
  
  // Try to find markdown code block first
  const blockMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(input);
  if (blockMatch && blockMatch[1]) {
    try {
      // Clean up any trailing/leading whitespace or non-JSON chars in the block
      const cleaned = blockMatch[1].trim();
      return cleaned;
    } catch (e) {
      // Continue to other methods
    }
  }

  // Try to find the first '{' and the last '}'
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  
  if (start !== -1 && end !== -1 && end > start) {
    return input.slice(start, end + 1);
  }
  
  // If no brackets found, it might be just the text (though unlikely for valid JSON)
  return input;
}

function normalizeResponse(obj) {
  if (!obj) return null;
  
  const response = typeof obj.response === "string" ? obj.response : "请具体说明你的要点、数据或假设。";
  let change = typeof obj.interest_change === "number" ? obj.interest_change : parseInt(obj.interest_change || "0", 10);
  
  if (isNaN(change)) change = 0;
  if (change > 15) change = 15;
  if (change < -15) change = -15;
  
  const deal = !!obj.is_dealbreaker;
  
  return { response, interest_change: change, is_dealbreaker: deal };
}

export const generatePitchResponse = async (provider, history, persona, startup) => {
  // Construct the system prompt
  let systemPrompt = '';
  
  if (persona.id === 'mentor') {
      systemPrompt = `
        Role: You are ${persona.name}, a helpful Startup Mentor.
        Personality: Patient, educational, encouraging.
        Speaking Style: Clear, explanatory, friendly.
        
        Context: You are guiding a novice founder through their startup pitch for "${startup.name}".
        Startup Description: "${startup.description}"
        
        Goal: Teach the founder how to pitch. If they use vague terms, explain why precision matters. If they miss key business concepts (like CAC, LTV, TAM), explain what these are and ask for them gently. Do not be harsh.
        
        Rules:
        1. Keep answers moderate length (2-3 sentences).
        2. EXPLAIN any technical term you use (e.g., "What is your TAM? Total Addressable Market means...").
        3. Adjust "interest_change" based on their learning progress (-10 to +10).
        4. Always be encouraging but firm on logic.
        5. NEVER acknowledge that you are an AI.
        6. If the input is in Chinese, REPLY IN CHINESE.
        
        Output Format: JSON ONLY.
        Schema:
        {
          "response": "Your verbal response to the founder (in Chinese)",
          "interest_change": integer,
          "is_dealbreaker": boolean
        }
      `;
  } else {
        systemPrompt = `
        Role: You are ${persona.name}, a ${persona.role}.
        Personality: ${persona.description}
        Speaking Style: ${persona.style}
        
        Context: You are listening to a startup pitch for "${startup.name}".
        Startup Description: "${startup.description}"
        
        Goal: Act as a realistic, ruthless, and critical investor. Do NOT be polite. Do NOT give validation. Your time is expensive.
        
        Rules:
        1. Keep answers short (1-2 sentences). Be direct and sharp.
        2. If the user's answer is vague, generic, or lacks data, ATTACK IT immediately. Ask for numbers (CAC, LTV, TAM, MoM growth).
        3. If the logic is flawed, point it out mercilessly.
        4. Adjust "interest_change" based on the answer quality (-20 to +15). Drop interest fast if they waste your time.
        5. NEVER acknowledge that you are an AI. NEVER talk about "understanding Chinese input". Just reply as the persona.
        6. If the input is in Chinese, REPLY IN CHINESE.
        7. If the user is a student, offer slightly more guidance but still be critical. If they are a seasoned founder, be ruthless.
        
        Output Format: JSON ONLY. No markdown, no "Here is the JSON", no thinking process.
        Schema:
        {
          "response": "Your verbal response to the founder (in Chinese)",
          "interest_change": integer,
          "is_dealbreaker": boolean
        }
      `;
    }

  // Prepare messages based on history
  // history is expected to be an array of { role: 'user'|'model', text: string }
  // We need to convert it to the provider's format
  
  if (provider === 'deepseek' && deepseekKey) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add history
    // DeepSeek expects 'user' and 'assistant' roles
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      });
    });

    try {
      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`DeepSeek API error (${resp.status}):`, errorText);
        throw new Error(`DeepSeek API error: ${resp.status} - ${errorText}`);
      }
      
      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const jsonText = extractJson(raw);
      
      try {
        const parsed = JSON.parse(jsonText);
        return normalizeResponse(parsed);
      } catch (e) {
        console.error("DeepSeek JSON parse error:", e, "Raw:", raw);
        // Fallback: try to use the raw text as response if it looks like text
        return { 
          response: raw.replace(/```json|```/g, '').trim() || "请继续说明你的项目细节。", 
          interest_change: 0, 
          is_dealbreaker: false 
        };
      }
    } catch (e) {
      console.error("DeepSeek API error:", e);
      throw new Error("DeepSeek API failed");
    }
  } else if (ai) {
    // Gemini Implementation
    // Gemini uses a different history format
    // history: [{ role: 'user', parts: [{ text: ... }] }, { role: 'model', parts: ... }]
    
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
      const model = ai.getGenerativeModel({ 
        model: "gemini-2.0-flash", // Updated to 2.0 Flash as per recent updates or stick to 1.5/2.5
        systemInstruction: systemPrompt,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    response: { type: "STRING" },
                    interest_change: { type: "INTEGER" },
                    is_dealbreaker: { type: "BOOLEAN" }
                },
                required: ["response", "interest_change", "is_dealbreaker"]
            }
        }
      });

      const chat = model.startChat({
        history: geminiHistory
      });
      
      // The last message in 'history' from the frontend is actually the *new* message we want to send?
      // No, usually 'history' contains the *past*. The new message comes separately.
      // But let's assume the caller separates them.
      // Wait, standard practice: chat(history + newMessage).
      // I'll assume the caller passes the *new* message separately.
      
      throw new Error("Use generatePitchResponseWithMessage signature");
    } catch (e) {
       // handled by caller or specific logic
    }
  }
  
  return { response: "配置错误：未找到可用的 AI 模型。", interest_change: 0, is_dealbreaker: false };
};

export const processPitchMessage = async (provider, history, newMessage, persona, startup) => {
    // Re-using logic but structuring for "history + new message"
    let systemPrompt = '';
    
    if (persona.id === 'mentor') {
        systemPrompt = `
        Role: You are ${persona.name}, a helpful Startup Mentor.
        Personality: Patient, educational, encouraging.
        Speaking Style: Clear, explanatory, friendly.
        
        Context: You are guiding a novice founder through their startup pitch for "${startup.name}".
        Startup Description: "${startup.description}"
        
        Goal: Teach the founder how to pitch. If they use vague terms, explain why precision matters. If they miss key business concepts (like CAC, LTV, TAM), explain what these are and ask for them gently. Do not be harsh.
        
        Rules:
        1. Keep answers moderate length (2-3 sentences).
        2. EXPLAIN any technical term you use (e.g., "What is your TAM? Total Addressable Market means...").
        3. Adjust "interest_change" based on their learning progress (-10 to +10).
        4. Always be encouraging but firm on logic.
        5. NEVER acknowledge that you are an AI.
        6. If the input is in Chinese, REPLY IN CHINESE.
        
        Output Format: JSON ONLY.
        {
          "response": "Your verbal response to the founder (in Chinese)",
          "interest_change": integer,
          "is_dealbreaker": boolean
        }
      `;
    } else {
        systemPrompt = `
        Role: You are ${persona.name}, a ${persona.role}.
        Personality: ${persona.description}
        Speaking Style: ${persona.style}
        
        Context: You are listening to a startup pitch for "${startup.name}".
        Startup Description: "${startup.description}"
        
        Goal: Act as a realistic, ruthless, and critical investor. Do NOT be polite. Do NOT give validation. Your time is expensive.
        
        Rules:
        1. Keep answers short (1-2 sentences). Be direct and sharp.
        2. If the user's answer is vague, generic, or lacks data, ATTACK IT immediately. Ask for numbers (CAC, LTV, TAM, MoM growth).
        3. If the logic is flawed, point it out mercilessly.
        4. Adjust "interest_change" based on the answer quality (-20 to +15). Drop interest fast if they waste your time.
        5. NEVER acknowledge that you are an AI. NEVER talk about "understanding Chinese input". Just reply as the persona.
        6. If the input is in Chinese, REPLY IN CHINESE.
        7. If the user is a student, offer slightly more guidance but still be critical. If they are a seasoned founder, be ruthless.
        
        Output Format: JSON ONLY.
        {
          "response": "Your verbal response to the founder (in Chinese)",
          "interest_change": integer,
          "is_dealbreaker": boolean
        }
      `;
    }

  if (provider === 'deepseek' && deepseekKey) {
     const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      });
    });
    
    messages.push({ role: 'user', content: newMessage });

    try {
      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`DeepSeek API error (${resp.status}):`, errorText);
        throw new Error(`DeepSeek API error: ${resp.status} - ${errorText}`);
      }
      
      const data = await resp.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const jsonText = extractJson(raw);
      
      try {
        const parsed = JSON.parse(jsonText);
        return normalizeResponse(parsed);
      } catch (e) {
        return { 
          response: raw.replace(/```json|```/g, '').trim() || "请继续说明你的项目细节。", 
          interest_change: 0, 
          is_dealbreaker: false 
        };
      }
    } catch (e) {
      console.error("DeepSeek Call Failed:", e);
      return { response: `API 调用失败: ${e.message}`, interest_change: 0, is_dealbreaker: false };
    }
  } else if (ai) {
    // Gemini
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    try {
        // Use gemini-2.0-flash-exp or gemini-1.5-flash
        const model = ai.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp", 
            systemInstruction: systemPrompt,
             generationConfig: {
                responseMimeType: "application/json"
            }
        });
        
        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(newMessage);
        const raw = result.response.text();
        const jsonText = extractJson(raw);
        try {
            const parsed = JSON.parse(jsonText);
            return normalizeResponse(parsed);
        } catch {
             return { 
                response: raw.replace(/```json|```/g, '').trim() || "请继续说明你的项目细节。", 
                interest_change: 0, 
                is_dealbreaker: false 
            };
        }
    } catch (e) {
        console.error(e);
        // Fallback to older model if 2.0 fails?
         return { response: "AI 服务异常，请重试。", interest_change: 0, is_dealbreaker: false };
    }
  }
  
  return { response: "未配置 AI 模型。", interest_change: 0, is_dealbreaker: false };
}

export const generateReport = async (provider, history, finalScore) => {
    // Similar logic for report generation
    // ...
     const systemPrompt = `
      You are a pitch deck analyst.
      Analyze the following pitch conversation history.
      Final Score: ${finalScore}/100.
      
      Task: Generate a feedback report in JSON format.
      Language: All text fields MUST be in Chinese.
      
      Schema:
      {
        "score": number,
        "feedback": "Overall feedback summary",
        "funding_decision": "Funded" | "Passed" | "Ghosted",
        "strengths": ["point 1", "point 2"],
        "weaknesses": ["point 1", "point 2"]
      }
    `;
    
    const conversationText = history.map(h => `${h.role}: ${h.text}`).join('\n');
    
    if (provider === 'deepseek' && deepseekKey) {
        try {
            const resp = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${deepseekKey}` },
                body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: conversationText }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
                })
            });

            if (!resp.ok) {
                const errorText = await resp.text();
                console.error(`DeepSeek Report API error (${resp.status}):`, errorText);
                return null;
            }

            const data = await resp.json();
             const raw = data?.choices?.[0]?.message?.content || '';
             const jsonText = extractJson(raw);
             return JSON.parse(jsonText);
        } catch (e) {
            return null;
        }
    } else if (ai) {
        try {
             const model = ai.getGenerativeModel({ 
                model: "gemini-2.0-flash-exp", 
                systemInstruction: systemPrompt,
                 generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(conversationText);
            return JSON.parse(result.response.text());
        } catch (e) {
            return null;
        }
    }
    return null;
}
