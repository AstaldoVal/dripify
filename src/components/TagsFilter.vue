<template>
  <div class="tags-filter">
    <select
      :value="modelValue"
      @change="handleChange"
      class="filter-select"
    >
      <option value="">All Tags</option>
      <option
        v-for="tag in tags"
        :key="tag.id"
        :value="tag.id"
      >
        {{ tag.name }}
      </option>
    </select>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'TagsFilter',
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const tags = ref([]);
    const loading = ref(false);
    
    const fetchTags = async () => {
      loading.value = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 200));
        tags.value = [
          { id: 1, name: 'Hot Lead' },
          { id: 2, name: 'Follow Up' },
          { id: 3, name: 'Qualified' },
          { id: 4, name: 'VIP' },
        ];
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const handleChange = (event) => {
      const value = event.target.value || null;
      emit('update:modelValue', value);
      emit('change', value);
    };
    
    onMounted(() => {
      fetchTags();
    });
    
    return {
      tags,
      loading,
      handleChange,
    };
  },
};
</script>

<style scoped>
.tags-filter {
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

