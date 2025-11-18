import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true
});

// Detect misinformation, bias, manipulation using LLaMA-Guard 3
export async function detectMisinformation(headline: string) {
  const prompt = `
  You are an AI trained to evaluate *multiple specific misinformation techniques*.
  
  Important:
  - Do NOT label emotionally intense headlines as "clickbait" unless the headline uses clickbait-style exaggeration.
  - Evaluate each technique independently.
  
  DEFINITIONS:
  Clickbait = sensationalism used to generate curiosity or shock (e.g., "shocking", "you won’t believe", "explosive revelation")
  Political Bias = language favoring or attacking a political group
  Emotional Triggering = language aimed at fear, sadness, anger, or moral outrage WITHOUT exaggerated stakes
  Fake Facts = fabricated or impossible details intended to mislead
  Out-of-Context Manipulation = true information framed in a misleading way
  
  Return ONLY JSON:
  
  {
    "misinformation_score": number 0-100,
    "emotional_triggering": number 0-100,
    "clickbait": number 0-100,
    "political_bias": number 0-100,
    "fake_facts": number 0-100,
    "out_of_context": number 0-100,
    "manipulative_phrases": ["..."],
    "psychological_triggers": ["..."],
    "reasoning": "..."
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
