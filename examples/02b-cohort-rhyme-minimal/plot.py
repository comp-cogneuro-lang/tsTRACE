"""Example 2b figures: cohort and rhyme competition, analyzed by pair.

Reads results/pairs.csv (from simulate.js) and writes figures/:
  fig1-cohort-and-rhyme
    top row:     every (target, cohort) pair
    bottom row:  every (target, rhyme) pair
    left:   activation of the target, the competitor, and the target's unrelated words
    right:  predicted fixation proportions for a four-picture display holding the
            target, the competitor, and two unrelated items (the mean unrelated
            activation fills both slots). Response strength exp(k * activation),
            k = 7; each item's probability is its share of the total.

Cohort and rhyme pairs are analyzed separately, so each row's target curve is
the average over exactly the targets in that row's pairs. Bands are +/- 1
standard error across pairs.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 7  # Luce choice exponent used by Allopenna et al. (1998)
LINES = {
    "target": dict(color=COLORS[0], marker=MARKERS[0], label="target"),
    "competitor": None,  # set per row (cohort or rhyme color)
    "unrelated": dict(color="0.55", marker=MARKERS[3], label="unrelated"),
}
COMPETITOR = {
    "cohort": dict(color=COLORS[6], marker=MARKERS[1], label="cohort"),
    "rhyme": dict(color=COLORS[5], marker=MARKERS[2], label="rhyme"),
}

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "pairs.csv"))
d["pair"] = d.target + "/" + d.competitor

# predicted fixations for each pair and cycle
strength = np.exp(K * d[["target_act", "competitor_act", "unrelated_act"]].to_numpy())
total = strength[:, 0] + strength[:, 1] + 2 * strength[:, 2]  # two unrelated pictures
d["target_p"] = strength[:, 0] / total
d["competitor_p"] = strength[:, 1] / total
d["unrelated_p"] = strength[:, 2] / total  # probability of one unrelated picture

fig, axes = plt.subplots(2, 2, figsize=(DOUBLE, 5.0), sharex=True)
for row, kind in enumerate(["cohort", "rhyme"]):
    f = d[d.type == kind]
    n_pairs, n_targets = f.pair.nunique(), f.target.nunique()
    styles = {"target": LINES["target"], "competitor": COMPETITOR[kind], "unrelated": LINES["unrelated"]}
    for col, suffix in enumerate(["act", "p"]):
        ax = axes[row, col]
        for item, style in styles.items():
            g = f.groupby("cycle")[f"{item}_{suffix}"]
            m, se = g.mean(), g.sem()
            ax.plot(m.index, m, markevery=10, **style)
            ax.fill_between(m.index, m - se, m + se, color=style["color"], alpha=0.2, lw=0)
        if suffix == "act":
            ax.set_ylabel("Activation (most active copy)")
            ax.set_title(f"{kind.capitalize()} pairs: activation ({n_pairs} pairs, {n_targets} targets)")
            ax.legend(loc="upper left")
        else:
            ax.set_ylabel("Predicted fixation proportion")
            ax.set_title(f"{kind.capitalize()} pairs: predicted fixations (Luce, k = {K})")
            ax.set_ylim(0, 1)
        if row == 1:
            ax.set_xlabel("Cycle")
save(fig, FIGURES, "fig1-cohort-and-rhyme")
