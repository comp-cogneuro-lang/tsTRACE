# 03. Lexical effects on phoneme-monitoring times (M&E Figs. 9–11)

McClelland & Elman (1986), pp. 29–32. Magnuson & Crinnion (2022), Table 22.1,
effect 3.

Monitoring times for word-initial phonemes do not differ between words and
nonwords (Foss & Blank, 1980). Phonemes late in a word are detected faster in
words (Marslen-Wilson, 1980). M&E's account: a clear word-initial phoneme is
identified before the input says whether it is a word. Late in a word, the
lexicon is already active and adds its support.

## Simulations

All phonemes are clear; the target phoneme is /t/.

| Target position | Word | Nonword | Readout slot |
|---|---|---|---|
| initial (M&E Figs. 9–10) | /targ^t/ (*target*) | /tr^g^s/ (*trugus*) | 4 (M&E's "Slice 12") |
| final (M&E Fig. 11) | /sikr^t/ (*secret*) | /g^ld^t/ (*guldut*) | 14 (M&E's "Slice 42") |

P(/t/) is the Luce choice over all phoneme units at the target's slot, with
M&E's k = 10. As in M&E, a response is made when P(/t/) reaches 0.9.
Default lexicon and parameters; 80 cycles.

## Run

```
node simulate.js        # 4 simulations, ~1 s
python3 plot.py
```

## Figures

- `fig09-trace`: the state of the Trace at cycles 18, 36 and 60 for /targ^t/
  and /tr^g^s/, drawn as in M&E.
- `fig10-11-response`: P(/t/) over cycles. Panel A shows the word-initial /t/,
  panel B the word-final /t/. Ticks mark where each run reaches 0.9.
- `stats.txt`: the cycle at which each run reaches 0.9.

## Results

| Run | Reaches 0.9 at cycle |
|---|---|
| /targ^t/ | 22 |
| /tr^g^s/ | 22 |
| /sikr^t/ | 52 |
| /g^ld^t/ | 55 |

- **Word-initial /t/: no word advantage.** /t/ reaches criterion at cycle 22 in
  both runs. At that point the word level holds only weak, shared candidates
  (*tar*, *target*, *truck*, *true*). The nonword is not distinguished until
  after the input ends, when *truck* rather than *target* leads (Fig. 9).
- **Word-final /t/: a 3-cycle (75-ms) word advantage.** This is exactly what
  M&E report: "the /t/ in /sikr^t/ reaches criterion about 3 cycles or 75 ms
  sooner". They compare it with Marslen-Wilson's 85-ms effect for Dutch
  two-syllable words.
- **One difference from M&E.** They say word-initial /t/ reaches high accuracy
  "by about Cycle 30". Here it gets there sooner (cycle 22), probably because of
  differences in the details of the response rule (for example, which units
  enter the Luce choice). The comparisons do not depend on it.
