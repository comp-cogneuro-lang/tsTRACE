"""Example 4 figures: phoneme restoration in "luxury".

Reads results/ (from simulate.js) and writes figures/:
  fig1-inputs      the input with /l/'s span replaced by zeros or noise
  fig2-replaced    activation of the replaced phoneme in each condition
  fig3-rivals      all phonemes at the replaced slot, true silence vs 1.0 noise

Time is plotted from word onset (cycle minus 6: the leading silence phoneme
takes the first 6 input slices).

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
ONSET = 6
FEATURES = ["POW", "VOC", "DIF", "ACU", "GRD", "VOI", "BUR"]
POSITIONS = ["initial", "medial", "final"]
CONDITIONS = {
    "intact": ("Intact", dict(color="black", marker="^", mfc="white")),
    "silence-phoneme": ("Silence phoneme", dict(color="0.5", marker="v", mfc="white")),
    "noise-0.0": ("0.0 noise (true silence)", dict(color=COLORS[5], marker="o", mfc="white")),
    "noise-0.2": ("0.2 noise", dict(color="#FDB863", marker="o")),
    "noise-0.6": ("0.6 noise", dict(color="#E66101", marker="s")),
    "noise-1.0": ("1.0 noise", dict(color="#8E0152", marker="^")),
}

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "phonemes.csv"), keep_default_na=False)
PHONEMES = list(d.columns[d.columns.get_loc("cycle") + 1 :])  # unit labels
d["time"] = d.cycle - ONSET
d = d[d.time >= 0]
inputs = pd.read_csv(os.path.join(RESULTS, "inputs.csv"))

# --- Figure 1: input matrices ---------------------------------------------------
fig, axes = plt.subplots(2, 2, figsize=(DOUBLE, 4.8), sharey=True, gridspec_kw={"hspace": 0.35})
for ax, cond in zip(axes.flat, ["noise-0.0", "noise-0.2", "noise-0.6", "noise-1.0"]):
    m = np.zeros((63, 99))
    f = inputs[inputs.condition == cond]
    m[f.unit, f.slice] = f.value
    ax.imshow(m, aspect="auto", cmap="Greys", vmin=0, vmax=1, interpolation="nearest")
    for b in range(1, 7):
        ax.axhline(b * 9 - 0.5, color="0.6", lw=0.4, ls="--")
    ax.set_xticks([6 * (k + 1) for k in range(9)])
    ax.set_xticklabels(["-", "#", "^", "k", "S", "^", "r", "i", "-"])
    ax.set_yticks([f * 9 + 4 for f in range(7)])
    ax.set_yticklabels(FEATURES)
    ax.set_xlim(0, 60)
    ax.set_title(f"Noise = {cond[-3:]}")
save(fig, FIGURES, "fig1-inputs")

# --- Figure 2: the replaced phoneme -------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.4), sharey=True)
for ax, pos in zip(axes, POSITIONS):
    f = d[d.position == pos]
    replaced = f.replaced.iloc[0]
    for cond, (label, style) in CONDITIONS.items():
        s = f[f.condition == cond]
        ax.plot(s.time, s[replaced], markevery=4, label=label, **style)
    ax.set_title(f"{pos.capitalize()} (/{replaced}/)")
    ax.set_xlabel("Time since word onset (cycles)")
axes[0].set_ylabel("Replaced phoneme activation")
handles, labels = axes[0].get_legend_handles_labels()
fig.legend(handles, labels, title="Replacement", loc="upper center", ncol=6, bbox_to_anchor=(0.5, 0.0))
save(fig, FIGURES, "fig2-replaced")

# --- Figure 3: which phonemes compete? ------------------------------------------
fig, axes = plt.subplots(2, 3, figsize=(DOUBLE, 3.8), sharex=True, sharey="row")
real = [p for p in PHONEMES if p != "-"]
for row, cond in enumerate(["noise-0.0", "noise-1.0"]):
    for col, pos in enumerate(POSITIONS):
        ax = axes[row, col]
        f = d[(d.position == pos) & (d.condition == cond)]
        replaced = f.replaced.iloc[0]
        for p in real:
            if p != replaced:
                ax.plot(f.time, f[p], color="0.75", lw=0.6)
        ax.plot(f.time, f[replaced], color="black", lw=1.4)
        # label the replaced phoneme and the strongest rivals at their peaks
        peaks = f[real].max().sort_values(ascending=False)
        rivals = [q for q in peaks.index if q != replaced and peaks[q] > -0.095][:3]
        for p in [replaced] + rivals:
            t = f.time.iloc[f[p].to_numpy().argmax()]
            ax.annotate(p, (t, f[p].max()), xytext=(0, 2), textcoords="offset points", ha="center",
                        fontsize=7, fontweight="bold" if p == replaced else "normal")
        ax.set_title(f"Noise {cond[-3:]}, {pos}")
        if col == 0:
            ax.set_ylabel("Activation")
        if row == 1:
            ax.set_xlabel("Time since word onset (cycles)")
fig.suptitle("All phonemes at the replaced slot (black: replaced phoneme)", y=1.01)
save(fig, FIGURES, "fig3-rivals")
