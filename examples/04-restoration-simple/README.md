# Example 4: phoneme restoration, short version

**Replicates:** the core result of Magnuson (2015). When a phoneme's stretch of
input is replaced by noise, TRACE briefly activates the missing phoneme. When
it is replaced by silence it does not, which parallels listeners' greater
restoration with noise. [Example 5](../05-restoration-magnuson2015/) replicates
the whole paper.

**Design.** *luxury* (`l^kS^ri`), with the initial /l/, medial /S/, or final /i/:

| Condition | How |
|---|---|
| intact | unchanged |
| silence phoneme | the phoneme swapped for TRACE's silence phoneme `-` |
| 0.0 noise (true silence) | the phoneme's input span set to zeros |
| 0.2, 0.6, 1.0 noise | the span replaced by Gaussian noise: mean = level, SD = 25% of the level |

The span is every input slice the phoneme contributes to, including the slices
it shares with its neighbors. `TraceNet.getInputPhonemeSpans()` gives it, and it
is the same span the GUI's *Replace phoneme* menu fills in. Replacement uses the
`replaceStart`, `replaceEnd`, `replaceMean`, and `replaceSD` settings, with a
fixed seed. Original phonemes and default parameters.

**Run** (18 simulations, ~3 s):

```
node simulate.js
python3 plot.py
```

**Figures** (time is measured from word onset, 6 cycles after the start of the
input, as in the paper):

- `fig1-inputs`: the input with /l/'s span replaced (paper's Fig. 2).
- `fig2-replaced`: the replaced phoneme's activation in each condition (paper's Fig. 3).
- `fig3-rivals`: every phoneme at the replaced slot, true silence vs 1.0 noise
  (paper's Fig. 4).

**Expected results.** The table gives the peak activation of the replaced
phoneme in the 25 cycles after its input would begin; resting level is −0.10.

| | true silence | 0.2 | 0.6 | 1.0 | silence phoneme |
|---|---|---|---|---|---|
| initial /l/ | −0.100 | −0.040 | 0.021 | 0.029 | −0.100 |
| medial /S/ | −0.086 | −0.030 | 0.043 | 0.054 | −0.083 |
| final /i/ | −0.006 | 0.066 | 0.123 | 0.119 | −0.016 |

Noise beats silence at every position. With the original phonemes, though,
/k/ and /g/ are even more active than the replaced phoneme at the initial and
medial positions (`fig3-rivals`). They have the most features on, so they
resemble noise most. Example 5 shows how revised phoneme definitions remove
that bias.
