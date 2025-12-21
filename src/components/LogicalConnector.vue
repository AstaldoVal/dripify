<template>
  <div class="logical-connector">
    <button
      class="connector-button"
      :class="{ active: value === 'AND' }"
      @click="setConnector('AND')"
    >
      AND
    </button>
    <button
      class="connector-button"
      :class="{ active: value === 'OR' }"
      @click="setConnector('OR')"
    >
      OR
    </button>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'LogicalConnector',
  props: {
    modelValue: {
      type: String,
      default: 'AND',
      validator: (val) => ['AND', 'OR'].includes(val),
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const value = ref(props.modelValue);

    const setConnector = (connector) => {
      value.value = connector;
      emit('update:modelValue', connector);
    };

    watch(() => props.modelValue, (newVal) => {
      value.value = newVal;
    });

    return {
      value,
      setConnector,
    };
  },
};
</script>

<style scoped>
.logical-connector {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 4px;
}

.connector-button {
  padding: 4px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.connector-button:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.connector-button.active {
  background-color: var(--color-primary);
  color: white;
}
</style>

