import Chart from 'chart.js';

Chart.controllers.box = Chart.DatasetController.extend({
  dataElementType: Chart.elements.Rectangle,

  update(reset) {
    const meta = this.getMeta();
    const data = meta.data || [];

    this._xScale = this.getScaleForId(meta.xAxisID);
    this._yScale = this.getScaleForId(meta.yAxisID);

    for (const [i, dataElement] of data.entries()) {
      this.updateElement(dataElement, i, reset);
    }
  },

  updateElement(item, index) {
    const dataset = this.getDataset();
    const datasetIndex = this.index;
    const value = dataset.data[index];
    const xScale = this._xScale;
    const yScale = this._yScale;
    const options = this._resolveElementOptions(item, index);

    // calculate the start X position of the chart
    const xZero = xScale.getPixelForTick(0);
    // calculate the width of a single X tick
    const xTickWidth = xScale.getPixelForTick(1) - xZero;

    const getPixelForCharacterAtIndex = (index) =>
      xZero + xTickWidth * (value.x + index * dataset.characterWidth);

    const x = getPixelForCharacterAtIndex(0);
    const y = yScale.getPixelForValue(value);

    // Letters are centered on slice positions value.x, value.x + cw, ...,
    // value.x + (wordlen-1)*cw. Build a tight box around those centers
    // with one cell-width's worth of letter padding (half on each side)
    // plus a small visual margin.
    const cellWidthPx = getPixelForCharacterAtIndex(1) - x;
    const lastIdx = Math.max(0, value.word.length - 1);
    const wordSpanPx = getPixelForCharacterAtIndex(lastIdx) - x;

    const height = options.height;
    const halfHeight = height / 2;

    item._xScale = xScale;
    item._yScale = yScale;
    item._options = options;
    item._datasetIndex = datasetIndex;
    item._index = index;

    const xPadding = 4;
    item._model = {
      getPixelForCharacterAtIndex,
      x: x + wordSpanPx / 2,
      base: y - halfHeight,
      y: y + halfHeight,
      width: wordSpanPx + cellWidthPx + xPadding * 2,
      height: height,
      backgroundColor: options.backgroundColor,
      borderColor: options.borderColor,
      borderSkipped: options.borderSkipped,
      borderWidth: options.borderWidth,
      word: value.word,
      slice: value.x,
    };

    item.pivot();
  },

  draw() {
    const data = this.getMeta().data || [];
    const ctx = this.chart.ctx;

    for (const dataElement of data) {
      const {
        word,
        getPixelForCharacterAtIndex,
        y,
        height,
        borderColor,
        slice,
      } = dataElement._model;
      if (!word.length) continue;

      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = borderColor;

      // Pick a font size that naturally fills the per-character tick width
      // (no horizontal-only scaling, which would distort the glyph aspect ratio).
      // Cap below the box height so there's vertical breathing room above
      // and below the text.
      const baseFontSize = 16;
      ctx.font = `bold ${baseFontSize}px monospace`;
      const referenceWidth = ctx.measureText('m').width;
      const desiredWidth = getPixelForCharacterAtIndex(1) - getPixelForCharacterAtIndex(0);
      const widthBasedSize = (baseFontSize * desiredWidth) / referenceWidth;
      const fontSize = Math.max(8, Math.min(widthBasedSize, height - 14));
      ctx.font = `bold ${Math.round(fontSize)}px monospace`;

      for (let i = 0; i < word.length; i++) {
        // Center each letter on its slice position (slice + i * characterWidth),
        // not on the cell that follows the slice. Previously letters were drawn
        // at slice + characterWidth/2, which made e.g. slice 2 appear at scale 3.5
        // for characterWidth ≈ 3.
        const x = getPixelForCharacterAtIndex(i);
        ctx.fillText(word[i], x, y - height / 2);
      }

      // Slice number in tiny font, centered just below the bottom of the
      // letter's bounding box. Putting it inside the box at the top tended to
      // overlap with tall letters when the font filled the row vertically.
      ctx.font = '9px sans-serif';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';
      ctx.fillText(String(slice), getPixelForCharacterAtIndex(0), y + 2);

      ctx.restore();

      dataElement.draw();
    }
  },

  _resolveElementOptions(rectangle, index) {
    const chart = this.chart;
    const datasets = chart.data.datasets;
    const dataset = datasets[this.index];
    const options = chart.options.elements.rectangle;
    const values = {};

    // Scriptable options
    const context = {
      chart: chart,
      dataIndex: index,
      dataset: dataset,
      datasetIndex: this.index,
    };

    const keys = [
      'backgroundColor',
      'borderColor',
      'borderSkipped',
      'borderWidth',
      'width',
      'height',
    ];

    for (const key of keys) {
      values[key] = Chart.helpers.options.resolve([dataset[key], options[key]], context, index);
    }

    return values;
  },
});

Chart.defaults.box = {
  hover: {
    mode: 'nearest',
    intersect: true,
  },
  tooltips: {
    mode: 'nearest',
    intersect: true,
  },
  scales: {
    xAxes: [
      {
        type: 'linear',
      },
    ],
    yAxes: [
      {
        type: 'linear',
      },
    ],
  },
  elements: {
    rectangle: {
      borderSkipped: false,
      width: 20,
      height: 20,
    },
  },
};
