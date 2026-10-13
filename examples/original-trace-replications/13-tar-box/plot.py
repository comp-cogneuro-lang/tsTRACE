"""Figures for M&E (1986) Fig. 31: short words need the next word; long words do not.

Reads results/ (from simulate.js) and writes figures/:
  fig31-trace   the state of the Trace at four points for /tarbaks/ (top) and
                /g^tarbaks/ (bottom)
  fig-words     word activations over time for each input: tar, target, guitar
                and box in color, every other word that exceeded 0.1 in light
                gray (each word's most active copy); the dashed line marks the
                cycle at which the /r/ peaks

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
FRAMES = [24, 36, 48, 72]  # cycles shown in the Trace displays (chosen here)
RUNS = {"tarbaks": "tar box", "g^tarbaks": "guitar box"}
KEY = {"tar": ("tar", 5, 0), "targ^t": ("target", 6, 1), "g^tar": ("guitar", 3, 2), "baks": ("box", 7, 3)}

apply_style()
words = pd.read_csv(os.path.join(RESULTS, "words.csv"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))

# --- Fig. 31: the Trace for tar box and guitar box ------------------------------
fig = plt.figure(figsize=(DOUBLE, 5.6))
for sub, run in zip(fig.subfigures(2, 1, hspace=0.08), RUNS):
    trace_panels(sub, snap[snap.run == run], FRAMES, f"-{run}-", title=f"/{run}/, cycle {{cycle}}")
save(fig, FIGURES, "fig31-trace")

# --- word activations over time -------------------------------------------------
fig, axes = plt.subplots(1, 2, figsize=(DOUBLE, 2.6), sharey=True)
for ax, (run, gloss) in zip(axes, RUNS.items()):
    f = words[words.run == run]
    for word, g in f.groupby("word"):
        if word not in KEY:
            ax.plot(g.cycle, g.activation, color="0.85", lw=0.6, zorder=1)
    for word, (label, color, marker) in KEY.items():
        g = f[f.word == word]
        ax.plot(g.cycle, g.activation, color=COLORS[color], marker=MARKERS[marker], markevery=10,
                label=f"{word} ({label})", zorder=3)
    ax.plot([], [], color="0.85", lw=0.6, label="other words")
    model_input = f"-{run}-"
    centers = phoneme_centers(model_input)
    for c in centers[1:-1]:
        ax.axvline(c, color="0.92", lw=0.5, zorder=0)
    ax.axvline(centers[model_input.index("r")], color="0.5", lw=0.6, ls="--")
    ax.axhline(0, color="0.7", lw=0.5)
    ax.set_title(f"/{run}/ ({gloss})")
    ax.set_xlabel("Processing cycle")
axes[0].set_ylabel("Word activation (most active copy)")
axes[0].legend(loc="upper left", fontsize=6)
save(fig, FIGURES, "fig-words")
