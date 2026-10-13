"""Figures for M&E (1986) Figs. 19-22: categorical perception of /g/-/k/.

Reads results/ (from simulate.js) and writes figures/:
  fig19-stimuli        where each of the 11 stimuli peaks on the VOT (and,
                       identically, F1OF) dimension
  fig20-competition    A: relative bottom-up excitation of /g/ and /k/;
                       B: their activations at cycle 60
  fig21-identification identification (P(/g/), P(/k/)) and ABX accuracy for
                       pairs one step apart
  fig22-differences    feature-level difference (1 - r) between stimuli one
                       step apart at cycle 60, with and without
                       phoneme-to-feature feedback
  stats.txt            the numbers behind these figures

Identification: Luce choice between /g/ and /k/ at slice 12, k = 10 (M&E).
Discrimination (M&E pp. 47-48): r is the correlation between two stimuli's
patterns over the 18 VOT and F1OF feature units at slice 12, at cycle 60. In
ABX, X is matched to A with probability exp(k r_XA) / (exp(k r_XA) + exp(k r_XB)),
with k = 5; when X is A, r_XA = 1 and r_XB = r_AB.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, SINGLE, apply_style, save  # noqa: E402
from trace_display import K_ME  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
K_ABX = 5  # M&E p. 48: "for one choice of the parameter k_s (5)"
G_STIM, K_STIM = 3, 9  # canonical /g/ and /k/
STYLE = {"g": dict(color=COLORS[5], marker=MARKERS[0]), "k": dict(color=COLORS[6], marker=MARKERS[1])}

apply_style()
ph = pd.read_csv(os.path.join(RESULTS, "phonemes.csv"))
feat = pd.read_csv(os.path.join(RESULTS, "features.csv"))
stim = pd.read_csv(os.path.join(RESULTS, "stimuli.csv")).sort_values("stimulus")
last = ph.cycle.max()
end = ph[ph.cycle == last].copy()
end["P_k"] = 1 / (1 + np.exp(K_ME * (end.g - end.k)))
end["P_g"] = 1 - end.P_k
with_fb = end[end.feedback > 0].sort_values("stimulus")


def canonical_marks(ax):
    for s, name in [(G_STIM, "/g/"), (K_STIM, "/k/")]:
        ax.axvline(s, color="0.85", lw=0.5, zorder=0)
        ax.text(s, 1.0, name, transform=ax.get_xaxis_transform(), ha="center", va="bottom", fontsize=6)


# --- Fig. 19: the stimuli -------------------------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE, 1.1))
ax.plot(stim.center, np.zeros(len(stim)), "|", color="0.3", ms=10)
for r in stim.itertuples():
    canonical = r.stimulus in (G_STIM, K_STIM)
    ax.annotate(str(r.stimulus), (r.center, 0), xytext=(0, 8), textcoords="offset points", ha="center",
                fontsize=6, fontweight="bold" if canonical else "normal")
ax.set_xlim(-0.2, 8.2)
ax.set_ylim(-1, 1)
ax.set_xticks(range(9))
ax.set_yticks([])
ax.spines["left"].set_visible(False)
ax.set_xlabel("Peak location on the VOT (and F1OF) dimension (unit)")
ax.set_title("The 11 stimuli (3 = canonical /g/, 9 = canonical /k/)")
save(fig, FIGURES, "fig19-stimuli")

# --- Fig. 20: bottom-up input vs activation -----------------------------------
fig, (a1, a2) = plt.subplots(1, 2, figsize=(DOUBLE, 2.4), sharex=True)
top = stim[["bottomup_g", "bottomup_k"]].to_numpy().max()
for ph_label in ["g", "k"]:
    a1.plot(stim.stimulus, stim[f"bottomup_{ph_label}"] / top, label=f"/{ph_label}/", **STYLE[ph_label])
    a2.plot(with_fb.stimulus, with_fb[ph_label], label=f"/{ph_label}/", **STYLE[ph_label])
a1.set_ylabel("Bottom-up excitation (relative to max)")
a1.set_title("A. Bottom-up input to the phoneme units", pad=12)
a2.set_ylabel(f"Activation at cycle {last + 1}")
a2.set_title(f"B. Activation after {last + 1} cycles", pad=12)
for ax in (a1, a2):
    ax.set_xlabel("Stimulus")
    ax.set_xticks(stim.stimulus)
    canonical_marks(ax)
    ax.legend(loc="center left", fontsize=6)
save(fig, FIGURES, "fig20-competition")


# --- discrimination: correlations between adjacent stimuli ---------------------
def pattern(fb, s, cycle):
    x = feat[(feat.feedback == fb) & (feat.stimulus == s) & (feat.cycle == cycle)].sort_values("unit")
    return x.activation.to_numpy()


pairs = []
stimuli = sorted(stim.stimulus)
for fb in sorted(feat.feedback.unique(), reverse=True):
    for a, b in zip(stimuli, stimuli[1:]):
        r = np.corrcoef(pattern(fb, a, last), pattern(fb, b, last))[0, 1]
        abx = 1 / (1 + np.exp(-K_ABX * (1 - r)))  # P(match X=A to A) = e^k / (e^k + e^(k r))
        pairs.append(dict(feedback=fb, a=a, b=b, mid=(a + b) / 2, diff=1 - r, abx=abx))
pairs = pd.DataFrame(pairs)
fb_pairs = pairs[pairs.feedback > 0]

# --- Fig. 21: identification and ABX -----------------------------------------
fig, ax = plt.subplots(figsize=(SINGLE, 2.5))
ax.plot(with_fb.stimulus, with_fb.P_g, label="identification: /g/", **STYLE["g"])
ax.plot(with_fb.stimulus, with_fb.P_k, label="identification: /k/", **STYLE["k"])
ax.plot(fb_pairs.mid, fb_pairs.abx, color="0.3", ls="--", marker="o", mfc="white", label="ABX accuracy (pairs one step apart)")
canonical_marks(ax)
ax.set_xlabel("Stimulus")
ax.set_xticks(stimuli)
ax.set_ylabel("Probability")
ax.set_ylim(-0.03, 1.08)
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.22), fontsize=6, ncol=2)
save(fig, FIGURES, "fig21-identification")

# --- Fig. 22: feature-level differences, with and without feedback ------------
fig, ax = plt.subplots(figsize=(SINGLE, 2.4))
for i, (fb, x) in enumerate(pairs.groupby("feedback")):
    label = f"feedback {fb:g}" + (" (M&E)" if fb > 0 else " (control)")
    ax.plot(x.mid, x["diff"], marker=MARKERS[i], color=[COLORS[7], COLORS[0]][int(fb > 0)], label=label)
canonical_marks(ax)
ax.set_xlabel("Stimulus pair (plotted between its members)")
ax.set_xticks(stimuli)
ax.set_ylabel(f"1 - r at cycle {last + 1}")
ax.legend(loc="upper left", fontsize=6)
save(fig, FIGURES, "fig22-differences")

# --- statistics ---------------------------------------------------------------
lines = ["Bottom-up excitation of /k/ relative to /g/ (M&E: 0.75 for stimulus 3, 0.88 for stimulus 5):"]
lines += [f"  stimulus {r.stimulus}: {r.bottomup_k / r.bottomup_g:.3f}" for r in stim.itertuples()]
lines.append(f"\nP(/k/) at cycle {last + 1} (M&E: 0.04 for stimulus 5):")
for fb, x in end.groupby("feedback", sort=False):
    lines.append(f"  feedback {fb:g}: " + "  ".join(f"{r.stimulus}:{r.P_k:.3f}" for r in x.sort_values("stimulus").itertuples()))
lines.append(f"\nAdjacent pairs: 1 - r and ABX accuracy (k = {K_ABX}) at cycle {last + 1}:")
lines.append(pairs[["feedback", "a", "b", "diff", "abx"]].round(4).to_string(index=False))
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
