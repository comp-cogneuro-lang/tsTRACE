# Example 3: the two length effects

**Replicates:** in TRACE, short words become active sooner and long words
become more active (Magnuson et al., 2013), consistent with Pitt & Samuel (2006).

**Why.** A long word's units span more time slices, so they overlap, and are
inhibited by, more competitors while activations are still low. That gives an
early short-word advantage. Later, the larger bottom-up input to long words wins
out.

**Design.** Every word in the default lexicon is presented once, and the
activation of its most active copy is recorded. The plot compares the shortest
words (1–2 phonemes, n = 15) with the longest (7–9 phonemes, n = 11), and also
shows every length. Original default parameters.

**Run** (212 simulations, ~20 s):

```
node simulate.js
python3 plot.py
```

**Figure** `fig1-length`: **A.** shortest vs longest words, mean ± 1 standard
error; **B.** mean target activation for each word length.

**Expected results.** Short words lead from cycle 19 to 45, by up to 0.12 (at
cycle 32). The curves cross at cycle 46, and long words end far higher (0.79 vs
0.42 at cycle 99).
