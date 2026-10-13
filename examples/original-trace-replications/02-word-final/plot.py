"""Figures for M&E (1986) Fig. 8: lexical effects on word-final segments.

Reads results/ (from simulate.js) and writes figures/:
  fig08-trace-target  the state of the Trace at four points while /targ^?/
                      (? = midway between /t/ and /d/) comes in
  fig-final-vs-initial
                      A: P(word-consistent) - P(inconsistent) phoneme, over
                         cycles since the ambiguous segment's center; mean of
                         the word-final and of the word-initial items, +/- 1 SE
                      B: the same for each item

P is the Luce choice over all phoneme units at the segment's slot, with M&E's
exponent k = 10. The shaded region in A is after Fox's (1982) 500-ms deadline
(M&E: 25 ms per cycle).

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402
from trace_display import K_ME, luce, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
FRAMES = [42, 48, 54, 66]  # cycles shown in the Trace display (the segment peaks at 42)
MS_PER_CYCLE = 25
DEADLINE_MS = 500
STYLE = {
    "final": dict(color=COLORS[5], marker=MARKERS[0], label="word-final"),
    "initial": dict(color=COLORS[6], marker=MARKERS[1], label="word-initial"),
}

apply_style()
d = luce(pd.read_csv(os.path.join(RESULTS, "phonemes.csv")))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))

# lexical effect: P(phoneme the word calls for) - P(the other endpoint)
cons = d[d.phoneme == d.consistent].set_index(["run", "cycle"])
incons = d[d.phoneme == d.inconsistent].set_index(["run", "cycle"])
effect = cons[["position", "center"]].assign(effect=cons.p - incons.p).reset_index()
effect["since"] = effect.cycle - effect.center
# keep the window every item covers (the latest segment peaks at cycle 42)
effect = effect[(effect.since >= -12) & (effect.since <= effect.cycle.max() - effect.center.max())]

# --- Fig. 8: the Trace while /targ^?/ comes in ----------------------------------
fig = plt.figure(figsize=(DOUBLE, 2.8))
trace_panels(fig, snap, FRAMES, "-targ^1-")
fig.suptitle("Input /targ^?/ (? = midway between /t/ and /d/)", y=1.02)
save(fig, FIGURES, "fig08-trace-target")

# --- Final vs initial ---------------------------------------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.6), sharey=True)
for where, style in STYLE.items():
    g = effect[effect.position == where].groupby("since").effect
    m, se = g.mean(), g.sem()
    n = effect[effect.position == where].run.nunique()
    a1.plot(m.index, m, markevery=6, **{**style, "label": f"{style['label']} ({n} items)"})
    a1.fill_between(m.index, m - se, m + se, color=style["color"], alpha=0.2, lw=0)
    for run, x in effect[effect.position == where].groupby("run"):
        a2.plot(x.since, x.effect, color=style["color"], lw=0.8, alpha=0.8)
# label each item at its line's end, nudged apart so labels don't overlap
ends = effect[effect.since == effect.since.max()].sort_values("effect")
y_prev = -1.0
for r in ends.itertuples():
    y = max(r.effect, y_prev + 0.05)
    a2.text(r.since + 1, y, f"/{r.run}/", fontsize=5, color=STYLE[r.position]["color"], va="center")
    y_prev = y
a1.axvspan(DEADLINE_MS / MS_PER_CYCLE, effect.since.max(), color="0.94", lw=0, zorder=-1)
a1.text(DEADLINE_MS / MS_PER_CYCLE + 1, -0.15, f"after Fox's {DEADLINE_MS}-ms deadline", fontsize=6, color="0.4")
for ax in (a1, a2):
    ax.axhline(0, color="0.7", lw=0.5)
    ax.axvline(0, color="0.85", lw=0.5, zorder=0)
    ax.set_xlabel("Cycles since the ambiguous segment's center")
a1.set_ylabel(f"P(consistent) - P(inconsistent)  (k = {K_ME})")
a1.set_title("A. Mean over items (+/- 1 SE)")
a2.set_title("B. Each item")
a1.legend(loc="upper left")
a2.set_xlim(right=effect.since.max() + 10)
save(fig, FIGURES, "fig-final-vs-initial")
