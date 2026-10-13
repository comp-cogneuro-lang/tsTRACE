"""Example 3 figures: the two length effects.

Reads results/targets.csv (from simulate.js) and writes figures/:
  fig1-length   A. shortest vs longest words (mean +/- 1 standard error)
                B. mean target activation for each word length (+/- 1 SE)

Short words are those of 1-2 phonemes and long words those of 7 or more,
the extremes of the default lexicon.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import COLORS, DOUBLE, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
SHORT_MAX, LONG_MIN = 2, 7

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "targets.csv"))
d["group"] = np.where(d.length <= SHORT_MAX, "short", np.where(d.length >= LONG_MIN, "long", "middle"))

fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.6))

# --- A. short vs long, mean +/- 1 standard error -------------------------------
for i, (group, label) in enumerate([("short", f"1-{SHORT_MAX} phonemes"), ("long", f"{LONG_MIN}+ phonemes")]):
    g = d[d.group == group].groupby("cycle").activation
    mean, sem, n = g.mean(), g.sem(), d[d.group == group].word.nunique()
    color = COLORS[5] if group == "short" else COLORS[6]
    a1.plot(mean.index, mean, color=color, label=f"{label} (n = {n})")
    a1.fill_between(mean.index, mean - sem, mean + sem, color=color, alpha=0.2, lw=0)
a1.set_xlabel("Cycle")
a1.set_ylabel("Target activation")
a1.set_title("A. Shortest vs longest words")
a1.legend(loc="upper left")

# --- B. every length -----------------------------------------------------------
lengths = sorted(d.length.unique())
cmap = plt.get_cmap("viridis")
for j, L in enumerate(lengths):
    g = d[d.length == L].groupby("cycle").activation
    m, se = g.mean(), g.sem().fillna(0)  # a single word has no standard error
    n = d[d.length == L].word.nunique()
    color = cmap(j / max(1, len(lengths) - 1))
    a2.plot(m.index, m, color=color, label=f"{L} (n = {n})")
    a2.fill_between(m.index, m - se, m + se, color=color, alpha=0.15, lw=0)
a2.set_xlabel("Cycle")
a2.set_ylabel("Target activation")
a2.set_title("B. All lengths (phonemes)")
a2.legend(loc="center left", bbox_to_anchor=(1.0, 0.5), title="Length")

save(fig, FIGURES, "fig1-length")
