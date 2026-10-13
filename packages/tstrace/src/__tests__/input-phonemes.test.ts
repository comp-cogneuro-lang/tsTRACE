import { createDefaultConfig, TraceSim } from '..';

const run = (edit: (config: ReturnType<typeof createDefaultConfig>) => void, cycles = 30) => {
  const config = createDefaultConfig();
  edit(config);
  const sim = new TraceSim(config);
  sim.cycle(cycles);
  return sim;
};

const copyOf = (label: string, as: string) => {
  const p = createDefaultConfig().phonology.find((x) => x.label == label)!;
  return { ...p, label: as, features: [...p.features], durationScalar: [...p.durationScalar] };
};

describe('inputPhonemes', () => {
  test('an input phoneme with /p/ features acts exactly like /p/ in the input', () => {
    const plain = run((c) => (c.modelInput = '-pl^g-'));
    const extra = run((c) => {
      c.inputPhonemes = [copyOf('p', 'X')];
      c.modelInput = '-Xl^g-';
    });
    expect(extra.getAllPhonemeData()).toEqual(plain.getAllPhonemeData());
    expect(extra.getAllWordData()).toEqual(plain.getAllWordData());
  });

  test('adds no phoneme units', () => {
    const sim = run((c) => {
      c.inputPhonemes = [copyOf('p', 'X')];
      c.modelInput = '-X-';
    });
    expect(sim.phonLayer[0].length).toBe(createDefaultConfig().phonology.length);
  });

  test('can be used together with a continuum', () => {
    const sim = run((c) => {
      c.continuumSpec = 'bp3';
      c.inputPhonemes = [copyOf('p', 'X')];
      c.modelInput = '-1X-';
    });
    expect(sim.phonLayer.length).toBe(30);
  });

  test('rejects a label the phonology already uses', () => {
    expect(() =>
      run((c) => {
        c.inputPhonemes = [copyOf('b', 'p')];
      })
    ).toThrow();
  });
});
