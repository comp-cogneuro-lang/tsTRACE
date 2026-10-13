# 04. Frequency of the target (CP Exp. 2, Figs. 9–12)

Dahan, Magnuson & Tanenhaus (2001), pp. 345–353.

With only unrelated distractors in the display, listeners fixated
high-frequency targets (*bed*) sooner than low-frequency ones (*bell*). In this
task participants weren't already fixating the target at word onset. So
besides the basic choice rule ("RDL"), the paper tried Allopenna et al.'s
scaled rule ("AMT"), which keeps fixation probabilities near zero until the
input supports someone.

## Simulation

- **Items.** 21 low/high-frequency pairs in the paper's TRACE transcriptions,
  each word presented alone for 100 cycles.
- **Distractors.** Three per pair, the same for both members: default-lexicon
  words with frequencies 10–150, unrelated in onset (seeded picks; the paper
  doesn't list its own).
- **Lexicon, parameters and the four frequency methods** as in
  [03](../03-frequency-cohorts/).
- **AMT.** The RDL probabilities are scaled by Δ(t) = max a(t) / max a over the
  four pictures (Eq. 7). The paper says it multiplied response *strengths* by
  Δ, but a factor common to all four strengths cancels in the Luce rule. Here,
  as in Allopenna et al. (1998), the probabilities are scaled instead. For
  post-activation frequency, Eq. 8's item-specific factor is used:
  (max a(t) + f⁴) / (max a + f⁴), with f = log10(15 + frequency).
- **Time mapping and delays** as in example 03.

## Run

```
node simulate.js        # 126 simulations, ~10 s
python3 plot.py
```

## Figures

- `fig09-activations`: HF and LF target activations for each frequency method.
- `fig10-rdl`: predicted target fixations, basic Luce choice.
- `fig11-amt`: predicted target fixations, scaled Luce choice.
- `fig12-hf-minus-lf`: the HF − LF difference for all eight methods.
- `stats.txt`: the values behind them.

All curves show the mean ± 1 SE over the 21 pairs.

## Results

HF − LF predicted target fixations:

| Method | At 0 ms | Mean 200–1000 ms | Peak |
|---|---|---|---|
| RDL, no frequency | 0.000 | 0.002 | 0.006 |
| RDL, resting levels | 0.068 | 0.040 | 0.079 (431 ms) |
| RDL, connection weights | 0.000 | 0.028 | 0.070 (530 ms) |
| RDL, post-activation | 0.058 | 0.032 | 0.079 (397 ms) |
| AMT, no frequency | 0.000 | −0.001 | 0.007 |
| AMT, resting levels | 0.000 | 0.048 | 0.101 (563 ms) |
| AMT, connection weights | 0.000 | 0.072 | 0.151 (696 ms) |
| AMT, post-activation | 0.083 | 0.054 | 0.123 (397 ms) |

- **Every frequency method makes high-frequency targets win sooner.** With AMT,
  target fixations reach 0.5 about 33 ms earlier for HF targets than for LF
  ones (596 vs 629 ms) under resting levels and weights.
- **The paper's AMT findings reproduce.**
  - AMT removes the frequency bias before input arrives, except in the
    post-activation variant.
  - That variant starts at 0.083, which matches the paper's remark that Eq. 8
    "only partially succeeds in reducing initial activation values".
  - The AMT variants sustain the difference longer than the RDL ones.
- **No frequency gives essentially no difference here.** The paper found a
  slight HF advantage without frequency, from differences in the items'
  neighborhoods. That depends on its 303-word lexicon, which can't be fully
  rebuilt.
- **No fit statistics.** The paper's RMS and r² comparisons need the human data
  and are not reproduced.
