"""Figure for Dahan, Magnuson, Tanenhaus & Hogan (2001) Fig. 4.

Reads results/activations.csv (from simulate.js) and writes figures/:
  fig04-subcategorical       the archived parameter set:
                             A: activation of the target (W1) and competitor (W2)
                             B: predicted fixation proportions, Luce choice (k = 7)
                             over the four pictures (W1, W2, two distractors)
                             for W1W1, N3W1 and W2W1 inputs; mean +/- 1 SE over items
  fig04-subcategorical-me86  the same with M&E's parameters (the paper's text)
  stats.txt                  peaks, crossing times, and final values per condition

The readout is the archived code's: plain Luce choice, k = 7, over the four
displayed words (no scaling, no delay). The paper plots TRACE's printed
activations (x 100); here they are on the model's own scale.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402
from linking import luce  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 7
ROLES = ["W1", "W2", "D1", "D2"]
STYLE = {  # as in the paper: filled triangles W1W1, filled squares W2W1, open squares N3W1
    "W1W1": dict(color=COLORS[0], marker="^", mfc=COLORS[0]),
    "N3W1": dict(color=COLORS[5], marker="s", mfc="white"),
    "W2W1": dict(color=COLORS[6], marker="s", mfc=COLORS[6]),
}

apply_style()
everything = pd.read_csv(os.path.join(RESULTS, "activations.csv"))
lines = []


def predicted(act):
    """Luce choice over the four displayed words, per item and condition."""
    fix = []
    for (item, cond), f in act.groupby(["item", "condition"]):
        f = f.sort_values("cycle")
        p = luce(f[ROLES].to_numpy().T, K)
        fix.append(pd.DataFrame(p.T, columns=ROLES).assign(item=item, condition=cond, cycle=f.cycle.to_numpy()))
    return pd.concat(fix)


def band(ax, frame, role, cond, label=None):
    g = frame[frame.condition == cond].groupby("cycle")[role]
    m, se = g.mean(), g.sem()
    ax.plot(m.index, m, markevery=8, ms=3, label=label, **STYLE[cond])
    ax.fill_between(m.index, m - se, m + se, color=STYLE[cond]["color"], alpha=0.15, lw=0)
    return m


TITLE = {"archive": "archived parameters", "me86": "M&E (1986) parameters"}
for params in [p for p in ["archive", "me86"] if p in set(everything.params)]:
    d = everything[everything.params == params]
    act = d.pivot_table(index=["item", "condition", "cycle"], columns="role", values="activation")[ROLES].reset_index()
    fix = predicted(act)
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.8))
    for cond in STYLE:
        band(a1, act, "W1", cond, label=cond)
        band(a1, act, "W2", cond)
        band(a2, fix, "W1", cond, label=cond)
        band(a2, fix, "W2", cond)
    for ax, y in [(a1, 0.6), (a2, 1.01)]:
        ax.set_xlabel("Cycle")
        ax.text(80, y, "target (W1)", fontsize=6, ha="center", va="bottom")
    a1.text(64, 0.285, "competitor (W2)", fontsize=6)
    a2.text(70, 0.30, "competitor (W2)", fontsize=6)
    a1.set_ylim(top=0.66)
    a1.set_ylabel("Activation (most active copy)")
    a2.set_ylabel(f"Predicted fixation proportion (Luce, k = {K})")
    a1.set_title(f"A. TRACE activation ({TITLE[params]})")
    a2.set_title("B. Predicted fixations (4 pictures)")
    a2.set_ylim(0, 1.08)
    a2.legend(title="Input", loc="center right", fontsize=6)
    save(fig, FIGURES, "fig04-subcategorical" + ("" if params == "archive" else "-me86"))
    lines.append(f"{TITLE[params]}: means over {d.item.nunique()} items")
    for cond in STYLE:
        a = act[act.condition == cond].groupby("cycle")[["W1", "W2"]].mean()
        p = fix[fix.condition == cond].groupby("cycle")[["W1", "W2"]].mean()
        half = p.index[p.W1 >= 0.5]
        lines.append(
            f"  {cond}: W2 peak activation {a.W2.max():.3f} (cycle {a.W2.idxmax()}), W1 peak {a.W1.max():.3f}, "
            f"W1 at cycle {a.index.max()} {a.W1.iloc[-1]:.3f}; W2 fixation peak {p.W2.max():.3f}; "
            f"W1 fixations reach 0.5 at cycle {half.min() if len(half) else 'never'}, end at {p.W1.iloc[-1]:.3f}"
        )

os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
