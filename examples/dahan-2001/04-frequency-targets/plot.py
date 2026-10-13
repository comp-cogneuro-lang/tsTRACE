"""Figures for Dahan, Magnuson & Tanenhaus (2001), Experiment 2 simulations.

Reads results/activations.csv (from simulate.js) and writes figures/:
  fig09-activations  HF and LF target activation with no frequency, frequency in
                     resting levels, and frequency in connection weights
  fig10-rdl          predicted target fixations, HF vs LF, basic Luce choice
                     (k = 7) over target + 3 distractors, four methods
  fig11-amt          the same with Allopenna et al.'s scaling (AMT)
  fig12-hf-minus-lf  HF - LF target fixations for all eight methods
  stats.txt          HF - LF differences by window, and when target fixations reach 0.5

Methods (pp. 335-339, 349-351):
  RDL none / rest / wt  Luce choice on the activations of each method
  RDL post              Luce choice with S = exp(k a) log10(15 + f) on 'none' activations
  AMT x                 the RDL probabilities scaled by Delta_t = max a(t) / max a over
                        the four pictures (Eq. 7). The paper says it multiplied
                        response strengths by Delta; a factor common to all four
                        strengths would cancel, so here (as in Allopenna et al., 1998)
                        the probabilities are scaled.
  AMT post              scaled by Eq. 8: Delta_i = (max a(t) + f_i^4) / (max a + f_i^4),
                        f_i = log10(15 + frequency)
Time mapping and delays as in example 03 (12.4 ms/cycle; delays 3, 3, 4, 2
frames for none, rest, wt, post). Means over pairs +/- 1 SE.

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
from linking import FRAME_MS, amt_scale, luce, to_frames  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 7
POST_C = 15
ROLES = ["target", "D1", "D2", "D3"]
METHODS = {"none": ("none", False, 3), "rest": ("rest", False, 3), "wt": ("wt", False, 4), "post": ("none", True, 2)}
TITLES = {"none": "No frequency", "rest": "Resting levels", "wt": "Connection weights", "post": "Post-activation"}
N_FRAMES = 31
STYLE = {"HF": dict(color=COLORS[6], marker=MARKERS[1]), "LF": dict(color=COLORS[5], marker=MARKERS[2])}

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "activations.csv"))
pairs = sorted(d.pair.unique())
ms = np.arange(N_FRAMES) * FRAME_MS


def target_fixations(method, scaled):
    """Predicted target fixations over frames: dict type -> array (pairs, frames)."""
    act_method, post, delay = METHODS[method]
    out = {"HF": [], "LF": []}
    for pair in pairs:
        for typ in out:
            f = d[(d.method == act_method) & (d.pair == pair) & (d.type == typ)]
            acts = np.vstack([f[f.role == r].sort_values("cycle").activation for r in ROLES])
            logf = np.array([np.log10(POST_C + f[f.role == r].freq.iloc[0]) for r in ROLES])
            p = luce(acts, K, logf if post else None)
            if scaled:
                p = p * amt_scale(acts, logf**4 if post else None)
            out[typ].append(to_frames(p, N_FRAMES, delay)[0])
    return {k: np.array(v) for k, v in out.items()}


preds = {(m, s): target_fixations(m, s) for m in METHODS for s in (False, True)}


def mean_se(x):
    return x.mean(0), x.std(0, ddof=1) / np.sqrt(len(x))


# --- Fig. 9: activations -------------------------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.4), sharey=True)
for ax, method in zip(axes, ["none", "rest", "wt"]):
    f = d[(d.method == method) & (d.role == "target")]
    for typ, style in STYLE.items():
        g = f[f.type == typ].groupby("cycle").activation
        m, se = g.mean(), g.sem()
        ax.plot(m.index, m, markevery=10, label=f"{typ} target", **style)
        ax.fill_between(m.index, m - se, m + se, color=style["color"], alpha=0.15, lw=0)
    ax.set_title(TITLES[method])
    ax.set_xlabel("Cycle")
axes[0].set_ylabel("Target activation (most active copy)")
axes[0].legend(fontsize=6)
fig.tight_layout()
save(fig, FIGURES, "fig09-activations")

# --- Figs. 10-11: target fixations ------------------------------------------------
for scaled, name, label in [(False, "fig10-rdl", "RDL"), (True, "fig11-amt", "AMT")]:
    fig, axes = plt.subplots(1, 4, figsize=(DOUBLE, 2.3), sharey=True)
    for ax, method in zip(axes, METHODS):
        for typ, style in STYLE.items():
            m, se = mean_se(preds[(method, scaled)][typ])
            ax.plot(ms, m, markevery=4, label=f"{typ} target", **style)
            ax.fill_between(ms, m - se, m + se, color=style["color"], alpha=0.15, lw=0)
        ax.set_title(f"{label}: {TITLES[method]}", fontsize=7)
        ax.set_xlabel("Time from target onset (ms)")
    axes[0].set_ylabel("Predicted target fixations")
    axes[0].set_ylim(0, 1)
    axes[0].legend(fontsize=6)
    fig.tight_layout()
    save(fig, FIGURES, name)

# --- Fig. 12: HF - LF ----------------------------------------------------------------
fig, axes = plt.subplots(1, 2, figsize=(DOUBLE, 2.4), sharey=True)
lines = [f"HF - LF target fixations (means over {len(pairs)} pairs)"]
for ax, scaled, label in [(axes[0], False, "RDL"), (axes[1], True, "AMT")]:
    for i, method in enumerate(METHODS):
        diff = preds[(method, scaled)]["HF"] - preds[(method, scaled)]["LF"]
        m, se = mean_se(diff)
        color = COLORS[[0, 5, 6, 3][i]]
        ax.plot(ms, m, color=color, marker=MARKERS[i], markevery=3, label=TITLES[method])
        ax.fill_between(ms, m - se, m + se, color=color, alpha=0.12, lw=0)
        win = (ms >= 200) & (ms <= 1000)
        hf, lf = preds[(method, scaled)]["HF"].mean(0), preds[(method, scaled)]["LF"].mean(0)
        reach = [ms[np.argmax(x >= 0.5)] if (x >= 0.5).any() else float("nan") for x in (hf, lf)]
        lines.append(
            f"  {label} {method}: at 0 ms {m[0]:.3f}; mean 200-1000 ms {m[win].mean():.3f}; peak {m.max():.3f} "
            f"at {ms[m.argmax()]:.0f} ms; target fixations reach 0.5 at {reach[0]:.0f} ms (HF), {reach[1]:.0f} ms (LF)"
        )
    ax.axhline(0, color="0.7", lw=0.5)
    ax.set_title(label)
    ax.set_xlabel("Time from target onset (ms)")
axes[0].set_ylabel("HF - LF predicted target fixations")
axes[0].legend(fontsize=6)
fig.tight_layout()
save(fig, FIGURES, "fig12-hf-minus-lf")

os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
