'use server';

import { GoogleGenAI } from '@google/genai';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function saveUserProfile(_userId: string, _data: unknown) {
  return { success: true };
}

export async function analyzePolicy(
  userId: string,
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

    const safeMimeType =
      fileDataPart.inlineData.mimeType === 'application/pdf'
        ? 'application/pdf'
        : fileDataPart.inlineData.mimeType;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert insurance analyst. Carefully read the attached insurance policy document and analyze it against the user profile below.

Return ONLY a single valid JSON object with exactly these keys:
{
  "policyName": "<inferred name/type of this policy, e.g. Star Health Individual Optima>",
  "score": <integer 0-100 representing overall policy quality for this user>,
  "scoreBreakdown": {
    "coverage": <integer 0-100, how comprehensive the coverage is>,
    "exclusions": <integer 0-100, the fewer exclusions the higher the score>,
    "userFit": <integer 0-100, how well this policy fits the user's profile>,
    "affordability": <integer 0-100, value for money based on typical premiums>,
    "claimEase": <integer 0-100, how easy claims appear to be from the document>
  },
  "scoreReason": "<2-3 sentence plain-language explanation of why this score was given>",
  "improvements": [<array of 3-5 actionable strings - what the user can do to get better coverage or a higher score>],
  "coverage": [<array of strings — what IS covered, be specific>],
  "exclusions": [<array of strings — what is NOT covered, be specific>],
  "personalizedRisks": [<array of strings — specific risks for this user based on their profile>],
  "keyFacts": {
    "sumInsured": "<e.g. ₹5 Lakhs or Not Specified>",
    "policyType": "<e.g. Individual / Family Floater>",
    "networkHospitals": "<e.g. 5000+ or Not Specified>",
    "waitingPeriod": "<e.g. 2 years for pre-existing or Not Specified>",
    "renewability": "<e.g. Lifelong or Not Specified>"
  }
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
      if (err.status === 503 || err.status === 429 || err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('UNAVAILABLE') || err.message?.includes('quota')) {
        console.warn('Gemini 2.5 Flash unavailable or rate limited, falling back to Gemini 2.0 Flash Lite');
        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-lite',
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

    // Save analysis to Firestore under users/{userId}/policyAnalyses
    if (userId && userId !== 'user_demo') {
      try {
        const analysisRef = adminDb
          .collection('users')
          .doc(userId)
          .collection('policyAnalyses')
          .doc();

        await analysisRef.set({
          id: analysisRef.id,
          policyName: result.policyName ?? 'Unnamed Policy',
          score: result.score ?? 0,
          scoreBreakdown: result.scoreBreakdown ?? {},
          scoreReason: result.scoreReason ?? '',
          improvements: result.improvements ?? [],
          coverage: result.coverage ?? [],
          exclusions: result.exclusions ?? [],
          personalizedRisks: result.personalizedRisks ?? [],
          keyFacts: result.keyFacts ?? {},
          uploadedAt: FieldValue.serverTimestamp(),
        });
      } catch (dbErr) {
        console.error('[analyzePolicy] Firestore save error:', dbErr);
        // Don't fail the whole analysis if save fails
      }
    }

    return { success: true, data: result };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[analyzePolicy] Error:', message);
    return { success: false, error: message };
  }
}

export async function getUserPolicyAnalyses(userId: string) {
  try {
    const snapshot = await adminDb
      .collection('users')
      .doc(userId)
      .collection('policyAnalyses')
      .orderBy('uploadedAt', 'desc')
      .limit(10)
      .get();

    const analyses = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        policyName: data.policyName ?? 'Unnamed Policy',
        score: data.score ?? 0,
        scoreBreakdown: data.scoreBreakdown ?? {},
        scoreReason: data.scoreReason ?? '',
        improvements: data.improvements ?? [],
        coverage: data.coverage ?? [],
        exclusions: data.exclusions ?? [],
        personalizedRisks: data.personalizedRisks ?? [],
        keyFacts: data.keyFacts ?? {},
        uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });

    return { success: true, data: analyses };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[getUserPolicyAnalyses] Error:', message);
    return { success: false, error: message, data: [] };
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
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');
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
      response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents });
    } catch (err: any) {
      if (err.status === 503 || err.status === 429 || err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('UNAVAILABLE') || err.message?.includes('quota')) {
        response = await ai.models.generateContent({ model: 'gemini-2.0-flash-lite', contents });
      } else throw err;
    }

    let raw = (response.text ?? '').trim();
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) raw = raw.substring(start, end + 1);
    return { success: true, data: JSON.parse(raw) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[simulateScenario] Error:', message);
    return { success: false, error: message };
  }
}

export async function comparePolicies(
  fileA: { inlineData: { data: string; mimeType: string } },
  fileB: { inlineData: { data: string; mimeType: string } },
  userProfile: unknown
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a world-class insurance analyst. You are given two insurance policy documents: Policy A and Policy B. 
Analyze both documents in detail and compare them against the user profile provided.

Return ONLY a single raw JSON object (no markdown) with exactly this structure:
{
  "policyA": {
    "name": "<inferred name of Policy A>",
    "score": <integer 0-100>,
    "categories": {
      "hospitalization": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "accidents": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "medicines": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "dental": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "exclusions": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" }
    }
  },
  "policyB": {
    "name": "<inferred name of Policy B>",
    "score": <integer 0-100>,
    "categories": {
      "hospitalization": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "accidents": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "medicines": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "dental": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" },
      "exclusions": { "rating": <"good"|"partial"|"weak">, "detail": "<1 sentence>" }
    }
  },
  "winner": <"A" | "B" | "tie">,
  "recommendation": "<2-3 sentence detailed recommendation of which policy is better and why, in simple language>",
  "insights": [
    "<insight 1: hidden risks, cost differences, or missing coverage in plain language>",
    "<insight 2>",
    "<insight 3>"
  ]
}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Do NOT wrap the JSON in markdown. Do NOT add any explanation. Just the raw JSON.`;

    const contents = [
      {
        role: 'user',
        parts: [
          { inlineData: { data: fileA.inlineData.data, mimeType: 'application/pdf' } },
          { inlineData: { data: fileB.inlineData.data, mimeType: 'application/pdf' } },
          { text: prompt },
        ],
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents });
    } catch (err: any) {
      if (err.status === 503 || err.status === 429 || err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('UNAVAILABLE') || err.message?.includes('quota')) {
        response = await ai.models.generateContent({ model: 'gemini-2.0-flash-lite', contents });
      } else throw err;
    }

    let raw = (response.text ?? '').trim();
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) raw = raw.substring(start, end + 1);

    return { success: true, data: JSON.parse(raw) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[comparePolicies] Error:', message);
    return { success: false, error: message };
  }
}
