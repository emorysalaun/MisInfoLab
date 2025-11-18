import { setupMisinfoButtons } from "./misinfoify";
import { setupLearnPage } from "./learn";

const randomBtn = document.querySelector(".top-btn") as HTMLButtonElement;
const headlineInput = document.getElementById("headline-input") as HTMLInputElement;


// Event listener for randomly generating a news headline
randomBtn.addEventListener("click", async () => {
    try {
        const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
        const url = `https://newsapi.org/v2/everything?q=America&from=2025-17-10&sortBy=popularity&apiKey=${NEWS_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        const articles = data.articles;
        if (!articles || articles.length === 0) {
            headlineInput.placeholder = "No articles found";
            return;
        }

        const randomIndex = Math.floor(Math.random() * articles.length);
        const title = articles[randomIndex].title;

        headlineInput.placeholder = title;
        headlineInput.value = title;

    } catch (err) {
        console.error(err);
        headlineInput.placeholder = "Error fetching news";
    }
});

export function setupNavigation() {
    const homeBtn = document.querySelector('[data-page="home"]') as HTMLButtonElement;
    const learnBtn = document.querySelector('[data-page="learn"]') as HTMLButtonElement;
    const testBtn  = document.querySelector('[data-page="test"]') as HTMLButtonElement;
  
    const homeScreen  = document.querySelector('.generator-container') as HTMLDivElement;
    const learnScreen = document.getElementById('learn-screen') as HTMLDivElement;
    const testScreen  = document.getElementById('test-screen') as HTMLDivElement;
    const explanationScreen = document.getElementById("explanation-screen") as HTMLDivElement;
  
    function showScreen(screen: HTMLElement) {
      homeScreen.classList.add("hidden");
      learnScreen.classList.add("hidden");
      testScreen.classList.add("hidden");
      explanationScreen.classList.add("hidden");
  
      screen.classList.remove("hidden");
    }
  
    homeBtn.addEventListener("click", () => showScreen(homeScreen));
    learnBtn.addEventListener("click", () => showScreen(learnScreen));
    testBtn.addEventListener("click", () => showScreen(testScreen));
}

window.onload = () => {
    setupNavigation();
    setupMisinfoButtons();
    setupLearnPage();
};

