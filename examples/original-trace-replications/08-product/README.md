# 08. The time course of recognizing one word (M&E Figs. 25–26)

McClelland & Elman (1986), pp. 57–60. Magnuson & Crinnion (2022), Table 22.1,
effect 9.

COHORT assumes that a candidate word drops out the moment the input diverges
from it. M&E asked how close TRACE comes to that, following five words that
diverge from *product* (/prad^kt/) at successive phonemes:

| Word | TRACE form | First mismatch |
|---|---|---|
| *trot* | /trat/ | phoneme 1 |
| *possible* | /pas^b^l/ | phoneme 2 |
| *priest* | /prist/ | phoneme 3 |
| *progress* | /pragr^s/ | phoneme 4 |
| *produce* | /pradus/ | phoneme 5 |

## Method

As in M&E (p. 58), *product*'s response strength is set to 1 at every cycle,
and each other word is plotted as the ratio of its strength to *product*'s.
Strength is exp(k·a) with M&E's k = 10, so the ratio is
exp(10 · (a<sub>word</sub> − a<sub>product</sub>)).

Activations come from each word's most active copy among those aligned near
the first input phoneme (slots 2–6). M&E compare words that begin where
*product* begins, so copies aligned with later parts of the input are left
out. Default lexicon and parameters; 80 cycles.

"Drops out" is not defined by M&E. Here a word counts as out of contention once
its relative strength falls below 0.5 for good (a criterion chosen here).

## Run

```
node simulate.js        # 1 simulation, <1 s
python3 plot.py
```

## Figures

- `fig25-trace`: the state of the Trace at cycles 24, 36, 48 and 66, drawn as
  in M&E.
- `fig26-relative`: strength relative to *product*. A shows processing cycles,
  with the input phonemes marked at their peaks. B aligns each word on the
  peak of its first mismatching phoneme, as in M&E's caption.
- `stats.txt`: dropout cycles and the short-word advantages below.

## Results

| Word | Mismatch peaks at cycle | Relative strength < 0.5 from cycle | Lag |
|---|---|---|---|
| *trot* | 12 | 24 | 12 |
| *possible* | 18 | 27 | 9 |
| *priest* | 24 | 34 | 10 |
| *progress* | 30 | 38 | 8 |
| *produce* | 36 | 49 | 13 |

- **Candidates fade one by one, just after their mismatch.** Each word drops
  below half of *product*'s strength 8–13 cycles (one to two phonemes) after
  its mismatching phoneme peaks. In panel B the five curves fall almost
  together. This is M&E's result: mismatching candidates "begin to fade" just
  after each successive phoneme comes in. The fade is gradual, not the discrete
  drop COHORT assumes.
- **Shorter words have a temporary advantage.**
  - *priest* is slightly ahead of *product* before the /a/ has had its effect:
    the peak ratio is 1.04, at cycle 26.
  - *produce*, one phoneme shorter, is ahead from cycle 17 to cycle 46: the
    ratio peaks at 1.88 at cycle 39, after the /^/ (cycle 36) has arrived.
  - M&E describe both ("*produce* is well ahead of *product* until the /^/
    comes in"). In TRACE, longer words suffer more inhibition from other long
    words.
- ***product* ends at 0.82.**
