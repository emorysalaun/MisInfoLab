import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true
});

// Detect misinformation, bias, manipulation using LLaMA-Guard 3
export async function detectMisinformation(headline: string) {
  const prompt = `
Analyze the following headline for misinformation, manipulation, or biased framing.

Return JSON ONLY:

{
  "misinformation_score": 0-100,
  "emotional_triggering": 0-100,
  "clickbait": 0-100,
  "political_bias": 0-100,
  "manipulative_phrases": ["list key phrases"],
  "psychological_triggers": ["fear", "anger", etc],
  "reasoning": "short explanation of why"
}

Headline:
"${headline}"
  `;

  const result = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "user", content: prompt }
    ]
  });

  const raw = result.choices[0].message?.content || "{}";

  return JSON.parse(raw);
}
