"""Figure for McClelland (1991) Fig. 8: intrinsic noise.

Reads results/choices.csv (from simulate.js) and writes figures/:
  fig08-intrinsic-noise  z(P(/r/)) against the input to /r/, one letter per
                         context (s, p, t; n = none), with the best
                         parallel-lines fit (one slope, one intercept per context)
  stats.txt              P(/r/), z, and the variance the parallel lines explain

With intrinsic noise there is no closed-form slope, so the classical model
is fitted freely: straight parallel lines (paper: 99.97% of variance).

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import json
import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import SINGLE, apply_style, save  # noqa: E402
from zplot import fit_parallel, plot_z, zscore  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "choices.csv"))
with open(os.path.join(RESULTS, "metadata.json")) as fh:
    sd = json.load(fh)["noiseSD"]
d["p_r"] = d.r / d.trials
d["z"] = zscore(d.p_r, d.trials.iloc[0])
intercepts, slope, _, pve = fit_parallel(d.input, d.z, d.context)

fig, ax = plt.subplots(figsize=(SINGLE, 2.8))
plot_z(ax, d, fit=(intercepts, slope))
ax.set_xlabel("Input to /r/")
ax.set_ylabel("z(P(/r/))")
ax.set_xlim(0.27, 0.73)
ax.set_title(f"Intrinsic noise (SD {sd}); parallel lines explain {pve:.2f}%", fontsize=7)
save(fig, FIGURES, "fig08-intrinsic-noise")

lines = [f"P(/r/), {d.trials.iloc[0]} trials per cell:"]
lines.append(d.pivot_table(index="context", columns="input", values="p_r", sort=False).round(4).to_string())
lines.append("\nz(P(/r/)):")
lines.append(d.pivot_table(index="context", columns="input", values="z", sort=False).round(3).to_string())
lines.append(f"\nParallel lines: slope {slope:.3f} per unit input; intercepts "
             + ", ".join(f"{g} {v:.3f}" for g, v in intercepts.items()))
lines.append(f"Variance explained: {pve:.2f}% (paper: 99.97%)")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
