<template>
  <div class="inline-filter-builder">
    <!-- Filter Bar -->
    <div class="filter-bar" :class="{ 'has-filters': conditions.length > 0 }">
      <div class="filter-content">
        <template v-if="conditions.length > 0">
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

    <!-- Actions Bar -->
    <div v-if="conditions.length > 0" class="filter-actions">
      <button class="save-filter-btn" @click="openSaveModal">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 8L7 10L11 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Save filter</span>
      </button>

    </div>

    <!-- Save Filter Modal -->
    <div v-if="showSaveModal" class="modal-overlay" @click="closeSaveModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Save Filter</h3>
          <button class="modal-close" @click="closeSaveModal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Filter name *</label>
            <input
              v-model="filterName"
              type="text"
              class="form-input"
              placeholder="Enter filter name"
              @keyup.enter="saveFilter"
              @keyup.esc="closeSaveModal"
              ref="filterNameInput"
            />
            <p class="form-hint">Give your filter a descriptive name</p>
          </div>
          <div class="form-group">
            <label class="form-label">Filter preview</label>
            <div class="filter-preview-box">
              {{ getCurrentFilterPreview() }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeSaveModal">Cancel</button>
          <button class="btn-primary" @click="saveFilter" :disabled="!canSaveFilter">
            Save Filter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import FilterChip from './FilterChip.vue';
import LogicalConnector from './LogicalConnector.vue';

// Storage key for saved filters
const SAVED_FILTERS_KEY = 'dripify_saved_filters';

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
  emits: ['update:modelValue', 'change', 'filter-saved'],
  setup(props, { emit }) {
    const conditions = ref([...props.modelValue]);
    const connectors = ref([]);
    const showSaveModal = ref(false);
    const filterName = ref('');
    const filterNameInput = ref(null);
    const savedFilters = ref([]);

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

    // Load saved filters from localStorage
    const loadSavedFilters = () => {
      try {
        const stored = localStorage.getItem(SAVED_FILTERS_KEY);
        if (stored) {
          savedFilters.value = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
        savedFilters.value = [];
      }
    };

    // Save filters to localStorage
    const saveFiltersToStorage = () => {
      try {
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters.value));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    };

    // Generate filter name from conditions
    const generateFilterName = () => {
      if (conditions.value.length === 0) return '';
      
      const parts = [];
      conditions.value.forEach((cond, idx) => {
        const fieldLabel = getFieldLabel(cond.field);
        const operatorLabel = getOperatorLabel(cond.operator);
        const valueLabel = getValueLabel(cond);
        
        if (valueLabel) {
          parts.push(`${fieldLabel} ${operatorLabel} ${valueLabel}`);
        } else {
          parts.push(`${fieldLabel} ${operatorLabel}`);
        }
        
        if (idx < connectors.value.length) {
          parts.push(connectors.value[idx]);
        }
      });
      
      return parts.join(' ');
    };

    const getFieldLabel = (field) => {
      const labels = {
        stage: 'Stage',
        email: 'Email',
        company: 'Company',
        location: 'Location',
        createDate: 'Create date',
      };
      return labels[field] || field;
    };

    const getOperatorLabel = (operator) => {
      const labels = {
        eq: '=',
        ne: '≠',
        contains: 'contains',
        not_contains: 'does not contain',
        is_set: 'is set',
        is_blank: 'is blank',
        before: 'before',
        after: 'after',
      };
      return labels[operator] || operator;
    };

    const getValueLabel = (condition) => {
      if (!condition.value) return '';
      if (condition.field === 'stage') {
        const stage = props.availableStages.find(s => s.id === condition.value);
        return stage ? stage.label : condition.value;
      }
      if (condition.field === 'createDate') {
        const date = new Date(condition.value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      return condition.value;
    };

    // Get current filter preview
    const getCurrentFilterPreview = () => {
      return generateFilterName() || 'No conditions';
    };

    // Get filter preview for saved filter
    const getFilterPreview = (filter) => {
      if (!filter.expression || !filter.expression.conditions || filter.expression.conditions.length === 0) {
        return 'No conditions';
      }
      
      const parts = [];
      filter.expression.conditions.forEach((item) => {
        if (item.logic) {
          parts.push(item.logic);
        } else {
          const fieldLabel = getFieldLabel(item.field);
          const operatorLabel = getOperatorLabel(item.operator);
          let valueLabel = '';
          
          if (item.value) {
            if (item.field === 'stage') {
              const stage = props.availableStages.find(s => s.id === item.value);
              valueLabel = stage ? stage.label : item.value;
            } else if (item.field === 'createDate') {
              const date = new Date(item.value);
              if (!isNaN(date.getTime())) {
                valueLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              } else {
                valueLabel = item.value;
              }
            } else {
              valueLabel = item.value;
            }
          }
          
          if (valueLabel) {
            parts.push(`${fieldLabel} ${operatorLabel} ${valueLabel}`);
          } else {
            parts.push(`${fieldLabel} ${operatorLabel}`);
          }
        }
      });
      
      return parts.join(' ');
    };

    // Open save modal
    const openSaveModal = () => {
      filterName.value = generateFilterName();
      showSaveModal.value = true;
      nextTick(() => {
        if (filterNameInput.value) {
          filterNameInput.value.focus();
          filterNameInput.value.select();
        }
      });
    };

    // Close save modal
    const closeSaveModal = () => {
      showSaveModal.value = false;
      filterName.value = '';
    };

    // Check if can save filter
    const canSaveFilter = computed(() => {
      return filterName.value.trim().length > 0 && conditions.value.length > 0;
    });

    // Save filter
    const saveFilter = () => {
      if (!canSaveFilter.value) return;

      const filterExpression = {
        conditions: [],
      };

      conditions.value.forEach((cond, idx) => {
        filterExpression.conditions.push({ ...cond });
        if (idx < connectors.value.length) {
          filterExpression.conditions.push({ logic: connectors.value[idx] });
        }
      });

      const newFilter = {
        id: `filter-${Date.now()}-${Math.random()}`,
        name: filterName.value.trim(),
        expression: filterExpression,
        createdAt: new Date().toISOString(),
      };

      savedFilters.value.push(newFilter);
      saveFiltersToStorage();
      closeSaveModal();
      // Ensure filter is applied after saving
      emitChange();
      // Emit event that filter was saved
      emit('filter-saved', newFilter);
    };


    // Click outside directive
    const clickOutside = {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    };

    // Load saved filters on mount
    onMounted(() => {
      loadSavedFilters();
    });

    return {
      conditions,
      connectors,
      matchCount,
      hasConflict,
      showSaveModal,
      filterName,
      filterNameInput,
      savedFilters,
      addCondition,
      updateCondition,
      removeCondition,
      updateConnector,
      openSaveModal,
      closeSaveModal,
      canSaveFilter,
      saveFilter,
      getCurrentFilterPreview,
      getFilterPreview,
      clickOutside,
    };
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    },
  },
};
</script>

<style scoped>
.inline-filter-builder {
  margin-top: 12px;
  margin-bottom: 0;
}

.filter-bar {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 8px 12px;
  min-height: 40px;
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
  margin-top: 8px;
  font-size: 12px;
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
  margin-top: 8px;
  padding: 8px 12px;
  background-color: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 4px;
  font-size: 12px;
  color: #F59E0B;
}

.filter-warning svg {
  flex-shrink: 0;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.save-filter-btn,
.load-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.save-filter-btn:hover,
.load-filter-btn:hover {
  background-color: var(--color-primary-dark, #7C3AED);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

/* Saved Filter Chips */


.saved-filters-dropdown {
  position: relative;
}

.dropdown-chevron {
  transition: transform 0.15s ease;
  margin-left: 4px;
}

.dropdown-chevron.is-open {
  transform: rotate(180deg);
}

.saved-filters-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 280px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.empty-state {
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
}

.empty-hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.saved-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.saved-filter-item:hover {
  background-color: var(--color-bg-secondary);
}

.filter-item-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.filter-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.filter-preview {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.filter-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.filter-delete-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-danger, #EF4444);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  font-family: inherit;
  transition: all 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 6px;
  margin-bottom: 0;
}

.filter-preview-box {
  padding: 12px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  min-height: 40px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  border: none;
}

.btn-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-bg-tertiary);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark, #7C3AED);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

