import { createDefaultConfig, TraceSim } from '..';

const CYCLES = 20;

const run = (seed: number | null | undefined) => {
  const config = createDefaultConfig() as any;
  config.noiseSD = 0.05;
  config.stochasticitySD = 0.02;
  if (seed === undefined) delete config.seed;
  else config.seed = seed;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);
  return [sim.getAllInputData(), sim.getAllFeatureData(), sim.getAllPhonemeData(), sim.getAllWordData()];
};

describe('random seed', () => {
  test('the same seed gives identical runs', () => {
    expect(run(42)).toEqual(run(42));
  });

  test('different seeds give different runs', () => {
    expect(run(42)).not.toEqual(run(43));
  });

  test('no seed gives different runs', () => {
    expect(run(null)).not.toEqual(run(null));
  });

  test('a config without a seed field still runs unseeded (older saved configs)', () => {
    expect(run(undefined)).not.toEqual(run(undefined));
  });
});
