"""Figure for the lexical-decision simulation of Dahan et al. (2001), pp. 529-530.

Reads results/decisions.csv (from simulate.js) and writes figures/:
  fig-lexical-decision  A: mean response cycle by threshold for W1W1, N3W1, W2W1
                        B: SD of response cycles (variability within an item)
                        C: share of W2W1 responses triggered by W2
                        mean +/- 1 SE over items
  stats.txt             the values behind the figure, for both parameter sets
The figure uses the archived parameter set (see lib/items.js).

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
STYLE = {
    "W1W1": dict(color=COLORS[0], marker="^", mfc=COLORS[0]),
    "N3W1": dict(color=COLORS[5], marker="s", mfc="white"),
    "W2W1": dict(color=COLORS[6], marker="s", mfc=COLORS[6]),
}

apply_style()
everything = pd.read_csv(os.path.join(RESULTS, "decisions.csv"))


def usable(d):
    """Keep thresholds every item reaches on most runs in every condition."""
    reached = (d.responses / d.runs).groupby(d.threshold).min()
    return d[d.threshold.isin(reached[reached >= 0.95].index)]


d = usable(everything[everything.params == "archive"])

fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.4))
for ax, col, label in [(axes[0], "mean_rt", "Mean response cycle"), (axes[1], "sd_rt", "SD of response cycle")]:
    for cond, style in STYLE.items():
        g = d[d.condition == cond].groupby("threshold")[col]
        m, se = g.mean(), g.sem()
        ax.errorbar(m.index, m, yerr=se, capsize=2, lw=1, ms=3, label=cond, **style)
    ax.set_ylabel(label)
g = d[d.condition == "W2W1"].groupby("threshold").share_w2
axes[2].errorbar(g.mean().index, g.mean(), yerr=g.sem(), capsize=2, lw=1, ms=3, **STYLE["W2W1"])
axes[2].set_ylabel("Share of responses")
axes[2].set_ylim(0, 1)
for ax, t in zip(axes, ["A. Mean", "B. Variability", "C. W2W1: share triggered by W2"]):
    ax.set_xlabel("Response threshold")
    ax.set_title(t)
axes[0].legend(fontsize=6)
fig.tight_layout()
save(fig, FIGURES, "fig-lexical-decision")

lines = []
for params in ["archive", "me86"]:
    p = usable(everything[everything.params == params])
    table = p.groupby(["threshold", "condition"])[["mean_rt", "sd_rt", "share_w2"]].mean().round(2).unstack("condition")
    lines += [f"{params}: means over items (response cycle; share of responses triggered by W2):", table.to_string(), ""]
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
