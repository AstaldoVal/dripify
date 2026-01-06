<template>
  <div class="filter-chip" :class="{ 'is-editing': isEditing }">
    <!-- Field Selector -->
    <div class="chip-segment field-segment" @click.stop="startEditing('field', $event)">
      <span class="chip-text">{{ fieldLabel }}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="chip-chevron" :class="{ 'is-open': showFieldDropdown }">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Operator Selector -->
    <div class="chip-segment operator-segment" @click.stop="startEditing('operator', $event)">
      <span class="chip-text">{{ operatorLabel }}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="chip-chevron" :class="{ 'is-open': showOperatorDropdown }">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Value Input/Selector -->
    <div class="chip-segment value-segment" @click.stop="startEditing('value', $event)">
      <!-- Date input - always visible when needed -->
      <template v-if="needsDateInput">
        <input
          ref="valueInput"
          v-model="localValue"
          type="date"
          class="chip-input chip-date-input"
          @change="handleDateChange"
          @click.stop
        />
      </template>
      
      <!-- Text input - only when editing -->
      <template v-else-if="isEditing && needsTextInput">
        <input
          ref="valueInput"
          v-model="localValue"
          type="text"
          class="chip-input"
          @blur="finishEditing"
          @keyup.enter="finishEditing"
          @keyup.esc="cancelEditing"
        />
      </template>
      
      <!-- Text display for non-editing or non-input fields -->
      <template v-else>
        <span class="chip-text">{{ valueDisplay }}</span>
        <svg v-if="!needsTextInput && !needsDateInput" width="12" height="12" viewBox="0 0 12 12" fill="none" class="chip-chevron" :class="{ 'is-open': showValueDropdown }">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </template>
    </div>

    <!-- Remove Button -->
    <button class="chip-remove" @click="$emit('remove')" title="Remove condition">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Dropdowns -->
    <div v-if="showFieldDropdown" class="chip-dropdown field-dropdown" v-click-outside="closeDropdowns" @click.stop>
      <div
        v-for="field in availableFields"
        :key="field.id"
        class="dropdown-item"
        :class="{ active: condition.field === field.id }"
        @click.stop="selectField(field.id)"
      >
        {{ field.label }}
      </div>
    </div>

    <div v-if="showOperatorDropdown" class="chip-dropdown operator-dropdown" v-click-outside="closeDropdowns" @click.stop>
      <div
        v-for="op in availableOperators"
        :key="op.id"
        class="dropdown-item"
        :class="{ active: condition.operator === op.id }"
        @click.stop="selectOperator(op.id)"
      >
        {{ op.label }}
      </div>
    </div>

    <div v-if="showValueDropdown" class="chip-dropdown value-dropdown" v-click-outside="closeDropdowns" @click.stop>
      <div
        v-for="val in availableValues"
        :key="val.id"
        class="dropdown-item"
        :class="{ active: condition.value === val.id }"
        @click.stop="selectValue(val.id)"
      >
        {{ val.label }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';

// Field definitions
const FIELD_DEFINITIONS = {
  stage: {
    label: 'Stage',
    type: 'enum',
    operators: ['eq', 'ne'],
    values: () => {
      // Will be injected from parent
      return [];
    },
  },
  email: {
    label: 'Email',
    type: 'string',
    operators: ['eq', 'ne', 'contains', 'not_contains', 'is_set', 'is_blank'],
  },
  company: {
    label: 'Company',
    type: 'string',
    operators: ['eq', 'ne', 'contains', 'not_contains', 'is_set', 'is_blank'],
  },
  location: {
    label: 'Location',
    type: 'string',
    operators: ['eq', 'ne', 'contains', 'not_contains', 'is_set', 'is_blank'],
  },
  createDate: {
    label: 'Create date',
    type: 'date',
    operators: ['before', 'after', 'is_set', 'is_blank'],
  },
};

// Operator definitions
const OPERATOR_DEFINITIONS = {
  eq: { label: '=', needsValue: true },
  ne: { label: '≠', needsValue: true },
  contains: { label: 'contains', needsValue: true },
  not_contains: { label: 'does not contain', needsValue: true },
  is_set: { label: 'is set', needsValue: false },
  is_blank: { label: 'is blank', needsValue: false },
  before: { label: 'before', needsValue: true },
  after: { label: 'after', needsValue: true },
};

export default {
  name: 'FilterChip',
  props: {
    condition: {
      type: Object,
      required: true,
      validator: (val) => {
        return val.field && val.operator !== undefined;
      },
    },
    availableStages: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update', 'remove'],
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editingSegment = ref(null);
    const showFieldDropdown = ref(false);
    const showOperatorDropdown = ref(false);
    const showValueDropdown = ref(false);
    
    // Initialize localValue based on field type
    const getInitialValue = () => {
      if (props.condition.field === 'createDate' && props.condition.value) {
        const date = new Date(props.condition.value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      return props.condition.value || '';
    };
    
    const localValue = ref(getInitialValue());
    const valueInput = ref(null);

    const fieldDef = computed(() => FIELD_DEFINITIONS[props.condition.field] || FIELD_DEFINITIONS.stage);
    const fieldLabel = computed(() => fieldDef.value.label);

    const availableFields = computed(() => {
      return Object.entries(FIELD_DEFINITIONS).map(([id, def]) => ({
        id,
        label: def.label,
      }));
    });

    const availableOperators = computed(() => {
      const field = fieldDef.value;
      if (!field.operators) return [];
      return field.operators.map(opId => ({
        id: opId,
        label: OPERATOR_DEFINITIONS[opId]?.label || opId,
      }));
    });

    const operatorDef = computed(() => OPERATOR_DEFINITIONS[props.condition.operator] || {});
    const operatorLabel = computed(() => operatorDef.value.label || props.condition.operator);

    const needsTextInput = computed(() => {
      if (!operatorDef.value.needsValue) return false;
      if (props.condition.field === 'stage') return false;
      if (props.condition.field === 'createDate') return false;
      return fieldDef.value.type === 'string';
    });

    const needsDateInput = computed(() => {
      return props.condition.field === 'createDate' && 
             operatorDef.value.needsValue && 
             (props.condition.operator === 'before' || props.condition.operator === 'after');
    });

    const needsValue = computed(() => {
      return operatorDef.value.needsValue !== false;
    });

    const availableValues = computed(() => {
      if (props.condition.field === 'stage') {
        return props.availableStages.map(stage => ({
          id: stage.id,
          label: stage.label,
        }));
      }
      return [];
    });

    const valueDisplay = computed(() => {
      if (!needsValue.value) {
        return '';
      }
      if (props.condition.field === 'stage') {
        const stage = props.availableStages.find(s => s.id === props.condition.value);
        return stage ? stage.label : props.condition.value || 'Select...';
      }
      if (props.condition.field === 'createDate') {
        if (!props.condition.value) return 'Select date...';
        const date = new Date(props.condition.value);
        if (isNaN(date.getTime())) return props.condition.value || 'Select date...';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return props.condition.value || 'Enter value...';
    });

    const startEditing = (segment, event) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();
      }
      
      // Toggle dropdown if clicking the same segment
      if (editingSegment.value === segment) {
        if (segment === 'field' && showFieldDropdown.value) {
          closeDropdowns();
          return;
        }
        if (segment === 'operator' && showOperatorDropdown.value) {
          closeDropdowns();
          return;
        }
        if (segment === 'value' && showValueDropdown.value) {
          closeDropdowns();
          return;
        }
      }

      isEditing.value = true;
      editingSegment.value = segment;
      
      // Close other dropdowns first
      showFieldDropdown.value = false;
      showOperatorDropdown.value = false;
      showValueDropdown.value = false;

      // Use nextTick to ensure DOM is updated
      nextTick(() => {
        if (segment === 'field') {
          showFieldDropdown.value = true;
        } else if (segment === 'operator') {
          showOperatorDropdown.value = true;
        } else if (segment === 'value') {
          console.log('🔍 startEditing value:', { 
            needsTextInput: needsTextInput.value, 
            needsDateInput: needsDateInput.value,
            field: props.condition.field,
            operator: props.condition.operator
          });
          if (needsTextInput.value || needsDateInput.value) {
            // Keep editing state for text/date inputs
            nextTick(() => {
              if (valueInput.value) {
                valueInput.value.focus();
                if (needsTextInput.value) {
                  valueInput.value.select();
                }
              }
            });
          } else if (props.condition.field === 'stage') {
            showValueDropdown.value = true;
          }
        }
      });
    };

    const closeDropdowns = () => {
      showFieldDropdown.value = false;
      showOperatorDropdown.value = false;
      showValueDropdown.value = false;
      isEditing.value = false;
      editingSegment.value = null;
    };

    const selectField = (fieldId) => {
      const newCondition = {
        ...props.condition,
        field: fieldId,
        operator: FIELD_DEFINITIONS[fieldId].operators[0], // Reset to first operator
        value: undefined, // Reset value
      };
      emit('update', newCondition);
      closeDropdowns();
    };

    const selectOperator = (operatorId) => {
      const newCondition = {
        ...props.condition,
        operator: operatorId,
        value: operatorDef.value.needsValue === false ? undefined : props.condition.value,
      };
      emit('update', newCondition);
      closeDropdowns();
    };

    const selectValue = (valueId) => {
      const newCondition = {
        ...props.condition,
        value: valueId,
      };
      emit('update', newCondition);
      closeDropdowns();
    };

    const handleDateChange = (event) => {
      const dateValue = event?.target?.value || localValue.value;
      if (dateValue) {
        const newCondition = {
          ...props.condition,
          value: dateValue,
        };
        emit('update', newCondition);
        closeDropdowns();
      }
    };

    const finishEditing = () => {
      if (editingSegment.value === 'value' && (needsTextInput.value || needsDateInput.value)) {
        const newCondition = {
          ...props.condition,
          value: localValue.value,
        };
        emit('update', newCondition);
      }
      closeDropdowns();
    };

    const cancelEditing = () => {
      localValue.value = props.condition.value || '';
      closeDropdowns();
    };

    watch(() => props.condition.value, (newVal) => {
      if (props.condition.field === 'createDate' && newVal) {
        // Convert date to YYYY-MM-DD format for date input
        const date = new Date(newVal);
        if (!isNaN(date.getTime())) {
          localValue.value = date.toISOString().split('T')[0];
        } else {
          localValue.value = newVal || '';
        }
      } else {
        localValue.value = newVal || '';
      }
    }, { immediate: true });

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

    return {
      isEditing,
      editingSegment,
      showFieldDropdown,
      showOperatorDropdown,
      showValueDropdown,
      localValue,
      valueInput,
      fieldLabel,
      operatorLabel,
      valueDisplay,
      availableFields,
      availableOperators,
      availableValues,
      needsTextInput,
      needsDateInput,
      needsValue,
      startEditing,
      closeDropdowns,
      selectField,
      selectOperator,
      selectValue,
      handleDateChange,
      finishEditing,
      cancelEditing,
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
.filter-chip {
  display: inline-flex;
  align-items: center;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0;
  font-size: 13px;
  position: relative;
  transition: all 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--color-primary);
}

.filter-chip.is-editing {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.chip-segment {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
  position: relative;
  min-width: fit-content;
  flex-shrink: 0;
}

.chip-segment:not(:last-child) {
  border-right: 1px solid var(--color-border);
}

.chip-segment:hover {
  background-color: var(--color-bg-secondary);
}

.chip-text {
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
  min-width: 60px;
  display: inline-block;
}

.chip-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  padding: 0;
  min-width: 100px;
  width: 100px;
  font-family: inherit;
}

.chip-date-input {
  min-width: 140px;
  width: 140px;
  cursor: pointer;
}

.chip-date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

.chip-date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

.chip-chevron {
  color: var(--color-text-secondary);
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  transition: transform 0.15s ease;
}

.chip-chevron.is-open {
  transform: rotate(180deg);
}

.chip-remove {
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
  margin: 2px;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.chip-remove:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text);
}

.chip-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 180px;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
}

.field-dropdown {
  left: 0;
  min-width: 180px;
}

.operator-dropdown {
  left: 0;
  min-width: 180px;
}

.value-dropdown {
  left: 0;
  min-width: 180px;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--color-text);
  font-size: 13px;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: var(--color-bg-secondary);
}

.dropdown-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}
</style>

