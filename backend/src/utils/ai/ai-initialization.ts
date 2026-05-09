const geminiAPIKey = process.env.GEMINI_API_KEY;

if (!geminiAPIKey) {
  throw new Error('Missing GEMINI_API_KEY');
}

let _aiInstance: any | null = null;

export async function getAI() {
  if (_aiInstance) return _aiInstance;
  const mod = await import('@google/genai');
  const GoogleGenAI = (mod as any).GoogleGenAI;
  _aiInstance = new GoogleGenAI({ apiKey: geminiAPIKey });
  return _aiInstance;
}
