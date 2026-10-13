# Replications of the original TRACE simulations

McClelland, J. L., & Elman, J. L. (1986). The TRACE model of speech perception.
*Cognitive Psychology, 18*, 1–86.

This folder holds one example per simulation reported by McClelland &
Elman (1986): effects 1–11 of Table 22.1 in Magnuson & Crinnion (2022), which
lists 30 effects TRACE accounts for. Effects 12–30 come from later papers (see
the end of this file); some of them already have examples in `examples/`.

Sources used to reconstruct each simulation:
- the figures and text of McClelland & Elman (1986);
- jTRACE's gallery (Strauss, Harris & Magnuson, 2007), which re-ran most of
  these simulations and records their exact inputs and run lengths;
- Strauss et al. (2007, Table 1), which lists the validation simulations.

All examples use the original parameters (`createDefaultConfig()`), the
original 14 phonemes, and the default 212-word lexicon. One note: the jTRACE
gallery files set the word resting level to −0.1. The original C
implementation and tsTRACE use −0.01, and these examples keep −0.01.

Conventions shared by these examples (helpers in `../lib/`):
- Response probabilities use the Luce choice rule over all phoneme units at
  the segment's slot, with M&E's exponent k = 10 (p. 46). The examples in the
  parent folder use k = 7, from Allopenna et al. (1998).
- Input arrives one feature slice per cycle, so M&E's "Slice 12" is the slot of
  the first input phoneme (slot 4), and a phoneme's features peak at cycle
  6 × (its input position + 1).
- "State of the Trace" figures (`trace_display.py`) draw each unit as a box at
  the height of its activation, as wide as the input it spans, as M&E do.
- Ambiguous segments are the midpoint of a 3-step continuum (`continuumSpec`
  such as `bp3`, input phoneme `1`), as in the jTRACE gallery.

## Examples

| Folder | Inventory rows | M&E figures |
|---|---|---|
| [01-lexical-effect](01-lexical-effect/) | 1, 2, 4 | 5, 6, 7 |
| [02-word-final](02-word-final/) | 3 | 8 |
| [03-reaction-time](03-reaction-time/) | 5 | 9, 10, 11 |
| [04-conspiracy](04-conspiracy/) | 6, 7 | 12, 13 |
| [05-trading-relations](05-trading-relations/) | 8 | 15, 17, 18 |
| [06-categorical-perception](06-categorical-perception/) | 9 | 19, 20, 21, 22 |
| [07-mismatching-onset](07-mismatching-onset/) | 10 | 24 |
| [08-product](08-product/) | 11 | 25, 26 |
| [09-all-words](09-all-words/) | 12 | (p. 62) |
| [10-party](10-party/) | 13 | 27, 28 |
| [11-bus-stop](11-bus-stop/) | 14 | 29 |
| [12-nonword-boundaries](12-nonword-boundaries/) | 15 | 30 |
| [13-tar-box](13-tar-box/) | 16 | 31 |
| [14-short-sentence](14-short-sentence/) | 17 | 32 |
| [15-all-word-pairs](15-all-word-pairs/) | 18 | (pp. 62–64) |

Examples 05 and 06 use a stripped-down /-/, /a/, /g/, /k/ model with
feature patterns reconstructed from M&E's figures (`../lib/ga-ka.js`), and
present their stimuli through `config.inputPhonemes`.

Lexicon additions: M&E added *regal*, *blush* and *sleet* to their lexicon
(p. 19). *sleet* survives; examples 01 and 07 add *blush* (/bl^S/) and *regal*
(/rig^l/) back.

## Inventory

`?` marks an ambiguous phoneme, the midpoint of a continuum between the two
phonemes listed (a `continuumSpec`). Inputs are written in TRACE phonemes.

### A. Lexical effects on phoneme identification

