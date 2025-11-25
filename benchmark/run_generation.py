import os
from dotenv import load_dotenv
from models.model_loader import load_models

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
