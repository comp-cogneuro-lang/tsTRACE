"""Figures for M&E (1986) p. 62: recognizing every word in the lexicon.

Reads results/ (from simulate.js) and writes figures/:
  fig1-recognition   A: cumulative proportion of words that lead every other
                        word for good, over cycles since the word's last
                        phoneme peaked (dashed: the readout used for accuracy)
                     B: lead cycle relative to the last phoneme's peak, by word
                        length (dots: words; line: mean +/- 1 SE)
  fig2-timecourse    mean activation of the target and of the strongest other
                     word, aligned on the last phoneme's peak, by word length
                     (+/- 1 SE)
  stats.txt          accuracy at the readout and at the last cycle, the
                     misses, and lead times by length

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
AFTER_OFFSET = 12  # readout used by simulate.js
GROUPS = [(2, "2"), (3, "3"), (4, "4"), (5, "5"), (6, "6+")]  # length groups for Fig. 2

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "words.csv"))
d["since"] = d.lead_cycle - d.offset_peak
t = pd.read_csv(os.path.join(RESULTS, "timecourse.csv.gz"))
t["since"] = t.cycle - t.offset_peak
t["group"] = t.length.clip(upper=6)

# --- Fig. 1: when is each word recognized? ---------------------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.6))
x = np.arange(int(np.nanmin(d.since)) - 2, int(np.nanmax(d.since)) + 6)
a1.step(x, [(d.since <= v).mean() for v in x], where="post", color=COLORS[5])
a1.axvline(0, color="0.85", lw=0.5)
a1.axvline(AFTER_OFFSET, color="0.4", lw=0.8, ls="--", label=f"readout ({AFTER_OFFSET} cycles after)")
a1.set_xlabel("Cycles since the word's last phoneme peaked")
a1.set_ylabel("Proportion of words leading for good")
a1.set_ylim(0, 1.03)
a1.set_title(f"A. Recognition over time ({len(d)} words)")
a1.legend(loc="upper left")

rng = np.random.default_rng(1)
a2.scatter(d.length + rng.uniform(-0.2, 0.2, len(d)), d.since, s=4, color="0.6", lw=0)
g = d.groupby("length").since
m, se = g.mean(), g.sem()
a2.errorbar(m.index, m, yerr=se, color=COLORS[6], marker=MARKERS[0], capsize=2)
a2.axhline(0, color="0.85", lw=0.5)
a2.set_xlabel("Word length (phonemes)")
a2.set_ylabel("Lead cycle - last phoneme's peak")
a2.set_title("B. Recognition point relative to word offset")
save(fig, FIGURES, "fig1-recognition")

# --- Fig. 2: target vs strongest competitor, by length ------------------------------
fig, ax = plt.subplots(figsize=(DOUBLE / 1.6, 2.6))
for i, (group, label) in enumerate(GROUPS):
    f = t[t.group == group]
    if f.empty:
        continue
    n = f.word.nunique()
    for col, ls, lab in [("target", "-", f"{label} phonemes (n = {n})"), ("best_other", ":", None)]:
        s = f.groupby("since")[col]
        mm, ss = s.mean(), s.sem()
        ax.plot(mm.index, mm, color=COLORS[[0, 5, 6, 3, 7][i]], ls=ls, label=lab)
        ax.fill_between(mm.index, mm - ss, mm + ss, color=COLORS[[0, 5, 6, 3, 7][i]], alpha=0.15, lw=0)
ax.axvline(0, color="0.85", lw=0.5)
ax.set_xlim(-50, t.cycle.max() - t.offset_peak.max())  # the window every word covers
ax.set_xlabel("Cycles since the word's last phoneme peaked")
ax.set_ylabel("Activation (most active copy)")
ax.set_title("Target (solid) vs strongest other word (dotted)")
ax.legend(title="Word length", loc="upper left", fontsize=6)
save(fig, FIGURES, "fig2-timecourse")

# --- stats ---------------------------------------------------------------------
miss = d[d.correct_readout == 0]
lines = [
    f"Words: {len(d)}",
    f"Correct at readout ({AFTER_OFFSET} cycles after the last phoneme's peak): "
    f"{d.correct_readout.sum()}/{len(d)} ({d.correct_readout.mean():.1%})",
    f"Correct at the last cycle: {d.correct_final.sum()}/{len(d)}",
    f"Words that never lead for good: {d.lead_cycle.isna().sum()}",
    f"Lead cycle relative to the last phoneme's peak: mean {d.since.mean():.2f} (SE {d.since.sem():.2f}), "
    f"median {d.since.median():.0f}, range {d.since.min():.0f} to {d.since.max():.0f}; "
    f"{(d.since < 0).sum()} words lead before their last phoneme peaks",
    "Misses at the readout (word: stronger word at readout, lead cycle relative to offset):",
]
lines += [f"  /{r.word}/: /{r.competitor_readout}/, +{r.since:.0f}" for r in miss.itertuples()]
lines.append("By length: n, proportion correct at readout, mean (SE) lead relative to offset")
for length, f in d.groupby("length"):
    lines.append(f"  {length}: {len(f)}, {f.correct_readout.mean():.2f}, {f.since.mean():.2f} ({f.since.sem():.2f})")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
