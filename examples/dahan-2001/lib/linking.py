"""Linking hypotheses of Dahan et al. (2001): activation -> fixation probability.

Import with:  from linking import luce, amt_scale, to_frames
(plot.py scripts add ../lib to sys.path first).

  luce(acts, k, weights)  basic Luce choice over the displayed items ("RDL"):
                          S = exp(k a) (times an optional per-item weight, e.g.
                          log10(c + f) for frequency applied after activation),
                          P = S / sum S. With equal activations each of n items
                          gets 1/n, which fits displays where participants could be
                          fixating any picture at word onset.
  amt_scale(acts, ...)    Allopenna et al.'s (1998) scaling ("AMT"), for tasks
                          where fixations start off the pictures (activations
                          shifted so that rest = 0, as in the archived scripts)
  to_frames(series, ...)  map cycles to 33.12-ms eye-tracking frames
"""

import numpy as np

MS_PER_CYCLE = 12.4  # Dahan, Magnuson & Tanenhaus (2001): 498 ms / 40.1 cycles
FRAME_MS = 33.12  # their downsampled frame (30-Hz video)


def luce(acts, k=7.0, weights=None):
    """acts: (n_items, n_times). Returns probabilities of the same shape."""
    strength = np.exp(k * np.asarray(acts, float))
    if weights is not None:
        strength = strength * np.asarray(weights, float)[:, None]
    return strength / strength.sum(axis=0, keepdims=True)


def amt_scale(acts, extra=None, offset=0.3):
    """Allopenna et al.'s scaling factor for each item and time.

    Delta_t = max over displayed items of a(t) / max over the whole trial
    (Eq. 7), floored at 0. As in the archived simulation scripts
    (ComputeTraceProb_SubCat_1.pl, "restdefault"), activations are first
    shifted by `offset` = 0.3, the negative of the word resting level (-0.3),
    so a unit at rest counts as 0. With `extra` (one value per item), the
    frequency variant of Eq. 8: (max_t a + extra_i) / (max a + extra_i), so it
    differs by item.
    """
    acts = np.asarray(acts, float) + offset
    top = acts.max(axis=0)  # max over displayed items at each time
    if extra is None:
        return np.clip(top / top.max(), 0, None)[None, :].repeat(len(acts), axis=0)
    extra = np.asarray(extra, float)[:, None]
    return np.clip((top[None, :] + extra) / (top.max() + extra), 0, None)


def to_frames(series, n_frames, delay=0, ms_per_cycle=MS_PER_CYCLE, frame_ms=FRAME_MS):
    """Resample per-cycle values (last axis) at frame times by linear
    interpolation, after `delay` frames during which the cycle-0 value is held
    (the time to plan and launch an eye movement)."""
    series = np.atleast_2d(np.asarray(series, float))
    cycles = np.arange(series.shape[1])
    t = np.arange(n_frames) * frame_ms / ms_per_cycle - delay * frame_ms / ms_per_cycle
    t = np.clip(t, 0, cycles[-1])
    return np.vstack([np.interp(t, cycles, s) for s in series])
