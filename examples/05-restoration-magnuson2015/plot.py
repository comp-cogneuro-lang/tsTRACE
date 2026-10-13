"""Example 5 figures and statistics: replication of Magnuson (2015).

Reads results/ (from simulate.js) and writes figures/fig01 ... fig13 (numbered
as in the paper), two supplementary figures, and figures/stats.txt.

  fig01  Grossberg & Kazerounian (2011) stimuli          (input matrices)
  fig02  noise-replacement stimuli                       (input matrices)
  fig03  luxury, replaced phoneme, original phonemes
  fig04  luxury, all phonemes at the replaced slot, original phonemes
  fig05  3-, 5-, 7-phoneme words, original phonemes      (mean +/- 1 SE)
  fig06  original and revised phoneme definitions
  fig07  as fig03, revised phonemes
  fig08  as fig04, revised phonemes
  fig09  as fig05, revised phonemes
  fig10  replaced vs next-most-active phoneme, revised phonemes
  fig11  as fig07, luxury the only word in the lexicon
  fig12  as fig08, luxury the only word in the lexicon
  fig13  early peak of the replaced phoneme (noise 1.0) by length and position
  figS1  hierarchical clustering of original vs revised definitions
  figS2  footnote 4: many noise levels (luxury, initial /l/)

Conventions
  * Time is plotted from word onset: cycle minus 6, because the leading
    silence phoneme occupies the first 6 input slices. This matches the
    paper's x axes.
  * "Early window": the 25 cycles after the replaced phoneme's input begins.
  * The silence unit "-" is left out when finding the most active phoneme.
  * Bands and error bars are +/- 1 standard error across words (the paper
    showed 95% confidence intervals).

Run:  python3 plot.py [resultsDir] [figuresDir]
"""

import os
import sys
from collections import Counter

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "lib"))
from style import COLORS, DOUBLE, apply_style, save  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RESULTS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "results")
FIGURES = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "figures")
ONSET = 6  # cycles before word onset (the leading silence phoneme)
EARLY = 25  # length of the early window, in cycles
FEATURES = ["POW", "VOC", "DIF", "ACU", "GRD", "VOI", "BUR"]
POSITIONS = ["initial", "medial", "final"]
CONDITIONS = ["intact", "silence-phoneme", "noise-0.0", "noise-0.2", "noise-0.6", "noise-1.0"]
COND_LABEL = {
    "intact": "Intact",
    "silence-phoneme": "Silence phoneme",
    "noise-0.0": "0.0 noise (true silence)",
    "noise-0.2": "0.2 noise",
    "noise-0.6": "0.6 noise",
    "noise-1.0": "1.0 noise",
}
COND_STYLE = {
    "intact": dict(color="black", marker="^", mfc="white"),
    "silence-phoneme": dict(color="0.5", marker="v", mfc="white"),
    "noise-0.0": dict(color=COLORS[5], marker="o", mfc="white"),
    "noise-0.2": dict(color="#FDB863", marker="o"),
    "noise-0.6": dict(color="#E66101", marker="s"),
    "noise-1.0": dict(color="#8E0152", marker="^"),
}

apply_style()
os.makedirs(FIGURES, exist_ok=True)
stats = []  # lines for stats.txt


def report(line=""):
    print(line)
    stats.append(line)


# ----------------------------------------------------------------------------
# Data
# ----------------------------------------------------------------------------

d = pd.read_csv(os.path.join(RESULTS, "phonemes.csv.gz"), keep_default_na=False)
PHONEMES = list(d.columns[d.columns.get_loc("cycle") + 1 :])  # unit labels, row order
REAL = [p for p in PHONEMES if p != "-"]  # all but silence
d["time"] = d.cycle - ONSET
# activation of the replaced phoneme in each row
cols = d[PHONEMES].to_numpy()
d["act"] = cols[np.arange(len(d)), [PHONEMES.index(p) for p in d.replaced]]
d = d[d.time >= 0]  # plot from word onset, as in the paper
SIM = ["part", "features", "lexicon", "word", "position", "condition"]  # one simulation


def select(**kw):
    out = d
    for k, v in kw.items():
        out = out[out[k] == v]
    return out


def mean_se(frame, value, by="time"):
    """Mean and mean +/- 1 standard error across words, per time point."""
    g = frame.groupby(by)[value]
    m, se = g.mean(), g.sem().fillna(0)
    return m, m - se, m + se


