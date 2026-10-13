"""Figures for M&E (1986) pp. 62-64: segmenting every word pair.

Reads results/pairs.csv (from simulate.js) and writes figures/:
  fig-accuracy   proportion of pairs parsed correctly at each readout lag:
                 mean over permutation sets +/- 1 SE, each set as a dot, and
                 M&E's 189 / 211 as a dashed line
  fig-scatter    at the main lag: the weaker of the two presented words against
                 the strongest rival, one dot per pair (above the diagonal =
                 a rival beats a presented word)
  failures.txt   every failure at the main lag, with its type (below)
  stats.txt      proportion correct per lag, and failure counts by type

M&E describe two kinds of failure: the input "was actually consistent with two
parses" (a spanning word, as in party for par + tea, or a different pair, as in
part + rust for par + trust), or the model found no valid parse (park for
par + key). Here a failure counts as an alternative parse when the winning
rival belongs to some other tiling of the stream by lexicon words (found by
exhaustive search), and as "rival in no valid parse" otherwise.

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import json
import os
import sys
from functools import lru_cache

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "lib"))
from style import COLORS, DOUBLE, MARKERS, SINGLE, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
MAIN_LAG = 18  # three phonemes after the last phoneme's center (chosen here)
ME_CORRECT = 189 / 211

apply_style()
d = pd.read_csv(os.path.join(RESULTS, "pairs.csv"))
with open(os.path.join(RESULTS, "metadata.json")) as fh:
    LEXICON = set(json.load(fh)["words"])


@lru_cache(maxsize=None)
def tilings(s):
    """Every way to write the phoneme string s as a sequence of lexicon words."""
    if not s:
        return [()]
    return [(s[:k],) + rest for k in range(1, len(s) + 1) if s[:k] in LEXICON for rest in tilings(s[k:])]


def failure_type(r):
    others = [t for t in tilings(r.first + r.second) if t != (r.first, r.second)]
    return "alternative parse" if any(r.rival in t for t in others) else "rival in no valid parse"


# --- proportion correct per lag ---------------------------------------------------
by_set = d.groupby(["lag", "set"]).correct.mean().reset_index()
summary = by_set.groupby("lag").correct.agg(["mean", "sem"])
fig, ax = plt.subplots(figsize=(SINGLE, 2.4))
jitter = np.random.default_rng(0).uniform(-0.6, 0.6, len(by_set))
ax.plot(by_set.lag + jitter, by_set.correct, "o", color=COLORS[5], alpha=0.3, ms=2.5, mew=0)
ax.errorbar(summary.index, summary["mean"], yerr=summary["sem"], color=COLORS[5], marker=MARKERS[0],
            capsize=2, label=f"tsTRACE ({d.set.nunique()} sets of {d.pair.nunique() // d.set.nunique()} pairs)")
ax.axhline(ME_CORRECT, color="0.4", lw=0.8, ls="--", label="M&E: 189 / 211")
ax.set_xlabel("Readout: cycles after the last phoneme's center")
ax.set_ylabel("Proportion of pairs parsed correctly")
ax.set_xticks(summary.index)
ax.set_ylim(0.5, 1.0)
ax.legend(loc="lower right", fontsize=6)
save(fig, FIGURES, "fig-accuracy")

# --- weaker presented word vs strongest rival, at the main lag ----------------------
m = d[d.lag == MAIN_LAG].copy()
m["weaker"] = m[["first_act", "second_act"]].min(axis=1)
fails = m[m.correct == 0].copy()
fails["type"] = [failure_type(r) for r in fails.itertuples()]
fig, ax = plt.subplots(figsize=(SINGLE, SINGLE))
ok = m[m.correct == 1]
ax.plot(ok.weaker, ok.rival_act, "o", color="0.6", ms=2, mew=0, alpha=0.6, label=f"correct ({len(ok)})")
for i, kind in enumerate(["alternative parse", "rival in no valid parse"]):
    f = fails[fails.type == kind]
    ax.plot(f.weaker, f.rival_act, MARKERS[i + 1], color=COLORS[[6, 5][i]], ms=3.5, label=f"{kind} ({len(f)})")
lo, hi = min(m.weaker.min(), m.rival_act.min()) - 0.05, max(m.weaker.max(), m.rival_act.max()) + 0.05
ax.plot([lo, hi], [lo, hi], color="0.3", lw=0.6)
ax.set_xlim(lo, hi)
ax.set_ylim(lo, hi)
ax.set_xlabel("Weaker of the two presented words")
ax.set_ylabel("Strongest rival word")
ax.set_title(f"Each pair, {MAIN_LAG} cycles after the last phoneme")
ax.legend(loc="upper left", fontsize=6)
save(fig, FIGURES, "fig-scatter")

# --- text summaries ----------------------------------------------------------------
os.makedirs(FIGURES, exist_ok=True)
with open(os.path.join(FIGURES, "failures.txt"), "w") as fh:
    fh.write(f"Failures {MAIN_LAG} cycles after the last phoneme's center\n")
    fh.write("set  first + second  ->  rival (act)  [first act, second act]  type\n")
    for r in fails.sort_values(["type", "set", "pair"]).itertuples():
        fh.write(f"{r.set}  {r.first} + {r.second}  ->  {r.rival} ({r.rival_act:.2f})  "
                 f"[{r.first_act:.2f}, {r.second_act:.2f}]  {r.type}\n")
lines = ["Proportion of pairs parsed correctly (mean over sets, SE, range):"]
for lag, g in by_set.groupby("lag"):
    lines.append(f"  lag {lag:>2}: {g.correct.mean():.3f} (SE {g.correct.sem():.3f}; "
                 f"{g.correct.min():.3f}-{g.correct.max():.3f})")
lines.append(f"M&E: {ME_CORRECT:.3f} (189 / 211)")
lines.append(f"Failures at lag {MAIN_LAG}: {len(fails)} of {len(m)}")
for kind, n in fails.type.value_counts().items():
    lines.append(f"  {kind}: {n}")
with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(lines) + "\n")
print("\n".join(lines))
