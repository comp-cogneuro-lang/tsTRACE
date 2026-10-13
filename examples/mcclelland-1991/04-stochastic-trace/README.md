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
  - phoneme→word excitation 0.05 and word→phoneme excitation 0.02;
  - feature decay 0.02;
  - processing noise SD 0.02 (`stochasticitySD`, which adds noise to every
    unit's net input before each update, as the paper describes).
- **Response.** Running averages (λ = 0.05) of the /l/ and /r/ units at slice
  24 (slot 8); the larger one at cycle 90 is the response.
- **Seeds.** Each trial has its own seed, so the results don't depend on the
  number of workers.
- **Deterministic comparison.** The 9 conditions are also run once without
  noise and read out with the Luce rule (k = 10), the original formulation
  (cf. [01](../01-luce-readout/)).

## Run

The stimuli use `config.inputPhonemes`, so the engine must be built
(`yarn workspace tstrace build`).

```
WORKERS=8 node simulate.js   # 4,500 trials: ~14 min on 1 worker, ~2 min on 8
python3 plot.py
```

Keep `WORKERS` at or below about 70% of your physical cores. `TRIALS=100` runs
fewer trials per condition.

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
| s | 0.004 | 0.196 | 0.910 |
| p | 0.042 | 0.630 | 0.994 |
| t | 0.298 | 0.936 | 1.000 |

- **The classical pattern holds in full TRACE.** Parallel lines explain 99.45%
  of the variance in z (paper: 99.94%). The best spacing puts the neutral
  liquid at 0.50, exactly midway between the /l/-like and /r/-like ones.
- **The context effect is in the paper's order.** /t/ (favoring /r/ through
  *tree*) is above /p/, which is above /s/ (favoring /l/ through *sleep* and
  *sleet*). The intercepts are −0.61, −1.60 and −2.70.
- **The deterministic original is distorted.** With the Luce readout and no
  noise, parallel lines explain only 96.0%.
- **The liquids are a little more discriminable than in the paper.** z runs
  from −2.65 to 3.09 here, against about −1.5 to 2.2 in the paper's Fig. 9.
  One cell (/t/, /r/-like) is at ceiling (500 of 500), so its z rests on the
  clipping rule. The paper's liquids were presumably a little more confusable,
  for reasons it doesn't record.
