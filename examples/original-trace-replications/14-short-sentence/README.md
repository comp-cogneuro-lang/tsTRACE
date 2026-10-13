# 14. Segmenting a short sentence (M&E Fig. 32)

McClelland & Elman (1986), p. 69. Magnuson & Crinnion (2022), Table 22.1,
effect 11 (lexical segmentation).

How far can lexical competition alone go in parsing a stream into words, with
no syntax, semantics, stress or juncture cues? For /SiS^t^baks/, M&E found
that the words of *she shut a box*, which cover the input with no overlap,
come to dominate all others. The short, unstressed *a* has a hard time, as
listeners do with function words (Grosjean & Gee, 1984).

## Simulation

Input: /SiS^t^baks/ (also in the jTRACE gallery's "short sentences" set).
Default lexicon and parameters, 110 cycles. Word activations come from each
word's most active copy. *a* (/^/) also occurs inside *shut*, so it is read
only from copies at the article's slot (input position 6, slot 14). The four
parse words are always saved, along with every other word that exceeds 0.1 at
some point.

## Run

```
node simulate.js        # 1 simulation, ~1 s
python3 plot.py
```

## Figures

- `fig32-trace`: the state of the Trace at cycles 36, 54, 72 and 108, drawn as
  in M&E (up to nine word units per panel, so that *a* is visible beside the
  silence units).
- `fig-words`: word activations over time. The four parse words are in color;
  every other word that exceeded 0.1 is in gray.

## Results

| Cycle | 36 | 48 | 60 | 72 | 90 | 109 |
|---|---|---|---|---|---|---|
| *she* /Si/ | 0.28 | 0.37 | 0.42 | 0.44 | 0.44 | 0.43 |
| *shut* /S^t/ | 0.03 | 0.28 | 0.45 | 0.51 | 0.53 | 0.54 |
| *a* /^/ | −0.01 | 0.00 | 0.10 | 0.18 | 0.23 | 0.26 |
| *box* /baks/ | −0.01 | −0.02 | 0.03 | 0.28 | 0.59 | 0.62 |

- **The four words of the parse win.** From cycle 73 on, *she*, *shut*, *a* and
  *box* are each more active than any other word. By cycle 109, every other
  word that ever exceeded 0.1 has fallen below zero; the best of them,
  *sheep* /Sip/, is at −0.02. The strongest rival at any point was *sheep*
  (0.20, cycle 41), before *shut* had come in.
- **The short function word is weakest.** *a* rises above zero at cycle 49,
  before *box* (cycle 57), but it grows slowly and ends well below the others
  (0.26, against 0.43–0.62). *box* passes it at cycle 67. This is M&E's point
  about short, unstressed words.
