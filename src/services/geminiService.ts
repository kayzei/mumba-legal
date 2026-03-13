import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async parseFAQCommand(input: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following user request into a structured FAQ article. 
      The user is a law firm staff member trying to add a new FAQ.
      
      Input: "${input}"
      
      Rules:
      1. Extract the question and answer clearly.
      2. Categorize it into one of: "General", "Corporate Law", "Dispute Resolution", "Real Estate", "Intellectual Property", "Family Law", "Portal Help".
      3. Extract relevant tags as an array of strings.
      4. If the input is missing information, use your best judgment to fill it in based on the context of a law firm (Mumba & Partners).
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              enum: ["General", "Corporate Law", "Dispute Resolution", "Real Estate", "Intellectual Property", "Family Law", "Portal Help"]
            },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["question", "answer", "category", "tags"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse Gemini response", e);
      throw new Error("Could not understand the command. Please be more specific.");
    }
  }
};