def legend_below(fig, ax, title):
    """One legend for the whole figure, centered underneath it."""
    handles, labels = ax.get_legend_handles_labels()
    fig.legend(handles, labels, title=title, loc="upper center", ncol=len(labels), bbox_to_anchor=(0.5, 0.0))


def plot_conditions(ax, frame, value="act"):
    """One line per condition (mean over words, with a +/- 1 SE band if several)."""
    for c in CONDITIONS:
        f = frame[frame.condition == c]
        if f.empty:
            continue
        m, lo, hi = mean_se(f, value)
        ax.plot(m.index, m, markevery=4, label=COND_LABEL[c], **COND_STYLE[c])
        if f.word.nunique() > 1:
            ax.fill_between(m.index, lo, hi, color=COND_STYLE[c]["color"], alpha=0.15, lw=0)


# ----------------------------------------------------------------------------
# Figures 1 and 2: input matrices
# ----------------------------------------------------------------------------

inputs = pd.read_csv(os.path.join(RESULTS, "inputs.csv.gz"))
LUXURY_LABELS = list("-l^kS^ri-")


def plot_inputs(figure, name, labels_for):
    panels = list(dict.fromkeys(inputs[inputs.figure == figure].panel))
    fig, axes = plt.subplots(2, 2, figsize=(DOUBLE, 4.8), sharey=True, gridspec_kw={"hspace": 0.35})
    for ax, panel in zip(axes.flat, panels):
        m = np.zeros((63, 99))
        f = inputs[(inputs.figure == figure) & (inputs.panel == panel)]
        m[f.unit, f.slice] = f.value
        ax.imshow(m, aspect="auto", cmap="Greys", vmin=0, vmax=1, interpolation="nearest")
        for b in range(1, 7):
            ax.axhline(b * 9 - 0.5, color="0.6", lw=0.4, ls="--")
        labels = labels_for(panel)
        ax.set_xticks([6 * (k + 1) for k in range(len(labels))])
        ax.set_xticklabels(labels)
        ax.set_yticks([f * 9 + 4 for f in range(7)])
        ax.set_yticklabels(FEATURES)
        ax.set_xlim(0, 60)
        ax.set_title(panel)
    save(fig, FIGURES, name)


def fig1_labels(panel):
    first = {"Intact": "l", "Silence phoneme": "-", "'True' silence phoneme": "_", "Noise 'phoneme'": "#"}[panel]
    return ["-", first] + LUXURY_LABELS[2:]


plot_inputs("fig1", "fig01-gk-stimuli", fig1_labels)
plot_inputs("fig2", "fig02-noise-stimuli", lambda panel: ["-", "#"] + LUXURY_LABELS[2:])

# ----------------------------------------------------------------------------
# Replaced-phoneme figures for luxury (3, 7, 11)
# ----------------------------------------------------------------------------


def fig_luxury(features, lexicon, name, title):
    fig, axes = plt.subplots(1, 3, figsize=(DOUBLE, 2.4), sharey=True)
    for ax, pos in zip(axes, POSITIONS):
        f = select(part="B", features=features, lexicon=lexicon, position=pos)
        plot_conditions(ax, f)
        replaced = f.replaced.iloc[0] if len(f) else "?"
        ax.set_title(f"{pos.capitalize()} (/{replaced}/)")
        ax.set_xlabel("Time since word onset (cycles)")
    axes[0].set_ylabel("Replaced phoneme activation")
    legend_below(fig, axes[0], "Replacement")
    fig.suptitle(title, y=1.02)
    save(fig, FIGURES, name)


fig_luxury("original", "full", "fig03-luxury-original", "luxury, original phonemes")
fig_luxury("revised", "full", "fig07-luxury-revised", "luxury, revised phonemes")
fig_luxury("revised", "luxury-only", "fig11-luxury-revised-single-word", "luxury, revised phonemes, luxury the only word")

# ----------------------------------------------------------------------------
# All phonemes at the replaced slot (4, 8, 12)
# ----------------------------------------------------------------------------


