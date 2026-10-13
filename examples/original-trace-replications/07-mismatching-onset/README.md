# 07. Recovering from a mismatching first phoneme (M&E Fig. 24)

McClelland & Elman (1986), pp. 55–57. Magnuson & Crinnion (2022), Table 22.1,
effect 8.

The COHORT model drops a word as soon as the input mismatches it, so a
distorted first phoneme should make a word unrecognizable. TRACE instead
uses competition among word units. If no word matches the input exactly, the
closest word can still win, more slowly than an exact match.

## Simulations

| Run | What M&E expect |
|---|---|
| /lig^l/ (*legal*) | *legal* completely dominates *regal* |
| /l^g^d/ (*lugged*, not a word) | *rugged* eventually wins, though less effectively than with exact input |
| /r^g^d/ (*rugged*) | comparison: the intact word (added here) |

Word activations come from each word's most active copy. The silence "word" is
excluded.

**One change to the lexicon.** M&E's lexicon contained *regal* (p. 19; they
added it, with *blush* and *sleet*, "to make specific points"). The TRACE
lexicon that survives (used by jTRACE, the C code, and tsTRACE) does not, so
`simulate.js` adds /rig^l/. All parameters are the defaults; 90 cycles.

## Run

```
node simulate.js        # 3 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig24-trace`: the state of the Trace at cycles 36 and 72 for /lig^l/ and
  /l^g^d/, drawn as in M&E.
- `fig-timecourse`: word activations for each run. Each panel shows the
  words M&E discuss plus the three most active other words. The dashed line
  marks the cycle from which the expected word leads every other word for the
  rest of the run.
- `stats.txt`: those lead cycles and final activations.

## Results

| Run | Expected winner | Leads from cycle | Final activation |
|---|---|---|---|
| /lig^l/ | *legal* | 40 | 0.71 |
| /l^g^d/ | *rugged* | 65 | 0.63 |
| /r^g^d/ | *rugged* | 33 | 0.71 |

- ***regal* never gets going.** Its peak is 0.016, at cycle 21, and it
  ends at −0.15. The early leader is
  the embedded word *league* (/lig/, peak 0.35), which *legal* overtakes at
  cycle 40.
- ***rugged* wins with a mismatching onset, but late.** For most of /l^g^d/,
  words that match the onset lead: *luck* (/l^k/, peak 0.36), *lucky* and
  *plug*. *rugged* only overtakes them at cycle 65, a full 32 cycles later than
  when it is presented intact, and it ends lower (0.63 vs 0.71). This is M&E's
  description: *rugged* "is less effective ... than it would be if the input
  exactly matched it, but it does win out in the end".
