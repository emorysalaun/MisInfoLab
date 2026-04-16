import json
import matplotlib.pyplot as plt
import numpy as np

with open("generated/avg_scores.json", "r") as f:
    avg = json.load(f)

# Row labels = scoring models
scoring_models = list(avg.keys())

# Column labels = generating models
generating_models = list(next(iter(avg.values())).keys())

# Build matrix of values
matrix = np.array([
    [avg[scorer][gen] for gen in generating_models]
    for scorer in scoring_models
])

# --- Plot the heatmap ---
plt.figure(figsize=(9, 7))

# Better colormap (plasma has excellent perceptual contrast)
cmap = plt.get_cmap("plasma")

heatmap = plt.imshow(matrix, cmap=cmap, interpolation="nearest")

# Colorbar
cbar = plt.colorbar(heatmap)
cbar.set_label("Average Misinformation Score", fontsize=12)

# Axis labels
plt.xlabel("Generating Model", fontsize=12)
plt.ylabel("Scoring Model", fontsize=12)

# Tick labels
plt.xticks(
    ticks=np.arange(len(generating_models)),
    labels=generating_models,
    rotation=45,
    ha="right"
)
plt.yticks(
    ticks=np.arange(len(scoring_models)),
    labels=scoring_models
)

# Add grid lines for clarity
plt.grid(color="white", linestyle="-", linewidth=0.5, alpha=0.3)

# Annotate each cell with readable text
for i in range(matrix.shape[0]):
    for j in range(matrix.shape[1]):
        value = matrix[i, j]
        text_color = "black"  # auto-contrast
        plt.text(j, i, f"{value:.2f}",
                 ha="center", va="center", color=text_color, fontsize=10)

plt.title("Cross-Model Misinformation Scoring Matrix", fontsize=14, pad=15)

plt.tight_layout()

plt.savefig("generated/score_matrix.png", dpi=300)
plt.show()
