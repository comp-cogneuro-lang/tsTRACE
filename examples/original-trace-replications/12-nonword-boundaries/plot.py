"""Figures for M&E (1986) Fig. 30: word ends mark boundaries; nonword ends do not.

Reads results/ (from simulate.js) and writes figures/:
  fig30-trace     the state of the Trace at three points for "possible target"
                  (top) and "pagusle target" (bottom), as in M&E's Fig. 30
  fig-boundary    for each stream: "target", "possible" (word stream only), and
                  the most active other word that straddles the boundary before
                  the /t/ of "target"; the dashed line marks the cycle at which
                  that /t/'s features peak

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402
from trace_display import phoneme_centers, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
FRAMES = [45, 57, 99]  # before, just after, and well after the /t/ peaks (chosen here)
T_CENTER = 54  # cycle at which the /t/ of "target" (input position 8) peaks
RUNS = {
    "pas^b^ltarg^t": "possible target",
    "pag^s^ltarg^t": "pagusle target (M&E)",
    "piSd^rptarg^t": "piSd^rp target (jTRACE gallery)",
}

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "boundary.csv"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))

# --- Fig. 30: the Trace for a word and a nonword before "target" ---------------
fig = plt.figure(figsize=(DOUBLE, 5.6))
for sub, run in zip(fig.subfigures(2, 1, hspace=0.08), ["pas^b^ltarg^t", "pag^s^ltarg^t"]):
    trace_panels(sub, snap[snap.run == run], FRAMES, f"-{run}-", title=f"/{run}/, cycle {{cycle}}")
save(fig, FIGURES, "fig30-trace")

# --- boundary measures over time --------------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.6), sharey=True)
for ax, (run, title) in zip(axes, RUNS.items()):
    f = d[d.run == run]
    ax.plot(f.cycle, f.target, color=COLORS[5], marker=MARKERS[0], markevery=10, label="target")
    if f["first"].notna().any():
        ax.plot(f.cycle, f["first"], color=COLORS[3], marker=MARKERS[1], markevery=10, label="possible")
    ax.plot(f.cycle, f.straddler, color=COLORS[6], marker=MARKERS[2], markevery=10, label="best straddling word")
    # name the straddling word at the /t/'s peak
    at = f[f.cycle == T_CENTER]
    if len(at):
        ax.annotate(f"/{at.straddler_word.iloc[0]}/", (T_CENTER, at.straddler.iloc[0]), xytext=(4, 6),
                    textcoords="offset points", fontsize=6, color=COLORS[6])
    for c in phoneme_centers(f"-{run}-")[1:-1]:
        ax.axvline(c, color="0.92", lw=0.5, zorder=0)
    ax.axvline(T_CENTER, color="0.5", lw=0.6, ls="--")
    ax.axhline(0, color="0.7", lw=0.5)
    ax.set_title(title)
    ax.set_xlabel("Processing cycle")
axes[0].set_ylabel("Word activation")
axes[0].legend(loc="upper left", fontsize=6)
save(fig, FIGURES, "fig-boundary")
