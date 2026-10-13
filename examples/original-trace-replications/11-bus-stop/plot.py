"""Figures for M&E (1986) Fig. 29: overlapping parses are not suppressed.

Reads results/ (from simulate.js) and writes figures/:
  fig29-final   the state of the Trace at the last cycle for /b^stap/ and /br^Sap/
  fig-words     word activations over time for each input: the words of the
                possible parses in color, every other word that exceeded 0.1
                in light gray (each word's most active copy)

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
RUNS = {"b^stap": "-b^stap-", "br^Sap": "-br^Sap-"}
# words of the candidate parses: word -> (gloss, color, marker)
PARSE_WORDS = {
    "b^stap": {"b^s": ("bus", 5, 0), "stap": ("stop", 6, 1), "tap": ("top", 3, 2)},
    "br^Sap": {"br^S": ("brush", 5, 0), "Sap": ("shop", 6, 1)},
}
TITLES = {"b^stap": '/b^stap/ ("bus stop" or "bus top")', "br^Sap": '/br^Sap/ ("brush shop")'}

apply_style()
words = pd.read_csv(os.path.join(RESULTS, "words.csv"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))
last = snap.cycle.max()

# --- Fig. 29: final state of the Trace -----------------------------------------
fig = plt.figure(figsize=(DOUBLE, 2.8))
for k, (sub, (run, model_input)) in enumerate(zip(fig.subfigures(1, 2, wspace=0.04), RUNS.items())):
    axes = trace_panels(sub, snap[snap.run == run], [last], model_input, title=f"{TITLES[run]}, cycle {{cycle}}")
    if k:
        axes[0, 0].set_ylabel("")
        axes[1, 0].set_ylabel("")
save(fig, FIGURES, "fig29-final")

# --- word activations over time -------------------------------------------------
fig, axes = plt.subplots(1, 2, figsize=(DOUBLE, 2.6), sharey=True)
for ax, (run, model_input) in zip(axes, RUNS.items()):
    f = words[words.run == run]
    for word, g in f.groupby("word"):
        if word not in PARSE_WORDS[run]:
            ax.plot(g.cycle, g.activation, color="0.85", lw=0.6, zorder=1)
    for word, (gloss, color, marker) in PARSE_WORDS[run].items():
        g = f[f.word == word]
        ax.plot(g.cycle, g.activation, color=COLORS[color], marker=MARKERS[marker], markevery=10,
                label=f"{word} ({gloss})", zorder=3)
    ax.plot([], [], color="0.85", lw=0.6, label="other words")
    for c in phoneme_centers(model_input)[1:-1]:
        ax.axvline(c, color="0.9", lw=0.5, zorder=0)
    ax.axhline(0, color="0.7", lw=0.5)
    ax.set_title(TITLES[run])
    ax.set_xlabel("Processing cycle")
    ax.legend(loc="upper left", fontsize=6)
axes[0].set_ylabel("Word activation (most active copy)")
save(fig, FIGURES, "fig-words")
