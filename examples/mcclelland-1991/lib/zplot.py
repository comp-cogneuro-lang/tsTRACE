"""z-transformed choice probabilities and the "classical" parallel-lines fit.

McClelland (1991) tests whether context and stimulus have the independent
(additive) effects that classical models (signal detection theory, Massaro's
FLMP) predict. If they do, z(P(/r/)) plotted against the stimulus falls on
parallel straight lines, one per context. fit_parallel fits that model (one
common slope, one intercept per context) and reports the percentage of
variance it accounts for, the statistic the paper reports (e.g. 99.97%).

Import with:  from zplot import zscore, fit_parallel, plot_z, LETTERS
"""

import numpy as np
from scipy.stats import norm

# the paper labels each curve with a letter (Fig. 4 caption)
LETTERS = {"s": "s", "p": "p", "t": "t", "none": "n", "isolated": "x"}


def zscore(p, n=None):
    """Inverse-normal transform. With n trials, p is kept within [1/2n, 1 - 1/2n]
    so that cells with no (or all) /r/ choices still give a finite z."""
    p = np.asarray(p, dtype=float)
    lo = 0.5 / n if n else 1e-6
    return norm.ppf(np.clip(p, lo, 1 - lo))


def fit_parallel(x, z, groups, free_middle=False):
    """Least-squares fit of z = a[group] + b * x.

    With free_middle=True, x must take three values (0, 0.5, 1); the middle
    one is then treated as a free position (McClelland's Fig. 9: "choosing the
    spacing of the input conditions to promote a straight line fit").
    Returns (intercepts by group, slope, x positions used, percent variance explained).
    """
    x, z, groups = np.asarray(x, float), np.asarray(z, float), np.asarray(groups)
    names = list(dict.fromkeys(groups))

    def solve(xx):
        design = np.column_stack([(groups == g).astype(float) for g in names] + [xx])
        coef, *_ = np.linalg.lstsq(design, z, rcond=None)
        sse = float(np.sum((design @ coef - z) ** 2))
        return coef, sse

    xx = x
    if free_middle:
        best = None
        for m in np.linspace(0.01, 0.99, 981):
            cand = np.where(np.isclose(x, 0.5), m, x)
            coef, sse = solve(cand)
            if best is None or sse < best[1]:
                best = (cand, sse)
        xx = best[0]
    coef, sse = solve(xx)
    sst = float(np.sum((z - z.mean()) ** 2))
    return dict(zip(names, coef[:-1])), float(coef[-1]), xx, 100 * (1 - sse / sst)


def plot_z(ax, frame, x="input", z="z", group="context", fit=None, xx=None, connect=False):
    """Points drawn as the paper's context letters, with the fitted lines
    (fit = (intercepts, slope)) or, with connect=True, each context's points joined."""
    for g, f in frame.groupby(group, sort=False):
        letter = LETTERS.get(g, g)
        if connect:
            ax.plot(f[x], f[z], color="0.75", lw=0.7, zorder=0)
        for xi, zi in zip(f[x] if xx is None else xx[frame[group] == g], f[z]):
            ax.text(xi, zi, letter, ha="center", va="center", fontsize=8)
        if fit is not None:
            intercepts, slope = fit
            xs = np.array([f[x].min(), f[x].max()]) if xx is None else np.array([0, 1])
            ax.plot(xs, intercepts[g] + slope * xs, color="0.6", lw=0.7, zorder=0)
    ax.axhline(0, color="0.9", lw=0.5, zorder=-1)
