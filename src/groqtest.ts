import Groq from "groq-sdk";

export async function testGroq() {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.error("Missing Groq API key! Add VITE_GROQ_API_KEY to .env");
    return;
  }

  const client = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true
  });


  try {
    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: "Write me a small story about a dog and a cat." }
      ]
    });

    const output = result.choices[0].message?.content || "(no result)";
    console.log("Groq Response:", output);

    // write to the page for debugging
    // const outBox = document.getElementById("groq-output");
    // if (outBox) outBox.textContent = output;

  } catch (err) {
    console.error("❌ Groq API Error:", err);
  }
}
