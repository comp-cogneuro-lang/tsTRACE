"""Figures for M&E (1986) Figs. 9-11: lexical effects on monitoring times.

Reads results/ (from simulate.js) and writes figures/:
  fig09-trace         the state of the Trace at three points for /targ^t/ (top)
                      and the nonword /tr^g^s/ (bottom)
  fig10-11-response   P(/t/) over cycles:
                      A (M&E Fig. 10): word-initial /t/, target vs trugus
                      B (M&E Fig. 11): word-final /t/, secret vs guldut
                      with M&E's 0.9 response criterion and the cycle at which
                      each run reaches it
  stats.txt           those criterion cycles

P(/t/) is the Luce choice over all phoneme units at the /t/'s slot, with M&E's
exponent k = 10. Vertical lines mark the cycles at which each input phoneme's
features peak.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, apply_style, save  # noqa: E402
from trace_display import K_ME, luce, phoneme_centers, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
FRAMES = [18, 36, 60]  # early, near the end of the input, after it (chosen here)
CRITERION = 0.9  # M&E p. 30: "an arbitrary threshold of .9 for response initiation"
MS_PER_CYCLE = 25

apply_style()
p = luce(pd.read_csv(os.path.join(RESULTS, "phonemes.csv")))
p = p[p.phoneme == "t"]
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))

# --- Fig. 9: the Trace for a word and a nonword with initial /t/ ---------------
fig = plt.figure(figsize=(DOUBLE, 5.4))
for sub, (run, model_input) in zip(fig.subfigures(2, 1, hspace=0.08), [("targ^t", "-targ^t-"), ("tr^g^s", "-tr^g^s-")]):
    trace_panels(sub, snap[snap.run == run], FRAMES, model_input, title=f"/{run}/, cycle {{cycle}}")
save(fig, FIGURES, "fig09-trace")

# --- Figs. 10-11: growth of P(/t/) --------------------------------------------
criterion = {}
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.5), sharey=True)
for ax, pair, model_input, title in [
    (a1, [("targ^t", "target"), ("tr^g^s", "trugus")], "-targ^t-", "A. Word-initial /t/ (M&E Fig. 10)"),
    (a2, [("sikr^t", "secret"), ("g^ld^t", "guldut")], "-sikr^t-", "B. Word-final /t/ (M&E Fig. 11)"),
]:
    for i, (run, gloss) in enumerate(pair):
        x = p[p.run == run]
        reached = x[x.p >= CRITERION].cycle
        criterion[run] = int(reached.min()) if len(reached) else None
        label = f"/{run}/ ({gloss}{', word' if i == 0 else ', nonword'})"
        ax.plot(x.cycle, x.p, color=COLORS[[5, 6][i]], marker=MARKERS[i], markevery=6, label=label)
        if criterion[run] is not None:
            ax.plot(criterion[run], CRITERION, "|", color=COLORS[[5, 6][i]], ms=10, mew=1.2)
    for c in phoneme_centers(model_input)[1:-1]:
        ax.axvline(c, color="0.85", lw=0.5, zorder=0)
    ax.axhline(CRITERION, color="0.6", lw=0.5, ls="--")
    ax.set_xlabel("Processing cycle")
    ax.set_title(title)
    ax.legend(loc="upper left")
a1.set_ylabel(f"P(/t/) at the target's slot (k = {K_ME})")
a1.set_ylim(0, 1.03)
save(fig, FIGURES, "fig10-11-response")

lines = [f"Cycle at which P(/t/) first reaches {CRITERION} (k = {K_ME}):"]
lines += [f"  /{run}/: {c}" for run, c in criterion.items()]
for word, nonword in [("targ^t", "tr^g^s"), ("sikr^t", "g^ld^t")]:
    if criterion[word] is not None and criterion[nonword] is not None:
        diff = criterion[nonword] - criterion[word]
        lines.append(f"  word advantage, /{word}/ vs /{nonword}/: {diff} cycles ({diff * MS_PER_CYCLE} ms at 25 ms/cycle)")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