def fig_all_phonemes(features, lexicon, name, title):
    fig, axes = plt.subplots(2, 3, figsize=(DOUBLE, 3.8), sharex=True, sharey="row")
    for row, cond in enumerate(["noise-0.0", "noise-1.0"]):
        for col, pos in enumerate(POSITIONS):
            ax = axes[row, col]
            f = select(part="B", features=features, lexicon=lexicon, position=pos, condition=cond)
            if f.empty:
                continue
            replaced = f.replaced.iloc[0]
            peaks = f[REAL].max().sort_values(ascending=False)
            for p in REAL:
                if p == replaced:
                    continue
                ax.plot(f.time, f[p], color="0.75", lw=0.6)
            ax.plot(f.time, f[replaced], color="black", lw=1.4, label=f"/{replaced}/ (replaced)")
            # label the replaced phoneme and the three strongest competitors at their peaks
            rivals = [q for q in peaks.index if q != replaced and peaks[q] > -0.095][:3]
            for p in [replaced] + rivals:
                t = f.time.iloc[f[p].to_numpy().argmax()]
                ax.annotate(p, (t, f[p].max()), xytext=(0, 2), textcoords="offset points",
                            ha="center", fontsize=7, fontweight="bold" if p == replaced else "normal")
            ax.set_title(f"Noise {cond[-3:]}, {pos}")
            if col == 0:
                ax.set_ylabel("Activation")
            if row == 1:
                ax.set_xlabel("Time since word onset (cycles)")
    fig.suptitle(title + " (gray: other phonemes; black: replaced)", y=1.01)
    save(fig, FIGURES, name)


fig_all_phonemes("original", "full", "fig04-luxury-all-phonemes-original", "luxury, original phonemes")
fig_all_phonemes("revised", "full", "fig08-luxury-all-phonemes-revised", "luxury, revised phonemes")
fig_all_phonemes("revised", "luxury-only", "fig12-luxury-all-phonemes-single-word", "luxury, revised phonemes, single-word lexicon")

# ----------------------------------------------------------------------------
# Word sets (5, 9)
# ----------------------------------------------------------------------------

LENGTHS = [3, 5, 7]


def fig_word_sets(features, name, title):
    fig, axes = plt.subplots(3, 3, figsize=(DOUBLE, 6.0), sharex=True, sharey=True)
    for i, L in enumerate(LENGTHS):
        for j, pos in enumerate(POSITIONS):
            ax = axes[i, j]
            f = select(part="C", features=features, position=pos)
            f = f[f.length == L]
            plot_conditions(ax, f)
            ax.set_title(f"Length {L}, {pos} (n = {f.word.nunique()})")
            if j == 0:
                ax.set_ylabel("Replaced phoneme activation")
            if i == 2:
                ax.set_xlabel("Time since word onset (cycles)")
    legend_below(fig, axes[0, 0], "Replacement")
    fig.suptitle(title, y=1.0)
    save(fig, FIGURES, name)


fig_word_sets("original", "fig05-word-sets-original", "All 3-, 5-, and 7-phoneme words, original phonemes")
fig_word_sets("revised", "fig09-word-sets-revised", "All 3-, 5-, and 7-phoneme words, revised phonemes")

# ----------------------------------------------------------------------------
# Figure 6 and S1: phoneme definitions
# ----------------------------------------------------------------------------

defs = pd.read_csv(os.path.join(RESULTS, "phoneme-definitions.csv"), keep_default_na=False)
ORDER = list("pbtdkgsSrlaiu^-")
fig, axes = plt.subplots(2, 1, figsize=(3.6, 6.4), sharex=True)
for ax, features in zip(axes, ["original", "revised"]):
    m = defs[defs.features == features].pivot(index="unit", columns="phoneme", values="value")[ORDER]
    ax.imshow(m.to_numpy(), aspect="auto", cmap="Greys", vmin=0, vmax=1, interpolation="nearest")
    for b in range(1, 7):
        ax.axhline(b * 9 - 0.5, color="0.6", lw=0.4, ls="--")
    ax.set_yticks([f * 9 + 4 for f in range(7)])
    ax.set_yticklabels(FEATURES)
    ax.set_title(f"{features.capitalize()} definitions")
axes[1].set_xticks(range(len(ORDER)))
axes[1].set_xticklabels(ORDER)
save(fig, FIGURES, "fig06-phoneme-definitions")

from scipy.cluster.hierarchy import cophenet, dendrogram, linkage  # noqa: E402
from scipy.spatial.distance import pdist  # noqa: E402

