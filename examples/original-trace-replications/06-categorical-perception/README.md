# 06. Categorical perception (M&E Figs. 19–22)

McClelland & Elman (1986), pp. 42–50. Magnuson & Crinnion (2022), Table 22.1,
effect 7.

TRACE combines cues flexibly ([05](../05-trading-relations/)), yet its overt
responses are categorical:

- **Identification is sharp.** Small step-to-step changes in bottom-up support
  for /g/ vs /k/ become a steep identification function, through competition
  at the phoneme level.
- **Discrimination is poor within categories.** Phoneme-to-feature feedback
  pulls the feature level toward the winning phoneme's canonical pattern, so
  stimuli within a category become hard to tell apart, and stimuli that
  straddle the boundary stay distinct.

## Simulations

The model is the stripped-down silence, /a/, /g/, /k/ model described in
[05](../05-trading-relations/) (`../../lib/ga-ka.js`).

- **Stimuli.** As in M&E, there are 11 consonants, spaced equally on both VOT
  and F1OF. They run from beyond /g/ (Stimulus 1) to beyond /k/ (11); 3 is
  canonical /g/ and 9 canonical /k/. In bump centers they run from 2 to 7 in
  half-unit steps. Each is presented in /-Xa-/ for 60 cycles.
- **Identification.** The Luce choice between /g/ and /k/ at slice 12 at cycle
  60, with k = 10.
- **Discrimination** (M&E pp. 47–48). Take the pattern over the 18 VOT and F1OF
  feature units at slice 12 (the consonant's center) at cycle 60, and let r be
  the correlation between two stimuli's patterns.
  - In ABX, X is matched to A with probability
    exp(k·r_XA) / (exp(k·r_XA) + exp(k·r_XB)), with M&E's k = 5.
  - Pairs are one step apart.
- **Control, added here.** Every stimulus is also run with phoneme-to-feature
  feedback off (0 instead of 0.05).

## Run

Rebuild the engine first (`yarn workspace tstrace build`), since the stimuli
use the new `config.inputPhonemes`. Then:

```
node simulate.js        # 22 simulations, ~2 s
python3 plot.py
```

## Figures

- `fig19-stimuli`: where each stimulus peaks on the VOT (and F1OF) dimension.
- `fig20-competition`: the relative bottom-up input to /g/ and /k/ (A) and
  their activations at cycle 60 (B).
- `fig21-identification`: the identification functions and ABX accuracy.
- `fig22-differences`: 1 − r between neighboring stimuli at cycle 60, with
  and without feedback.
- `stats.txt`: the numbers behind the figures.

## Results

**Bottom-up input changes gradually.** /k/ receives 75% as much excitation as
/g/ from Stimulus 3 (fitted to M&E's figure) and 89% from Stimulus 5 (M&E:
88%). The ratio rises smoothly, from 0.67 at Stimulus 1 to 1.36 at Stimulus 11.

**Identification is sharp.** P(/k/) at cycle 60:

| Stimulus | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P(/k/) | 0.000 | 0.001 | 0.001 | 0.005 | 0.080 | 0.494 | 0.914 | 0.994 | 0.999 | 0.999 | 0.999 |

- **Stimulus 5:** /k/ gets 89% of /g/'s support, but is chosen only 8% of the
  time. M&E report 4%.
- **The boundary** lies at Stimulus 6, just short of 7, as in M&E's Fig. 21.
  The reconstructed /k/ pattern is clipped more at the edge of its dimension
  than /g/'s, which tips Stimulus 6 slightly toward /g/ (0.98 bottom-up ratio).

**Discrimination is categorical, and feedback is what does it.** 1 − r between
neighboring stimuli at cycle 60, and ABX accuracy:

| Pair | 1–2 | 3–4 | 4–5 | 5–6 | 6–7 | 7–8 | 8–9 | 10–11 |
|---|---|---|---|---|---|---|---|---|
| with feedback: 1 − r | 0.011 | 0.036 | 0.086 | 0.106 | 0.105 | 0.076 | 0.034 | 0.009 |
| with feedback: ABX | 0.51 | 0.54 | 0.61 | 0.63 | 0.63 | 0.59 | 0.54 | 0.51 |
| no feedback: 1 − r | 0.043 | 0.057 | 0.060 | 0.060 | 0.057 | 0.050 | 0.043 | 0.029 |

- **Within categories, feedback erases differences.** For pairs beyond the
  canonical stimuli, 1 − r falls to about 0.01, a quarter of its value without
  feedback. ABX accuracy is then at chance (0.51).
- **Across the boundary, differences grow.** Pairs straddling the boundary
  differ more with feedback (0.106) than without (0.060).
- **Without feedback, discrimination barely tracks the categories.** It varies
  only gently along the continuum, from 0.029 to 0.060. This is M&E's point:
  the sharpening at the feature level comes from phoneme-to-feature feedback.
- **The ABX peak is modest.** With k = 5, accuracy peaks at 0.63. M&E's Fig. 21
  shows a larger peak, but the ABX values depend directly on the size of the
  feature differences, which depend on the reconstructed patterns.
- **Identification itself barely needs feedback.** Without it, Stimulus 5
  gives P(/k/) = 0.040 and the function is about as steep. Phoneme-level
  competition alone produces the sharp identification.
