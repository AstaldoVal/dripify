<template>
  <div class="scope-filter">
    <select
      :value="modelValue"
      @change="handleChange"
      class="filter-select"
    >
      <option value="all">All leads ({{ totalCount }})</option>
      <option value="custom">Custom segments</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'LeadsScopeFilter',
  props: {
    modelValue: {
      type: String,
      default: 'all',
    },
    totalCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    handleChange(event) {
      const value = event.target.value;
      this.$emit('update:modelValue', value);
      this.$emit('change', value);
    },
  },
};
</script>

<style scoped>
.scope-filter {
  position: relative;
}

.filter-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all var(--transition-base);
  min-width: 150px;
}

.filter-select:hover {
  border-color: var(--color-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
</style>

