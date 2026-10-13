# 09. Recognizing every word in the lexicon (M&E p. 62)

McClelland & Elman (1986), p. 62. Magnuson & Crinnion (2022), Table 22.1,
effect 9. Strauss, Harris & Magnuson (2007), Table 1, validation simulation 11.

M&E presented each word of their lexicon on its own, with silence before and
after: "TRACE made no mistakes — that is, by a few slices after the end of the
word, the word that spanned the entire input was more strongly activated than
any other word."

## Simulations

Each of the 212 words in the default lexicon is presented as `-word-` for 100
cycles. M&E's main list had 211 words; today's lexicon lacks their added
*blush* and *regal* but has *sleet*.

A word's activation is that of its most active copy. The silence "word" is not
counted as a competitor. Measures:

- **Correct at readout.** The target is more active than every other word 12
  cycles after its last phoneme peaks. M&E's "a few slices after the end of the
  word" isn't exact; the trailing silence peaks 6 cycles after the last
  phoneme, so this is one phoneme later. Also scored at the last cycle (99).
- **Lead cycle.** The first cycle from which the target is more active than
  every other word for the rest of the run. This is expressed relative to the
  cycle at which the word's last phoneme peaks, 6 × (length + 1).

Default lexicon and parameters.

## Run

```
node simulate.js        # 212 simulations, ~15 s
python3 plot.py
```

## Figures

- `fig1-recognition`: A, the cumulative proportion of words leading for good,
  over cycles since the last phoneme's peak; B, lead cycle relative to that
  peak by word length (dots: words; line: mean ± 1 SE).
- `fig2-timecourse`: mean activation of the target and of the strongest other
  word, aligned on the last phoneme's peak, by length (± 1 SE).
- `stats.txt`: the numbers below.

## Results

- **Every word is recognized.** All 212 words lead every other word by the
  last cycle, and all of them lead for good from some point on. That point
  comes at most 15 cycles after the last phoneme peaks, which is "a few slices
  after the end of the word", as M&E report.
- **At 12 cycles after the last phoneme, 203 of 212 (95.8%) already lead.** The
  nine that do not yet lead are all words that begin with a shorter word, which
  is still slightly ahead:

  | Word | Still behind |
  |---|---|
  | /kard/ (*card*) | /kar/ (*car*) |
  | /park/, /part/ | /par/ |
  | /parti/ (*party*) | /part/ |
  | /sis/, /sil/, /sid/ | /si/ |
  | /start/ | /star/ |
  | /tr^sti/ (*trusty*) | /tr^st/ (*trust*) |

  Each takes the lead 13–15 cycles after its last phoneme peaks. This is the
  embedded-word competition M&E describe for *party* vs *par* (p. 62, Fig. 27).
  With a later readout (16 or more cycles), accuracy is 100%.
- **Recognition is tied to the word's end.** The lead cycle is, on average,
  1.67 cycles after the last phoneme peaks (SE 0.39; median 2; range −24 to
  +15). 61 words lead before their last phoneme peaks.
- **Long words are recognized before their end.** Mean lead relative to the
  last phoneme's peak, by length:

  | Phonemes | Words | Mean lead (cycles) |
  |---|---|---|
  | 2 | 14 | +0.6 |
  | 3 | 75 | +2.6 |
  | 4 | 65 | +2.5 |
  | 5 | 31 | +0.6 |
  | 6 | 15 | +1.3 |
  | 7 | 8 | −2.6 |
  | 8 | 2 | −5.0 |
  | 9 | 1 | −24 |

  The 9-phoneme /s^bst^tut/ (*substitute*) leads 24 cycles before its last
  phoneme peaks. Long words also reach higher
  activations (Fig. 2), since more phonemes support them.
