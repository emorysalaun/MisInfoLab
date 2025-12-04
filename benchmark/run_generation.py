import os
from dotenv import load_dotenv
from models.model_loader import load_models
import json
import time

# Load .env variables
load_dotenv()

def clean_headline(text: str) -> str:
    if not isinstance(text, str):
        return text
    
    # Remove escaped quotes (\")
    cleaned = text.replace('\\"', '')
    
    # Remove stray backslashes
    cleaned = cleaned.replace('\\', '')
    
    # Remove leading/trailing quotes “ ” ' '
    cleaned = cleaned.strip('"').strip("'").strip()
    
    #collapse double spaces
    cleaned = " ".join(cleaned.split())
    
    return cleaned


FULL_CONFIG = {
    "groq-llama-8b":  {"api_key": os.getenv("GROQ_API_KEY")},
    "groq-llama-70b": {"api_key": os.getenv("GROQ_API_KEY")},
    "local-mistral-7b": {
        "model_path": "models/gguf/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        "n_gpu_layers": 0
    },
}


with open("unbiased/100_neutral_articles.json", "r") as f:
    articles = json.load(f)

print("\nLoaded Article Titles:\n")
for i, article in enumerate(articles, start=1):
    print(f"{i}. {article['title']}")

results = {}


for model_name, model_params in FULL_CONFIG.items():

    print(f"\nLoading model: {model_name}")
    single_config = {model_name: model_params}
    # only load one model at a time
    model = load_models(single_config)[0]   
    print(f"Loaded: {model.name}")

    model_results = {}

    # Generate only first 10 for testing
    for idx, article in enumerate(articles[:10], start=1):
        original = article["title"]

        print(f"  [{model.name}] Generating article {idx} of 10")

        try:
            misinfo = model.generate_misinformation(original)
        except Exception as e:
            print("    Error:", e)
            misinfo = "(error)"

        model_results[original] = misinfo
        time.sleep(0.1)

    results[model.name] = model_results

    # Manually deleting model after use.
    del model
    # time to free ram
    time.sleep(0.2)

# Save output
with open("generated/generated_misinformation.json", "w") as f:
    json.dump(results, f, indent=2)

with open("generated/generated_misinformation.json", "r") as f:
    data = json.load(f)

# Clean all headlines
for model_name, model_results in data.items():
    for original, rewritten in model_results.items():
        data[model_name][original] = clean_headline(rewritten)

# Save cleaned version
with open("generated/generated_misinformation_clean.json", "w") as f:
    json.dump(data, f, indent=2)

print("\nDone! Saved generated_misinformation.json")


