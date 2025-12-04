# models/model_loader.py

"""
Model Loader for the Misinformation Benchmark.
----------------------------------------------
This file maps short model names to model classes and loads them
based on a configuration dictionary.

Usage:

config = {
    "groq-llama-8b":  {"api_key": "..."},
    "groq-llama-70b": {"api_key": "..."}
}

models = load_models(config)
"""

from models.llama_3_1_8b_instant import Llama8b
from models.llama_3_3_70b_versatile import Llama70b
from models.local_mistral_7b import LocalMistral7B




# Mapping of model names to class constructors

MODEL_MAP = {
    "groq-llama-8b":  Llama8b,
    "groq-llama-70b": Llama70b,
    "local-mistral-7b": LocalMistral7B,
}


def load_models(config: dict):
    """
    Load multiple models from a configuration dict.

    Example config:
    {
        "groq-llama-8b":  {"api_key": "..."},
        "groq-llama-70b": {"api_key": "..."}
    }

    Returns a list of instantiated model objects.
    """

    loaded_models = []

    for model_name, params in config.items():

        if model_name not in MODEL_MAP:
            available = ", ".join(MODEL_MAP.keys())
            raise ValueError(
                f"Unknown model '{model_name}'. Available models: {available}"
            )

        model_class = MODEL_MAP[model_name]

        try:
            model_instance = model_class(**params)
        except TypeError as e:
            raise TypeError(
                f"Error initializing model '{model_name}'. "
                f"Check parameters: {params}. Error: {e}"
            )

        loaded_models.append(model_instance)

    return loaded_models
