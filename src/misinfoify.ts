import Groq from "groq-sdk";

const headlineInput = document.getElementById("headline-input") as HTMLInputElement;
const genButtons = document.querySelectorAll(".gen-btn");

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true
});

// UI elements
const generatorScreen = document.querySelector(".generator-container") as HTMLDivElement;
const explanationScreen = document.getElementById("explanation-screen") as HTMLDivElement;
const originalHeadlineText = document.getElementById("original-headline-text") as HTMLParagraphElement;
const misinfoHeadlineText = document.getElementById("misinfo-headline-text") as HTMLParagraphElement;
const explanationText = document.getElementById("explanation-text") as HTMLParagraphElement;

const backBtn = document.getElementById("back-btn") as HTMLButtonElement;

backBtn.addEventListener("click", hideExplanationScreen);

function markdownBoldToHtml(text: string): string {
    // Replace **word** with <strong>word</strong>
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }  

function showExplanationScreen() {
    generatorScreen.classList.add("hidden");
    explanationScreen.classList.remove("hidden");
  }
  
  function hideExplanationScreen() {
    explanationScreen.classList.add("hidden");
    generatorScreen.classList.remove("hidden");
  }
  

async function applyGroqTransformation(mode: string, text: string): Promise<{ headline: string; explanation: string }> {
    try {
      const prompt = `
You are an AI that rewrites headlines to demonstrate misinformation techniques.

TASK:
1. Rewrite the headline using ${mode} style misinformation.
2. Make it punchy, misleading, and emotionally manipulative.
3. Identify ONLY the manipulative/emotional words or phrases and bold JUST those using **markdown bold**.
   - Do NOT bold the entire headline.
   - Do NOT wrap the whole sentence in asterisks.
   - Only bold the misleading/emotional words.
4. Then provide a short explanation of HOW and WHY this rewritten headline is an example of '${mode}' misinformation.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS JSON (no extra commentary):

{
  "headline": "REWRITTEN HEADLINE WITH **BOLDED KEYWORDS ONLY**",
  "explanation": "SHORT EXPLANATION HERE"
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
        const originalText = headlineInput.value || headlineInput.placeholder;
  
        if (!originalText) {
          headlineInput.value = "Generate or type a headline first!";
          return;
        }
  
        headlineInput.value = "Generating…";
  
        const result = await applyGroqTransformation(mode, originalText);

        headlineInput.value = result.headline;
  
       //left box with original headline
        originalHeadlineText.textContent = markdownBoldToHtml(originalText);

        misinfoHeadlineText.innerHTML = markdownBoldToHtml(result.headline);
        explanationText.innerHTML = markdownBoldToHtml(
          `<strong>(${mode}) Explanation:</strong> ${result.explanation}`
        );

  
        // Show explanation screen
        showExplanationScreen();
      });
    });
  }
  