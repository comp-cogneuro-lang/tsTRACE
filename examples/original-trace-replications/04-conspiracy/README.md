# 04. Phonotactic effects as a lexical conspiracy (M&E Figs. 12–13)

McClelland & Elman (1986), pp. 33–35. Magnuson & Crinnion (2022), Table 22.1,
effect 5.

Massaro and Cohen (1983) found that a segment ambiguous between /l/ and /r/ is
heard as /l/ after /s/, where English allows /l/ but not /r/. This holds even
though neither *sli* nor *sri* is a word. TRACE has no phonotactic rules. M&E
showed that the bias can come from a "conspiracy" of partially active words
(*sleep*, *sleet*), all of which support /l/.

They then tested a prediction of that account. A phonotactically illegal
segment should win if it makes the input close to a word. In /?luli/, with ?
between /p/ and /t/, /t/ is illegal but makes the input close to *truly*.

## Simulations

| Run | Continuum | Purpose |
|---|---|---|
| /s?i/ | /l/–/r/ | M&E Fig. 12: /l/ should win (*sleep*, *sleet*) |
| /p?i/, /t?i/ | /l/–/r/ | jTRACE gallery: /r/ should win (*priest*; *tree*, *treat*, *treaty*) |
| /s?i/, no words in the lexicon | /l/–/r/ | control, added here: without words, no bias |
| /?luli/ | /p/–/t/ | M&E Fig. 13: the illegal /t/ should come to win (*truly*) |
| /truli/ | (clear) | comparison for the second segment |

P is the Luce choice over all phoneme units at a segment's slot, with M&E's
k = 10. Default lexicon and parameters; 80 cycles.

## Run

```
node simulate.js        # 6 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig12-trace-sli`: the state of the Trace while /s?i/ comes in. *sleep* and
  *sleet* have identical activations and share one box, as in M&E.
- `fig-sli`: P(/l/) at the ambiguous segment in each context.
- `fig13-trace-luli`: the state of the Trace while /?luli/ comes in.
- `fig-truly`: for /?luli/, P(/p/) and P(/t/) at the ambiguous segment (A), and
  P(/l/) and P(/r/) at the clear /l/ that follows (B).

## Results

- **The conspiracy works with no rule.** For /s?i/, P(/l/) reaches 0.98 by
  cycle 79. With no words in the lexicon, the same input stays exactly split
  (0.48 vs 0.48). The bias comes entirely from *sleep* and *sleet*. In /p?i/ and
  /t?i/, words containing /r/ push P(/l/) to 0.01 and 0.00.
- **Close words beat phonotactics.** For /?luli/, the legal /p/ leads at first
  (0.53 vs 0.44 at cycle 30), because many /pl/ words are partly active. /t/
  overtakes it at cycle 39 as *truly* comes to dominate, and reaches 0.92. This
  is M&E's result, and the pattern Elman (1983) found with listeners for
  *bwacelet*.
- **/r/ stays active even though the /l/ is clear.** As M&E note, *truly* also
  supports /r/ at the second segment. P(/r/) stays near 0.3 throughout
  (0.33 at cycle 79). M&E point out that in a more neutral context a clear /l/
  would suppress it.
