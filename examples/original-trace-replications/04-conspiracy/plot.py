"""Figures for M&E (1986) Figs. 12-13: phonotactic effects as a lexical conspiracy.

Reads results/ (from simulate.js) and writes figures/:
  fig12-trace-sli     the state of the Trace while /s?i/ (? between /l/ and /r/)
                      comes in
  fig-sli             P(/l/) at the ambiguous segment for /s?i/, /p?i/, /t?i/,
                      and /s?i/ with no words in the lexicon
  fig13-trace-luli    the state of the Trace while /?luli/ (? between /p/ and /t/)
                      comes in
  fig-truly           /?luli/: A, P(/p/) and P(/t/) at the ambiguous segment;
                      B, P(/l/) and P(/r/) at the (clear) second segment, beside
                      the clear word /truli/

P is the Luce choice over all phoneme units at a slot, with M&E's exponent
k = 10. Vertical lines mark the cycles at which each input phoneme's features peak.

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
FRAMES_SLI = [24, 36, 48, 63]  # cycles shown in the Trace displays (chosen here)
FRAMES_LULI = [24, 42, 60, 78]

apply_style()
p = luce(pd.read_csv(os.path.join(RESULTS, "phonemes.csv")), by=("run", "position", "cycle"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))


def series(run, position, phoneme):
    x = p[(p.run == run) & (p.position == position) & (p.phoneme == phoneme)]
    return x.cycle, x.p


def time_lines(ax, model_input):
    for c in phoneme_centers(model_input)[1:-1]:
        ax.axvline(c, color="0.85", lw=0.5, zorder=0)


def trace_figure(run, model_input, frames, name, title):
    fig = plt.figure(figsize=(DOUBLE, 2.8))
    trace_panels(fig, snap[snap.run == run], frames, model_input)
    fig.suptitle(title, y=1.02)
    save(fig, FIGURES, name)


# --- Fig. 12: the Trace for /s?i/ ------------------------------------------------
trace_figure("s?i", "-s1i-", FRAMES_SLI, "fig12-trace-sli", "Input /s?i/ (? = midway between /l/ and /r/)")

# --- P(/l/) in each context ------------------------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE, 2.5))
for i, (run, label, ls) in enumerate([
    ("s?i", "/s?i/ (sleep, sleet)", "-"),
    ("p?i", "/p?i/ (priest)", "-"),
    ("t?i", "/t?i/ (tree, treat, treaty)", "-"),
    ("s?i (no words)", "/s?i/, no words in lexicon", "--"),
]):
    ax.plot(*series(run, 2, "l"), color=COLORS[[5, 6, 3, 0][i]], ls=ls, marker=MARKERS[i], markevery=8, label=label)
time_lines(ax, "-s1i-")
ax.axhline(0.5, color="0.7", lw=0.5)
ax.set_xlabel("Processing cycle")
ax.set_ylabel(f"P(/l/) at the segment (k = {K_ME})")
ax.set_ylim(0, 1.03)
ax.legend(loc="upper left", fontsize=6)
save(fig, FIGURES, "fig-sli")

# --- Fig. 13: the Trace for /?luli/ --------------------------------------------
trace_figure("?luli", "-1luli-", FRAMES_LULI, "fig13-trace-luli", "Input /?luli/ (? = midway between /p/ and /t/)")

# --- /?luli/: the illegal /t/ wins, and /r/ stays active ------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.5), sharey=True)
for i, ph in enumerate(["p", "t"]):
    a1.plot(*series("?luli", 1, ph), color=COLORS[[5, 6][i]], marker=MARKERS[i], markevery=8, label=f"/{ph}/")
for i, ph in enumerate(["l", "r"]):
    a2.plot(*series("?luli", 2, ph), color=COLORS[[3, 7][i]], marker=MARKERS[i], markevery=8, label=f"/{ph}/ in /?luli/")
    a2.plot(*series("truli", 2, ph), color=COLORS[[3, 7][i]], ls=":", label=f"/{ph}/ in /truli/")
for ax in (a1, a2):
    time_lines(ax, "-1luli-")
    ax.set_xlabel("Processing cycle")
    ax.legend(loc="center right", fontsize=6)
a1.set_title("A. Ambiguous first segment: /p/ (legal) vs /t/ (illegal)")
a2.set_title("B. Clear second segment /l/")
a1.set_ylabel(f"P at the segment (k = {K_ME})")
a1.set_ylim(0, 1.03)
save(fig, FIGURES, "fig-truly")
