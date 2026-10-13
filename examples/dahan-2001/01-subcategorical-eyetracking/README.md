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

- **Items.** The paper's 15 triplets, in its TRACE transcriptions (*net* /git/,
  *neck* /gik/, *nep* /gip/), with default parameters and 100 cycles.
- **Splicing.** As in the paper, input slices up to 23 come from the first
  token and slices from 24 on (the final consonant's peak) from W1. In tsTRACE
  this is a splice of the final consonant, e.g. W2W1 = `-gi{k6t}-`.
- **Lexicon.** The default lexicon plus every W1 and W2 (239 entries; the paper
  had 257).
- **Readout.** Each word's most active copy. Predicted fixations use the Luce
  choice rule (k = 7) over the four pictures: W1, W2 and two unrelated
  distractors. The paper's curves start at 0.25, which shows it used this
  unscaled form.

## Run

```
node simulate.js        # 45 simulations, ~3 s
python3 plot.py
```

## Figures

- `fig04-subcategorical`: activation (A) and predicted fixations (B) for W1
  and W2 in the three conditions, mean ± 1 SE over the 15 items.
- `stats.txt`: peaks and crossing times.

## Results

| | W1W1 | N3W1 | W2W1 |
|---|---|---|---|
| W2 peak activation | 0.174 (cycle 34) | 0.189 (cycle 36) | 0.251 (cycle 42) |
| W1 activation, cycle 99 | 0.549 | 0.532 | 0.528 |
| W2 peak predicted fixations | 0.381 | 0.396 | 0.431 |
| W1 predicted fixations reach 0.5 | cycle 31 | cycle 33 | cycle 36 |

- **The paper's pattern reproduces.** W2 is most active given W2W1, less given
  N3W1, least given W1W1. The target rises fastest given W1W1, a little slower
  given N3W1, and slowest given W2W1.
- **The mismatch only delays the target.** W1 reaches nearly the same level in
  all three conditions. This is the paper's point against Marslen-Wilson and
  Warren's (1994) simulations, in which W1 stayed low.
- **Activations are close to the paper's Fig. 4.** The paper prints them ×100;
  read from its figure, W2 peaks at about 0.14, 0.16 and 0.23, and W1 at about
  0.50.
- **Predicted fixations rise somewhat earlier than in the paper's figure,**
  where W1 crosses 0.5 at about cycles 40–48.
- **Activations go below zero here.** After the target wins, W2 falls below
  zero, to −0.08 given W1W1. The paper's TRACE printed only positive values.
