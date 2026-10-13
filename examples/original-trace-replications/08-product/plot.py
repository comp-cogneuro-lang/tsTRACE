"""Figures for M&E (1986) Figs. 25-26: the time course of recognizing "product".

Reads results/ (from simulate.js) and writes figures/:
  fig25-trace        the state of the Trace at four points while /prad^kt/ comes in
  fig26-relative     response strength of trot, possible, priest, progress, and
                     produce relative to product:
                     A: over processing cycles (vertical lines: phoneme peaks)
                     B: over cycles since each word's first mismatching phoneme
                        peaked (the alignment in M&E's caption)
  stats.txt          for each word, the cycle at which its relative strength
                     falls below 0.5 for good, and how long after its
                     mismatching phoneme's peak that is

Following M&E (p. 58), product's response strength is set to 1 at every
cycle and each other word is plotted as the ratio of its strength to
product's. Strength is exp(k a) with M&E's k = 10, so the ratio is
exp(k (a_word - a_product)).

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402
from trace_display import K_ME, phoneme_centers, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
INPUT = "-prad^kt-"
FRAMES = [24, 36, 48, 66]  # cycles shown in the Trace display (chosen here)
DROPOUT = 0.5  # relative strength below which a word counts as out of contention (chosen here)
GLOSS = {"trat": "trot", "pas^b^l": "possible", "prist": "priest", "pragr^s": "progress", "pradus": "produce"}

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "words.csv"))
act = d.pivot_table(index="cycle", columns="word", values="activation")
ratio = np.exp(K_ME * act.sub(act["prad^kt"], axis=0))
mismatch_peak = d.dropna(subset=["mismatch_peak"]).groupby("word").mismatch_peak.first()
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))

# --- Fig. 25: the Trace while /prad^kt/ comes in --------------------------------
fig = plt.figure(figsize=(DOUBLE, 2.8))
trace_panels(fig, snap, FRAMES, INPUT, word_ylim=(0, 1.0))
fig.suptitle("Input /prad^kt/ (product)", y=1.02)
save(fig, FIGURES, "fig25-trace")

# --- Fig. 26: strength relative to product ---------------------------------------
lines = [f"Relative strength (k = {K_ME}) falls below {DROPOUT} for good at cycle:"]
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.6), sharey=True)
a1.axhline(1, color="0.3", lw=1.0, label="/prad^kt/ (product) = 1")
for i, (word, gloss) in enumerate(GLOSS.items()):
    style = dict(color=COLORS[[5, 6, 3, 7, 2][i]], marker=MARKERS[i], markevery=6)
    r = ratio[word]
    a1.plot(r.index, r, label=f"/{word}/ ({gloss}), mismatch at phoneme {i + 1}", **style)
    a2.plot(r.index - mismatch_peak[word], r, **style)
    above = r.index[r >= DROPOUT]
    out = int(above.max()) + 1 if len(above) and above.max() < r.index.max() else None
    if out is not None:
        lines.append(f"  /{word}/ ({gloss}): cycle {out}, {out - int(mismatch_peak[word])} cycles after its mismatch peaked")
for x, ph in zip(phoneme_centers(INPUT)[1:-1], INPUT[1:-1]):
    a1.axvline(x, color="0.85", lw=0.5, zorder=0)
    a1.text(x, 1.0, ph, transform=a1.get_xaxis_transform(), ha="center", va="bottom", fontsize=7)
a2.axhline(1, color="0.3", lw=1.0)
a2.axvline(0, color="0.6", lw=0.5, ls="--")
a1.set_xlabel("Processing cycle")
a2.set_xlabel("Cycles since the first mismatching phoneme peaked")
a1.set_ylabel(f"Strength relative to product (k = {K_ME})")
a1.set_title("A. Over time (input phonemes at their peaks)", pad=12)
a2.set_title("B. Aligned on each word's mismatch (M&E Fig. 26)", pad=12)
fig.legend(*a1.get_legend_handles_labels(), loc="upper center", bbox_to_anchor=(0.5, -0.04), ncol=3, fontsize=6)
save(fig, FIGURES, "fig26-relative")

lines.append(f"/pradus/ (produce) is ahead of product (ratio > 1) at cycles "
             f"{int(ratio.index[ratio['pradus'] > 1].min())}-{int(ratio.index[ratio['pradus'] > 1].max())}; "
             f"peak ratio {ratio['pradus'].max():.2f} at cycle {int(ratio['pradus'].idxmax())}")
lines.append(f"/prist/ (priest) peak ratio {ratio['prist'].max():.2f} at cycle {int(ratio['prist'].idxmax())}")
lines.append(f"product's final activation: {act['prad^kt'].iloc[-1]:.2f}")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
