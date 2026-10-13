# 13. Short words need the next word; long words do not (M&E Fig. 31)

McClelland & Elman (1986), pp. 67–69. Magnuson & Crinnion (2022), Table 22.1,
effect 11 (lexical segmentation).

At the /r/ of *tar box*, *tar* might still turn out to be *target*. M&E showed
that in TRACE, *tar* leads *target* only somewhat while the /r/ comes in, and
*target* fades only when *box* emerges from the phonemes that follow. A longer
word is different: in *guitar box*, *guitar* "is clearly dominant at the word
level" once its /r/ has registered. This mirrors Grosjean's (1985) finding
that monosyllables often cannot be identified until well into the next word.

## Simulations

Inputs: /tarbaks/ (*tar box*) and /g^tarbaks/ (*guitar box*). Default lexicon
and parameters, 100 cycles. Word activations come from each word's most active
copy. *tar*, *target*, *guitar* and *box* are always saved, along with every
other word that exceeds 0.1 at some point.

## Run

```
node simulate.js        # 2 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig31-trace`: the state of the Trace at cycles 24, 36, 48 and 72 for both
  inputs, drawn as in M&E.
- `fig-words`: word activations over time. The dashed line marks the cycle at
  which the /r/ peaks: cycle 24 in *tar box*, cycle 36 in *guitar box*.

## Results

| Cycle | 24 | 36 | 48 | 60 | 72 | 99 |
|---|---|---|---|---|---|---|
| *tar box*: *tar* | 0.10 | 0.34 | 0.46 | 0.52 | 0.57 | 0.57 |
| *tar box*: *target* | 0.08 | 0.26 | 0.36 | 0.24 | −0.08 | −0.19 |
| *tar box*: *box* | −0.02 | −0.04 | 0.08 | 0.40 | 0.57 | 0.63 |
| *guitar box*: *guitar* | 0.10 | 0.33 | 0.57 | 0.66 | 0.70 | 0.71 |
| *guitar box*: *box* | −0.01 | −0.01 | 0.01 | 0.15 | 0.45 | 0.62 |

- **In *tar box*, *target* stays a serious rival until *box* arrives.**
  *target* trails *tar* by only 0.02–0.10 through cycle 48. It keeps rising
  until cycle 50 (peak 0.36). It collapses only as *box* takes hold: *box*
  passes 0.1 at cycle 49, and *target* falls below zero at cycle 69.
- **In *guitar box*, the long word is decided early.** When the /r/ peaks
  (cycle 36), *guitar* (0.33) already leads its best rival, *got* /gat/
  (0.23). From cycle 42 on it leads every rival by at least 0.25 (not counting
  *box*, which comes later in the input and does not compete with it). *tar*
  and *target*, embedded in *guitar*, never exceed 0.06.
