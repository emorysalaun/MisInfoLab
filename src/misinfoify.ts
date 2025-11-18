import Groq from "groq-sdk";

const headlineInput = document.getElementById("headline-input") as HTMLInputElement;
const genButtons = document.querySelectorAll(".gen-btn");

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true
});

async function applyGroqTransformation(mode: string, text: string): Promise<string> {
  try {
    const prompt = `
Rewrite the following headline using the style: ${mode}.
Make it short, punchy, and clearly show the misinformation technique.
Do NOT add disclaimers.

Original: "${text}"
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message?.content || "(no result)";

  } catch (err) {
    console.error("Groq error:", err);
    return "Error generating misinformation headline";
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

      headlineInput.value = result;
    });
  });
}
