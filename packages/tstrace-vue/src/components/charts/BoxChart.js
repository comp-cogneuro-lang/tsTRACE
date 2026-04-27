import { defineComponent } from 'vue';
import '../../chart-controllers/chartjs-box.js';
import { generateChart } from './BaseChart';

const colorPalette = [
  'black',
  'red',
  'orange',
  'green',
  'blue',
  'magenta',
  'darkgray',
  'darkgray',
  'darkgray',
  'darkgray',
];

export default defineComponent({
  extends: generateChart('box-chart', 'box'),
  props: {
    chartData: Array,
    chartTitle: String,
    xAxisTitle: String,
    yAxisTitle: String,
    numXTicks: Number,
    simConfig: Object,
    borderWidth: {
      type: Number,
      default: 1.0,
    },
  },
  data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
        legend: {
          display: false,
        },
        tooltips: {
          enabled: false,
        },
        title: {
          display: true,
          text: this.chartTitle,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                display: true,
                min: 0,
                max: this.numXTicks - 1,
                stepSize: 1,
              },
              gridLines: {
                display: false,
              },
              scaleLabel: {
                display: true,
                labelString: this.xAxisTitle,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                display: true,
                // Y axis runs in raw activation units (matches the threshold
                // input value on the chart's toolbar). Falls back to 0..1 if
                // simConfig isn't supplied.
                min: this.simConfig ? this.simConfig.min : 0,
                max: this.simConfig ? this.simConfig.max : 1,
                stepSize: 0.1,
              },
              gridLines: {
                display: true,
              },
              scaleLabel: {
                display: true,
                labelString: this.yAxisTitle,
              },
            },
          ],
        },
      },
    };
  },
  computed: {
    // The width in X ticks that each character should be drawn
    characterWidth() {
      return this.simConfig ? this.simConfig.deltaInput / this.simConfig.slicesPerPhon : 1;
    },
  },
  watch: {
    chartData() {
      this.updateChart();
    },
    characterWidth() {
      this.updateChart();
    },
  },
  mounted() {
    this.updateChart();
  },
  methods: {
    // Half-width (in chart slices) of a phoneme's input ramp on the X axis.
    // Mirrors the model's spread shape: spreadPhons writes spread[spreadOffset±i]
    // for i in [0, n-1], so the outermost nonzero offset from the peak is n-1
    // input slices, where n = floor(spread[f] * spreadScale[f] * durationScalar[f]).
    // Take the max over feature continua so the box spans the widest contributing
    // feature (matching ceil-of-max used for spreadOffset in trace-phones.ts).
    halfWindowChartSlices(label) {
      const cfg = this.simConfig;
      if (!cfg || !cfg.phonology) return 0;
      const phon = cfg.phonology.find((p) => p.label === label);
      const spread = cfg.spread || [];
      const scale = cfg.spreadScale || [];
      const slicesPerPhon = cfg.slicesPerPhon || 1;
      let maxN = 0;
      for (let f = 0; f < spread.length; f++) {
        const dur = phon && phon.durationScalar ? phon.durationScalar[f] || 0 : 1;
        const n = Math.floor((spread[f] || 0) * (scale[f] || 1) * dur);
        if (n > maxN) maxN = n;
      }
      return Math.max(0, (maxN - 1) / slicesPerPhon);
    },
    updateChart() {
      // order chart data by y value
      const sorted = this.chartData.slice().sort((a, b) => b.y - a.y);

      // build map of word -> color
      const words = [];
      for (const { word } of sorted) {
        if (!words.includes(word)) {
          words.push(word);
        }
      }
      const wordColors = {};
      for (const [index, word] of words.entries()) {
        wordColors[word] = colorPalette[Math.min(index, colorPalette.length - 1)];
      }

      // Annotate each datum with the per-phoneme half-window (in chart slices)
      // for its first and last letter. chartjs-box.js uses these to size the
      // box so it matches the actual input ramp duration.
      const annotatedData = this.chartData.map((d) => {
        const w = d.word || '';
        const first = w.charAt(0);
        const last = w.charAt(w.length - 1) || first;
        return {
          ...d,
          halfWindowLeft: this.halfWindowChartSlices(first),
          halfWindowRight: this.halfWindowChartSlices(last),
        };
      });

      const chartData = {
        datasets: [
          {
            characterWidth: this.characterWidth,
            data: annotatedData,
            backgroundColor: () => 'transparent',
            borderColor: (ctx) =>
              ctx.dataset.data[ctx.dataIndex]
                ? wordColors[ctx.dataset.data[ctx.dataIndex].word]
                : 'transparent',
            borderWidth: () => this.borderWidth,
            height: (ctx) => {
              const { bottom, top } = ctx.chart.chartArea;
              // /8 (vs the old /10) makes each row ~25% taller, which leaves
              // visible padding above and below each letter.
              return (bottom - top) / this.options.scales.yAxes[0].ticks.max / 8;
            },
          },
        ],
      };
      this.renderChart(chartData, this.options);
    },
  },
});