fig, axes = plt.subplots(1, 2, figsize=(DOUBLE, 2.4))
links = {}
phons = ORDER[:-1]  # leave out silence
for ax, features in zip(axes, ["original", "revised"]):
    m = defs[defs.features == features].pivot(index="phoneme", columns="unit", values="value").loc[phons]
    links[features] = linkage(m.to_numpy(), "average", metric="euclidean")
    dendrogram(links[features], labels=phons, ax=ax, color_threshold=0, above_threshold_color="black")
    ax.set_title(f"{features.capitalize()} definitions")
save(fig, FIGURES, "figS1-clustering")

# ----------------------------------------------------------------------------
# Figure 10: replaced vs next-most-active phoneme
# ----------------------------------------------------------------------------


def early(frame):
    return frame[(frame.cycle >= frame.span_start) & (frame.cycle < frame.span_start + EARLY)]


def next_phoneme(sim):
    """Most active phoneme in the early window other than the replaced one."""
    e = early(sim)
    return e[[p for p in REAL if p != sim.replaced.iloc[0]]].max().idxmax()


fig, axes = plt.subplots(3, 3, figsize=(DOUBLE, 6.0), sharex=True, sharey=True)
for i, L in enumerate(LENGTHS):
    for j, pos in enumerate(POSITIONS):
        ax = axes[i, j]
        for cond, mk in [("noise-1.0", "filled"), ("noise-0.0", "open")]:
            f = select(part="C", features="revised", position=pos, condition=cond)
            f = f[f.length == L]
            if f.empty:
                continue
            nxt = [s.set_index("time")[next_phoneme(s)].rename(w) for w, s in f.groupby("word")]
            nxt = pd.concat(nxt, axis=1)
            for series, label, marker in [(f, "Replaced", "o"), (None, "Next", "^")]:
                if series is not None:
                    m, lo, hi = mean_se(series, "act")
                else:
                    m = nxt.mean(axis=1)
                    se = nxt.sem(axis=1).fillna(0)
                    lo, hi = m - se, m + se
                color = "#8E0152" if cond == "noise-1.0" else COLORS[5]
                ax.plot(m.index, m, marker=marker, markevery=4, color=color,
                        mfc=color if mk == "filled" else "white", label=f"{cond[-3:]}: {label}")
                ax.fill_between(m.index, lo, hi, color=color, alpha=0.12, lw=0)
        ax.set_title(f"Length {L}, {pos}")
        if j == 0:
            ax.set_ylabel("Phoneme activation")
        if i == 2:
            ax.set_xlabel("Time since word onset (cycles)")
legend_below(fig, axes[2, 2], "Noise level: phoneme")
fig.suptitle("Replaced and next-most-active phonemes, revised phonemes", y=1.0)
save(fig, FIGURES, "fig10-replaced-vs-next")

# ----------------------------------------------------------------------------
# Figure 13: early peak by length and position (noise 1.0, revised)
# ----------------------------------------------------------------------------

peaks = (
    select(part="C", features="revised", condition="noise-1.0")
    .query("time < 50")
    .groupby(["word", "length", "position"])
    .act.max()
    .reset_index()
)
fig, ax = plt.subplots(figsize=(3.6, 2.4))
width = 0.26
shades = {"initial": "white", "medial": "0.6", "final": "black"}
report("Fig. 13: early peak (before 50 cycles after onset) of the replaced phoneme, noise 1.0, revised phonemes")
for k, pos in enumerate(POSITIONS):
    g = peaks[peaks.position == pos].groupby("length").act
    m, se = g.mean(), g.sem().fillna(0)
    x = np.arange(len(m)) + (k - 1) * width
    ax.bar(x, m, width, yerr=se, color=shades[pos], edgecolor="black", lw=0.6, capsize=2, label=pos.capitalize())
    for L, v in m.items():
        report(f"  length {L}, {pos}: {v:.3f}")
ax.set_xticks(np.arange(len(LENGTHS)))
ax.set_xticklabels(LENGTHS)
ax.set_xlabel("Word length in phonemes")
ax.set_ylabel("Peak early phoneme activation\n(noise = 1.0)")
ax.legend(title="Replacement position", ncol=3, loc="upper left")
save(fig, FIGURES, "fig13-early-peak")

# ----------------------------------------------------------------------------
# Supplementary: footnote 4, many noise levels
# ----------------------------------------------------------------------------

