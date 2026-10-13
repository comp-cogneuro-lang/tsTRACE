# 12. Word ends mark boundaries; nonword ends do not (M&E Fig. 30)

McClelland & Elman (1986), pp. 65–67. Magnuson & Crinnion (2022), Table 22.1,
effect 11 (lexical segmentation).

Listeners detect a word-initial target phoneme more slowly after a nonword
("gatabont decided") than after a word ("government decided"; Foss & Blank,
1980). M&E's account:
- Once a word is identified, TRACE knows where it ends. Competitors that
  straddle the boundary have been crushed by the time the next word's first
  phoneme arrives.
- After a nonword, words beginning and ending at many places stay partly
  active, including some that overlap the boundary. So it is not clear that
  the next phoneme starts a word until well into that word.

## Simulations

| Input | Stream |
|---|---|
| /pas^b^ltarg^t/ | *possible target* |
| /pag^s^ltarg^t/ | *pagusle target*, M&E's Fig. 30 |
| /piSd^rptarg^t/ | nonword + *target*, from the jTRACE gallery |

In all three the first part has 7 phonemes, so *target* starts at input
position 8 (slot 18). Its /t/ peaks at cycle 54. Default lexicon and
parameters, 100 cycles.

M&E show the boundary only in Trace displays. To put a number on it,
`simulate.js` tracks the **best straddling word** at every cycle. This is the
most active unit of any word (other than *target* and silence) whose span
covers both the last phoneme of the first part (slot 16) and the /t/ (slot 18).
A copy of *possible* that sits half a phoneme late (covering slots 5–17) does
not count. It also tracks *target* (aligned within one slot of slot 18) and,
for the word stream, *possible*.

## Run

```
node simulate.js        # 3 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig30-trace`: the state of the Trace at cycles 45, 57 and 99 for *possible
  target* and *pagusle target*, as in M&E's Fig. 30.
- `fig-boundary`: for each stream, the activations of *target*, *possible* (word
  stream only) and the best straddling word. The straddling word's name is
  given at cycle 54 (dashed line), when the /t/ peaks.

## Results

| Stream | Best straddler at cycle 54 | Its highest value (cycle) | *target* > 0.3 from cycle | *target* at 99 |
|---|---|---|---|---|
| *possible target* | −0.07 (*lid*) | 0.03 (cycle 21) | 80 | 0.68 |
| *pagusle target* | 0.16 (*asleep* /^slip/) | 0.35 (*adult* /^d^lt/, cycle 91) | 82 | 0.59 |
| /piSd^rp/ *target* | 0.17 (*double* /d^b^l/) | 0.17 (cycle 55) | 79 | 0.74 |

- **After a word, the boundary is clear when the /t/ arrives.** *possible* is
  at 0.53 when the /t/ peaks. No word that crosses the boundary is above 0.02
  at any point after cycle 25.
- **After a nonword, straddling words are active.** At the /t/'s peak, *asleep*
  (/^slip/, lined up with /^s^lt/) and *double* (/d^b^l/) span the boundary at
  0.16–0.17. After /piSd^rp/ they fade once *target* takes hold.
  After *pagusle* they keep growing: *adult* (/^d^lt/), which
  matches /^s^lt/ but for one phoneme and ends on the /t/ of *target*, reaches
  0.35 at cycle 91. That is more than half of *target*'s final activation.
- **A spurious word for the nonword.** In *pagusle target*, *possible* also ends
  up fairly active (0.45 at cycle 99), as a near match to the nonword.
- **Where this differs from Foss & Blank.** *target* itself is not slower after
  the nonwords here: it passes 0.3 at cycles 79–82 in all three streams. So the
  difference lies in where the word boundary is, not in recognizing the word
  after it. That fits M&E's point that the task requires deciding that the
  target phoneme is word-initial.
