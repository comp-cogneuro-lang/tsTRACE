"""Figures for Dahan, Magnuson & Tanenhaus (2001), Experiment 1 simulations.

Reads results/activations.csv (from simulate.js) and writes figures/:
  fig05-activations   activation of target, HF cohort, LF cohort and distractor
                      with no frequency, frequency in resting levels, and
                      frequency in connection weights
  fig06-fixations     predicted fixations for the four methods (RDL = basic Luce
                      choice over the four pictures, k = 7): no frequency, rest,
                      weights, and post-activation (S = exp(k a) log10(15 + f))
  fig07-hf-minus-lf   predicted HF - LF cohort fixations over time, all methods
  stats.txt           the HF - LF difference by window, and its onset

Time: 1 cycle = 12.4 ms (the paper's mapping from stimulus duration), sampled in
33.12-ms frames, after the paper's fitted delays (3 frames for no frequency
and rest, 4 for weights, 2 for post-activation). Curves are means over items
+/- 1 SE.

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
from linking import FRAME_MS, luce, to_frames  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 7
POST_C = 15
ROLES = ["target", "HF", "LF", "distractor"]
METHODS = {  # name: (activation method, frequency weights in choice rule?, delay in frames)
    "No frequency": ("none", False, 3),
    "Resting levels": ("rest", False, 3),
    "Connection weights": ("wt", False, 4),
    "Post-activation": ("none", True, 2),
}
N_FRAMES = 31  # 0 to ~1000 ms
STYLE = {
    "target": dict(color=COLORS[0], marker=MARKERS[0]),
    "HF": dict(color=COLORS[6], marker=MARKERS[1]),
    "LF": dict(color=COLORS[5], marker=MARKERS[2]),
    "distractor": dict(color="0.55", marker=MARKERS[3]),
}

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "activations.csv"))
items = sorted(d.item.unique())


def predictions(method):
    """Fixation probabilities per item over frames: array (items, roles, frames)."""
    act_method, post, delay = METHODS[method]
    out = []
    for item in items:
        f = d[(d.method == act_method) & (d.item == item)]
        acts = np.vstack([f[f.role == r].sort_values("cycle").activation for r in ROLES])
        weights = None
        if post:
            weights = [np.log10(POST_C + f[f.role == r].freq.iloc[0]) for r in ROLES]  # Eq. 6
        out.append(to_frames(luce(acts, K, weights), N_FRAMES, delay))
    return np.array(out)


ms = np.arange(N_FRAMES) * FRAME_MS
preds = {m: predictions(m) for m in METHODS}

# --- Fig. 5: activations ----------------------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.4), sharey=True)
for ax, (title, method) in zip(axes, [("No frequency", "none"), ("Resting levels", "rest"), ("Connection weights", "wt")]):
    f = d[d.method == method]
    for role in ROLES:
        g = f[f.role == role].groupby("cycle").activation
        m, se = g.mean(), g.sem()
        ax.plot(m.index, m, markevery=10, label=role, **STYLE[role])
        ax.fill_between(m.index, m - se, m + se, color=STYLE[role]["color"], alpha=0.15, lw=0)
    ax.set_title(title)
    ax.set_xlabel("Cycle")
axes[0].set_ylabel("Activation (most active copy)")
axes[0].legend(fontsize=6)
fig.tight_layout()
save(fig, FIGURES, "fig05-activations")

# --- Fig. 6: predicted fixations -------------------------------------------------
fig, axes = plt.subplots(1, 4, figsize=(DOUBLE, 2.3), sharey=True)
for ax, method in zip(axes, METHODS):
    p = preds[method]
    for r, role in enumerate(ROLES):
        m, se = p[:, r].mean(0), p[:, r].std(0, ddof=1) / np.sqrt(len(items))
        ax.plot(ms, m, markevery=4, label=role, **STYLE[role])
        ax.fill_between(ms, m - se, m + se, color=STYLE[role]["color"], alpha=0.15, lw=0)
    ax.set_title(method, fontsize=7)
    ax.set_xlabel("Time from target onset (ms)")
axes[0].set_ylabel(f"Predicted fixations (Luce, k = {K})")
axes[0].set_ylim(0, 1)
axes[0].legend(fontsize=6)
fig.tight_layout()
save(fig, FIGURES, "fig06-fixations")

# --- Fig. 7: HF - LF ---------------------------------------------------------------
fig, ax = plt.subplots(figsize=(DOUBLE / 2, 2.4))
lines = [f"HF - LF cohort fixations (means over {len(items)} items)"]
for i, method in enumerate(METHODS):
    diff = preds[method][:, 1] - preds[method][:, 2]
    m, se = diff.mean(0), diff.std(0, ddof=1) / np.sqrt(len(items))
    ax.plot(ms, m, color=COLORS[[0, 5, 6, 3][i]], marker=MARKERS[i], markevery=3, label=method)
    ax.fill_between(ms, m - se, m + se, color=COLORS[[0, 5, 6, 3][i]], alpha=0.12, lw=0)
    win = (ms >= 200) & (ms <= 500)
    onset = ms[np.argmax(m > 0.02)] if (m > 0.02).any() else float("nan")
    lines.append(
        f"  {method}: at 0 ms {m[0]:.3f}; mean 200-500 ms {m[win].mean():.3f}; "
        f"mean 0-1000 ms {m.mean():.3f}; peak {m.max():.3f} at {ms[m.argmax()]:.0f} ms; first > .02 at {onset:.0f} ms"
    )
ax.axhline(0, color="0.7", lw=0.5)
ax.set_xlabel("Time from target onset (ms)")
ax.set_ylabel("HF - LF predicted fixations")
ax.legend(fontsize=6)
save(fig, FIGURES, "fig07-hf-minus-lf")

os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
