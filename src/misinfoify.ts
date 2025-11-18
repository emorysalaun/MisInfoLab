import Groq from "groq-sdk";
import { detectMisinformation } from "./detectmisinfo";

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
        
        Selected Technique: ${mode}
        
        GENERAL RULES (always apply):
        1. Make the rewritten headline punchy, emotionally manipulative, and misleading.
        2. Bold ONLY the manipulative/emotional words using **markdown bold**.
           - Do NOT bold the entire headline.
           - Do NOT wrap the whole sentence in asterisks.
           - Only bold the misleading/emotional words.
        3. Return JSON only.
        
        SPECIAL RULES FOR POLITICAL BIAS:
        If mode == "Political Bias", then:
        - Choose a clear partisan framing (LEFT-leaning or RIGHT-leaning). Randomly pick one per generation.
        - Use emotionally loaded, ideological language.
        - Blame or praise a political group, party, ideology, or public figure.
        - Insert partisan narratives (e.g., corruption, incompetence, elitism, extremism).
        - Slightly distort context to favor one side.
        - Ensure **at least 3** manipulative/emotional terms are bolded.
        - Avoid neutrality — pick a side clearly.
        
        SPECIAL RULES FOR FAKE FACTS:
        If mode == "Fake Facts", fabricate details that sound authoritative but are false.
        
        SPECIAL RULES FOR EMOTIONAL TRIGGERING:
        If mode == "Emotional Triggering", emphasize fear, anger, outrage, or panic.
        
        SPECIAL RULES FOR CLICKBAIT:
        If mode == "Clickbait", exaggerate stakes and add urgent/dangerous language.

        IMPORTANT STYLE CORRECTION:
        - If mode is NOT "Clickbait", avoid using clickbait-style exaggeration such as:
        "shocking", "devastating", "explosive", "you won’t believe", "stuns", "panic", "outrage", "urgent warning".
        - Keep the manipulation focused STRICTLY on the selected technique.
        - For Political Bias: use partisan framing, *not* dramatic stakes.
        - For Fake Facts: invent authoritative-sounding details, *not* exaggerated danger.
        - For Emotional Triggering: evoke a specific emotion (fear, anger, sadness), *not* generic hype.
        - For Out-of-Context Distortion: change context subtly, *not* sensationalize.
        
        Your output MUST follow this JSON schema exactly:
        
        {
          "headline": "REWRITTEN HEADLINE WITH **BOLDED KEYWORDS ONLY**",
          "explanation": "SHORT EXPLANATION OF WHY THIS REPRESENTS '${mode}' MISINFORMATION"
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
    const MISINFO_MODES = [
        "Clickbait",
        "Emotional Triggering",
        "Fake Facts",
        "Political Bias"
      ];
          
    genButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        let mode = btn.textContent?.trim() ?? "";

        if (mode === "Randomize") {
        mode = MISINFO_MODES[Math.floor(Math.random() * MISINFO_MODES.length)];
        }

        const originalText = headlineInput.value || headlineInput.placeholder;
  
        if (!originalText) {
          headlineInput.value = "Generate or type a headline first!";
          return;
        }
  
        headlineInput.value = "Generating…";
  
        const result = await applyGroqTransformation(mode, originalText);

        headlineInput.value = result.headline;

        const detection = await detectMisinformation(result.headline);
        const detectionBox = document.getElementById("detection-results");
        detectionBox.innerHTML = `
            <h3>AI Detection (Model: <code>openai/gpt-oss-120b</code>)</h3>
            <p><strong>Misinformation Score:</strong> ${detection.misinformation_score}</p>
            <p><strong>Emotional Triggering:</strong> ${detection.emotional_triggering}</p>
            <p><strong>Fake Facts:</strong> ${detection.fake_facts}</p>
            <p><strong>Clickbait:</strong> ${detection.clickbait}</p>
            <p><strong>Political Bias:</strong> ${detection.political_bias}</p>
            <p><strong>Manipulative Phrases:</strong> ${detection.manipulative_phrases.join(", ")}</p>
            <p><strong>Psychological Triggers:</strong> ${detection.psychological_triggers.join(", ")}</p>
            <p><strong>Analysis:</strong> ${detection.reasoning}</p>
            `;
  
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
  