from models.model_interface import ModelInterface
from groq import Groq
from config.prompt_loader import load_prompts


class Llama70b(ModelInterface):
    """
    Groq model wrapper (fixed to llama-3.3-70b-versatile)
    """

    FIXED_MODEL_NAME = "llama-3.3-70b-versatile"

    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Groq API key is required.")

        self.client = Groq(api_key=api_key)

        # Load shared prompts
        prompts = load_prompts()
        self.generation_template = prompts["generation_prompt"]
        self.scoring_template  = prompts["scoring_prompt"]

    @property
    def name(self):
        return "Groq-llama-3.3-70b-versatile"

    def generate_misinformation(self, headline: str) -> str:
        prompt = self.generation_template.format(headline=headline)

        response = self.client.chat.completions.create(
            model=self.FIXED_MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message["content"].strip()

    def score_misinformation(self, headline: str) -> float:
        prompt = self.scoring_template.format(headline=headline)

        response = self.client.chat.completions.create(
            model=self.FIXED_MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        raw = response.choices[0].message["content"].strip()

        # Convert safe to float
        try:
            score = float(raw)
            return max(0.0, min(1.0, score))  # Clamp 0–1
        except ValueError:
            return 0.0
