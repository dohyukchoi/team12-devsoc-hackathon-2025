
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    isRelevant: {
      type: Type.BOOLEAN,
      description: "True if the text appears to be a privacy policy, terms of service, or other legal user agreement. False otherwise.",
    },
    relevanceReason: {
        type: Type.STRING,
        description: "A brief, one-sentence explanation of why the text is or is not considered a relevant legal document."
    },
    issues: {
      type: Type.ARRAY,
      description: "An array of potential issues found in the text. If the text is not relevant or no issues are found, this should be an empty array.",
      items: {
        type: Type.OBJECT,
        properties: {
          issueType: {
            type: Type.STRING,
            description: "A short category for the issue (e.g., 'Data Sharing', 'Vague Language', 'User Rights Limitation').",
          },
          summary: {
            type: Type.STRING,
            description: "A concise, one-sentence summary explaining the potential issue and its implication for the user.",
          },
          quote: {
            type: Type.STRING,
            description: "The exact quote from the text that demonstrates the issue.",
          },
          severity: {
            type: Type.STRING,
            description: "The potential severity of the issue for a typical user. Can be 'High', 'Medium', or 'Low'.",
          },
        },
        required: ["issueType", "summary", "quote", "severity"],
      },
    },
  },
  required: ["isRelevant", "relevanceReason", "issues"],
};


export const analyzePolicyText = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please analyze the following text. First, determine if it is a Privacy Policy, Terms of Service (TOS), or a similar legal document. If it is, identify and flag any clauses that could be problematic, unclear, or disadvantageous for a user. Focus on data collection, third-party sharing, user rights, liability limitations, and ambiguous language. \n\nTEXT TO ANALYZE:\n"""\n${text}\n"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("The API returned an empty response. The content may have been blocked.");
    }
    
    const parsedResult = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object matches our expected structure
    if (typeof parsedResult.isRelevant !== 'boolean' || !Array.isArray(parsedResult.issues)) {
        throw new Error("API returned a malformed JSON response.");
    }

    return parsedResult as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("Failed to get a valid analysis from the AI. Please try again.");
    }
    throw new Error("Could not analyze the text. Please check your connection or API key.");
  }
};
