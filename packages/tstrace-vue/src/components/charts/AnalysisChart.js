import { defineComponent } from 'vue';
import { Scatter } from './BaseChart';
import { reactiveProp } from './mixins';

export default defineComponent({
  extends: Scatter,
  mixins: [reactiveProp],
  data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 0,
            hitRadius: 0,
          },
        },
      },
      _resizeObserver: null,
    };
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
    // Workaround for a chart.js v2 sizing bug: when the Chart tab mounts
    // as a Suspense-loaded async component, the canvas's parent doesn't
    // have its final dimensions when renderChart() runs, so the chart
    // renders at the wrong size and stays blank until a window resize
    // triggers chart.js's responsive handler. A ResizeObserver on the
    // parent re-triggers chart.resize() once layout settles.
    if (typeof ResizeObserver !== 'undefined' && this.$refs.canvas) {
      const parent = this.$refs.canvas.parentElement;
      if (parent) {
        this.$data._resizeObserver = new ResizeObserver(() => {
          if (this.$data._chart) this.$data._chart.resize();
        });
        this.$data._resizeObserver.observe(parent);
      }
    }
  },
  beforeUnmount() {
    if (this.$data._resizeObserver) {
      this.$data._resizeObserver.disconnect();
      this.$data._resizeObserver = null;
    }
  },
});
