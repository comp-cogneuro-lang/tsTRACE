<template>
  <div :class="$style.wrapper">
    <div :class="$style.controls">
      <label :class="$style.control">
        Threshold:
        <input
          type="number"
          :class="$style.input"
          :min="store.config.min"
          :max="store.config.max"
          step="0.01"
          v-model.number="store.displaySettings.wordThreshold"
        />
      </label>
      <label :class="$style.control">
        Top:
        <input
          type="number"
          :class="$style.input"
          min="1"
          max="500"
          step="1"
          v-model.number="store.displaySettings.wordTopN"
        />
      </label>
    </div>
    <div :class="$style.chartArea">
      <BoxChart
        :chart-data="chartData"
        chart-title="Word Activations"
        x-axis-title="Time (phoneme cycles)"
        y-axis-title="Activation Magnitude"
        :num-x-ticks="Math.ceil(store.config.fSlices / store.config.slicesPerPhon) + 1"
        :sim-config="store.config"
        :styles="chartStyles"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { getStore } from '../../store';
// @ts-ignore
import BoxChart from './BoxChart';

export default defineComponent({
  components: { BoxChart },
  setup() {
    const store = getStore();
    return {
      store,
      // Force the BoxChart's root div to fill our chartArea (otherwise the
      // canvas defaults to 400x400 and the chart looks squished).
      chartStyles: { position: 'relative', height: '100%', width: '100%' },
      chartData: computed(() => {
        const rawData = store.sim.value?.wordLayer[store.currentCycle.value] || [];
        // Threshold is in raw activation units (matches the chart's Y axis).
        const threshold = store.displaySettings.wordThreshold;
        const topN = Math.max(1, Math.min(500, store.displaySettings.wordTopN || 1));

        // associate each word with corresponding row in an array [word, row]
        const data = rawData.map((row, index): [string, number[]] => [
          store.config.lexicon.length > index ? store.config.lexicon[index].phon : '',
          row,
        ]);
        // sort associated array descending by max value of row
        data.sort((a, b) => Math.max(...b[1]) - Math.max(...a[1]));
        const topData = data.slice(0, topN);

        const chartData = [];
        for (const [word, row] of topData) {
          let lastValue = Number.NEGATIVE_INFINITY;
          for (let col = 0; col < row.length; col++) {
            const value = row[col];
            const nextValue = col + 1 < row.length ? row[col + 1] : Number.NEGATIVE_INFINITY;
            if (value > lastValue && value > nextValue && value > threshold) {
              chartData.push({
                x: col,
                y: value,
                word,
              });
            }
            lastValue = value;
          }
        }

        return chartData;
      }),
    };
  },
});
</script>

<style module>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.controls {
  flex: 0 0 auto;
  display: flex;
  gap: 0.75rem;
  padding: 0.25rem 0.5rem 0;
  font-size: 0.8rem;
}

.control {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.input {
  width: 4.5rem;
  padding: 0.1rem 0.25rem;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  font-size: 0.8rem;
}

.chartArea {
  flex: 1;
  min-height: 0;
  position: relative;
}
</style>
