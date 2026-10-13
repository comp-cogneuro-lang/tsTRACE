# 01. The lexical effect on phoneme identification (M&E Figs. 5–7)

McClelland & Elman (1986), pp. 24–29. Magnuson & Crinnion (2022), Table 22.1,
effects 1 (lexical effect), 2 (eliminated under time pressure) and 4 (needs an
ambiguous phoneme).

## Simulations

The ambiguous segment `?` is the midpoint of a 3-step /b/–/p/ continuum
(`continuumSpec` `bp3`, input phoneme `1`), so its features support /b/ and
/p/ equally.

| Run | Purpose |
|---|---|
| /?l^g/ (*plug*), /?l^S/ (*blush*) | M&E Figs. 5–6: the following context decides the ambiguous segment |
| /pl^g/ | M&E Fig. 6: a clear /p/ is identified long before the word is known |
| /bl^g/ | M&E Fig. 7: same for a clear /b/ in a context that favors /p/ |
| /pl^S/, /bl^S/ | M&E p. 29: clear segments are not moved by the lexicon |
| /?ist/ (*beast*), /?r^S/ (*brush*), /?ragr^s/ (*progress*) | further contexts from the jTRACE gallery |

Response probabilities use the Luce choice rule over all phoneme units at the
segment's slot (slot 4, M&E's "Slice 12"), with M&E's exponent k = 10.

**One change to the lexicon.** M&E's lexicon contained *blush* (p. 25), but the
TRACE lexicon that survives (used by jTRACE, the C code, and tsTRACE) does not,
so `simulate.js` adds /bl^S/. Without it, nothing pulls /?l^S/ toward /b/.
All parameters are the defaults.

## Run

```
node simulate.js        # 9 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig05-trace-plug`: the state of the Trace at four cycles while /?l^g/ comes
  in, drawn as in M&E: each unit is a box at the height of its activation,
  as wide as the stretch of input it spans. Only the six most active word units
  are shown in each panel, and phoneme units between input peaks are omitted,
  as in M&E.
- `fig06-timecourse`: P(/p/) at the initial segment over time. The shaded
  region is after Fox's (1982) 500-ms response deadline, at M&E's 25 ms per
  cycle.
- `fig07-trace-clear`: the Trace for a clear /bl^g/.
- `fig-ambiguity`: P(/p/) at the last cycle, for clear and ambiguous onsets.

## Results

These match M&E's account:

- **The context only matters late.** /?l^g/ and /?l^S/ follow the same curve
  until about cycle 40. That is a few cycles after the final phoneme peaks at
  cycle 30, the first point at which the input says which word it is. By cycle
  74, P(/p/) is 0.85 in *plug* and 0.23 in *blush*.
- **Early responses are accurate for clear segments.** P(/p/) for /pl^g/ reaches
  0.95 by cycle 24, 12 cycles after the segment's center. That is well inside
  Fox's deadline, when the ambiguous segment is still at chance.
- **Clear segments are not moved by the lexicon.** At the last cycle, P(/p/) is
  1.00 for /pl^S/ and 0.00 for /bl^g/, even though each runs against its word.
- **There is an early /p/ bias.** Before any word is identified, the ambiguous
  segment leans slightly toward /p/ in every context: around cycles 30–36,
  P(/p/) is 0.56–0.66 and P(/b/) is 0.33–0.43. M&E attribute this to there being
  more /pl/ words than /bl/ words in the lexicon (p. 25). The bias is lexical, not
  phonetic. With an empty lexicon, the midpoint activates /b/ and /p/ exactly
  equally. But it does not need /l/: it appears before /r^S/ and /ist/ too,
  because more of the lexicon's words begin with /p/ than with /b/. *beast*
  never quite overturns it: P(/p/) = 0.45 at cycle 74.
