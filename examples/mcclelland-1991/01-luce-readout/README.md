# 01. Deterministic IA with a Luce readout (McClelland 1991, Fig. 4)

The original TRACE and the letter-perception model turned activations into
choice probabilities with the Luce rule, P(r) = e^(k·ā_r) / (e^(k·ā_r) + e^(k·ā_l)),
applied to running-average activations. McClelland (1991) showed that this
does not give the classical pattern. The question here is whether
z(P(/r/)) is a straight line in the stimulus, shifted by context.

## Simulation

The network is the small IA network (`../lib/iac.js`). The design is 5 inputs
× 5 contexts, each run once (the network is deterministic) for 60 cycles:

- **Input.** /r/ gets 0.3, 0.4, 0.5, 0.6 or 0.7; /l/ gets 1 minus that.
- **Context.** Input 0.5 goes to /s/ (favors /l/), /p/ (neutral) or /t/
  (favors /r/). There are also two context-free conditions: no context input
  (*n*), and the target–word connections cut (*x*, isolated).
- **Response.** The Luce rule on the running averages at cycle 60. The paper
  does not state k for this figure; k = 10 is the value TRACE used.

## Run

```
node simulate.js        # 25 runs, < 1 s
python3 plot.py
```

## Figures

- `fig04-luce-readout`: z(P(/r/)) against the input, one letter per context,
  with each context's points joined.
- `stats.txt`: P(/r/), and the variance a parallel-lines fit explains.

## Results

P(/r/) at cycle 60:

| Context | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 |
|---|---|---|---|---|---|
| s | 0.005 | 0.009 | 0.054 | 0.711 | 0.994 |
| p | 0.005 | 0.009 | 0.500 | 0.991 | 0.995 |
| t | 0.006 | 0.289 | 0.946 | 0.991 | 0.995 |
| none (n) | 0.006 | 0.014 | 0.500 | 0.986 | 0.994 |
| isolated (x) | 0.015 | 0.059 | 0.500 | 0.941 | 0.985 |

All of the distortions the paper describes are here:

- **The curves are S-shaped, not straight.** They are steep across the middle
  and flat at the extremes, even with no interaction at all (*x*).
- **Interaction makes the distortion worse.** Connections to the word level
  alone (*n*), or a neutral context (*p*), steepen the curve further.
- **Context moves the boundary rather than adding a constant.** *t* shifts the
  curve left and *s* shifts it right, so its effect is huge near the boundary
  and nil at the ends.
- **The classical model fits poorly.** The best parallel lines explain 92.5% of
  the variance, against 99.98% once noise is added ([02](../02-input-noise/),
  [03](../03-intrinsic-noise/)).
