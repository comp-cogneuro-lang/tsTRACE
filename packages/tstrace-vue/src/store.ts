import hashsum from 'hash-sum';
import {
  createDefaultConfig,
  doSimAnalysis,
  formatAnalysis,
  ModelInputError,
  TraceCalculationType,
  TraceChoice,
  TraceCompetitionType,
  TraceDomain,
  TraceSim,
} from 'tstrace';
import TraceConfig from 'tstrace/dist/esm/trace-param';
import { computed, inject, provide, reactive, ref } from 'vue';

// format data as tab separated values with header
const formatData = (data?: (string | number)[][], header?: string) => {
  if (!data) return '';
  const dataRows = data.map((row) => row.join('\t')).join('\n');
  return header ? `${header}\n${dataRows}` : dataRows;
};

// colors for analysis chart
const chartColors = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#fabebe',
  '#008080',
  '#e6beff',
  '#9a6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#808080',
  '#000000',
];

class Store {
  readonly config = reactive(createDefaultConfig());
  readonly analysisConfig = reactive({
    domain: TraceDomain.WORDS,
    itemsToWatch: 10 as number | string[],
    calculationType: TraceCalculationType.STATIC,
    alignment: 4,
    choice: TraceChoice.NORMAL,
    kValue: 0,
    competType: TraceCompetitionType.RAW,
    competSlope: 4,
    excludeSilence: false,
  });
  readonly sortedPhonemes = computed(() =>
    [...this.config.phonology].sort((a, b) => a.label.localeCompare(b.label))
  );
  readonly sim = ref<TraceSim | null>(null);
  readonly lastSimConfig = ref<TraceConfig>(JSON.parse(JSON.stringify(this.config)));
  readonly lastSimConfigHash = ref<string | null>(hashsum(this.lastSimConfig.value));
  readonly isConfigChanged = computed(() => this.lastSimConfigHash.value !== hashsum(this.config));
  readonly cyclesToCalculate = ref(81);
  readonly calculatedCycles = computed(() => this.sim.value?.getStepsRun() || 0);
  readonly currentCycle = ref(0);
  readonly formattedInputData = computed(() => {
    const data = this.sim.value?.getInputData(this.currentCycle.value);
    if (!data) return '';
    const numTimeSlices = data[0]?.length - 1 || 0;
    const timeHeaders = Array.from({ length: numTimeSlices }, (_, i) => `t${i}`).join('\t');
    const header = `feature_index\t${timeHeaders}`;
    return formatData(data, header);
  });
  readonly formattedFeatureData = computed(() => {
    const data = this.sim.value?.getFeatureData(this.currentCycle.value);
    if (!data) return '';
    const numTimeSlices = data[0]?.length - 1 || 0;
    const timeHeaders = Array.from({ length: numTimeSlices }, (_, i) => `t${i}`).join('\t');
    const header = `feature_index\t${timeHeaders}`;
    return formatData(data, header);
  });
  readonly formattedPhonemeData = computed(() => {
    const data = this.sim.value?.getPhonemeData(this.currentCycle.value);
    if (!data) return '';
    const numTimeSlices = data[0]?.length - 1 || 0;
    const timeHeaders = Array.from({ length: numTimeSlices }, (_, i) => `t${i}`).join('\t');
    const header = `phoneme\t${timeHeaders}`;
    return formatData(data, header);
  });
  readonly formattedWordData = computed(() => {
    const data = this.sim.value?.getWordData(this.currentCycle.value);
    if (!data) return '';
    const numTimeSlices = data[0]?.length - 1 || 0;
    const timeHeaders = Array.from({ length: numTimeSlices }, (_, i) => `t${i}`).join('\t');
    const header = `word\t${timeHeaders}`;
    return formatData(data, header);
  });
  readonly formattedLevelsAndFlowData = computed(() => {
    const data = this.sim.value
      ?.getAllLevelsAndFlowData()
      .map(([flowData], index) => [index, ...flowData.map((num) => num.toFixed(13).padEnd(18, ' '))]);
    const header = 'cycle\tfeature_sum_all\tfeature_sum_pos\tfeature_competition\tphon_sum_all\tphon_sum_pos\tphon_competition\tword_sum_all\tword_sum_pos\tlexical_competition\tfeat_to_phon\tphon_to_feat\tphon_to_word\tword_to_phon';
    return formatData(data, header);
  });
  readonly analysisData = ref<any[]>([]);
  readonly formattedAnalysisData = computed(() => formatAnalysis(this.analysisData.value, true));
  readonly useBoxChart = ref(false);
  // Session-local display settings for the word/phoneme box charts.
  // Threshold is in raw activation units (same scale as the chart's Y axis);
  // top-N is the maximum number of words/phonemes whose peaks are plotted.
  readonly displaySettings = reactive({
    wordThreshold: 0.0,
    wordTopN: 15,
    phonemeThreshold: 0.0,
    phonemeTopN: 100,
  });
  readonly isModelInputValid = ref(true);

  updateAnalysis() {
    // TODO: fix TraceSim typing
    this.analysisData.value = doSimAnalysis({
      ...this.analysisConfig,
      sim: this.sim.value as any,
    }).map((x, idx) => ({
      ...x,
      fill: false,
      borderColor: chartColors[idx],
      showLine: true,
    }));
  }

  runSimulation() {
    this.isModelInputValid.value = true;
    try {
      // create a copy of the config object
      // trace.js accesses the object a lot, and it's a lot slower if it's
      // a reactive proxy.
      const configCopy = JSON.parse(JSON.stringify(this.config));

      console.time('trace.js');
      const sim = new TraceSim(configCopy);
      sim.cycle(this.cyclesToCalculate.value);
      console.timeEnd('trace.js');

      this.currentCycle.value = Math.min(
        Math.max(this.currentCycle.value, 0),
        this.calculatedCycles.value
      );
      this.sim.value = sim;
      this.lastSimConfig.value = configCopy;
      this.lastSimConfigHash.value = hashsum(configCopy);

      this.updateAnalysis();
    } catch (e) {
      if (e instanceof ModelInputError) {
        this.isModelInputValid.value = false;
      }
      throw e;
    }
  }
}

export const StoreSymbol = Symbol();

export const createStore = () => {
  const store = new Store();
  provide(StoreSymbol, store);
  return store;
};

export const getStore = () => inject<Store>(StoreSymbol)!;
