<template>
  <div class="search-input-wrapper">
    <SearchIcon class="search-icon" />
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      class="search-input"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Search',
    },
  },
  emits: ['update:modelValue', 'search'],
  methods: {
    handleInput(event) {
      const value = event.target.value;
      this.$emit('update:modelValue', value);
      this.$emit('search', value);
    },
  },
  components: {
    SearchIcon: {
      template: `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
    },
  },
};
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  transition: all var(--transition-base);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-input:hover {
  border-color: var(--color-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
</style>

