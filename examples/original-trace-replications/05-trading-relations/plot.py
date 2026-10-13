"""Figures for M&E (1986) Figs. 15, 17, 18: trading relations between VOT and F1OF.

Reads results/ (from simulate.js) and writes figures/:
  fig15-patterns     the feature patterns on the VOT (and, identically, F1OF)
                     dimension: canonical /g/ and /k/ and the five values used
  fig17-trace        the phoneme level at four points for the most /g/-like stimulus
  fig18-trading      P(/k/) at cycle 60 for the 25 stimuli: one curve per F1OF
                     value, across the VOT values
  stats.txt          P(/k/) for every stimulus, and the VOT value needed for
                     P(/k/) = 0.5 at each F1OF value (Summerfield & Haggard's measure)

P(/k/) = exp(10 a_k) / (exp(10 a_k) + exp(10 a_g)), M&E's choice rule (k = 10),
from the /g/ and /k/ units at slice 12.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, SINGLE, apply_style, save  # noqa: E402
from trace_display import K_ME, trace_panels  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
FRAMES = [12, 18, 30, 57]  # cycles shown in the Trace display (chosen here)

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "trading.csv"))
d["P_k"] = 1 / (1 + np.exp(K_ME * (d.g - d.k)))
last = d.cycle.max()
end = d[d.cycle == last]

# --- Fig. 15: the input patterns ---------------------------------------------
pat = pd.read_csv(os.path.join(RESULTS, "patterns.csv"))
fig, ax = plt.subplots(figsize=(SINGLE, 2.2))
for name, x in pat.groupby("pattern", sort=False):
    canonical = name.startswith("/")
    ax.plot(x.unit, x.value, color=COLORS[6] if name == "/k/" else COLORS[5] if canonical else "0.6",
            lw=1.4 if canonical else 0.7, label=name if canonical else None)
    if not canonical:  # label each numbered pattern at its center
        ax.text(x.center.iloc[0], 1.03, name, ha="center", fontsize=6, color="0.4")
ax.set_xlabel("Unit on the VOT (or F1OF) dimension")
ax.set_ylabel("Input strength")
ax.set_xticks(range(9))
ax.legend(loc="upper right")
ax.set_title("Canonical /g/ and /k/, and the five values used (numbered)", pad=10)
save(fig, FIGURES, "fig15-patterns")

# --- Fig. 17: the phoneme level for the most /g/-like stimulus --------------
snap = pd.read_csv(os.path.join(RESULTS, "snapshot.csv"))
fig = plt.figure(figsize=(DOUBLE, 1.6))
trace_panels(fig, snap, FRAMES, "-Xa-", words=False, ambiguous="X")
fig.suptitle("Most /g/-like stimulus (VOT 1, F1OF 1) in /-Xa-/", y=1.08)
save(fig, FIGURES, "fig17-trace")

# --- Fig. 18: trading relations ----------------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE, 2.5))
for i, (f1, x) in enumerate(end.groupby("f1of")):
    x = x.sort_values("vot")
    ax.plot(x.vot, x.P_k, marker=MARKERS[i % len(MARKERS)], color=COLORS[[5, 2, 3, 1, 6][i % 5]], label=str(f1))
ax.axhline(0.5, color="0.8", lw=0.5, ls="--")
ax.set_xlabel("VOT value (1 = most /g/-like)")
ax.set_ylabel(f"P(/k/) at cycle {last + 1}")
ax.set_xticks(sorted(end.vot.unique()))
ax.set_ylim(-0.02, 1.02)
ax.legend(title="F1OF value", loc="upper left", fontsize=6)
save(fig, FIGURES, "fig18-trading")

# --- statistics ---------------------------------------------------------------
table = end.pivot_table(index="f1of", columns="vot", values="P_k")
lines = [f"P(/k/) at cycle {last + 1} (rows: F1OF value, columns: VOT value)", table.round(3).to_string(), ""]
lines.append("VOT value giving P(/k/) = 0.5 (linear interpolation), by F1OF value:")
for f1, row in table.iterrows():
    v, p = row.index.to_numpy(float), row.to_numpy()
    cross = np.interp(0.5, p, v) if p.min() < 0.5 < p.max() else float("nan")
    lines.append(f"  F1OF {f1}: {cross:.2f}")
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
