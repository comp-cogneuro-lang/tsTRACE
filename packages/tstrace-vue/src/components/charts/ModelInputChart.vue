<template>
  <SimulationChart
    :chart-data="chartData"
    chart-title="Model Input"
    x-axis-title="Time (input cycles)"
    y-axis-title="Feature Continua"
    :y-label-callback="yLabelCallback"
    :row-label-callback="rowLabelCallback"
    :num-x-ticks="store.config.fSlices + 1"
    :num-y-ticks="numXTicks"
    :y-step-size="numYTicks"
    :sim-config="store.config"
  />
</template>

<script lang="ts">
import { TraceNet } from 'tstrace';
import { computed, defineComponent } from 'vue';
import { CONTINUA, NUM_FEATURES } from '../../constants';
import { getStore } from '../../store';
// @ts-ignore
import SimulationChart from './SimulationChart';

export default defineComponent({
  components: { SimulationChart },
  setup() {
    const store = getStore();
    return {
      store,
      numXTicks: CONTINUA.length * NUM_FEATURES,
      numYTicks: NUM_FEATURES,
      chartData: computed(() => {
        try {
          store.isModelInputValid.value = true;
          return new TraceNet(store.config).inputLayer || [];
        } catch {
          store.isModelInputValid.value = false;
          return [];
        }
      }),
      yLabelCallback(_: any, index: number) {
        if (index < CONTINUA.length) {
          return CONTINUA[index];
        }
        return null;
      },
      // Tooltip row label: rows are interleaved feature x continuum, so map
      // the row index back to "<continuum>[<feature>]"
      rowLabelCallback(_: any, rowIndex: number) {
        if (rowIndex == null) return null;
        const continuum = CONTINUA[Math.floor(rowIndex / NUM_FEATURES)];
        const featureIdx = rowIndex % NUM_FEATURES;
        return continuum != null ? `${continuum}[${featureIdx}]` : null;
      },
    };
  },
});
</script>
