"""Figures for M&E (1986) Figs. 5-7: the lexical effect on an ambiguous phoneme.

Reads results/ (from simulate.js) and writes figures/:
  fig05-trace-plug    the state of the Trace at four points while /?l^g/ comes in
  fig06-timecourse    P(/p/) at the initial segment over time:
                      A: M&E's runs, ?l^g and ?l^S (ambiguous) and pl^g (clear),
                         with Fox's (1982) 500-ms deadline marked
                      B: the jTRACE gallery's contexts
  fig07-trace-clear   the state of the Trace while a clear /bl^g/ comes in
  fig-ambiguity       P(/p/) at the last cycle for clear /b/, ambiguous, and
                      clear /p/ onsets, in the plug and blush contexts

P(/p/) is the Luce choice over all phoneme units at the segment's slot, with
M&E's exponent k = 10. Vertical lines mark the cycles at which each input
phoneme's features peak (M&E Fig. 6).

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, SINGLE, apply_style, save  # noqa: E402
from trace_display import K_ME, luce, phoneme_centers, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
FRAMES = [18, 30, 42, 60]  # cycles shown in the Trace displays (chosen here)
MS_PER_CYCLE = 25  # M&E p. 27: 12 cycles = 300 ms
DEADLINE_MS = 500  # Fox (1982): responses within 500 ms of the ambiguous segment
SEGMENT_CENTER = 12  # cycle at which the initial segment's features peak

apply_style()
p = luce(pd.read_csv(os.path.join(RESULTS, "phonemes.csv")))
p = p[p.phoneme == "p"]
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))
last = p.cycle.max()


def trace_figure(run, model_input, name, title):
    """Four Trace displays side by side: words on top, phonemes below."""
    fig = plt.figure(figsize=(DOUBLE, 2.8))
    trace_panels(fig, snap[snap.run == run], FRAMES, model_input)
    fig.suptitle(title, y=1.02)
    save(fig, FIGURES, name)


def time_lines(ax, model_input):
    """Vertical lines at the peaks of the input phonemes; '?' over the first."""
    for i, c in enumerate(phoneme_centers(model_input)[1:-1]):
        ax.axvline(c, color="0.85", lw=0.5, zorder=0)
        if i == 0:
            ax.text(c, 1.0, "?", ha="center", va="bottom", transform=ax.get_xaxis_transform(), fontsize=7)


# --- Fig. 5: the Trace while an ambiguous /b/-/p/ segment and /l^g/ come in ----
trace_figure("?l^g", "-1l^g-", "fig05-trace-plug", "Input /?l^g/ (? = midway between /b/ and /p/)")

# --- Fig. 6: time course of P(/p/) -------------------------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.5), sharey=True)
for ax, runs in [
    (a1, {"?l^g": "?l^g (plug)", "?l^S": "?l^S (blush)", "pl^g": "pl^g (clear /p/)"}),
    (a2, {"?l^g": "?l^g (plug)", "?ragr^s": "?ragr^s (progress)",
          "?ist": "?ist (beast)", "?r^S": "?r^S (brush)"}),
]:
    for i, (run, label) in enumerate(runs.items()):
        x = p[p.run == run]
        ax.plot(x.cycle, x.p, color=COLORS[[5, 6, 0, 3][i]], marker=MARKERS[i], markevery=6, label=label)
    time_lines(ax, "-1l^g-")
    ax.set_xlabel("Processing cycle")
    ax.legend(loc="upper left")
deadline = SEGMENT_CENTER + DEADLINE_MS / MS_PER_CYCLE
a1.axvspan(deadline, last, color="0.94", lw=0, zorder=-1)
a1.text(deadline + 1, 0.04, f"after Fox's {DEADLINE_MS}-ms deadline", fontsize=6, color="0.4")
a1.set_title("A. M&E Fig. 6: the context matters only late", pad=12)
a2.set_title("B. More contexts (jTRACE gallery)", pad=12)
a1.set_ylabel(f"P(/p/) at the initial segment (k = {K_ME})")
a1.set_ylim(0, 1.05)
save(fig, FIGURES, "fig06-timecourse")

# --- Fig. 7: the Trace while a clear /bl^g/ comes in ---------------------------
trace_figure("bl^g", "-bl^g-", "fig07-trace-clear", "Input /bl^g/ (clear /b/)")

# --- Dependence on ambiguity (M&E p. 29) ---------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE, 2.3))
at = p[p.cycle == last].set_index("run").p
onsets = ["b", "?", "p"]
for i, (rest, label) in enumerate([("l^g", "plug (·l^g)"), ("l^S", "blush (·l^S)")]):
    ax.plot(range(3), [at[o + rest] for o in onsets], marker=MARKERS[i], color=COLORS[[5, 6][i]], label=label)
ax.set_xticks(range(3), ["clear /b/", "ambiguous", "clear /p/"])
ax.set_xlabel("Initial segment")
ax.set_ylabel(f"P(/p/) at cycle {last}")
ax.set_ylim(-0.03, 1.03)
ax.legend(title="Context", loc="upper left")
save(fig, FIGURES, "fig-ambiguity")
