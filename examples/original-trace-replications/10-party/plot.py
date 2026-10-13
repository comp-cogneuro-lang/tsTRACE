"""Figures for M&E (1986) Figs. 27-28: one long word or two short ones?

Reads results/ (from simulate.js) and writes figures/:
  fig27-trace-party   the state of the Trace at four points while /parti/ comes in
  fig28-final         the state of the Trace at the last cycle for /parti/,
                      /par-ti/, /barti/ and /parki/
  fig-words           activation of the candidate words over time, one panel per
                      input (each word's most active copy; words that never
                      exceed 0.1 are left out)

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
FRAMES = [24, 42, 60, 99]  # cycles shown for /parti/ (chosen here)
RUNS = {"parti": "-parti-", "par-ti": "-par-ti-", "barti": "-barti-", "parki": "-parki-"}
GLOSS = {"parti": "party", "par": "par", "ti": "tea", "bar": "bar", "art": "art",
         "park": "park", "ki": "key", "part": "part"}
STYLE = {w: dict(color=COLORS[[5, 6, 3, 1, 0, 7, 2, 4][i]], marker=MARKERS[i]) for i, w in enumerate(GLOSS)}

apply_style()
words = pd.read_csv(os.path.join(RESULTS, "words.csv"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))
last_snap = snap.cycle.max()

# --- Fig. 27: the Trace while /parti/ comes in -------------------------------
fig = plt.figure(figsize=(DOUBLE, 2.8))
trace_panels(fig, snap[snap.run == "parti"], FRAMES, "-parti-")
fig.suptitle("Input /parti/ (party, or par + tea)", y=1.02)
save(fig, FIGURES, "fig27-trace-party")

# --- Fig. 28: the final state for each input ---------------------------------
fig = plt.figure(figsize=(DOUBLE, 2.8))
for sub, (run, model_input) in zip(fig.subfigures(1, 4, wspace=0.02), RUNS.items()):
    axes = trace_panels(sub, snap[snap.run == run], [last_snap], model_input, title=f"/{run}/, cycle {{cycle}}")
    if run != "parti":
        axes[0, 0].set_ylabel("")
        axes[1, 0].set_ylabel("")
save(fig, FIGURES, "fig28-final")

# --- word activations over time -----------------------------------------------
fig, axes = plt.subplots(2, 2, figsize=(DOUBLE, 4.4), sharex=True, sharey=True)
for ax, (run, model_input) in zip(axes.flat, RUNS.items()):
    f = words[words.run == run]
    for word, g in f.groupby("word", sort=False):
        if g.activation.max() > 0.1:
            ax.plot(g.cycle, g.activation, markevery=10, label=f"{word} ({GLOSS[word]})", **STYLE[word])
    for c in phoneme_centers(model_input)[1:-1]:
        ax.axvline(c, color="0.85", lw=0.5, zorder=0)
    ax.axhline(0, color="0.7", lw=0.5)
    ax.set_title(f"/{run}/")
    ax.legend(loc="upper left", fontsize=6)
for ax in axes[1]:
    ax.set_xlabel("Processing cycle")
fig.supylabel("Word activation (most active copy)", fontsize=8)
save(fig, FIGURES, "fig-words")
