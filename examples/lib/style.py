"""Shared figure style for the tsTRACE examples.

Import with:  from style import apply_style, COLORS, MARKERS, save, SINGLE, DOUBLE
(plot.py scripts add ../lib to sys.path first).
"""

import os
import matplotlib

matplotlib.use("Agg")  # write files only; no window
import matplotlib.pyplot as plt

# Figure widths in inches for typical journal columns.
SINGLE = 3.5
DOUBLE = 7.2

# Okabe-Ito palette: distinguishable with common forms of color blindness.
COLORS = ["#000000", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"]
# Markers to pair with colors so lines stay distinct in grayscale.
MARKERS = ["o", "s", "^", "D", "v", "P", "X", "*"]


def apply_style():
    """Small, clean defaults suitable for print."""
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.size": 8,
            "axes.titlesize": 8,
            "axes.labelsize": 8,
            "legend.fontsize": 7,
            "xtick.labelsize": 7,
            "ytick.labelsize": 7,
            "axes.spines.top": False,
            "axes.spines.right": False,
            "axes.linewidth": 0.6,
            "lines.linewidth": 1.0,
            "lines.markersize": 3,
            "legend.frameon": False,
            "savefig.dpi": 300,
            "savefig.bbox": "tight",
            "pdf.fonttype": 42,  # embed TrueType so text stays editable
        }
    )


def save(fig, figures_dir, name):
    """Save a figure as vector PDF (for publication) and PNG (for quick viewing)."""
    os.makedirs(figures_dir, exist_ok=True)
    for ext in ("pdf", "png"):
        fig.savefig(os.path.join(figures_dir, f"{name}.{ext}"))
    plt.close(fig)
    print(f"saved {name}.pdf/.png")
