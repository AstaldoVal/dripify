<template>
  <div class="inline-filter-builder">
    <!-- Filter Bar -->
    <div class="filter-bar" :class="{ 'has-filters': conditions.length > 0 }">
      <div class="filter-content">
        <template v-if="conditions.length === 0">
          <button class="add-condition-btn" @click="addCondition">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>Add filter</span>
          </button>
        </template>

        <template v-else>
          <template v-for="(condition, index) in conditions" :key="condition.id">
            <FilterChip
              :condition="condition"
              :available-stages="availableStages"
              @update="(updated) => updateCondition(index, updated)"
              @remove="removeCondition(index)"
            />
            <LogicalConnector
              v-if="index < conditions.length - 1"
              v-model="connectors[index]"
              @update:modelValue="(val) => updateConnector(index, val)"
            />
          </template>

          <button class="add-condition-btn inline" @click="addCondition">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>Add condition</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Live Preview Counter -->
    <div v-if="showCounter" class="filter-counter">
      <span class="counter-label">Matching leads:</span>
      <span class="counter-value">{{ matchCount }}</span>
    </div>

    <!-- Conflict Warning -->
    <div v-if="hasConflict" class="filter-warning">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 4V8M8 12H8.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span>Some conditions may never match any leads</span>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import FilterChip from './FilterChip.vue';
import LogicalConnector from './LogicalConnector.vue';

export default {
  name: 'InlineFilterBuilder',
  components: {
    FilterChip,
    LogicalConnector,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    availableStages: {
      type: Array,
      default: () => [],
    },
    totalLeads: {
      type: Number,
      default: 0,
    },
    filteredLeads: {
      type: Array,
      default: () => [],
    },
    showCounter: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const conditions = ref([...props.modelValue]);
    const connectors = ref([]);

    // Initialize connectors
    const initializeConnectors = () => {
      connectors.value = [];
      for (let i = 0; i < conditions.value.length - 1; i++) {
        connectors.value.push('AND');
      }
    };

    initializeConnectors();

    const matchCount = computed(() => {
      if (conditions.value.length === 0) {
        return props.totalLeads;
      }
      return props.filteredLeads.length;
    });

    const hasConflict = computed(() => {
      // Check for logical conflicts
      // Example: Email is set AND Email is blank
      const fieldOperators = new Map();
      
      for (const condition of conditions.value) {
        const key = `${condition.field}:${condition.operator}`;
        if (!fieldOperators.has(condition.field)) {
          fieldOperators.set(condition.field, new Set());
        }
        fieldOperators.get(condition.field).add(condition.operator);
      }

      // Check for conflicts
      for (const [field, operators] of fieldOperators.entries()) {
        if (operators.has('is_set') && operators.has('is_blank')) {
          return true;
        }
        if (operators.has('eq') && operators.has('ne') && 
            conditions.value.filter(c => c.field === field && c.operator === 'eq').length > 0 &&
            conditions.value.filter(c => c.field === field && c.operator === 'ne').length > 0) {
          // Check if same value
          const eqValues = conditions.value.filter(c => c.field === field && c.operator === 'eq').map(c => c.value);
          const neValues = conditions.value.filter(c => c.field === field && c.operator === 'ne').map(c => c.value);
          if (eqValues.some(v => neValues.includes(v))) {
            return true;
          }
        }
      }

      return false;
    });

    const addCondition = () => {
      const newCondition = {
        id: `condition-${Date.now()}-${Math.random()}`,
        field: 'stage',
        operator: 'eq',
        value: undefined,
      };
      conditions.value.push(newCondition);
      if (conditions.value.length > 1) {
        connectors.value.push('AND');
      }
      emitChange();
    };

    const updateCondition = (index, updated) => {
      conditions.value[index] = { ...conditions.value[index], ...updated };
      emitChange();
    };

    const removeCondition = (index) => {
      conditions.value.splice(index, 1);
      if (connectors.value.length > 0 && index < connectors.value.length) {
        connectors.value.splice(index, 1);
      } else if (connectors.value.length > 0 && index === connectors.value.length) {
        connectors.value.pop();
      }
      emitChange();
    };

    const updateConnector = (index, value) => {
      connectors.value[index] = value;
      emitChange();
    };

    const emitChange = () => {
      // Build filter expression with conditions and logical connectors
      const filterExpression = {
        conditions: [],
      };

      conditions.value.forEach((cond, idx) => {
        // Add condition
        filterExpression.conditions.push({ ...cond });
        
        // Add logical connector if not the last condition
        if (idx < connectors.value.length) {
          filterExpression.conditions.push({ logic: connectors.value[idx] });
        }
      });
      
      emit('update:modelValue', conditions.value);
      emit('change', filterExpression);
    };

    watch(() => props.modelValue, (newVal) => {
      if (JSON.stringify(newVal) !== JSON.stringify(conditions.value)) {
        conditions.value = [...newVal];
        initializeConnectors();
      }
    }, { deep: true });

    return {
      conditions,
      connectors,
      matchCount,
      hasConflict,
      addCondition,
      updateCondition,
      removeCondition,
      updateConnector,
    };
  },
};
</script>

<style scoped>
.inline-filter-builder {
  margin-bottom: 16px;
}

.filter-bar {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px 16px;
  min-height: 48px;
  transition: all 0.15s ease;
}

.filter-bar.has-filters {
  background-color: var(--color-bg);
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.add-condition-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: none;
  border: 1px dashed var(--color-border);
  border-radius: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.add-condition-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.add-condition-btn.inline {
  border-style: solid;
  background-color: var(--color-bg-secondary);
}

.filter-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.counter-label {
  font-weight: 500;
}

.counter-value {
  font-weight: 600;
  color: var(--color-text);
}

.filter-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  font-size: 13px;
  color: #F59E0B;
}

.filter-warning svg {
  flex-shrink: 0;
}
</style>

