"""Example 1 figures: the Ganong effect.

Reads results/ganong.csv (from simulate.js) and writes figures/:
  fig1-identification   P(/p/) across the /b/-/p/ continuum in each context
  fig2-timecourse       the ambiguous midpoint over time: P(/p/), and the two words

Response probabilities use the Luce choice rule over the two phoneme units,
P(/p/) = exp(k*a_p) / (exp(k*a_p) + exp(k*a_b)), with k = 7.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, SINGLE, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K = 7  # Luce choice exponent
ID_CYCLE = 99  # cycle at which identification is read out (last simulated cycle)
MIDPOINT = 3  # the most ambiguous continuum step

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "ganong.csv"))
d["P_p"] = np.exp(K * d.p) / (np.exp(K * d.p) + np.exp(K * d.b))
contexts = {"plug": "plug  (/?l^g/)", "blood": "blood  (/?l^d/)"}

# --- Figure 1: identification functions ---------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE, 2.4))
at = d[d.cycle == ID_CYCLE]
for i, (context, label) in enumerate(contexts.items()):
    x = at[at.context == context].sort_values("step")
    ax.plot(x.step, x.P_p, marker=MARKERS[i], color=COLORS[i + 5], label=label)
ax.set_xlabel("Continuum step (0 = /b/, 6 = /p/)")
ax.set_ylabel(f"P(/p/) at cycle {ID_CYCLE}")
ax.set_ylim(-0.02, 1.02)
ax.legend(title="Context", loc="upper left")
save(fig, FIGURES, "fig1-identification")

# --- Figure 2: time course at the ambiguous midpoint ---------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.4))
mid = d[d.step == MIDPOINT]
for i, (context, label) in enumerate(contexts.items()):
    x = mid[mid.context == context]
    a1.plot(x.cycle, x.P_p, color=COLORS[i + 5], label=label)
a1.axhline(0.5, color="0.7", lw=0.5, ls="--")
a1.set_xlabel("Cycle")
a1.set_ylabel(f"P(/p/), step {MIDPOINT}")
a1.set_title("A. Phoneme identification")
a1.legend(title="Context")

# most active copy of each word; solid = plug context, dashed = blood context
for i, word in enumerate(["plug", "blood"]):
    for context, ls in [("plug", "-"), ("blood", "--")]:
        x = mid[mid.context == context]
        a2.plot(x.cycle, x[word], color=COLORS[i + 5], ls=ls, label=f"{word} ({context} context)")
a2.set_xlabel("Cycle")
a2.set_ylabel("Word activation")
a2.set_title("B. Lexical units")
a2.legend()
save(fig, FIGURES, "fig2-timecourse")
