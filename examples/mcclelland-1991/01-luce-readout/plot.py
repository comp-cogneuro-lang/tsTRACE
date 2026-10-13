"""Figure for McClelland (1991) Fig. 4: deterministic IA with a Luce readout.

Reads results/activations.csv (from simulate.js) and writes figures/:
  fig04-luce-readout  z(P(/r/)) against the input to /r/, one letter per context
                      (s, p, t; n = no context; x = isolated); the title gives
                      the variance the best parallel-lines ("classical") fit explains
  stats.txt           P(/r/), and the percentage of variance the classical fit explains

P(/r/) = exp(k abar_r) / (exp(k abar_r) + exp(k abar_l)) at cycle 60 (Eq. 2).
The paper does not give k for this figure; k = 10 is the value TRACE and the
letter-perception model used.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import SINGLE, apply_style, save  # noqa: E402
from zplot import fit_parallel, plot_z, zscore  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 10

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "activations.csv"))
end = d[d.cycle == d.cycle.max()].copy()
end["p_r"] = 1 / (1 + np.exp(K * (end.abar_l - end.abar_r)))
end["z"] = zscore(end.p_r)
intercepts, slope, _, pve = fit_parallel(end.input, end.z, end.context)

fig, ax = plt.subplots(figsize=(SINGLE, 2.8))
plot_z(ax, end, connect=True)
ax.set_xlabel("Input to /r/ (/l/ gets 1 minus this)")
ax.set_ylabel(f"z(P(/r/)), Luce readout, k = {K}")
ax.set_xlim(0.27, 0.73)
ax.set_title(f"Deterministic IA network; parallel lines explain {pve:.1f}% of variance", fontsize=7)
save(fig, FIGURES, "fig04-luce-readout")

lines = [f"P(/r/) at cycle {end.cycle.max()} (k = {K}):"]
lines.append(end.pivot_table(index="context", columns="input", values="p_r", sort=False).round(3).to_string())
lines.append(f"\nClassical (parallel lines) fit to z(P(/r/)): {pve:.2f}% of variance")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
