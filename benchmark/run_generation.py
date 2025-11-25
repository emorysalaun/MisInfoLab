import os
from dotenv import load_dotenv
from models.model_loader import load_models
import json
import time

# Load .env variables
load_dotenv()

config = {
    "groq-llama-8b":  {"api_key": os.getenv("GROQ_API_KEY")},
    "groq-llama-70b": {"api_key": os.getenv("GROQ_API_KEY")},
    "local-mistral-7b": {
        "model_path": "models/gguf/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        "n_gpu_layers": 0  # set to > 0 to use GPU.
    }
}

models = load_models(config)

for m in models:
    print("Loaded:", m.name)

with open("unbiased/100_neutral_articles.json", "r") as f:
    articles = json.load(f)

print("\nLoaded Article Titles:\n")
for i, article in enumerate(articles, start=1):
    print(f"{i}. {article['title']}")

results = {}  # { model_name: { original_title: misinfo_title } }

for model in models:
    print(f"\nModel: {model.name}")


    model_results = {}

    for idx, article in enumerate(articles[:10], start=1):
        original = article["title"]

        print(f"  Generating article {idx} of 10")

        try:
            misinfo = model.generate_misinformation(original)
        except Exception as e:
            print("    Error:", e)
            misinfo = "(error)"

        model_results[original] = misinfo

        time.sleep(0.1)
    results[model.name] = model_results


with open("generated/generated_misinformation.json", "w") as f:
    json.dump(results, f, indent=2)