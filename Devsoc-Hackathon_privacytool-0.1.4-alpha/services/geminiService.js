import { GoogleGenAI, Type } from "https://aistudiocdn.com/@google/genai@^1.21.0";

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

export const analyzePolicyText = async (text, apiKey) => {
  if (!apiKey) {
    throw new Error("Gemini API key is required for analysis.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

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
      throw new Error("The API returned an empty response. The content may have been blocked or the API key may be invalid.");
    }
    
    const parsedResult = JSON.parse(jsonText);

    if (typeof parsedResult.isRelevant !== 'boolean' || !Array.isArray(parsedResult.issues)) {
        throw new Error("API returned a malformed JSON response.");
    }

    return parsedResult;

  } catch (error) {
    console.error("Error during analysis:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("The provided Gemini API key is not valid. Please check the key and try again.");
        }
        throw error;
    }
    throw new Error("An unknown error occurred during the analysis process.");
  }
};