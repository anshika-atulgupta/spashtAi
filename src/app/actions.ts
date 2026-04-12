'use server';

import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// NOTE: We intentionally do NOT import firebase-admin here to keep this action
// lightweight. Profile saving uses localStorage on the client side.
// ---------------------------------------------------------------------------

export async function saveUserProfile(_userId: string, _data: unknown) {
  // Placeholder — real persistence can be added later
  return { success: true };
}

export async function analyzePolicy(
  _userId: string,
  fileDataPart: { inlineData: { data: string; mimeType: string } },
  userProfile: unknown
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.'
      );
    }

    // Always use application/pdf so Gemini can parse the document
    const safeMimeType =
      fileDataPart.inlineData.mimeType === 'application/pdf'
        ? 'application/pdf'
        : fileDataPart.inlineData.mimeType;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert insurance analyst. Carefully read the attached insurance policy document and analyze it against the user profile below.

Return ONLY a single valid JSON object with exactly these keys:
{
  "score": <integer 0-100 representing overall policy quality for this user>,
  "coverage": [<array of strings — what IS covered>],
  "exclusions": [<array of strings — what is NOT covered>],
  "personalizedRisks": [<array of strings — specific risks for this user based on their profile>]
}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Do NOT wrap the JSON in markdown. Do NOT add any explanation. Just the raw JSON object.`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: fileDataPart.inlineData.data,
              mimeType: safeMimeType,
            },
          },
          { text: prompt },
        ],
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
        console.warn('Gemini 2.5 Flash unavailable (503), falling back to Gemini 2.0 Flash');
        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents,
        });
      } else {
        throw err;
      }
    }

    let raw = (response.text ?? '').trim();

    // Strip any accidental markdown code fences
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Extract the outermost JSON object if there's surrounding text
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      raw = raw.substring(start, end + 1);
    }

    const result = JSON.parse(raw);
    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[analyzePolicy] Error:', message);
    return { success: false, error: message };
  }
}

export async function saveAnalysis(
  _userId: string,
  _policyId: string,
  _result: unknown
) {
  return { success: true };
}

export async function simulateScenario(scenario: string, userProfile: unknown) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert insurance and financial analyst. The user has described the following scenario: "${scenario}". 
Based on their profile and a typical standard comprehensive health/general insurance policy in India, estimate the financial impact.

Return a JSON object EXACTLY matching this schema with NO markdown wrapping:
{
  "totalCost": <integer, total estimated cost in INR>,
  "insurancePays": <integer, amount covered by standard insurance>,
  "userPays": <integer, amount the user pays out of pocket>,
  "timeEstimate": <string, e.g., "7-10 working days">,
  "steps": [
    { "title": <string>, "description": <string> }
  ]
}

User Profile:
${JSON.stringify(userProfile, null, 2)}
`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });
    } catch (err: any) {
      if (err.status === 503 || err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
        console.warn('Gemini 2.5 Flash unavailable, falling back to 2.0');
        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents,
        });
      } else {
        throw err;
      }
    }

    let raw = (response.text ?? '').trim();
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      raw = raw.substring(start, end + 1);
    }

    const result = JSON.parse(raw);
    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[simulateScenario] Error:', message);
    return { success: false, error: message };
  }
}
