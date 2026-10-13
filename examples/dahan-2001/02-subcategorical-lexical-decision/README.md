# 02. Subcategorical mismatch: lexical decision (LCP pp. 529–530)

Dahan, Magnuson, Tanenhaus & Hogan (2001).

Lexical-decision studies found equal latencies for W2W1 and N3W1, which was
taken as evidence against lexical competition. Dahan et al. proposed instead
that a "yes" can be triggered by the competitor W2 as well as the target W1.

- **Why that equalizes the means.** W2W1 then mixes early, W2-driven responses
  with late, competition-delayed W1 responses, so its mean can match N3W1's.
- **What it predicts.** W2W1's variability should be larger. McQueen et al.'s
  (1999) data agree: SDs of 162, 201 and 168 ms for W1W1, W2W1 and N3W1.

The paper's simulation is described only in outline: a "yes" is generated
probabilistically when either W1 or W2 reaches threshold, 1,000 runs per item,
across a range of thresholds. The details were in an unpublished report.

## Simulation

- **Activations.** As in [01](../01-subcategorical-eyetracking/): the most
  active copies of W1 and W2 for the 15 items in each splicing condition, with
  the archived lexicon and splicing, and both parameter sets (`archive`, the
  settings the archived code ran, and `me86`, the paper's stated M&E set). The
  figure uses `archive`.
- **Decision rule (reconstructed).** On each run the threshold is the nominal
  value plus normal noise (SD 0.05). The response time is the first cycle at
  which W1 or W2 reaches it. The archived code has no lexical-decision
  simulation, so this rule remains a reconstruction.
- **Design.** 1,000 runs per item, condition and threshold, at thresholds
  0.10–0.50. Thresholds that some item fails to reach on more than 5% of runs
  are left out of the figure and tables (with `archive`, 0.40–0.50).

## Run

```
node simulate.js        # 90 simulations, 1000 runs per cell, ~6 s
python3 plot.py
```

## Figures

- `fig-lexical-decision`: mean response cycle (A), its SD within items (B), and
  the share of W2W1 responses triggered by W2 (C), by threshold, with the
  archived parameters; mean ± 1 SE over items.
- `stats.txt`: the values for both parameter sets.

## Results

With the archived parameters (response times in cycles):

| Threshold | Mean W1W1 | Mean N3W1 | Mean W2W1 | SD W1W1 | SD N3W1 | SD W2W1 | W2W1 triggered by W2 |
|---|---|---|---|---|---|---|---|
| 0.10 | 25.7 | 26.3 | 26.0 | 4.82 | 5.37 | 5.34 | 24% |
| 0.15 | 29.5 | 30.9 | 30.8 | 3.47 | 4.55 | 4.72 | 39% |
| 0.20 | 32.8 | 35.5 | 35.7 | 3.22 | 4.65 | 5.41 | 36% |
| 0.25 | 36.0 | 40.2 | 41.6 | 3.40 | 5.19 | 6.45 | 24% |
| 0.30 | 39.7 | 45.8 | 48.5 | 3.91 | 5.92 | 7.53 | 15% |
| 0.35 | 43.8 | 52.1 | 56.6 | 4.66 | 6.86 | 8.55 | 10% |

- **Means: as the paper reports.** Up to a threshold of 0.20, W2W1 and N3W1
  means are within 0.4 cycles of each other and slower than W1W1. They diverge
  at higher thresholds, where W2 reaches threshold less often and the delayed
  W1 responses dominate.
- **Variability: as the paper argues.** From a threshold of 0.15 on, W2W1 is
  the most variable condition. Up to 39% of its responses are triggered by W2,
  against at most 1% in N3W1.
- **M&E's parameters give the same pattern, more weakly.** W2 triggers at most
  14% of W2W1 responses, and W2W1 and N3W1 stay within 0.6 cycles up to 0.25.
- **This depends on the reconstructed rule.** The size of the effects depends
  on the threshold noise, and the paper's own rule may have differed. The
  paper also notes that this kind of rule wrongly predicts more errors for
  nonwords such as W2N1; that condition isn't simulated here.
