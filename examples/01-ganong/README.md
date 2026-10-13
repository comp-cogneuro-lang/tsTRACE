# Example 1: the Ganong effect

**Replicates:** lexical context pulls an ambiguous phoneme toward the word it
would complete (Ganong, 1980), as simulated by McClelland & Elman (1986).

**Design.** A 7-step /b/–/p/ continuum (step 0 = /b/, step 6 = /p/), made with
`config.continuumSpec = 'bp7'`, is placed before two contexts from the default
lexicon:

| Context | Word | Nonword | Favors |
|---|---|---|---|
| `_l^g` | *plug* | *blug* | /p/ |
| `_l^d` | *blood* | *plood* | /b/ |

The /b/ and /p/ phoneme units are read at the ambiguous phoneme's slot, and
P(/p/) comes from the Luce choice rule over those two units, with k = 7.
Original default parameters.

**Run** (14 simulations, ~2 s):

```
node simulate.js
python3 plot.py
```

**Figures**

- `fig1-identification`: P(/p/) at cycle 99 across the continuum, one line per
  context. The curves agree at the endpoints and split at the ambiguous step.
- `fig2-timecourse`: at the midpoint (step 3), P(/p/) over time, and the
  activation of *plug* and *blood* (their most active copies) in each context.

**Expected results** (step 3, cycle 99): P(/p/) = 0.96 in the *plug* context and
0.13 in the *blood* context. The two contexts give the same P(/p/) until about
cycle 45, when the word level settles on *plug* or *blood* and feedback takes
over.
