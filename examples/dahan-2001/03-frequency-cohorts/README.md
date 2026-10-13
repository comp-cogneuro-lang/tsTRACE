# 03. Frequency of cohort competitors (CP Exp. 1, Figs. 5–7)

Dahan, Magnuson & Tanenhaus (2001), pp. 333–345.

Listeners hearing *bench* fixated a high-frequency cohort competitor (*bed*)
more than a low-frequency one (*bell*), from early in the word. The paper
compared three ways of putting frequency into TRACE, and no frequency at all,
against these data.

## Simulation

- **Items.** 17 target / HF cohort / LF cohort triplets in the paper's TRACE
  transcriptions, plus one unrelated distractor each, from jTRACE's template
  for this simulation (the paper doesn't list them). Each target is presented
  alone for 100 cycles.
- **Lexicon.** The 235-word distribution lexicon plus every stimulus of both
  experiments, with Kučera–Francis frequencies: 298 distinct words, the
  paper's 303 less five duplicates (see `../README.md`).
- **Parameters.** M&E defaults except word resting level −0.3 (Appendix B).
- **The four methods** (scaling constants from Appendix B):

  | Method | Implementation |
  |---|---|
  | No frequency | — |
  | Resting levels | rest = −0.3 + 0.06·log10(1 + f), f capped at 1000 |
  | Connection weights | tsTRACE's frequency weighting with s = 0.13 (see `../README.md` for how it differs from the paper's Eq. 4) |
  | Post-activation | S = e^(7a)·log10(15 + f) on the no-frequency activations |

- **Linking.** Luce choice (k = 7) over the four pictures. Time runs at
  12.4 ms per cycle, in 33.12-ms frames, after the paper's fitted delays: 3
  frames for no frequency and resting levels, 4 for weights, 2 for
  post-activation.

## Run

```
node simulate.js        # 51 simulations, ~4 s
python3 plot.py
```

## Figures

- `fig05-activations`: activations under no frequency, resting levels and
  connection weights.
- `fig06-fixations`: predicted fixations for the four methods.
- `fig07-hf-minus-lf`: the HF − LF cohort difference over time.
- `fig06-archive`: choice probabilities by cycle, with no delay, for resting
  levels and post-activation, against an archived TRACE prediction (below).
- `stats.txt`: differences by window, their onsets, and RMS differences from
  the archived prediction.

All curves show the mean ± 1 SE over the 17 items.

## Results

HF − LF predicted cohort fixations:

| Method | At 0 ms | Mean 200–500 ms | Peak |
|---|---|---|---|
| No frequency | 0.000 | 0.003 | 0.019 (530 ms) |
| Resting levels | 0.112 | 0.120 | 0.146 (530 ms) |
| Connection weights | 0.000 | 0.038 | 0.212 (596 ms) |
| Post-activation | 0.097 | 0.118 | 0.135 (464 ms) |

The paper's data average 0.080 over 200–500 ms.

- **Every frequency method favors the HF cohort; no frequency doesn't.**
- **The paper's key qualitative contrast reproduces.** Resting levels and
  post-activation build in a frequency bias before any input arrives (0.112
  and 0.097 at 0 ms). Connection weights start at no difference, and the
  difference grows as bottom-up input arrives. The paper singles this out as
  the one feature of the data only the weight method captures.
- **The weight method's difference arrives later and grows larger than the
  paper describes.** It first passes 0.02 at about 400 ms, peaks at 0.21 near
  600 ms, and averages only 0.038 over 200–500 ms. The paper describes its
  onset as "gradual (although still immediate and fast)".
  - The formula is probably not the cause. tsTRACE's weighting differs from
    the paper's Eq. 4, but it is the form jTRACE used to match the paper's
    Fig. 6 closely (`../README.md`).
  - Nor is the lexicon. Moving from tsTRACE's default lexicon to the
    distribution lexicon the paper used, with jTRACE's distractors, changed
    these numbers by less than 0.005.
  - The cause is still open. One candidate is the phoneme set: the archived
    subcategorical runs, from the same months, used the distribution's
    phonemes and feature spreads, not M&E's.
- **No fit statistics.** The paper's RMS and r² comparisons need the human data
  and are not reproduced.
- **An archived prediction is matched closely.** The archive holds one
  averaged TRACE prediction for this experiment (`Try2/FrqE1.PROBDATA`, copied
  to `../items/archive-FrqE1-probdata.txt`): choice probabilities for target,
  HF, LF and distractor by cycle. The file is unlabeled; the column order is
  inferred from the curves.
  - It starts with a frequency bias, so it comes from resting levels (or
    post-activation). Our resting-level run is within RMS 0.020 of it over
    cycles 2–80. The archived curves run about 2 cycles later (RMS 0.011 when
    shifted).
  - Its starting probabilities (0.212, 0.290, 0.210, 0.288) imply a
    resting-level scale of about 0.04 with these items and distractors, not
    the paper's 0.06. It was presumably an earlier fit.

## What the original code settled

The archive supplied with the subcategorical-mismatch simulations
(`SubCatSims_2k0325`) holds some frequency-paper material from February–March
2000: fit files, a target list, the probability script, and the archived
prediction compared above. It also pins down the gap in the
connection-weight method.

- **The archived C code implements connection-weight frequency with a buggy
  line.** In the phoneme→word loop of `interact.c`, the line is
  `*wnexptr++ += (wp->wfrq * *wtptr++*t) + (*wtptr++*t);`, with
  `wfrq = fscale·log10(1 + f)`.
  - It advances the weight pointer twice per target slot, so the frequency
    term and the plain term use different weights.
  - The order of the two increments is undefined in C, so the result depends
    on the compiler.
- **Three versions differ.** The archived code, the paper's Eq. 4
  (a′ = a·[1 + a·s·log10(1 + f)]), and tsTRACE (input × (1 + s·log10 f), on
  both phoneme→word and word→phoneme connections) are all different.
  - jTRACE's replication used tsTRACE's form and matched the paper closely,
    so this is probably not why the weight method here peaks later and higher
    than the paper describes.
  - Reproducing Eq. 4 exactly would need an engine option.
- **The archived fits suggest a different scale.** A file named
  `FinalFits_wts_ds10_fs035` suggests a weight-frequency scale of 0.035 at
  that stage, against the paper's s = 0.13.
