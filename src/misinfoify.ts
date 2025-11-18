import Groq from "groq-sdk";

const headlineInput = document.getElementById("headline-input") as HTMLInputElement;
const genButtons = document.querySelectorAll(".gen-btn");

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true
});

async function applyGroqTransformation(mode: string, text: string): Promise<{ headline: string; explanation: string }> {
    try {
      const prompt = `
  You are an AI that rewrites headlines to demonstrate misinformation techniques.
  
  TASK:
  1. Rewrite the headline using **${mode}** style misinformation.
  2. Make it punchy, misleading, and emotionally manipulative.
  3. Bold the key misleading words or phrases using **markdown bold**.
  4. Then provide a short explanation of HOW and WHY this rewritten headline is an example of '${mode}' misinformation.
  
  FORMAT YOUR RESPONSE EXACTLY LIKE THIS JSON (no extra text):
  {
    "headline": "MISINFORMATION_HEADLINE_HERE",
    "explanation": "SHORT_EXPLANATION_HERE"
  }
  
  Original Headline:
  "${text}"
      `;
  
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
      });
  
      const raw = completion.choices[0].message?.content || "";
  
      // Parse the JSON the model outputs
      return JSON.parse(raw);
  
    } catch (err) {
      console.error("Groq error:", err);
      return {
        headline: "Error generating misinformation headline",
        explanation: "The AI failed to generate a valid response."
      };
    }
  }
  

export function setupMisinfoButtons() {
  genButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const mode = btn.textContent?.trim() ?? "";
      const text = headlineInput.value || headlineInput.placeholder;

      if (!text) {
        headlineInput.value = "Generate or type a headline first!";
        return;
      }

      // Show loading state
      headlineInput.value = "Generating…";

      const result = await applyGroqTransformation(mode, text);

      headlineInput.value = result.headline;
    });
  });
}