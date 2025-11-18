export function setupLearnPage() {
    const learnCards = document.getElementById("learn-cards");
    if (!learnCards) return;
  
    const topics = [
      {
        title: "Clickbait",
        definition: "Exaggerates or dramatizes a headline to grab attention, often without reflecting the actual content.",
        example: `"City Council Unveils SHOCKING New Budget Plan!"`,
        why: "Overstates the emotional impact, uses sensational language, and misleads readers into expecting drama."
      },
      {
        title: "Emotional Triggering",
        definition: "Uses strong emotional cues—fear, anger, outrage—to influence a reader’s reaction.",
        example: `"Heartless Officials Slash Funding That Protects YOUR Family!"`,
        why: "Manipulates emotional responses to bypass critical thinking and increase sharing."
      },
      {
        title: "Fake Facts",
        definition: "Includes fabricated statistics, false claims, or invented expert quotes.",
        example: `"Experts Confirm 80% of Local Water Is Contaminated—City Denies Allegations!"`,
        why: "Gives the illusion of credibility by using fake numbers or fake authority figures."
      },
      {
        title: "Political Bias",
        definition: "Frames events to favor or attack a specific political group or viewpoint.",
        example: `"Corrupt Elite Politicians Push Dangerous Agenda Against Hardworking Citizens"`,
        why: "Uses divisive partisan framing to influence political beliefs and create 'us vs. them' mentality."
      }
    ];
  
    learnCards.innerHTML = topics
      .map(t => `
        <div class="learn-card">
          <div class="learn-card-title">${t.title}</div>
  
          <div class="learn-section-title">Definition:</div>
          <div class="learn-section-text">${t.definition}</div>
  
          <div class="learn-section-title">Example:</div>
          <div class="learn-section-text">${t.example}</div>
  
          <div class="learn-section-title">Why It Misleads:</div>
          <div class="learn-section-text">${t.why}</div>
        </div>
      `)
      .join("");
  }
  