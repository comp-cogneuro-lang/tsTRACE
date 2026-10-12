<template>
  <div class="field is-horizontal" style="width: 30rem">
    <div class="field-label">
      <label class="label" style="width: 10rem">{{ label }}</label>
      <button
        class="button is-small"
        v-if="defaultValue !== undefined && defaultValue !== modelValue"
        @click="$emit('update:modelValue', defaultValue)"
        title="Set to the default value"
      >
        Default
      </button>
      <button
        class="button is-small"
        v-if="lastValue != null && lastValue !== modelValue"
        @click="$emit('update:modelValue', lastValue)"
        title="Set to the value used in the last simulation"
      >
        Reset
      </button>
    </div>
    <div class="field-body">
      <div class="field">
        <input
          class="input"
          :type="type"
          :step="type === 'number' ? step : undefined"
          :value="modelValue"
          @change="onChange"
        />
        <p class="help is-info">{{ note }}</p>
        <p class="help is-danger" v-if="error">
          <span class="has-text-weight-bold">ERROR</span> {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ConfigInput',
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number | null>,
      default: '',
    },
    lastValue: {
      type: [String, Number] as PropType<string | number | null>,
      default: null,
    },
    // no Default button when left undefined
    defaultValue: {
      type: [String, Number] as PropType<string | number | null>,
      default: undefined,
    },
    label: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
    type: {
      type: String as PropType<'text' | 'number'>,
      default: 'number',
    },
    step: {
      type: Number,
      default: 0.1,
    },
    // when true, a blank number field means null instead of 0
    nullable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return {
      onChange: (evt: any) => {
        const raw = evt.target.value;
        if (props.nullable && String(raw).trim() === '') {
          emit('update:modelValue', null);
          return;
        }
        const value = props.type === 'number' ? Number(raw) : raw;
        emit('update:modelValue', value);
      },
    };
  },
});
</script>
