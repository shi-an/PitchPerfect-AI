import { GoogleGenAI, Type } from "@google/genai";
import { Persona, StartupDetails, PitchResponse, PitchReport } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Cache the chat history for the session
let currentChatSession: any = null;

export const startPitchSession = async (persona: Persona, startup: StartupDetails): Promise<string> => {
  const systemPrompt = `
    You are ${persona.name}, a ${persona.role}.
    Your Personality: ${persona.description}.
    Your Speaking Style: ${persona.style}.
    
    You are listening to a pitch for a startup called "${startup.name}".
    Description: "${startup.description}".

    Your Goal: Act as a realistic, critical investor. Grill the founder. Ask tough questions about market size, competition, and revenue.
    
    RULES:
    1. Be concise. 1-2 sentences max per turn.
    2. Do NOT be polite if the user is vague. Be direct.
    3. You have an "Interest Meter". Adjust it based on the quality of the answer.
    4. If the user talks nonsense, lower interest drastically.
    
    IMPORTANT: You must output your response in JSON format.
  `;

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

  // Initial greeting (we simulate this as a "generated" message to kickstart context, 
  // but strictly we can just return a hardcoded opening based on persona to save a call, 
  // or call the model. Let's call the model for immersion.)
  
  try {
    const result = await currentChatSession.sendMessage({ message: "The founder has entered the room. Start the meeting." });
    const data = JSON.parse(result.text) as PitchResponse;
    return data.response;
  } catch (e) {
    console.error(e);
    return "Let's hear what you've got.";
  }
};

export const sendPitchMessage = async (message: string): Promise<PitchResponse> => {
  if (!currentChatSession) throw new Error("Session not started");
  
  try {
    const result = await currentChatSession.sendMessage({ message });
    return JSON.parse(result.text) as PitchResponse;
  } catch (error) {
    console.error("Pitch Error:", error);
    return {
      response: "I didn't quite catch that. Can you repeat?",
      interest_change: 0,
      is_dealbreaker: false
    };
  }
};

export const generateAnalysisReport = async (history: string[], finalScore: number): Promise<PitchReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze this pitch transcript and generate a funding decision report.
        Final Interest Score: ${finalScore}/100.
        Transcript Summary: ${history.join('\n')}
        
        Return JSON.
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
  } catch (e) {
    console.error(e);
    return {
        score: finalScore,
        feedback: "Analysis failed, but good effort.",
        funding_decision: "Passed",
        strengths: ["Persistence"],
        weaknesses: ["Tech issues"]
    }
  }
};
