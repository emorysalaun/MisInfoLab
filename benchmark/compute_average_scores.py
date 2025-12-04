import json
import numpy as np

# Load the cross-model scoring file
with open("generated/misinformation_scores.json", "r") as f:
    data = json.load(f)

models = list(data.keys())

# Create matrix structure
avg_matrix = {scorer: {} for scorer in models}

print("\n=== AVERAGE SCORE FOR EACH SCORING MODEL → GENERATING MODEL ===\n")

for scoring_model, generated_dict in data.items():
    for generated_model, scores in generated_dict.items():

        # scores is a dict: {"0": 0.83, "1": 0.65, ...}
        values = list(scores.values())

        # compute mean
        avg_score = float(np.mean(values))

        avg_matrix[scoring_model][generated_model] = avg_score

        print(f"{scoring_model:28} → {generated_model:28}  avg = {avg_score:.3f}")

#save averages
with open("generated/avg_scores.json", "w") as f:
    json.dump(avg_matrix, f, indent=2)

print("\nSaved results to generated/avg_scores.json")
