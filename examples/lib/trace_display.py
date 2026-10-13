"""Readouts and displays in the style of McClelland & Elman (1986).

Import with:  from trace_display import luce, draw_trace, phoneme_centers, K_ME
(plot.py scripts add the examples' lib folder to sys.path first).

  luce(frame, k)        response probabilities from phoneme activations at one
                        slot (rows from phonemeSlotRows in sim-utils.js)
  draw_trace(...)       one "state of the Trace" panel, as in M&E's Figs. 5, 7-9,
                        12-13: each unit is a box whose height is its activation
                        and whose width is the stretch of input it spans
  phoneme_centers(...)  cycles at which each input phoneme's features peak
"""

import numpy as np
import pandas as pd
from matplotlib.patches import Rectangle

# M&E (p. 46): the exponent used "in all ... cases where we translate activation
# into response probability" is 10.
K_ME = 10
# default TRACE geometry: input phonemes every 6 feature slices, units every 3
DELTA_INPUT = 6
SLICES_PER_PHON = 3


def luce(frame, k=K_ME, by=("run", "cycle")):
    """Luce choice over all phoneme units at a slot.

    `frame` has columns run, cycle, phoneme, activation. Returns the same rows
    with a column `p`: exp(k a) / sum over the slot's phonemes of exp(k a).
    """
    by = list(by)
    out = frame.copy()
    strength = np.exp(k * out.activation)
    out["p"] = strength / strength.groupby([out[c] for c in by]).transform("sum")
    return out


def phoneme_centers(model_input, delta_input=DELTA_INPUT):
    """Cycle (= feature slice) at which input position i is centered, for each i.

    Input arrives one feature slice per cycle, so the slice at the center of an
    input phoneme is also the cycle at which its features peak.
    """
    return [delta_input * (i + 1) for i in range(len(model_input))]


def draw_trace(ax_word, ax_phon, snap, cycle, model_input, ambiguous="?", threshold=0.05,
               max_words=6, word_ylim=(0, 0.8), phon_ylim=(0, 1.0), delta_input=DELTA_INPUT,
               slices_per_phon=SLICES_PER_PHON):
    """Draw the state of the Trace at one cycle on two stacked axes.

    snap:  rows from traceSnapshot (sim-utils.js) with columns cycle, level,
           unit, slot, length, activation.
    ax_word may be None to draw the phoneme level only.
    model_input: the input string, used to label the x axis; input-only
           continuum phonemes (digits) are shown as `ambiguous`.
    Only units at or above `threshold` are drawn, and of the word units only
    the `max_words` most active, so the display stays readable. Word units with
    identical span and activation are drawn as one box labeled "a/b". As in M&E,
    phoneme units centered between input peaks (odd slots) are left out for
    clarity. A caret marks how far into the input the model has got at this
    cycle (omitted once the whole input has arrived).
    """
    f = snap[(snap.cycle == cycle) & (snap.activation >= threshold)]
    # words with the same span and activation (e.g. "sleep" and "sleet" before
    # their last phoneme) share one box, as in M&E's Fig. 12
    words = f[f.level == "word"].assign(act=lambda w: w.activation.round(3))
    words = (words.groupby(["slot", "length", "act"], as_index=False)
             .agg(cycle=("cycle", "first"), level=("level", "first"),
                  unit=("unit", "/".join), activation=("activation", "first"))
             .drop(columns="act").nlargest(max_words, "activation"))
    f = pd.concat([f[f.level == "phoneme"], words])
    step = delta_input // slices_per_phon  # slots between successive phonemes
    for r in f.itertuples():
        if r.level == "phoneme" and r.slot % step:
            continue
        if r.level == "word" and ax_word is None:
            continue
        ax, ylim = (ax_word, word_ylim) if r.level == "word" else (ax_phon, phon_ylim)
        x0 = slices_per_phon * r.slot - delta_input / 2
        x1 = slices_per_phon * (r.slot + step * (r.length - 1)) + delta_input / 2
        h = 0.06 * (ylim[1] - ylim[0])
        ax.add_patch(Rectangle((x0, r.activation), x1 - x0, h, fill=False, lw=0.5))
        ax.text((x0 + x1) / 2, r.activation + h / 2, r.unit, ha="center", va="center", fontsize=5)

    width = delta_input * (len(model_input) + 1)
    for ax, ylim in [(ax_word, word_ylim), (ax_phon, phon_ylim)]:
        if ax is None:
            continue
        ax.set_xlim(0, width)
        ax.set_ylim(*ylim)
        ax.set_xticks([])
    if ax_word is not None:
        ax_word.spines["bottom"].set_visible(False)
        # start word ticks above 0 so they don't collide with the phoneme axis's top label
        ax_word.set_yticks(np.arange(0.2, word_ylim[1] + 1e-9, 0.2))
    shown = "".join(ambiguous if ch.isdigit() else ch for ch in model_input)
    ax_phon.set_xticks(phoneme_centers(model_input, delta_input))
    ax_phon.set_xticklabels(list(shown))
    ax_phon.tick_params(axis="x", length=0)
    if cycle <= width:
        ax_phon.annotate("^", (cycle, 0), xycoords=("data", "axes fraction"), xytext=(0, -14),
                         textcoords="offset points", ha="center", va="top", fontsize=7)


def trace_panels(container, snap, frames, model_input, title="cycle {cycle}", words=True, **kw):
    """A row of Trace displays (words above phonemes), one per cycle in `frames`.

    container: a matplotlib Figure or SubFigure. Frames later than the last
    simulated cycle are skipped, so smoke runs still plot. words=False draws
    the phoneme level only (for models without a lexicon). Extra keyword
    arguments go to draw_trace. Returns the array of axes (2 x n, or 1 x n).
    """
    frames = [c for c in frames if c <= snap.cycle.max()]
    rows = 2 if words else 1
    axes = container.subplots(rows, len(frames), sharey="row", squeeze=False, gridspec_kw={"hspace": 0.05})
    for j, cycle in enumerate(frames):
        ax_word = axes[0, j] if words else None
        draw_trace(ax_word, axes[-1, j], snap, cycle, model_input, **kw)
        axes[0, j].set_title(title.format(cycle=cycle))
    if words:
        axes[0, 0].set_ylabel("Word\nactivation")
    axes[-1, 0].set_ylabel("Phoneme\nactivation")
    return axes
