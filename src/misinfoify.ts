import Groq from "groq-sdk";
import { detectMisinformation } from "./detectmisinfo";

const headlineInput = document.getElementById("headline-input") as HTMLInputElement;
const genButtons = document.querySelectorAll(".gen-btn");

const storyBtn = document.getElementById("generate-story-btn") as HTMLButtonElement;
const storyOutput = document.getElementById("generated-story-text") as HTMLParagraphElement;

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

// Model selector elements
const modelSelector = document.getElementById("model-selector") as HTMLSelectElement;
const headlineModelName = document.getElementById("headline-model-name") as HTMLElement;
const explanationModelName = document.getElementById("explanation-model-name") as HTMLElement;
const storyModelName = document.getElementById("story-model-name") as HTMLElement;

// Model configuration with display names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "llama-3.1-8b-instant": "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b": "gpt-oss-20b",
  "openai/gpt-oss-120b": "gpt-oss-120b"
};

// Get the currently selected model
function getSelectedModel(): string {
  return modelSelector?.value || "llama-3.1-8b-instant";
}

// Update model name displays in the UI
function updateModelNameDisplays(model: string): void {
  const displayName = MODEL_DISPLAY_NAMES[model] || model;
  if (headlineModelName) headlineModelName.textContent = displayName;
  if (explanationModelName) explanationModelName.textContent = displayName;
  if (storyModelName) storyModelName.textContent = displayName;
  
  // Update the button text
  if (storyBtn) {
    storyBtn.innerHTML = `Generate Full Story (AI Model: <span id="story-model-name">${displayName}</span>)`;
    // Re-select the element after innerHTML update
    const updatedStoryModelName = document.getElementById("story-model-name");
    if (updatedStoryModelName) {
      // Store reference for future updates
      (window as any).storyModelNameElement = updatedStoryModelName;
    }
  }
}

backBtn.addEventListener("click", hideExplanationScreen);

// Listen for model selector changes
if (modelSelector) {
  modelSelector.addEventListener("change", () => {
    updateModelNameDisplays(getSelectedModel());
  });
  // Initialize model name displays
  updateModelNameDisplays(getSelectedModel());
}

storyBtn.addEventListener("click", async () => {
    const selectedModel = getSelectedModel();
    storyBtn.textContent = "Generating story…";
    storyBtn.disabled = true;
  
    const generatedStory = await generateFullStory(
      misinfoHeadlineText.textContent || "",
      selectedModel
    );
  
    storyOutput.textContent = generatedStory;
  
    const displayName = MODEL_DISPLAY_NAMES[selectedModel] || selectedModel;
    storyBtn.innerHTML = `Generate Full Story (AI Model: <span id="story-model-name">${displayName}</span>)`;
    storyBtn.disabled = false;
  });

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
  

async function applyGroqTransformation(mode: string, text: string, model?: string): Promise<{ headline: string; explanation: string }> {
    try {
        const selectedModel = model || getSelectedModel();
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
        "shocking", "devastating", "explosive", "you won't believe", "stuns", "panic", "outrage", "urgent warning".
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
        
        CRITICAL: Return ONLY valid JSON. Do NOT include any markdown formatting, code blocks, explanations, or text outside the JSON object. Start with { and end with }.
        
        Original Headline:
        "${text}"
        `;

  
      const completion = await groq.chat.completions.create({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }]
      });

      const raw = completion.choices[0].message?.content || "";

      // Parse the JSON the model outputs
      // Handle cases where the model wraps JSON in markdown code blocks or adds extra text
      let jsonText = raw.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```")) {
        // Remove opening ```json or ```
        jsonText = jsonText.replace(/^```(?:json)?\s*\n?/i, "");
        // Remove closing ```
        jsonText = jsonText.replace(/\n?```\s*$/, "");
        jsonText = jsonText.trim();
      }
      
      // Find the JSON object in the text (handle cases where there's text before/after)
      // Try to match the outermost JSON object
      let jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      } else {
        // If no match, try to find JSON array (less likely but possible)
        jsonMatch = jsonText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }
      
      // Remove trailing commas before closing braces/brackets (common LLM mistake)
      jsonText = jsonText.replace(/,(\s*[}\]])/g, "$1");
      
      // Try to parse
      try {
        const parsed = JSON.parse(jsonText);
        // Validate that we have the required fields
        if (typeof parsed.headline === 'string' && typeof parsed.explanation === 'string') {
          return parsed;
        } else {
          throw new Error("JSON missing required fields: headline or explanation");
        }
      } catch (parseError) {
        console.error("Failed to parse JSON. Raw response:", raw);
        console.error("Cleaned JSON text:", jsonText);
        console.error("Parse error:", parseError);
        
        // Last resort: try to extract fields manually if JSON structure is close
        const headlineMatch = jsonText.match(/"headline"\s*:\s*"([^"]+)"/);
        const explanationMatch = jsonText.match(/"explanation"\s*:\s*"([^"]+)"/);
        
        if (headlineMatch && explanationMatch) {
          console.warn("Recovered from malformed JSON by extracting fields manually");
          return {
            headline: headlineMatch[1],
            explanation: explanationMatch[1]
          };
        }
        
        throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
  
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
  
        const selectedModel = getSelectedModel();
        const result = await applyGroqTransformation(mode, originalText, selectedModel);
        
        // Update model name displays with the model that was used
        updateModelNameDisplays(selectedModel);

        headlineInput.value = result.headline;

        const detection = await detectMisinformation(result.headline);
        const detectionBox = document.getElementById("detection-results");
        if (detectionBox) {
          detectionBox.innerHTML = `
            <h3>AI Detection (Model: <code>openai/gpt-oss-120b</code>)</h3>
            <p><strong>Misinformation Score:</strong> ${detection.misinformation_score}</p>
            <p><strong>Emotional Triggering:</strong> ${detection.emotional_triggering}</p>
            <p><strong>Fake Facts:</strong> ${detection.fake_facts}</p>
            <p><strong>Clickbait:</strong> ${detection.clickbait}</p>
            <p><strong>Political Bias:</strong> ${detection.political_bias}</p>
            <p><strong>Manipulative Phrases:</strong> ${detection.manipulative_phrases?.join(", ") || "None detected"}</p>
            <p><strong>Psychological Triggers:</strong> ${detection.psychological_triggers?.join(", ") || "None detected"}</p>
            <p><strong>Analysis:</strong> ${detection.reasoning || "No analysis available"}</p>
            `;
        }
  
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
  
  async function generateFullStory(misinfoHeadline: string, model?: string): Promise<string> {
    const selectedModel = model || getSelectedModel();
    const prompt = `
  You are an AI that expands misinformation headlines into full deceptive articles.
  
  TASK:
  1. Take this misinformation headline:
  "${misinfoHeadline}"
  2. Write a full fake news article (4–6 paragraphs).
  3. Keep the tone manipulative and aligned with the misinformation style.
  4. Do NOT include disclaimers.
  5. Focus on emotional language, exaggeration, and misleading claims.
  6. Return ONLY the story text.
  
  Begin now.
  `;
  
    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages: [{ role: "user", content: prompt }],
    });
  
    return completion.choices[0].message?.content || "No story generated.";
  }
  