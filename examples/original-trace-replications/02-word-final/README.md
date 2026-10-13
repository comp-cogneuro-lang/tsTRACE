# 02. Lexical effects are stronger late in a word (M&E Fig. 8)

McClelland & Elman (1986), pp. 27–28. Magnuson & Crinnion (2022), Table 22.1,
effect 3.

M&E showed that when an ambiguous segment ends a word whose identity is
already known (/targ^?/, with ? midway between /t/ and /d/), /t/ pulls ahead
"within the duration of a single phoneme" after the segment's center. They
predicted that, unlike word-initial effects ([01](../01-lexical-effect/)), such
an effect would appear before Fox's (1982) 500-ms response deadline.

This example tests that prediction directly. It compares five word-final
items with four word-initial items, aligned on the ambiguous segment's center.

## Simulations

| Position | Items (word that decides) | Continuum |
|---|---|---|
| word-final | /targ^?/ (*target*; M&E Fig. 8) | /t/–/d/ |
| word-final | /dra?/ (*drop*), /gru?/ (*group*), /kri?/ (*creep*), /kl^?/ (*club*); jTRACE gallery | /b/–/p/ |
| word-initial | /?l^g/ (*plug*), /?ragr^s/ (*progress*), /?ist/ (*beast*), /?r^S/ (*brush*) | /b/–/p/ |

The measure is the lexical effect: P(the phoneme the word calls for) minus
P(the other endpoint) at the ambiguous segment's slot. Each P is a Luce choice
over all phoneme units there, with M&E's k = 10. Default lexicon and
parameters; 90 cycles.

## Run

```
node simulate.js        # 9 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig08-trace-target`: the state of the Trace at four cycles while /targ^?/
  comes in (the segment peaks at cycle 42), drawn as in M&E.
- `fig-final-vs-initial`: the lexical effect over cycles since the segment's
  center. A shows the mean ± 1 SE for each position, with Fox's deadline shaded
  (25 ms per cycle). B shows each item.

## Results

| Cycles after the segment's center | 6 | 20 (Fox's deadline) | 47 |
|---|---|---|---|
| word-final, mean (SE) | 0.16 (0.08) | 0.50 (0.09) | 0.83 (0.04) |
| word-initial, mean (SE) | 0.00 (0.00) | −0.01 (0.15) | 0.33 (0.21) |

- **Word-final effects appear at once.** As in M&E's Fig. 8, /t/ leads /d/ in
  /targ^?/ (+0.36) one phoneme (6 cycles) after the segment's center. By the
  deadline, the effect averages 0.50 over the five word-final items.
- **Word-initial effects appear only after the deadline.** At the deadline the
  word-initial items show no consistent effect. The /p/-initial words (*plug*,
  *progress*) have begun to pull, but the /b/-initial ones (*beast*, *brush*)
  are still held back by the lexicon-wide lean toward /p/ described in
  [01](../01-lexical-effect/).
- **The same lean slows the one /b/ word-final item, /kl^?/ (*club*).** Its
  effect is briefly negative before *club* takes over.
