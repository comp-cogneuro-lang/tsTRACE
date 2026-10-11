import {
  createDefaultConfig,
  parseJtLexicon,
  parseJtPhonology,
  serializeJtLexicon,
  serializeJtPhonology,
} from '..';

describe('jTRACE XML serializers', () => {
  const config = createDefaultConfig();

  test('lexicon round-trips through XML', () => {
    const xml = serializeJtLexicon(config.lexicon);
    expect(typeof xml).toBe('string');
    expect(xml).not.toMatch(/>,/);
    const parsed = parseJtLexicon(xml);
    expect(parsed.map((w) => w.phon)).toEqual(config.lexicon.map((w) => w.phon));
    expect(parsed.map((w) => w.freq)).toEqual(config.lexicon.map((w) => w.freq || 0));
  });

  test('phonology round-trips through XML, including durationScalar', () => {
    const xml = serializeJtPhonology(config.phonology);
    expect(xml).not.toMatch(/>,/);
    const parsed = parseJtPhonology(xml);
    expect(parsed.map((p) => p.label)).toEqual(config.phonology.map((p) => p.label));
    expect(parsed.map((p) => p.features)).toEqual(config.phonology.map((p) => p.features));
    expect(parsed.map((p) => p.durationScalar)).toEqual(
      config.phonology.map((p) => p.durationScalar)
    );
  });
});
