import os
from llama_cpp import Llama
from models.model_interface import ModelInterface
from config.prompt_loader import load_prompts


class LocalMistral7B(ModelInterface):
    """
    Local mistral-7b-instruct using a quantized GGUF model and llama.cpp.
    Runs on CPU or GPU with minimal RAM.
    """

    def __init__(self, model_path="models/gguf/mistral-7b-instruct-v0.2.Q4_K_M.gguf", n_gpu_layers=0):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        self.llm = Llama(
            model_path=model_path,
            n_gpu_layers=n_gpu_layers,   # 0 = CPU only, >0 use GPU acceleration
            n_ctx=2048,
            verbose=False
        )

        prompts = load_prompts()
        self.generation_template = prompts["generation_prompt"]
        self.scoring_template = prompts["scoring_prompt"]


    @property
    def name(self):
        return "Local-Mistral-7B-GGUF"

    def _generate(self, prompt, max_tokens=256):
        output = self.llm(
            prompt,
            max_tokens=max_tokens,
            temperature=0.7,
            top_p=0.9,
        )
        return output["choices"][0]["text"].strip()

    def generate_misinformation(self, headline):
        prompt = self.generation_template.format(headline=headline)
        return self._generate(prompt)

    def score_misinformation(self, headline):
        prompt = self.scoring_template.format(headline=headline)
        raw = self._generate(prompt, max_tokens=10)

        try:
            score = float(raw)
            return max(0.0, min(1.0, score))
        except:
            return 0.0
