# 15. Segmenting every word pair (M&E pp. 62–64)

McClelland & Elman (1986), pp. 62–64. Magnuson & Crinnion (2022), Table 22.1,
effect 11 (lexical segmentation); Strauss, Harris & Magnuson (2007), Table 1,
validation simulation 13.

With no cues to word boundaries, how often does lexical competition alone
parse a two-word stream correctly? M&E made 211 pairs "by simply permuting the
lexicon twice and then abutting the two permutations so that each word
occurred once as the first word and once as the second word". Each stream had
silence at the start and end. A parse was correct "in the sense that no other
word was more active than either of the two words that had been presented".
TRACE got **189 of 211** right (90%).

## Design

- **Pairs.** The 212 words of the default lexicon (M&E's had 211; silence is not
  counted as a word), permuted twice with a seeded generator. Pair *i* is word
  *i* of the first permutation followed by word *i* of the second. M&E ran one
  such set; here **8 independent sets** (1,696 pairs) are run, so the proportion
  correct comes with a standard error across sets.
- **Input.** `-` + first word + second word + `-`. Default parameters, except
  that the Trace is lengthened to 135 feature slices so the longest streams
  (up to 20 positions) fit. In the default 99-slice Trace, the end of a long
  stream runs into the edge of the Trace. Lengthening it leaves activations
  for streams that already fit unchanged.
- **Scoring.** M&E judged the parse "a few slices after the end of the word"
  but give no number. So each pair is scored at five lags: 6, 12, 18, 24 and 36
  cycles after the center of the second word's last phoneme. Lag 18 (three
  phonemes) is used for the detailed analysis; that choice is made here.
  - Each presented word's activation is its most active unit within one slot
    of its true alignment.
  - Rivals are every unit of every other word, at any slot (silence excluded).
  - A pair is correct when no rival is more active than either presented word.
- **Failure types.** M&E describe two kinds of failure. Either the input "was
  actually consistent with two parses" (*party* for *par* + *tea*), or the model
  found no valid parse (*park* for *par* + *key*). Here, a failure counts as an
  **alternative parse** if the winning rival belongs to some other tiling of the
  stream by lexicon words (found by exhaustive search). Otherwise it is
  **rival in no valid parse**.

## Run

```
node simulate.js        # 8 x 212 simulations, ~2 min
python3 plot.py
```

## Figures

- `fig-accuracy`: the proportion correct at each lag, as the mean ± 1 SE over
  the 8 sets. Each set is a dot, and the dashed line is M&E's 189 / 211.
- `fig-scatter`: at lag 18, the weaker presented word against the strongest
  rival, one dot per pair. Failures lie above the diagonal and are marked by
  type.
- `failures.txt`: every failure at lag 18, with the activations and its type.
- `stats.txt`: the numbers below.

## Results

| Readout lag (cycles) | 6 | 12 | 18 | 24 | 36 |
|---|---|---|---|---|---|
| Proportion correct, mean (SE) | 0.554 (0.004) | 0.827 (0.011) | 0.926 (0.004) | 0.947 (0.004) | 0.961 (0.003) |

- **About as accurate as M&E reported.** From lag 18 on, TRACE parses 93–96% of
  pairs correctly; M&E report 90%. At lag 18 the 8 sets range from 91% to 95%.
  Very early readouts (lag 6–12) are much worse, because the second word has
  not yet overcome its rivals.
- **Failures at lag 18: 126 of 1,696.**
  - **Alternative parses: 12.** For example, *see* + *clock* (/si/ + /klak/) →
    *seek*; *car* + *putt* (/kar/ + /p^t/) → *carpet*; *bar* + *crush* →
    *bark*.
  - **Rival in no valid parse: 114.** For example, *par* + *couple* →
    *park*, the same kind of failure M&E show for /parki/; *tar* + *key* →
    *target*.
- **The second word is usually the problem.** In 96 of the 126 failures, the
  second word is the weaker presented word. Short second words are especially
  vulnerable: 41 of the 120 pairs whose second word has one or two phonemes
  fail (34%), against 85 of the other 1,576 (5%). This is consistent with M&E's point that
  TRACE prefers parses in which the longer word comes first, and its difficulty
  with short words ([13](../13-tar-box/), [14](../14-short-sentence/)).
- **Ambiguity matters less than one might expect.** The 150 pairs whose stream
  can be tiled by lexicon words in more than one way are parsed correctly about
  as often (90.0%) as the other 1,546 (92.8%).
