# Example 2b: cohort and rhyme competition over time, minimal version

**Replicates:** the time course of competition from words that share a target's
onset (cohorts) or its ending (rhymes), as measured with eye tracking and
simulated with TRACE by Allopenna, Magnuson & Tanenhaus (1998).

This version uses the whole default lexicon and adds as few assumptions as
possible. [Example 2a](../02a-allopenna-1998/) is the close replication of the
paper's own simulations.

**Design.** Every word in the default lexicon (212, not counting silence) is
presented once as the target, preceded by a **carrier word** drawn at random
from the lexicon, a different one on each trial (seeded, so runs repeat). The
carrier stands in for running speech, as "the" did in the original study, so
the target's onset is not the start of the input. For each target, every other
word is classed as:

- **cohort**: shares the first two phonemes (*beaker*, *beetle*);
- **rhyme**: identical from the first vowel to the end of the word, with a
  different onset, the consonants before that vowel (*beaker*, *speaker*;
  *star*, *skar*; *s^k*, *str^k*). Words that are also cohorts are not counted
  as rhymes;
- **unrelated**: everything else.

Each word's activation is that of its **most active copy**, the alignment whose
activation peaks highest over the run, among copies aligned no earlier than one
phoneme before the target's onset (so copies lined up with the carrier don't
count). Original default parameters.

**Pairs, analyzed separately.** Every (target, cohort) pair and every (target,
rhyme) pair is one unit of analysis: 918 cohort pairs from 198 targets, and 658
rhyme pairs from 143 targets. The two kinds are analyzed separately, so the
target curve in each analysis comes from exactly the targets in its pairs, and
differences between the analyses reflect the competitor type.

**Run** (212 simulations, ~30 s):

```
node simulate.js
python3 plot.py
```

**Figure** `fig1-cohort-and-rhyme` (bands: ±1 standard error across pairs):

- **Top row:** cohort pairs. **Bottom row:** rhyme pairs.
- **Left:** activation of the target, the competitor, and the mean of the
  target's unrelated words.
- **Right:** predicted fixation proportions for a four-picture display: the
  target, the competitor, and two unrelated pictures (the mean unrelated
  activation fills both). Each item's response strength is exp(7 × activation),
  and its probability is its share of the total.

**Expected results.**
- **Cohorts** rise with the target and peak at 0.10 at about cycle 57; every
  cohort pair rises above zero at some point. They then fall as the target wins
  (0.63 by cycle 99). Cohorts draw well above-baseline predicted fixations
  early on (about 0.35 near cycle 50).
- **Rhymes** never rise above resting level (−0.01) on average. About a third of
  rhyme pairs edge above zero at some point, but the mean stays near rest. They
  fall more slowly than unrelated words, so they lead unrelated words only
  slightly in predicted fixations.
- The two target curves differ (0.63 vs 0.54 by cycle 99) because the targets
  that have rhymes are a different, shorter set of words.

The original C implementation of TRACE gives the same rhyme result for a test
case (*beaker* input with *speaker* in the lexicon: rhyme peak 0.00), so this is
how TRACE behaves with its default parameters and lexicon.
