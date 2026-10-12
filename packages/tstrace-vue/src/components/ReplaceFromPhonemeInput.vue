<template>
  <div class="field is-horizontal" style="width: 30rem">
    <div class="field-label">
      <label class="label" style="width: 10rem">Replace phoneme</label>
    </div>
    <div class="field-body">
      <div class="field">
        <div class="select">
          <select :value="selected" @change="pick(asAny($event).target.value)">
            <option value="">(choose to fill start and end)</option>
            <option v-for="(span, index) in spans" :key="index" :value="index">
              {{ index + 1 }}: {{ span.label }} (slices {{ span.start }}–{{ span.end }})
            </option>
          </select>
        </div>
        <p class="help is-info">Fills in the slices this phoneme of the model input spans</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { InputPhonemeSpan, TraceNet } from 'tstrace';
import { computed, defineComponent } from 'vue';
import { getStore } from '../store';

export default defineComponent({
  name: 'ReplaceFromPhonemeInput',
  setup() {
    const store = getStore();
    const spans = computed<InputPhonemeSpan[]>(() => {
      try {
        return new TraceNet(JSON.parse(JSON.stringify(store.config))).getInputPhonemeSpans();
      } catch (e) {
        return [];
      }
    });
    // show the phoneme whose span matches the current start and end, if any
    const selected = computed(() => {
      const index = spans.value.findIndex(
        (s) => s.start === store.config.replaceStart && s.end === store.config.replaceEnd
      );
      return index < 0 ? '' : String(index);
    });
    return {
      spans,
      selected,
      asAny: (x: any) => x,
      pick: (value: string) => {
        const span = spans.value[Number(value)];
        if (value === '' || !span) return;
        store.config.replaceStart = span.start;
        store.config.replaceEnd = span.end;
      },
    };
  },
});
</script>
