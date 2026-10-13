"""Figure for McClelland (1991) Fig. 6: noise in the input.

Reads results/choices.csv (from simulate.js) and writes figures/:
  fig06-input-noise  z(P(/r/)) against the mean input to /r/, one letter per
                     context (s, p, t; n = none). Gray lines: the classical
                     prediction as the paper fits it (p. 15): the neutral
                     contexts on one line through z = 0 at input .5 with
                     slope 1/SD (signal detection theory), and the /s/ and /t/
                     contexts shifted down and up by one fitted amount.
  stats.txt          P(/r/), z, the shift, and the variance the fit explains

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import json
import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import SINGLE, apply_style, save  # noqa: E402
from zplot import plot_z, zscore  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "choices.csv"))
with open(os.path.join(RESULTS, "metadata.json")) as fh:
    sd = json.load(fh)["inputSD"]
d["p_r"] = d.r / d.trials
d["z"] = zscore(d.p_r, d.trials.iloc[0])

# classical prediction: z = (input - .5) / SD + shift, with shift = -c for /s/,
# +c for /t/, 0 for the neutral contexts; c is the one fitted parameter
sign = d.context.map({"s": -1, "t": 1}).fillna(0).to_numpy()
base = (d.input - 0.5).to_numpy() / sd
biased = sign != 0
c = float(np.sum(sign[biased] * (d.z.to_numpy()[biased] - base[biased])) / np.sum(biased))
pred = base + sign * c
pve = 100 * (1 - np.sum((d.z - pred) ** 2) / np.sum((d.z - d.z.mean()) ** 2))
intercepts = {g: -0.5 / sd + s * c for g, s in zip(["s", "p", "t", "none"], [-1, 0, 1, 0])}

fig, ax = plt.subplots(figsize=(SINGLE, 2.8))
plot_z(ax, d, fit=(intercepts, 1 / sd))
ax.set_xlabel("Mean input to /r/")
ax.set_ylabel("z(P(/r/))")
ax.set_xlim(0.27, 0.73)
ax.set_title(f"Noise in the input (SD {sd}); classical fit explains {pve:.2f}%", fontsize=7)
save(fig, FIGURES, "fig06-input-noise")

lines = [f"P(/r/), {d.trials.iloc[0]} trials per cell:"]
lines.append(d.pivot_table(index="context", columns="input", values="p_r", sort=False).round(4).to_string())
lines.append("\nz(P(/r/)):")
lines.append(d.pivot_table(index="context", columns="input", values="z", sort=False).round(3).to_string())
lines.append(f"\nFitted context shift: {c:.3f} (z units); classical fit explains {pve:.2f}% of variance (paper: 99.97%)")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
