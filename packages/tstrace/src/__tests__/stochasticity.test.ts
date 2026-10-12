import { createDefaultConfig, TraceSim } from '..';
import * as util from '../util';

const CYCLES = 20;

const run = (edit: (config: ReturnType<typeof createDefaultConfig>) => void) => {
  const config = createDefaultConfig();
  edit(config);
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);
  return {
    feat: sim.getFeatureData(CYCLES - 1),
    phon: sim.getPhonemeData(CYCLES - 1),
    word: sim.getWordData(CYCLES - 1),
  };
};

describe('per-level stochasticity', () => {
  afterEach(() => jest.restoreAllMocks());

  test('noise at one level leaves the levels below it untouched', () => {
    const clean = run(() => {});
    const noisy = run((c) => {
      c.stochasticity.W = 0.02;
    });
    // word noise reaches phonemes only through word-to-phoneme feedback,
    // and features only if phoneme-to-feature feedback is on (off by default)
    expect(noisy.feat).toEqual(clean.feat);
    expect(noisy.word).not.toEqual(clean.word);
  });

  test('feature-only noise changes features', () => {
    const clean = run(() => {});
    const noisy = run((c) => {
      c.stochasticity.F = 0.02;
    });
    expect(noisy.feat).not.toEqual(clean.feat);
  });

  test('global and level SDs combine as sqrt(global^2 + level^2)', () => {
    const sds = new Set<number>();
    jest.spyOn(util, 'gauss').mockImplementation((_mean, sd) => {
      sds.add(sd);
      return 0;
    });
    const config = createDefaultConfig();
    config.stochasticitySD = 0.03;
    config.stochasticity = { F: 0, P: 0.04, W: 0.04 };
    new TraceSim(config).cycle(1);
    expect([...sds].sort()).toEqual([0.03, 0.05]);
  });

  test('a config without per-level values still runs (older saved configs)', () => {
    const config = createDefaultConfig() as any;
    delete config.stochasticity;
    config.stochasticitySD = 0.02;
    expect(() => new TraceSim(config).cycle(2)).not.toThrow();
  });
});
