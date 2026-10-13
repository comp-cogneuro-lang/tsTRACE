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
  active copies of W1 and W2 for the 15 items in each splicing condition.
- **Decision rule (reconstructed).** On each run the threshold is the nominal
  value plus normal noise (SD 0.05). The response time is the first cycle at
  which W1 or W2 reaches it.
- **Design.** 1,000 runs per item, condition and threshold, at thresholds
  0.10–0.50. Thresholds that some item fails to reach on more than 5% of runs
  are left out of the figure (0.45 and 0.50).

## Run

```
node simulate.js        # 45 simulations, 1000 runs per cell, ~3 s
python3 plot.py
```

## Figures

- `fig-lexical-decision`: mean response cycle (A), its SD within items (B), and
  the share of W2W1 responses triggered by W2 (C), by threshold; mean ± 1 SE
  over items.
- `stats.txt`: the values.

## Results

| Threshold | Mean W1W1 | Mean N3W1 | Mean W2W1 | SD W1W1 | SD N3W1 | SD W2W1 | W2W1 triggered by W2 |
|---|---|---|---|---|---|---|---|
| 0.15 | 27.7 | 28.2 | 28.3 | 3.16 | 3.67 | 3.72 | 13% |
| 0.20 | 30.6 | 31.7 | 31.9 | 2.77 | 3.48 | 3.76 | 13% |
| 0.25 | 33.3 | 35.2 | 35.9 | 2.79 | 3.70 | 4.18 | 8% |
| 0.30 | 36.2 | 39.1 | 40.4 | 3.08 | 4.18 | 4.87 | 3% |
| 0.40 | 43.3 | 49.0 | 52.4 | 4.47 | 6.54 | 8.45 | 0% |

(Response times are in cycles.)

- **Means: as the paper reports.** Up to a threshold of about 0.25, W2W1 and
  N3W1 means are nearly identical (within 0.7 cycles) and slower than W1W1.
  They diverge at higher thresholds, where W2 rarely reaches threshold and
  only the delayed W1 responds.
- **Variability: as the paper argues.** W2W1 is the most variable condition at
  every threshold. Up to 13% of its responses are triggered by W2, but none in
  N3W1.
- **This depends on the reconstructed rule.** The size of the effects depends
  on the threshold noise, and the paper's own rule may have differed. The
  paper also notes that this kind of rule wrongly predicts more errors for
  nonwords such as W2N1; that condition isn't simulated here.
