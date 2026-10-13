# 10. One long word or two short ones? (M&E Figs. 27–28)

McClelland & Elman (1986), pp. 61–64. Magnuson & Crinnion (2022), Table 22.1,
effect 11 (lexical segmentation).

The stream /parti/ could be one word (*party*) or two (*par tea*). M&E showed
that:
- TRACE first favors the short word *par*, then settles on *party*.
- A brief silence (/par-ti/) gives *par* + *tea*.
- With no spanning word (/barti/), it settles on *bar* + *tea*, which do not
  overlap and gang up on the overlapping *art*.
- It can fail to find a valid parse: in /parki/, *park* beats *par* and *key*.

## Simulations

Inputs (from the jTRACE gallery's "word segmentation" set): /parti/,
/par-ti/, /barti/, /parki/. Default lexicon and parameters, 100 cycles. Word
activations come from each word's most active copy. Besides the words M&E
discuss (*party*, *par*, *tea*, *bar*, *art*, *park*, *key*), *part* is
tracked, because it turns out to be a strong rival.

## Run

```
node simulate.js        # 4 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig27-trace-party`: the state of the Trace at cycles 24, 42, 60 and 99 for
  /parti/, drawn as in M&E.
- `fig28-final`: the state of the Trace at cycle 99 for each input.
- `fig-words`: the candidate words over time, one panel per input.

## Results

Activations at cycle 99:

| Input | Winner(s) | Rivals |
|---|---|---|
| /parti/ | *party* 0.70 | *part* 0.03, *tea* 0.03, *par* −0.05 |
| /par-ti/ | *par* 0.47, *tea* 0.44 | *part* 0.43, *party* 0.08 |
| /barti/ | *bar* 0.52, *tea* 0.39 | *art* 0.35 |
| /parki/ | *park* 0.63 | *key* 0.28, *par* 0.14 |

- **/parti/: short words lead, then the long word wins.** *par* leads early
  (0.34 vs 0.26 for *party* at cycle 42; peak 0.35 at cycle 45). *party* passes
  it at cycle 48 and ends at 0.70. One detail M&E do not mention: *part*, which
  is also embedded at the start of *party*, is about as strong as *par*
  (0.33 at cycle 42; peak 0.39 at cycle 56). *party* passes it at cycle 51.
- **/par-ti/: silence gives two words, but only just.** *par* and *tea* end up
  as the two most active words, as in M&E's Fig. 28. But a misaligned copy of
  *part* (starting half a phoneme late) is close behind (0.43).
- **/barti/: non-overlapping words gang up.** *bar* and *tea* each beat *art*,
  which overlaps both. *art* still keeps a fair activation (0.35), not far
  below *tea*.
- **/parki/: no valid parse.** *park* wins clearly and suppresses *par*, as M&E
  report, so the parse leaves the /i/ to *key*, which overlaps *park*.
