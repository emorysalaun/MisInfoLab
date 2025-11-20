import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

interface Question {
  headline: string;
  choices: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
}

// Model used for generating test questions
const TEST_MODEL = "llama-3.1-8b-instant";

let questions: Question[] = [];
let currentIndex = 0;
let score = 0;

export async function setupTestPage() {
  const startBtn = document.getElementById("start-test-btn") as HTMLButtonElement;
  const questionBox = document.getElementById("test-question-box") as HTMLDivElement;
  const headlineEl = document.getElementById("test-headline") as HTMLParagraphElement;
  const choicesEl = document.getElementById("test-choices") as HTMLDivElement;
  const nextBtn = document.getElementById("next-question-btn") as HTMLButtonElement;
  const resultScreen = document.getElementById("test-results") as HTMLDivElement;
  const scoreEl = document.getElementById("test-score") as HTMLParagraphElement;
  const restartBtn = document.getElementById("restart-test-btn") as HTMLButtonElement;
  const testModelName = document.getElementById("test-model-name") as HTMLElement;
  
  // Display the model name used for generating questions
  if (testModelName) {
    testModelName.textContent = TEST_MODEL;
  }

  // Start test
  startBtn.addEventListener("click", async () => {
    startBtn.textContent = "Generating questions…";
    startBtn.disabled = true;
    
    score = 0;
    currentIndex = 0;

    questions = await generateQuestions();
    
    if (!questions || questions.length === 0) {
      // Show error message
      alert("Failed to generate questions. Please try again.");
      startBtn.textContent = "Start Test";
      startBtn.disabled = false;
      return;
    }
    
    startBtn.classList.add("hidden");
    resultScreen.classList.add("hidden");
    questionBox.classList.remove("hidden");
    
    showQuestion();
  });

  // Next question
  nextBtn.addEventListener("click", () => {
    currentIndex++;
    if (currentIndex >= questions.length) {
      showResults();
      return;
    }
    showQuestion();
  });

  restartBtn.addEventListener("click", () => {
    resultScreen.classList.add("hidden");
    startBtn.classList.remove("hidden");
    // Reset start button state
    startBtn.textContent = "Start Test";
    startBtn.disabled = false;
  });

  function showQuestion() {
    nextBtn.classList.add("hidden");
    const q = questions[currentIndex];

    if (!q) {
      console.error("Question is undefined at index:", currentIndex);
      alert("Error: Question not found. Please restart the test.");
      return;
    }

    headlineEl.textContent = q.headline;
    choicesEl.innerHTML = "";

    let choiceLocked = false;

    Object.entries(q.choices).forEach(([letter, text]) => {
      const div = document.createElement("div");
      div.classList.add("test-choice");
      div.textContent = `${letter}: ${text}`;

      div.addEventListener("click", () => {
        if (choiceLocked) return; // Prevent multiple clicks
        choiceLocked = true;

        const correct = q.correct_answer.trim().toUpperCase();

        // Mark choices
        if (letter === correct) {
          score++;
          div.classList.add("correct");
        } else {
          div.classList.add("wrong");

          const correctEl = Array.from(choicesEl.children)
            .find(c => c.textContent?.startsWith(correct));
          correctEl?.classList.add("correct");
        }

        // Disable all choices visually + functionally
        Array.from(choicesEl.children).forEach(child => {
          (child as HTMLElement).classList.add("disabled");
        });

        nextBtn.classList.remove("hidden");
      });

      choicesEl.appendChild(div);
    });
  }

  function showResults() {
    questionBox.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    const percentage = Math.round((score / questions.length) * 100);
    scoreEl.textContent = `You scored ${score}/${questions.length} (${percentage}%).`;
  }
}

/*** Generates 10 training questions from Groq ***/
async function generateQuestions(): Promise<Question[]> {
    const prompt = `
    Generate EXACTLY 10 misinformation training questions.

    Each question must describe a *misleading or manipulative news headline* that demonstrates **ONLY ONE** of the following misinformation techniques:

    - Clickbait
    - Emotional Triggering
    - Political Bias
    - Fake Facts

    STRICT REQUIREMENTS FOR HEADLINES:
    - The headline must clearly and unambiguously fit ONE technique.
    - The headline MUST NOT blend or mix multiple techniques.
    - The headline must contain patterns typical of ONLY that chosen technique.
    - The explanation must confirm that only ONE technique is present.

    Technique definitions (follow these strictly):

    A. Clickbait — sensational, exaggerated wording meant to attract attention, but not strongly emotional.
    B. Emotional Triggering — evokes fear, anger, outrage, sympathy, or other strong emotions.
    C. Political Bias — slanted framing that favors or attacks a political party, group, or ideology.
    D. Fake Facts — fabricated or impossible claims presented as “facts.”

    💡 IMPORTANT:
    Each question MUST use ONLY the following answer choices:

    {
    "A": "Clickbait",
    "B": "Emotional Triggering",
    "C": "Political Bias",
    "D": "Fake Facts"
    }

    Schema (REQUIRED for every question):

    {
    "headline": "string",
    "choices": {
        "A": "Clickbait",
        "B": "Emotional Triggering",
        "C": "Political Bias",
        "D": "Fake Facts"
    },
    "correct_answer": "A" | "B" | "C" | "D",
    "explanation": "string"
    }

    RULES:
    - The headline must demonstrate exactly ONE technique.
    - The explanation must clearly justify why it fits ONLY that technique.
    - NEVER mix techniques (e.g., no emotional clickbait, no political emotionality, etc.).
    - DO NOT include commentary, markdown, or text outside the JSON.
    - Output must be valid JSON beginning with '[' and ending with ']'.
    - No trailing commas or schema deviations.

    Now generate the JSON array of 10 questions.
    `;

    
  const result = await groq.chat.completions.create({
    model: TEST_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  let raw = result.choices[0].message?.content || "";

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
  
  // Remove extra non-JSON text by finding the JSON array
  const startIndex = jsonText.indexOf("[");
  const endIndex = jsonText.lastIndexOf("]");
  if (startIndex !== -1 && endIndex !== -1) {
    jsonText = jsonText.substring(startIndex, endIndex + 1);
  }
  
  // Remove trailing commas before closing brackets/braces (common LLM mistake)
  // Apply multiple times to catch nested trailing commas
  let previousText = "";
  while (previousText !== jsonText) {
    previousText = jsonText;
    // Remove trailing commas before closing brackets/braces
    jsonText = jsonText.replace(/,(\s*[}\]])/g, "$1");
  }

  try {
    const parsed = JSON.parse(jsonText);
    // Validate that we got an array
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate that each question has required fields
      const validQuestions = parsed.filter((q: any) => 
        q && 
        typeof q.headline === 'string' && 
        q.choices && 
        typeof q.correct_answer === 'string' &&
        typeof q.explanation === 'string'
      );
      
      if (validQuestions.length > 0) {
        return validQuestions;
      } else {
        console.error("No valid questions found in parsed array");
        return [];
      }
    } else {
      console.error("Parsed result is not a valid array or is empty");
      return [];
    }
  } catch (err) {
    console.error("Bad JSON from Groq. Raw response:", raw);
    console.error("Cleaned JSON text:", jsonText);
    console.error("Parse error:", err);
    return [];
  }
}
