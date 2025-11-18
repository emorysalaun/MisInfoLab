import { setupMisinfoButtons } from "./misinfoify";
setupMisinfoButtons();

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
