"""Figures for M&E (1986) Fig. 32: segmenting "she shut a box".

Reads results/ (from simulate.js) and writes figures/:
  fig32-trace   the state of the Trace at four points while /SiS^t^baks/ comes in
  fig-words     word activations over time: the four words of the parse in
                color, every other word that exceeded 0.1 in light gray (each
                word's most active copy; "a" only from copies at the article's
                slot); vertical lines mark where each input phoneme peaks

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, SINGLE, apply_style, save  # noqa: E402
from trace_display import phoneme_centers, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
INPUT = "-SiS^t^baks-"
FRAMES = [36, 54, 72, 108]  # cycles shown in the Trace displays (chosen here)
PARSE = {"Si": ("she", 5, 0), "S^t": ("shut", 6, 1), "^": ("a", 3, 2), "baks": ("box", 7, 3)}

apply_style()
words = pd.read_csv(os.path.join(RESULTS, "words.csv"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))

# --- Fig. 32: the Trace while "she shut a box" comes in ---------------------------
fig = plt.figure(figsize=(DOUBLE, 2.8))
trace_panels(fig, snap, FRAMES, INPUT, max_words=9)  # room for "a" beside the silence units
fig.suptitle('Input /SiS^t^baks/ ("she shut a box")', y=1.02)
save(fig, FIGURES, "fig32-trace")

# --- word activations over time -------------------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE * 1.3, 2.6))
for word, g in words.groupby("word"):
    if word not in PARSE:
        ax.plot(g.cycle, g.activation, color="0.85", lw=0.6, zorder=1)
for word, (gloss, color, marker) in PARSE.items():
    g = words[words.word == word]
    ax.plot(g.cycle, g.activation, color=COLORS[color], marker=MARKERS[marker], markevery=10,
            label=f"{word} ({gloss})", zorder=3)
ax.plot([], [], color="0.85", lw=0.6, label="other words")
for c in phoneme_centers(INPUT)[1:-1]:
    ax.axvline(c, color="0.92", lw=0.5, zorder=0)
ax.axhline(0, color="0.7", lw=0.5)
ax.set_xlabel("Processing cycle")
ax.set_ylabel("Word activation (most active copy)")
ax.legend(loc="upper left", fontsize=6)
save(fig, FIGURES, "fig-words")
