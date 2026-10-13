# 02. Noise in the input (McClelland 1991, Fig. 6)

If each trial's input is perturbed by noise and the response is simply the
more active alternative, an IA network behaves as a signal detection device.
Context acts as a criterion shift, so z(P(/r/)) should fall on parallel straight
lines with slope 1/SD. That is what classical models predict.

## Simulation

The network is the small IA network (`../lib/iac.js`). The design is 5 inputs
× 4 contexts, with 10,000 trials per cell and 60 cycles per trial. The isolated
condition is left out, as in the paper.

- **Input.** The mean input to /r/ is 0.3–0.7. On each trial it is shifted by
  a normal sample with SD 0.141421 (0.1·√2); /l/ gets 1 minus /r/'s input.
- **Context.** Input 0.5 goes to /s/, /p/ or /t/, or there is no context input.
- **Response.** The target with the larger running average at cycle 60.

## Run

```
node simulate.js        # 200,000 trials, ~3 s
python3 plot.py
```

## Figures

- `fig06-input-noise`: z(P(/r/)) per context, with the classical prediction
  fitted as in the paper (p. 15):
  - the neutral contexts lie on one line through z = 0 at input 0.5, with the
    slope given by signal detection theory (1/SD);
  - /s/ and /t/ are shifted down and up by one fitted amount.
- `stats.txt`: P(/r/), z, the shift, and the variance explained.

## Results

- **The classical pattern holds.** It explains 99.98% of the variance in z
  (paper: 99.97%), with one free parameter: a context shift of 0.61 z units.
- **The neutral contexts coincide,** with P(/r/) 0.075/0.078 at input 0.3 and
  0.924/0.919 at 0.7, so the network's distortions are gone.
- **The range matches the paper's.** P(/r/) runs from 0.021 (/s/ context,
  input 0.3) to 0.979 (/t/, 0.7), the ".02 to .98" range the paper gives for
  this noise level.
