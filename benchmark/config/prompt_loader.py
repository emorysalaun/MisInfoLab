import json

def load_prompts(path="config/prompts.json"):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return {
        "generation_prompt": data["generation_prompt"],
        "scoring_prompt": data["scoring_prompt"]
    }
