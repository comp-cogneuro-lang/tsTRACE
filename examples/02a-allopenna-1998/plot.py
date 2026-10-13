"""Example 2a figures: close replication of Allopenna et al. (1998), Experiment 1.

Reads results/activations.csv (from simulate.js) and writes figures/:
  fig1-activations    mean activation of referent, cohort, rhyme, unrelated
                      (A: raw; B: negative values shown as 0, as in the paper's Fig. 1)
  fig2-predicted      predicted fixation proportions (A: fixed k = 7; B: sigmoid k)
  fig3-pairs          one panel per referent / rhyme pair and direction: the
                      presented word, its rhyme, and the set's unrelated item

The linking hypothesis follows the paper (pp. 424-425):
  1. response strength  S_i = exp(k * a_i), for the four pictured items only
  2. Luce choice        L_i = S_i / sum_j S_j
  3. scaling            Delta_t = max(a at t) / max(a over the trial), using the
                        four pictured items; p_i = Delta_t * L_i (Delta_t is
                        floored at 0, since early activations are negative)
  4. delay              6 cycles of zero probability before the predictions
                        (saccade programming)
  5. time               1 cycle = 11 ms; sampled every 3rd cycle (33 ms frames)
The paper's best fits used a sigmoid k (Eq. 5) whose values were not published;
SIGMOID below gives the values chosen here. Curves are means over the 8 sets,
with +/- 1 standard error.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import json
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
ROLES = ["referent", "cohort", "rhyme", "unrelated"]
MS_PER_CYCLE = 11
DELAY = 6  # cycles
SAMPLE = 3  # cycles per 33-ms frame
K_FIXED = 7
# sigmoid k(t) = C / (1 + exp(-slope * (t - midpoint))), t in cycles.
# NOT from the paper (its values were not reported); chosen here.
SIGMOID = dict(C=15.0, slope=0.15, midpoint=40.0)
STYLE = {
    "referent": dict(color=COLORS[0], marker=MARKERS[0], mfc="white"),
    "cohort": dict(color=COLORS[6], marker=MARKERS[1], mfc="white"),
    "rhyme": dict(color=COLORS[5], marker=MARKERS[2], mfc="white"),
    "unrelated": dict(color="0.55", marker=MARKERS[2], mfc="0.55"),
}

apply_style()
everything = pd.read_csv(os.path.join(RESULTS, "activations.csv"))
d = everything[everything.direction == "forward"]  # Figs. 1-2: the paper's displays
act = d.pivot_table(index=["set", "cycle"], columns="role", values="activation")[ROLES].reset_index()


def band(ax, x, frame, role, **kw):
    """Mean over sets with a +/- 1 SE band."""
    g = frame.groupby(x)[role]
    m, se = g.mean(), g.sem()
    ax.plot(m.index, m, markevery=max(1, len(m) // 15), label=role, **STYLE[role], **kw)
    ax.fill_between(m.index, m - se, m + se, color=STYLE[role]["color"], alpha=0.2, lw=0)


# --- Figure 1: activations ---------------------------------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.6), sharex=True)
clipped = act.copy()
clipped[ROLES] = clipped[ROLES].clip(lower=0)
for ax, frame, title in [(a1, act, "A. Raw activation"), (a2, clipped, "B. Negative values shown as 0 (paper's Fig. 1)")]:
    for role in ROLES:
        band(ax, "cycle", frame, role)
    ax.set_xlabel("Cycle")
    ax.set_title(title)
a1.set_ylabel("Activation (most active copy)")
a1.legend()
save(fig, FIGURES, "fig1-activations")


# --- Figure 2: predicted fixations -----------------------------------------------
def predict(frame, k_of_t):
    """Scaled Luce choice for each set, delayed and sampled as in the paper."""
    out = []
    for s, f in frame.groupby("set"):
        f = f.sort_values("cycle")
        a = f[ROLES].to_numpy()
        t = f.cycle.to_numpy()
        k = k_of_t(t)[:, None]
        strength = np.exp(k * a)
        luce = strength / strength.sum(axis=1, keepdims=True)
        delta = np.clip(a.max(axis=1) / a.max(), 0, None)[:, None]
        p = delta * luce
        p = np.vstack([np.zeros((DELAY, len(ROLES))), p])  # saccade delay
        cycles = np.arange(len(p))
        keep = cycles % SAMPLE == 0
        out.append(pd.DataFrame(p[keep], columns=ROLES).assign(set=s, ms=cycles[keep] * MS_PER_CYCLE))
    return pd.concat(out)


def sigmoid_k(t):
    return SIGMOID["C"] / (1 + np.exp(-SIGMOID["slope"] * (t - SIGMOID["midpoint"])))


fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.6), sharey=True)
for ax, k_of_t, title in [
    (a1, lambda t: np.full(len(t), K_FIXED, dtype=float), f"A. Fixed k = {K_FIXED}"),
    (a2, sigmoid_k, "B. Sigmoid k (C = {C:g}, slope = {slope:g}, midpoint = {midpoint:g}; chosen here)".format(**SIGMOID)),
]:
    p = predict(act, k_of_t)
    for role in ROLES:
        band(ax, "ms", p, role)
    ax.set_xlabel("Time since input onset (ms)")
    ax.set_title(title)
a1.set_ylabel("Predicted fixation proportion")
a1.set_ylim(0, 1)
a1.legend()
save(fig, FIGURES, "fig2-predicted")


# --- Figure 3: each referent / rhyme pair, both directions ---------------------
REST = -0.01  # word resting level
# TRACE transcriptions used in the run (recorded by simulate.js)
with open(os.path.join(RESULTS, "metadata.json")) as fh:
    TRANSCRIPTIONS = json.load(fh)["transcriptions"]
sets = sorted(everything.set.unique())
rows = (len(sets) + 1) // 2
fig, axes = plt.subplots(rows, 4, figsize=(DOUBLE, 1.6 * rows + 0.6), sharex=True, sharey=True,
                         gridspec_kw={"hspace": 0.55})
for i, s in enumerate(sets):
    for j, direction in enumerate(["forward", "reverse"]):
        ax = axes[i // 2, (i % 2) * 2 + j]
        f = everything[(everything.set == s) & (everything.direction == direction)]
        for role, label in [("referent", "presented word"), ("rhyme", "its rhyme"), ("unrelated", "unrelated")]:
            g = f[f.role == role]
            ax.plot(g.cycle, g.activation, color=STYLE[role]["color"], label=label)
        presented = f[f.role == "referent"].word.iloc[0]
        rhyme = f[f.role == "rhyme"].word.iloc[0]
        ax.axhline(REST, color="0.8", lw=0.5, ls="--")
        ph = TRANSCRIPTIONS
        ax.set_title(f"{presented} (rhyme: {rhyme})\n/{ph[presented]}/ vs /{ph[rhyme]}/", fontsize=7)
for ax in axes[-1]:
    ax.set_xlabel("Cycle")
for ax in axes[:, 0]:
    ax.set_ylabel("Activation")
handles, labels = axes[0, 0].get_legend_handles_labels()
fig.legend(handles, labels, loc="upper center", ncol=3, bbox_to_anchor=(0.5, 0.0))
fig.suptitle("Each pair in both directions (dashed: resting level)", y=1.0)
save(fig, FIGURES, "fig3-pairs")