| # | Effect (Magnuson & Crinnion #) | M&E | Inputs | Measure | jTRACE gallery |
|---|---|---|---|---|---|
| 1 | Lexical context shifts an ambiguous phoneme (Ganong) (#1) | p. 24, Fig. 5 | /b/–/p/ midpoint in /?l^g/ (*plug*), /?r^S/ (*brush*), /?ist/ (*beast*), /?ragr^s/ (*progress*) | /b/ vs /p/ phoneme units, P(/p/) | basic lexical effect 1, 2 |
| 2 | Lexical effects are eliminated under time pressure (#2) | p. 26, Fig. 6 | as #1, read out early vs late | growth of P(/p/) over cycles | — |
| 3 | Lexical effects are stronger late in a word (#3) | pp. 27–28, Figs. 7–8 | word-final midpoints: /dra?/, /gru?/, /kl^?/, /kri?/; /targ^?/ with /t/–/d/ | P of the word-consistent phoneme | word-final lexical effect |
| 4 | Lexical effects need phonetic ambiguity (#4) | p. 28 | /?l^g/ (ambiguous) vs /bl^g/ (clear /b/) | /b/ vs /p/ | phoneme ambiguity |
| 5 | Lexical effects in reaction time: present late in a word, absent at onset (#3) | pp. 29–30, Figs. 9–11 | /targ^t/ vs nonword /tr^g^s/ (word-initial /t/); /sikr^t/ vs nonword /g^ld^t/ (late /t/) | growth of P(/t/) | reaction time effect 1, 2 |
| 6 | Phonotactic effects from a lexical "conspiracy" (#5) | pp. 33–35, Fig. 12 | /l/–/r/ midpoint in /s?i/, /p?i/, /t?i/ | /l/ vs /r/ | lexical conspiracy 1 |
| 7 | Lexical conspiracy, second case (#5) | p. 35, Fig. 13 | /p/–/t/ midpoint in /?luli/ | /p/ vs /t/ | lexical conspiracy 2 |

### B. Phonetic cue integration (phoneme level only; no word level)

| # | Effect | M&E | Inputs | Measure |
|---|---|---|---|---|
| 8 | Trading relations between two cues (#6) | pp. 36–41, Figs. 14–18 | 5 × 5 /g/–/k/ stimuli varying voice onset (VOT) and F1 onset (F1OF) independently, in /-?a-/ | P(/k/) at slice 60 per stimulus |
| 9 | Categorical perception: identification and discrimination (#7) | pp. 41–50, Figs. 19–22 | 11-step /g/–/k/ continuum | identification; ABX accuracy from feature-level differences at cycle 60 |

These need inputs built at the feature level (intermediate values on two
feature dimensions), with the word level switched off, as M&E did.

### C. Recognizing one word

| # | Effect | M&E | Inputs | Measure | jTRACE gallery |
|---|---|---|---|---|---|
| 10 | Recovery from a mismatching onset (#8) | pp. 55–57, Fig. 24 | /lig^l/ (*legal*; *regal* suppressed) vs nonword /l^g^d/ (*rugged* wins) | word activations | — |
| 11 | Time course of word recognition (#9) | pp. 57–59, Figs. 25–26 | /prad^kt/ (*product*) | words vs *product*: *trot*, *possible*, *priest*, *progress*, *produce* | word recognition |
| 12 | Recognition of every word in the lexicon (#9) | p. 62 | each of the 212 words | which word wins, and when | (Strauss et al. Table 1, #11) |

### D. Lexical segmentation (#11)

| # | Effect | M&E | Inputs | Measure | jTRACE gallery |
|---|---|---|---|---|---|
| 13 | Words vs word pairs | pp. 61–64, Figs. 27–28 | /parti/ (*party*), /par-ti/ (*par tea*), /barti/ (*bar tea*), /parki/ | *party*, *par*, *tea*, *bar*, *art* | word segmentation |
| 14 | Ambiguous segmentation | p. 65, Fig. 29 | /b^stap/ (*bus stop*, *bus top*) and /br^Sap/ (*brush shop*) | word activations | — |
| 15 | Nonwords leave boundaries open; words close them | pp. 65–67, Fig. 30 | /pas^b^ltarg^t/ (*possible target*) vs /piSd^rptarg^t/ (a nonword before *target*; input from the jTRACE gallery) | *target* and competitors | nonword boundaries |
| 16 | Right context resolves segmentation | pp. 67–68, Fig. 31 | /tarbaks/ (*tar box*) vs /g^tarbaks/ (*guitar box*) | *tar*, *guitar*, *box* | short sentences (part) |
| 17 | Segmenting a short sentence | p. 69, Fig. 32 | /SiS^t^baks/ (*she shut a box*) | word activations over the stream | short sentences |
| 18 | Segmenting every word pair | p. 65 | 211 two-word sequences | is each pair parsed correctly? | (Strauss et al. Table 1, #13) |

## Effects 12–30 of Magnuson & Crinnion (2022), from later work

Some of these already have examples:
- #15, Allopenna et al. (1998): [02a](../02a-allopenna-1998/), [02b](../02b-cohort-rhyme-minimal/)
- #26, length effects: [03](../03-length/)
- #28, phoneme restoration: [04](../04-restoration-simple/), [05](../05-restoration-magnuson2015/)

The others would need inputs or mechanisms beyond the original model:
- compensation for coarticulation (#12, #13);
- stochastic TRACE (#14; McClelland, 1991);
- gating (#16);
- frequency mechanisms (#17);
- subcategorical mismatch (#18, #19);
- Hebbian learning, attention and individual differences (#20–#25);
- embedding (#27), inhibition modulation (#29), feedback and noise (#30).
