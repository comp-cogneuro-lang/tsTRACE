# 01. Subcategorical mismatch: predicted fixations (LCP Fig. 4)

Dahan, Magnuson, Tanenhaus & Hogan (2001), pp. 523–526.

Each target word (W1, e.g. *net*) was cross-spliced so that its vowel came
from another token:

- **W1W1:** another token of *net*.
- **W2W1:** the word *neck*, so the vowel carries cues to /k/.
- **N3W1:** the nonword *nep*, so the vowel carries cues to /p/.

Listeners were slower to fixate the target when the misleading cues pointed to
a real word (W2W1) than to a nonword (N3W1). Lateral inhibition between words
predicts this, and TRACE simulated it.

## Simulation

The design follows the paper and the archived simulation code
(`SubCatSims_2k0325`, final version "Try3"; see `../README.md`).

- **Items.** The 15 triplets in their TRACE transcriptions (*net* /git/,
  *neck* /gik/, *nep* /gip/). *carp* is /krp/, as in the archived files; the
  printed appendix's /kup/ is a typo. 100 cycles.
- **Splicing.** Input slices up to 23 come from the first token and slices from
  24 on (the final consonant's peak) from W1, as in the paper and the
  archive's splicing script. In tsTRACE this is a splice of the final
  consonant, e.g. W2W1 = `-gi{k9t}-` (`{k6t}` with M&E's phonemes, whose
  features spread 6 slices instead of 9).
- **Lexicon.** Built as in the archive: the 235-word lexicon of the Unix
  distribution of TRACE (`../items/distribution-lexicon.txt`), minus /bab/,
  /babi/ and /bat^l/, plus every W1, W2 and cohort-absent competitor. That
  gives 263 words; the paper reports 257.
- **Display.** W1, W2 and the two unrelated distractors of the archived
  displays (e.g. *net*: /par/, /b^s/).
- **Readout.** As in the archived code: each word's most active copy, and a
  plain Luce choice (k = 7) over the four displayed words, with no scaling and
  no delay. The paper's curves start at 0.25, which confirms this form.
- **Two parameter sets.**
  - `archive`: what the archived code ran. It uses the feature set of the Unix
    distribution of TRACE (`../items/distribution-phonemes.json`), whose
    dimensions spread 3, 6, 9, 9, 9, 3 and 9 slices. Word-to-phoneme excitation
    is 0.015 and phoneme inhibition 0.05; everything else is as in M&E (1986).
  - `me86`: what the paper's text describes, M&E's parameters and phonemes.

## Run

```
node simulate.js        # 90 simulations, ~6 s
python3 plot.py
```

## Figures

- `fig04-subcategorical`: activation (A) and predicted fixations (B) for W1
  and W2 in the three conditions, with the archived parameters, mean ± 1 SE
  over the 15 items.
- `fig04-subcategorical-me86`: the same with M&E's parameters.
- `stats.txt`: peaks and crossing times for both parameter sets.

## Results

| | W1W1 | N3W1 | W2W1 |
|---|---|---|---|
| Paper's Fig. 4 (read from the figure): W2 peak | ≈0.15 (cycle ≈36) | ≈0.165 (≈40) | ≈0.23 (≈44) |
| `archive`: W2 peak activation | 0.151 (cycle 35) | 0.164 (cycle 39) | 0.259 (cycle 54) |
| `me86`: W2 peak activation | 0.175 (cycle 34) | 0.191 (cycle 36) | 0.256 (cycle 43) |
| Paper: W1 peak | ≈0.51 | ≈0.50 | ≈0.475 |
| `archive`: W1, cycle 99 | 0.549 | 0.523 | 0.495 |
| `me86`: W1, cycle 99 | 0.547 | 0.531 | 0.527 |
| Paper: W1 predicted fixations reach 0.5 | cycle ≈34 | ≈36 | ≈40 |
| `archive`: W1 predicted fixations reach 0.5 | cycle 33 | 35 | 43 |
| `me86`: W1 predicted fixations reach 0.5 | cycle 31 | 33 | 36 |

- **The paper's pattern reproduces with both parameter sets.** W2 is most
  active given W2W1, less given N3W1, and least given W1W1. The target rises
  fastest given W1W1, slower given N3W1, and slowest given W2W1. The mismatch
  only delays the target, which reaches a similar level in all three
  conditions. This is the paper's point against Marslen-Wilson and Warren's
  (1994) simulations, in which W1 stayed low.
- **The archived parameters match the paper's figure more closely.** The W2
  peaks for W1W1 and N3W1 agree with the figure to within 0.002 and one
  cycle. M&E's parameters put them 0.025 higher.
- **What still differs.**
  - Given W2W1, W2 here peaks a little higher and later than in the paper.
  - The paper's W1 peaks near cycle 70 and then sags to about 0.47, so its
    predicted target fixations end near 0.90; here W1 keeps rising, to
    0.50–0.55, and fixations end at 0.88–0.97.
  - The archive has no surviving outputs for these runs, so the cause can't be
    traced.
- **Activations go below zero here.** After the target wins, W2 falls to
  −0.07 given W1W1 (archive). The paper's figure shows no negative values.

## What the original code settled

- **Splice point.** Slices 0–23 come from the first token and slices 24 on
  from W1, which is what tsTRACE's final-consonant splice does.
- ***carp*.** It is /krp/.
- **Lexicon.** It was built from the 235-word distribution lexicon.
- **Displays.** The distractors and cohort-absent competitors are listed.
- **Readout.** Post-hoc max copy, plain Luce with k = 7 over the four pictures,
  no scaling.
- **The parameters actually compiled.** These were the distribution phonemes
  and spreads, word-to-phoneme excitation 0.015, and phoneme inhibition 0.05,
  not the M&E set the paper names.

One caution: the archived C code has a bug in its phoneme→word loop (see
`../README.md`). It shifts each word's bottom-up input one phoneme slot early.
tsTRACE reproduces the corrected C code to within 0.012, not the buggy build.
