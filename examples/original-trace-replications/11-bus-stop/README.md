# 11. Overlapping parses are not suppressed (M&E Fig. 29)

McClelland & Elman (1986), p. 64–65. Magnuson & Crinnion (2022), Table 22.1,
effect 11 (lexical segmentation).

TRACE does not insist that each phoneme belong to exactly one word. M&E argue
that this is often a virtue, because the last phoneme of one word sometimes
also starts the next (*brush shop*, *hound dog*). In /b^stap/, *bus stop*
shares its /s/ between two words, while *bus top* uses each phoneme once.
M&E showed that TRACE keeps both readings active, leaving the choice to
higher levels. It does the same for /br^Sap/ (*brush shop*, sharing the /S/).

## Simulations

Inputs: /b^stap/ and /br^Sap/, as in M&E's text and Fig. 29. All the words
involved are in the default lexicon:
*bus* /b^s/, *stop* /stap/, *top* /tap/, *brush* /br^S/, *shop* /Sap/. Default
parameters, 100 cycles. Word activations come from each word's most active
copy. Every word that exceeds 0.1 at some point is saved.

## Run

```
node simulate.js        # 2 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig29-final`: the state of the Trace at cycle 99 for each input, drawn as in
  M&E.
- `fig-words`: the parse words over time; every other word that exceeded 0.1
  is shown in gray.

## Results

Activations at cycle 99:

| Input | Parse words | Best other word |
|---|---|---|
| /b^stap/ | *stop* 0.56, *bus* 0.50, *top* 0.37 | *a* /^/ 0.08 |
| /br^Sap/ | *brush* 0.63, *shop* 0.39 | *pea* 0.03 |

- **Both readings of /b^stap/ survive.** *stop*, which overlaps *bus* by one
  phoneme, ends up a little stronger than *top* (0.56 vs 0.37). But *top* stays
  far above every other word, none of which is above 0.08 by the end. *stop*
  pulls ahead of *top* at cycle 33 and keeps the lead.
- **The shared /S/ of *brush shop* serves both words.** *brush* (0.63) and
  *shop* (0.39) are the only words left above 0.03.
- As M&E say, the model "is not inclined to suppress activations of partially
  overlapping words, even when a non-overlapping parse is available."
