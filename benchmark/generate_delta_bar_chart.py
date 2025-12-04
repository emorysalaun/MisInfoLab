import json
import numpy as np
import matplotlib.pyplot as plt

# Load avg delta data
with open("generated/avg_delta.json", "r") as f:
    data = json.load(f)

scoring_models = list(data.keys())
generating_models = list(next(iter(data.values())).keys())

# Build matrix (rows = scoring model, cols = generating model)
matrix = np.array([
    [data[scorer][gen] for gen in generating_models]
    for scorer in scoring_models
])

# Plot settings
x = np.arange(len(generating_models))
width = 0.25  # width of each bar

plt.figure(figsize=(10, 6))

# Plot one bar set per scoring model
for i, scorer in enumerate(scoring_models):
    plt.bar(x + i * width, matrix[i], width, label=scorer)

# Axis labels & formatting
plt.xticks(x + width, generating_models, rotation=30, ha="right")
plt.ylabel("Average Δ (Manipulativeness Increase)")
plt.xlabel("Generating Model")
plt.title("Cross-Model Misinformation Delta Scores (Δ vs Ground Truth)")

plt.legend(title="Scoring Model")
plt.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.savefig("generated/delta_bar_chart.png", dpi=300)
plt.show()
