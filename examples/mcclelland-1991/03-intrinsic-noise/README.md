# 03. Intrinsic noise (McClelland 1991, Fig. 8)

In most experiments the stimulus itself doesn't vary; variability comes from
the perceiver. A "stochastic interactive activation" network adds noise to
every unit's net input on every cycle. Does it still give parallel straight
lines?

## Simulation

The network is the small IA network (`../lib/iac.js`). The design is 5 inputs
× 4 contexts, with 10,000 trials per cell and 60 cycles per trial.

- **Input.** /r/ gets 0.3–0.7, /l/ gets 1 minus that, with no input noise.
- **Context.** Input 1.0 (up from 0.5, as in the paper) goes to /s/, /p/ or
  /t/, or there is no context input.
- **Noise.** A normal sample with SD 0.14 is added to each unit's net input on
  every cycle, after the 0.1 input scaling. With the noise added before the
  scaling, the network is nearly deterministic (see `../README.md`).
- **Response.** The target with the larger running average at cycle 60.

## Run

```
node simulate.js        # 200,000 trials, ~7 s
python3 plot.py
```

## Figures

- `fig08-intrinsic-noise`: z(P(/r/)) per context, with the best parallel lines
  (one slope, one intercept per context). There is no closed-form slope here,
  so the slope is fitted.
- `stats.txt`: P(/r/), z, the fitted lines, and the variance explained.

## Results

- **The classical pattern survives intrinsic noise.** Parallel lines explain
  99.98% of the variance (paper: 99.97%).
- **The neutral contexts coincide,** with intercepts −3.148 and −3.150.
- **/s/ and /t/ shift symmetrically,** by −0.36 and +0.35 z units.
- **The range** is P(/r/) = 0.052–0.948, a little narrower than with input
  noise.
