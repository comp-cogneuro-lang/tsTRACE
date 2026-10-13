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
- **Distractors.** Three per pair, the same for both members: distribution-lexicon
  words with frequencies 10–150, unrelated in onset (seeded picks; the paper
  doesn't list its own).
- **Lexicon, parameters and the four frequency methods** as in
  [03](../03-frequency-cohorts/).
- **AMT.** The RDL probabilities are scaled by Δ(t) = max a(t) / max a over the
  four pictures (Eq. 7). The paper says it multiplied response *strengths* by
  Δ, but a factor common to all four strengths cancels in the Luce rule. Here,
  as in Allopenna et al. (1998) and the archived scripts, the probabilities
  are scaled instead. Activations are first shifted by +0.30 so that rest
  counts as 0, as the archived scripts do. For
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
| RDL, no frequency | 0.000 | 0.003 | 0.009 (497 ms) |
| RDL, resting levels | 0.068 | 0.039 | 0.081 (364 ms) |
| RDL, connection weights | 0.000 | 0.024 | 0.061 (530 ms) |
| RDL, post-activation | 0.059 | 0.033 | 0.081 (364 ms) |
| AMT, no frequency | 0.000 | −0.000 | 0.005 (530 ms) |
| AMT, resting levels | 0.010 | 0.041 | 0.075 (530 ms) |
| AMT, connection weights | 0.000 | 0.048 | 0.100 (696 ms) |
| AMT, post-activation | 0.081 | 0.053 | 0.123 (397 ms) |

- **Every frequency method makes high-frequency targets win sooner.** With AMT,
  target fixations reach 0.5 about 33 ms earlier for HF targets than for LF
  ones (530 vs 563 ms) under resting levels and weights.
- **The paper's AMT findings reproduce.**
  - AMT nearly removes the frequency bias before input arrives: 0.010 with
    resting levels, 0 with weights. The post-activation variant is the
    exception.
  - That variant starts at 0.081, which matches the paper's remark that Eq. 8
    "only partially succeeds in reducing initial activation values".
  - The AMT variants sustain the difference longer than the RDL ones.
- **No frequency gives essentially no difference here.** The paper found a
  slight HF advantage without frequency, from differences in the items'
  neighborhoods. The lexicon here is built the same way as the paper's, so
  the remaining difference probably lies in the distractors (the paper's
  aren't listed) or the phoneme set.
- **No fit statistics.** The paper's RMS and r² comparisons need the human data
  and are not reproduced.

## What the original code settled

The archive supplied with the subcategorical-mismatch simulations
(`SubCatSims_2k0325`) also holds frequency-paper scripts and fits from
February–March 2000. It settles two points and leaves the main one open.

- **AMT scaling.** The archived script (`ComputeTraceProb_SubCat_1.pl`) shifts
  every activation by +0.30, the negative of the word resting level, before
  applying Eq. 7. It then multiplies the Luce *probabilities*, not the
  strengths, by the scaling factor. `../lib/linking.py` now does both. The
  shift is why resting-level frequency leaves a small difference (0.010) at
  0 ms.
- **Base lexicon.** This is the 235-word distribution lexicon
  (`../items/distribution-lexicon.txt`), which the frequency lexicon here is
  built on (298 distinct words; the paper's 303 counts five duplicates).
- **Not settled: connection-weight frequency.** The archived C code applies it
  with a line that is buggy and compiler-dependent. The paper's Eq. 4 is
  different again, and so is tsTRACE's version. See `../README.md`.
- **Post-activation frequency.** The archived script's version weights
  strengths by ln(f + 13). The published Eq. 6 uses log10(c + f) with c = 15,
  and that is what is used here.
