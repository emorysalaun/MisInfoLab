import json
import numpy as np
from pathlib import Path

INPUT_PATH = Path("generated/misinformation_scores.json")
DELTA_OUT = Path("generated/delta_scores.json")
AVG_DELTA_OUT = Path("generated/avg_delta.json")

# -----------------------------------------------------
# Load all scores
# -----------------------------------------------------
with INPUT_PATH.open("r") as f:
    scores = json.load(f)

# -----------------------------------------------------
# Compute delta for each
# delta = generated_score – ground_truth_score
# -----------------------------------------------------

delta_scores = {}
avg_delta = {}

for scoring_model, gen_dict in scores.items():

    delta_scores[scoring_model] = {}
    avg_delta[scoring_model] = {}

    # Extract ground truth scores for comparison
    gt_scores = gen_dict.get("ground_truth", {})
    gt_scores_float = {int(k): float(v) for k, v in gt_scores.items()}

    for generated_model, index_dict in gen_dict.items():

        if generated_model == "ground_truth":
            continue  # skip self-comparison

        deltas = []

        delta_scores[scoring_model][generated_model] = {}

        for idx_str, gen_score in index_dict.items():
            idx = int(idx_str)
            gen_val = float(gen_score)
            gt_val = float(gt_scores_float.get(idx, 0.0))

            delta = gen_val - gt_val
            delta_scores[scoring_model][generated_model][idx] = delta
            deltas.append(delta)

        # Average Δ for this scoring_model × generating_model
        if len(deltas) > 0:
            avg_delta[scoring_model][generated_model] = float(np.mean(deltas))
        else:
            avg_delta[scoring_model][generated_model] = 0.0

# -----------------------------------------------------
# Save outputs
# -----------------------------------------------------
DELTA_OUT.write_text(json.dumps(delta_scores, indent=2))
AVG_DELTA_OUT.write_text(json.dumps(avg_delta, indent=2))

print("\nSaved delta matrices to:")
print(" -", DELTA_OUT)
print(" -", AVG_DELTA_OUT)
