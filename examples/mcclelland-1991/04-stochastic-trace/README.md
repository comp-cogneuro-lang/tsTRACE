# 04. Stochastic TRACE (McClelland 1991, Fig. 9)

The small network of examples 01–03 lacks time, a feature level and a real
lexicon. McClelland therefore checked that full TRACE, with noise added to
every unit's net input, also produces the classical pattern: parallel straight
lines in z(P(/r/)).

## Simulation

The design (pp. 23–25) is 3 contexts × 3 liquids, with 500 noisy trials each
and 90 cycles per trial.

- **Inputs.** The syllables /s_i/, /p_i/ and /t_i/, with two silences on each
  side (`--sXi--`), so the liquid peaks at slice 24.
- **The liquids.** /r/ and /l/ are made more confusable on the acuteness
  dimension (footnote 4): units 4–6 are .25 .50 .75 for the /r/-like liquid,
  .75 .50 .25 for the /l/-like one, and .50 .50 .50 for the neutral one.
  - They are presented with `config.inputPhonemes`, so the /r/ and /l/ phoneme
    units keep their usual definitions.
  - On every other dimension they keep the default values. These match M&E's:
    the /r/–/l/ correlation is 0.78 here against 0.80 in M&E's Table 2.
  - /r/ and /l/ also differ on diffuseness, and the paper doesn't say what the
    neutral liquid had there, so it gets their average.
- **Parameters.** The paper's changes to M&E's parameters:
  - feature spread 3 on every dimension, so the phonemes don't overlap;
  - word resting level −0.1;
  - phoneme→word excitation 0.03 and word→phoneme excitation 0.015 (see
    below);
  - feature decay 0.02;
  - processing noise SD 0.02 (`stochasticitySD`, which adds noise to every
    unit's net input before each update, as the paper describes).
- **Response.** Running averages (λ = 0.05) of the /l/ and /r/ units at slice
  24 (slot 8); the larger one at cycle 90 is the response.
- **Gains.** The paper prints phoneme→word 0.05 and word→phoneme 0.02, but
  McClelland's own code used 0.03 and 0.015. Strauss, Harris & Magnuson
  (2007, footnote 7) report that the printed values give larger lexical effects
  than the paper's, and jTRACE's replication file (`extra/mcclellend-1991.jt`)
  uses the code's values. They are the default here; `GAINS=paper` runs the
  printed ones.
- **Seeds.** Each trial has its own seed, so the results don't depend on the
  number of workers.
- **Deterministic comparison.** The 9 conditions are also run once without
  noise and read out with the Luce rule (k = 10), the original formulation
  (cf. [01](../01-luce-readout/)).

## Run

The stimuli use `config.inputPhonemes`, so the engine must be built
(`yarn workspace tstrace build`).

```
WORKERS=8 node simulate.js   # 4,500 trials: ~16 min on 1 worker, ~2 min on 8
python3 plot.py
```

Keep `WORKERS` at or below about 70% of your physical cores. `TRIALS=100` runs
fewer trials per condition, and `GAINS=paper` uses the paper's printed gains.

## Figures

- `fig09-stochastic-trace`:
  - A: the deterministic model with the Luce readout.
  - B: the stochastic model, with ±1 SE (binomial, carried into z units) and
    the best parallel lines. As in the paper, the neutral liquid's position on
    the x axis is fitted ("choosing the spacing of the input conditions to
    promote a straight line fit").
- `stats.txt`: P(/r/), z with SEs, the fitted spacing, and the variance the
  lines explain, for both versions.

## Results

The table gives P(/r/) for 500 trials per condition. The deterministic version's
values are in `stats.txt`.

| Context | /l/-like | neutral | /r/-like |
|---|---|---|---|
| s | 0.010 | 0.386 | 0.960 |
| p | 0.022 | 0.538 | 0.994 |
| t | 0.096 | 0.758 | 0.996 |

Compared with the paper's Fig. 9 (values read off the figure, ±0.05 z):

| | Paper | Here (code's gains) | Here (printed gains) |
|---|---|---|---|
| Variance explained by parallel lines | 99.94% | 99.63% | 99.45% |
| Context effect, /t/ − /s/ (z) | ≈ 1.2 | 0.97 | 2.08 |
| Liquid effect, /r/-like − /l/-like (z) | ≈ 3.2 | 4.19 | 3.95 |

- **The classical pattern holds in full TRACE.** Parallel lines explain 99.63%
  of the variance in z (paper: 99.94%). The best spacing puts the neutral
  liquid at 0.49, almost exactly midway between the /l/-like and /r/-like ones.
- **The context effect matches the paper's.** /t/ (favoring /r/ through
  *tree*) is above /p/, which is above /s/ (favoring /l/ through *sleep* and
  *sleet*), evenly spaced as in the paper. The intercepts are −1.40, −1.88
  and −2.37. With the printed gains, the context effect is about twice the
  paper's and unevenly spaced (−0.61, −1.60, −2.70), with one cell at ceiling.
- **The deterministic original is distorted.** With the Luce readout and no
  noise, parallel lines explain only 98.1%.
- **The liquids are more discriminable than in the paper.** The liquid effect
  is about 30% larger than the paper's, with either set of gains. The causes
  checked and ruled out:
  - the liquids' features, which follow M&E's Table 1 and footnote 4;
  - the noise, which perturbs every unit's net input just before its update,
    as the paper describes;
  - the input timing (12 slices of silence on each side, target peaking at
    slice 24).
  The remaining difference is unexplained. jTRACE's replication was also only
  moderately close (RMS error about 0.16, against about 0.08 between repeated
  runs of McClelland's code).
