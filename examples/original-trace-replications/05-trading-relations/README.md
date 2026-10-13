# 05. Trading relations between two cues (M&E Figs. 15–18)

McClelland & Elman (1986), pp. 36–42. Magnuson & Crinnion (2022), Table 22.1,
effect 6.

Listeners trade one cue to a phoneme against another. With a higher
first-formant onset frequency (F1OF), a shorter voice onset time (VOT) is
enough to hear /k/ rather than /g/ (Summerfield & Haggard, 1977). TRACE should
show the same, because a phoneme unit simply adds up the bottom-up support from
all feature dimensions.

## The model (shared with [06](../06-categorical-perception/), in `../../lib/ga-ka.js`)

M&E stripped TRACE down for these simulations (pp. 36–37):

- **Phonemes and words.** Only silence, /a/, /g/ and /k/, and no word level.
- **The two cues.** /g/ and /k/ are identical on five feature dimensions. They
  differ only on VOT and F1OF, which replace voicing and burst.
- **No overlap.** /a/ and silence share no feature units with /g/ or /k/.
- **Parameters.** Phoneme-to-feature feedback is 0.05, feature decay 0.03 and
  phoneme inhibition 0.05; everything else is at the defaults.

M&E show the patterns on the two cue dimensions only as drawings (Figs. 15
and 19), so they are reconstructed:

- **Pattern shape.** Each is a Gaussian bump over the dimension's 9 units,
  centered at unit 3 for /g/ and unit 6 for /k/. The outer units (0 and 8),
  which /a/ and silence use, are left at 0.
- **Width.** The width (1.92 units) is fitted to the one number M&E give:
  canonical /g/ sends /k/ 75% as much bottom-up excitation as /g/. It then
  predicts 89% for their Stimulus 5, against the 88% they report.
- **/a/.** Its default values on diffuseness and acuteness overlap /g/ and /k/,
  so on those dimensions it uses a single unused unit (unit 1).
- **Input-only consonants.** The consonants are presented with tsTRACE's
  `config.inputPhonemes`. These are input-only phonemes, like continuum steps,
  so they get no phoneme units.

## Simulations

The stimuli are 25 consonants, crossing five VOT patterns with five F1OF
patterns, each in /-Xa-/, run for 60 cycles. The response is the Luce choice
between /g/ and /k/ at slice 12 at cycle 60, with k = 10, as in M&E.

**Choosing the five values.** M&E say the trading stimuli "lie between Stimuli
6 and 4" of their categorical-perception continuum (p. 45; the page image reads
the same). That cannot be literal. In their Fig. 21 the /g/–/k/ boundary lies
between Stimuli 6 and 7, so every stimulus in that range would favor /g/.
Their Fig. 18, however, reaches P(/k/) ≈ 0.85, and the text treats the middle
value as "neutral". So here the five values are centered on the boundary and
span Stimuli 4–8. In bump centers that is 3.5, 4, 4.5, 5 and 5.5; value 3 is
the midpoint.

## Run

`config.inputPhonemes` is new, so rebuild the engine first
(`yarn workspace tstrace build`). Then:

```
node simulate.js        # 25 simulations, ~2 s
python3 plot.py
```

## Figures

- `fig15-patterns`: the canonical /g/ and /k/ patterns and the five values used.
- `fig17-trace`: the phoneme level at four cycles for the most /g/-like stimulus.
- `fig18-trading`: P(/k/) at cycle 60 for all 25 stimuli, with one curve per
  F1OF value.
- `stats.txt`: the full table, and the VOT value giving P(/k/) = 0.5 at each
  F1OF value.

## Results

P(/k/) at cycle 60:

| F1OF \ VOT | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1 | 0.005 | 0.023 | 0.085 | 0.254 | 0.473 |
| 2 | 0.024 | 0.080 | 0.223 | 0.486 | 0.704 |
| 3 | 0.090 | 0.228 | 0.494 | 0.762 | 0.901 |
| 4 | 0.275 | 0.500 | 0.767 | 0.914 | 0.972 |
| 5 | 0.500 | 0.725 | 0.907 | 0.973 | 0.994 |

- **The cues trade.** The VOT value needed for P(/k/) = 0.5 falls as F1OF
  rises: 4.07 at F1OF 2, 3.02 at F1OF 3, and 2.00 at F1OF 4. This is
  Summerfield and Haggard's finding.
- **M&E's three equivalent combinations come out equal.** These are a neutral
  VOT with the most /k/-like F1OF, the reverse, and somewhat /k/-like values on
  both. Here they give 0.907, 0.901 and 0.914, against M&E's 0.82–0.85. The
  level is a little higher, which depends on the reconstructed patterns and
  the spacing of the five values.
- **The curves have M&E's shape.** They are roughly linear in the middle and
  level off at the extremes, where both cues point the same way (cf. Denes,
  1955, in M&E's Fig. 16).
