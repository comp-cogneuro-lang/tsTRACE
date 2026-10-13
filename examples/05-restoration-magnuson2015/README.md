# Example 5: full replication of Magnuson (2015)

Magnuson, J. S. (2015). Phoneme restoration and empirical coverage of
interactive activation and adaptive resonance models of human speech
processing. *Journal of the Acoustical Society of America, 137*(3), 1481–1492.
https://doi.org/10.1121/1.4904543

**The argument.** Grossberg & Kazerounian (2011) concluded that TRACE cannot
simulate phoneme restoration. Their "noise" was a new phoneme, though: it ramps
on and off like speech and competes at the phoneme level. Magnuson (2015)
instead replaced the stretch of input a phoneme spans with Gaussian noise, or
with zeros (true silence). TRACE then activates the missing phoneme more for
noise than for silence. The effect is clearest once the phoneme definitions are
revised so that no phoneme resembles broadband noise more than the others.

**This example also shows how to change phoneme features.**
[`revised-phonemes.js`](revised-phonemes.js) explains how TRACE phonemes are
encoded (7 features × 9 levels) and swaps in the paper's revised definitions.
In those, every phoneme has exactly one level per feature.

## Run

```
node simulate.js        # ~4,300 simulations, ~8 minutes on one core
python3 plot.py         # figures/ and figures/stats.txt
```

`SMOKE=1 node simulate.js /tmp/x` runs a reduced design in a few seconds.

## What is replicated

| Paper | Figure file | Content |
|---|---|---|
| Fig. 1 | `fig01-gk-stimuli` | Grossberg & Kazerounian's inputs: intact, silence phoneme, "true silence" phoneme, "noise phoneme" (the last two added to the phonology as `_` and `#`) |
| Fig. 2 | `fig02-noise-stimuli` | /l/'s input span replaced by zeros or noise (0.2, 0.6, 1.0) |
| Fig. 3 | `fig03-luxury-original` | *luxury*: replaced-phoneme activation, initial/medial/final, six conditions |
| Fig. 4 | `fig04-luxury-all-phonemes-original` | *luxury*: all phonemes at the replaced slot, noise 0.0 vs 1.0 |
| Fig. 5 | `fig05-word-sets-original` | all 3-, 5-, and 7-phoneme words, mean ± 1 SE (the paper showed 95% CIs) |
| Fig. 6 | `fig06-phoneme-definitions` | original and revised phoneme definitions |
| Fig. 7 | `fig07-luxury-revised` | as Fig. 3, revised phonemes |
| Fig. 8 | `fig08-luxury-all-phonemes-revised` | as Fig. 4, revised phonemes |
| Fig. 9 | `fig09-word-sets-revised` | as Fig. 5, revised phonemes |
| Fig. 10 | `fig10-replaced-vs-next` | replaced vs next-most-active phoneme, noise 0.0 and 1.0 |
| Fig. 11 | `fig11-luxury-revised-single-word` | as Fig. 7, with *luxury* the only word in the lexicon |
| Fig. 12 | `fig12-luxury-all-phonemes-single-word` | as Fig. 8, with *luxury* the only word |
| Fig. 13 | `fig13-early-peak` | early peak of the replaced phoneme (noise 1.0) by length and position |
| footnote 4 | `figS2-noise-levels` | noise levels 0.1 … 1.2 |
| text | `figS1-clustering` | clustering of original vs revised definitions |

`stats.txt` reports the statistics given in the text:
- how often the replaced phoneme is not the most active phoneme early on under
  1.0 noise, and which phonemes win instead;
- whether the winning phoneme is backed by more frequent bigrams;
- the lexicon counts the paper cites;
- the similarity of the two clusterings;
- the values behind Fig. 13.

## Methods and choices

- **Conditions.** The noise is Gaussian with mean = level and SD = 25% of the
  level, as in the paper. It replaces every feature row over the replaced
  phoneme's span, the slices where it adds any input, including slices shared
  with its neighbors. Each noisy stimulus gets its own fixed seed.
- **Time** is plotted from word onset (cycle − 6). This matches the paper's axes:
  the leading silence phoneme occupies the first 6 input slices.
- **Early window**: the 25 cycles after the replaced phoneme's input begins. The
  paper describes it as "prior to cycle 25" for initial position and "about 30
  cycles after replacement onset" in general. Fig. 13 uses the paper's "prior to
  cycle 50".
- **Next-most-active phoneme** (Fig. 10): the phoneme other than the replaced one
  (and other than silence) with the highest activation in the early window.
- **Revised definitions** were read from the published Fig. 6. That figure omits
  the voicing level of /b d g/; it is kept at its original value, which gives
  every phoneme the seven features the caption describes.
- **Not replicated**: footnote 5. Its four-word lexicons are not specified in the
  paper.

## Differences to expect

- The default lexicon has 75 three-phoneme words; the paper reports 73. There are
  31 five-phoneme and 8 seven-phoneme words, as in the paper.
- Activation peaks of intact phonemes match the paper closely, and so do the
  qualitative patterns: noise > silence; /k/ and /g/ winning early with the
  original phonemes; no single winner with the revised ones; feedback at final
  position. The early noise transients are somewhat smaller than in the
  published figures. Exact noise samples differ, and the paper used jTRACE.
