"""Figures for M&E (1986) Fig. 24: recovering from a mismatching first phoneme.

Reads results/ (from simulate.js) and writes figures/:
  fig24-trace       the state of the Trace at two points for /lig^l/ (legal)
                    and /l^g^d/ (lugged, a nonword)
  fig-timecourse    word activations (most active copy) over time for /lig^l/,
                    /l^g^d/, and the intact /r^g^d/: the words M&E discuss
                    plus the most active other words in each run
  stats.txt         the cycle from which the closest word leads every other
                    word for the rest of the run, and its final activation

Vertical lines mark the cycles at which each input phoneme's features peak.

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
FRAMES = [36, 72]  # two points, as in M&E's figure (cycles chosen here)
N_OTHERS = 3  # most active other words shown per run
# run: (model input, gloss, the word expected to win, words always shown)
RUNS = {
    "lig^l": ("-lig^l-", "legal", "lig^l", ["lig^l", "rig^l"]),
    "l^g^d": ("-l^g^d-", "lugged, a nonword", "r^g^d", ["r^g^d"]),
    "r^g^d": ("-r^g^d-", "rugged, intact", "r^g^d", ["r^g^d"]),
}
GLOSS = {"lig^l": "legal", "rig^l": "regal", "r^g^d": "rugged"}

apply_style()
words = pd.read_csv(os.path.join(RESULTS, "words.csv"))
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))


def lead_from(act, target):
    """First cycle from which `target` beats every other word to the end, or None."""
    others = act.drop(columns=[target]).max(axis=1)
    behind = act.index[act[target] <= others]
    if len(behind) == 0:
        return int(act.index.min())
    return int(behind.max()) + 1 if behind.max() < act.index.max() else None


# --- Fig. 24: the Trace for legal and lugged -----------------------------------
fig = plt.figure(figsize=(DOUBLE, 5.4))
for sub, run in zip(fig.subfigures(2, 1, hspace=0.08), ["lig^l", "l^g^d"]):
    model_input, gloss = RUNS[run][:2]
    trace_panels(sub, snap[snap.run == run], FRAMES, model_input, title=f"/{run}/ ({gloss}), cycle {{cycle}}")
save(fig, FIGURES, "fig24-trace")

# --- Time course of word activations -------------------------------------------
lines = ["Cycle from which the expected word leads every other word (most active copies):"]
fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.5), sharey=True)
for ax, (run, (model_input, gloss, target, always)) in zip(axes, RUNS.items()):
    act = words[words.run == run].pivot_table(index="cycle", columns="word", values="activation")
    peaks = act.drop(columns=[w for w in GLOSS if w in act]).max().sort_values(ascending=False)
    shown = always + list(peaks.index[:N_OTHERS])
    for i, w in enumerate(shown):
        label = f"/{w}/" + (f" ({GLOSS[w]})" if w in GLOSS else "")
        ax.plot(act.index, act[w], color=COLORS[[5, 6, 3, 7, 2, 1][i]], marker=MARKERS[i], markevery=10, label=label)
    for c in phoneme_centers(model_input)[1:-1]:
        ax.axvline(c, color="0.85", lw=0.5, zorder=0)
    lead = lead_from(act, target)
    if lead is not None:
        ax.axvline(lead, color="0.3", lw=0.8, ls="--", label=f"leads from cycle {lead}")
    lines.append(f"  /{run}/ ({gloss}): /{target}/ leads from cycle {lead}; final activation {act[target].iloc[-1]:.2f}")
    ax.set_title(f"/{run}/ ({gloss})")
    ax.set_xlabel("Processing cycle")
    ax.legend(loc="upper left", fontsize=5.5)
axes[0].set_ylabel("Word activation (most active copy)")
axes[0].set_ylim(-0.25, 0.8)
save(fig, FIGURES, "fig-timecourse")

os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
