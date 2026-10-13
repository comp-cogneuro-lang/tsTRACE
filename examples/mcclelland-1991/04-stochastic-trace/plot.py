"""Figure for McClelland (1991) Fig. 9: TRACE with intrinsic noise.

Reads results/ (from simulate.js) and writes figures/:
  fig09-stochastic-trace
      A: deterministic TRACE, Luce readout (k = 10) of the running averages,
         points joined per context: the original formulation
      B: stochastic TRACE: z(P(/r/)) per context (s, p, t) and liquid, with
         +/- 1 SE (binomial, carried into z), and the best parallel lines. As in
         the paper, the neutral liquid's position on the x axis is fitted
         ("choosing the spacing of the input conditions to promote a straight
         line fit"); /l/-like is at 0 and /r/-like at 1.
  stats.txt  P(/r/), z, the fitted spacing, and the variance the lines explain

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd
from scipy.stats import norm

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import DOUBLE, apply_style, save  # noqa: E402
from zplot import fit_parallel, plot_z, zscore  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 10
X = {"l-like": 0.0, "neutral": 0.5, "r-like": 1.0}

apply_style()
trials = pd.read_csv(os.path.join(RESULTS, "trials.csv"))
det = pd.read_csv(os.path.join(RESULTS, "deterministic.csv"))

d = trials.groupby(["context", "target"]).agg(n=("response", "size"), r=("response", lambda s: (s == "r").sum()))
d = d.reset_index()
d["x"] = d.target.map(X)
d = d.sort_values(["context", "x"]).reset_index(drop=True)
n = int(d.n.min())
d["p_r"] = d.r / d.n
d["z"] = zscore(d.p_r, n)
# binomial SE of p, carried into z units: se_z = se_p / phi(z)
d["se_z"] = np.sqrt(d.p_r.clip(0.5 / n, 1 - 0.5 / n) * (1 - d.p_r.clip(0.5 / n, 1 - 0.5 / n)) / d.n) / norm.pdf(d.z)
intercepts, slope, xx, pve = fit_parallel(d.x, d.z, d.context, free_middle=True)
middle = float(xx[np.isclose(d.x, 0.5)][0])

det["x"] = det.target.map(X)
det = det.sort_values(["context", "x"])
det["p_r"] = 1 / (1 + np.exp(K * (det.abar_l - det.abar_r)))
det["z"] = zscore(det.p_r)
_, _, _, det_pve = fit_parallel(det.x, det.z, det.context)

fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.8))
plot_z(a1, det.rename(columns={"x": "input"}), connect=True)
a1.set_title(f"A. Deterministic, Luce readout (k = {K})\nparallel lines explain {det_pve:.1f}%", fontsize=7)
a1.set_ylabel("z(P(/r/))")
plot_z(a2, d.rename(columns={"x": "input"}), fit=(intercepts, slope), xx=xx)
a2.errorbar(xx, d.z, yerr=d.se_z, fmt="none", ecolor="0.5", elinewidth=0.6, capsize=1.5, zorder=0)
a2.set_title(f"B. Processing noise SD 0.02, {n} trials per point\nparallel lines explain {pve:.2f}%", fontsize=7)
for ax, mid in [(a1, 0.5), (a2, middle)]:
    ax.set_xticks([0, mid, 1], ["/l/-like", "neutral", "/r/-like"])
    ax.set_xlim(-0.1, 1.1)
    ax.set_xlabel("Liquid")
save(fig, FIGURES, "fig09-stochastic-trace")

lines = [f"Stochastic TRACE, {n} trials per condition: P(/r/)"]
lines.append(d.pivot_table(index="context", columns="target", values="p_r").round(3).to_string())
lines.append("\nz(P(/r/)) (SE):")
for r in d.itertuples():
    lines.append(f"  {r.context} {r.target:8s} z = {r.z:6.3f} ({r.se_z:.3f})")
lines.append(f"\nParallel lines with the neutral liquid at x = {middle:.2f} (between /l/-like 0 and /r/-like 1):")
lines.append(f"  slope {slope:.3f}; intercepts " + ", ".join(f"{g} {v:.3f}" for g, v in intercepts.items()))
lines.append(f"  variance explained {pve:.2f}% (paper: 99.94%)")
lines.append(f"\nDeterministic, Luce readout (k = {K}): P(/r/)")
lines.append(det.pivot_table(index="context", columns="target", values="p_r").round(3).to_string())
lines.append(f"  parallel lines (fixed spacing) explain {det_pve:.2f}%")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