f = select(part="D")
levels = sorted(f.condition.unique(), key=lambda c: float(c[-3:]))
fig, ax = plt.subplots(figsize=(3.6, 2.4))
cmap = plt.get_cmap("magma_r")
for k, c in enumerate(levels):
    s = f[f.condition == c]
    ax.plot(s.time, s.act, color=cmap(0.15 + 0.8 * k / max(1, len(levels) - 1)), label=c[-3:])
ax.set_xlabel("Time since word onset (cycles)")
ax.set_ylabel("Activation of /l/")
ax.set_title("luxury, initial /l/, original phonemes")
ax.legend(title="Noise", ncol=2, fontsize=6, loc="upper right")
save(fig, FIGURES, "figS2-noise-levels")

# ----------------------------------------------------------------------------
# Statistics reported in the text
# ----------------------------------------------------------------------------

report()
report("Lexicon checks (paper: 4 words begin /r^/ vs 3 /l^/; /r^/ in 17 words vs /l^/ in 10)")
lex = pd.read_csv(os.path.join(RESULTS, "lexicon.csv"), keep_default_na=False).word.tolist()
report(f"  begin r^: {sum(w.startswith('r^') for w in lex)}, begin l^: {sum(w.startswith('l^') for w in lex)}")
report(f"  contain r^: {sum('r^' in w for w in lex)}, contain l^: {sum('l^' in w for w in lex)}")
words_by_len = select(part="C", features="original", condition="intact").drop_duplicates("word").length.value_counts()
report(f"  3/5/7-phoneme words simulated: {dict(sorted(words_by_len.items()))} (paper: 73/31/8)")

report()
report("Noise 1.0: is the replaced phoneme the most active in the early window? (paper, original phonemes: not in ~75%, mostly /k/ or /g/)")
for features in ["original", "revised"]:
    sims = select(part="C", features=features, condition="noise-1.0")
    winners, not_top = Counter(), Counter()
    for (word, pos), s in sims.groupby(["word", "position"]):
        e = early(s)
        top = e[REAL].max().idxmax()
        winners[top] += 1
        not_top[pos] += top != s.replaced.iloc[0]
    n = sims.groupby(["word", "position"]).ngroups
    total = sum(not_top.values())
    report(f"  {features}: replaced phoneme NOT most active in {total}/{n} = {total / max(1, n):.0%} of simulations"
           f" (initial {not_top['initial']}, medial {not_top['medial']}, final {not_top['final']})")
    report(f"    most frequent winners: {', '.join(f'/{p}/ {c}' for p, c in winners.most_common(4))}")

report()
report("Revised phonemes, noise 1.0: is the next-most-active phoneme backed by more frequent bigrams?")
for pos in ["initial", "medial"]:
    sims = select(part="C", features="revised", condition="noise-1.0", position=pos)
    more, equal, less, wins = 0, 0, 0, 0
    for word, s in sims.groupby("word"):
        e = early(s)
        if e[REAL].max().idxmax() == s.replaced.iloc[0]:
            continue  # the replaced phoneme won; nothing to explain
        wins += 1
        nxt = next_phoneme(s)
        k = 0 if pos == "initial" else len(word) // 2
        if pos == "initial":  # word-initial bigram: phoneme + following phoneme
            count = lambda ph: sum(w.startswith(ph + word[1]) for w in lex)  # noqa: E731
        else:  # bigram with the preceding phoneme, anywhere in a word
            count = lambda ph: sum((word[k - 1] + ph) in w for w in lex)  # noqa: E731
        a, b = count(nxt), count(word[k])
        more += a > b
        equal += a == b
        less += a < b
    report(f"  {pos}: replaced phoneme lost in {wins} words; next phoneme's bigram more frequent in {more},"
           f" equally frequent in {equal}, less frequent in {less}")

report()
report("Clustering of original vs revised definitions (paper: virtually indistinguishable)")
r = np.corrcoef(cophenet(links["original"]), cophenet(links["revised"]))[0, 1]
report(f"  correlation of cophenetic distances: r = {r:.3f}")

with open(os.path.join(FIGURES, "stats.txt"), "w") as fh:
    fh.write("\n".join(stats) + "\n")
print(f"wrote {os.path.join(FIGURES, 'stats.txt')}")
