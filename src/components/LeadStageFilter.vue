<template>
  <div class="stage-filter">
    <div class="filter-header" @click="toggleDropdown">
      <span class="filter-label">
        {{ selectedLabel }}
      </span>
      <svg class="dropdown-arrow" :class="{ open: isOpen }" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    
    <div v-if="isOpen" class="filter-dropdown">
      <div class="dropdown-section">
        <div class="section-header">
          <span>Filter by Stage</span>
          <button v-if="hasSelection" class="clear-btn" @click.stop="clearAll">Clear</button>
        </div>
        
        <!-- Stage Groups -->
        <div v-for="(group, groupKey) in groupConfig" :key="groupKey" class="stage-group">
          <div 
            class="group-header"
            @click.stop="toggleGroup(groupKey)"
          >
            <input
              type="checkbox"
              :checked="isGroupSelected(groupKey)"
              :indeterminate="isGroupPartiallySelected(groupKey)"
              @click.stop
              @change="toggleGroup(groupKey)"
            />
            <span class="group-label" :style="{ color: group.color }">
              {{ group.label }}
            </span>
            <span class="group-count">({{ getGroupCount(groupKey) }})</span>
          </div>
          
          <div class="group-stages">
            <div
              v-for="stage in group.stages"
              :key="stage"
              class="stage-option"
              @click.stop="toggleStage(stage)"
            >
              <input
                type="checkbox"
                :checked="isStageSelected(stage)"
                @click.stop
                @change="toggleStage(stage)"
              />
              <LeadStageBadge
                :stage="stage"
                :clickable="false"
                size="sm"
              />
              <span class="stage-count">{{ getStageCount(stage) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div v-if="isOpen" class="dropdown-backdrop" @click="closeDropdown"></div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import LeadStageBadge from './LeadStageBadge.vue';
import { groupConfig, LeadStage } from '@/stores/leads';

export default {
  name: 'LeadStageFilter',
  components: {
    LeadStageBadge,
  },
  props: {
    selectedStages: {
      type: Array,
      default: () => [],
    },
    stageStats: {
      type: Object,
      default: () => ({}),
    },
    groupStats: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:selectedStages', 'change'],
  setup(props, { emit }) {
    const isOpen = ref(false);

    const selectedLabel = computed(() => {
      if (props.selectedStages.length === 0) {
        return 'All stages';
      }
      if (props.selectedStages.length === 1) {
        return `1 stage`;
      }
      return `${props.selectedStages.length} stages`;
    });

    const hasSelection = computed(() => props.selectedStages.length > 0);

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    const closeDropdown = () => {
      isOpen.value = false;
    };

    const isStageSelected = (stage) => {
      return props.selectedStages.includes(stage);
    };

    const isGroupSelected = (groupKey) => {
      const group = groupConfig[groupKey];
      return group.stages.every(stage => props.selectedStages.includes(stage));
    };

    const isGroupPartiallySelected = (groupKey) => {
      const group = groupConfig[groupKey];
      const selectedCount = group.stages.filter(stage => props.selectedStages.includes(stage)).length;
      return selectedCount > 0 && selectedCount < group.stages.length;
    };

    const toggleStage = (stage) => {
      const newSelection = [...props.selectedStages];
      const index = newSelection.indexOf(stage);
      
      if (index === -1) {
        newSelection.push(stage);
      } else {
        newSelection.splice(index, 1);
      }
      
      emit('update:selectedStages', newSelection);
      emit('change', newSelection);
    };

    const toggleGroup = (groupKey) => {
      const group = groupConfig[groupKey];
      const isSelected = isGroupSelected(groupKey);
      
      let newSelection = [...props.selectedStages];
      
      if (isSelected) {
        // Remove all stages from this group
        newSelection = newSelection.filter(stage => !group.stages.includes(stage));
      } else {
        // Add all stages from this group
        group.stages.forEach(stage => {
          if (!newSelection.includes(stage)) {
            newSelection.push(stage);
          }
        });
      }
      
      emit('update:selectedStages', newSelection);
      emit('change', newSelection);
    };

    const clearAll = () => {
      emit('update:selectedStages', []);
      emit('change', []);
    };

    const getStageCount = (stage) => {
      const count = props.stageStats?.[stage] || 0;
      console.log(`🔢 LeadStageFilter.getStageCount(${stage}):`, count);
      console.log(`🔢 props.stageStats:`, props.stageStats);
      console.log(`🔢 props.stageStats type:`, typeof props.stageStats);
      console.log(`🔢 props.stageStats[${stage}]:`, props.stageStats?.[stage]);
      return count;
    };

    const getGroupCount = (groupKey) => {
      const count = props.groupStats?.[groupKey] || 0;
      console.log(`🔢 LeadStageFilter.getGroupCount(${groupKey}):`, count);
      console.log(`🔢 props.groupStats:`, props.groupStats);
      return count;
    };

    return {
      isOpen,
      selectedLabel,
      hasSelection,
      groupConfig,
      toggleDropdown,
      closeDropdown,
      isStageSelected,
      isGroupSelected,
      isGroupPartiallySelected,
      toggleStage,
      toggleGroup,
      clearAll,
      getStageCount,
      getGroupCount,
    };
  },
};
</script>

<style scoped>
.stage-filter {
  position: relative;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  cursor: pointer;
  min-width: 140px;
  transition: all var(--transition-base);
}

.filter-header:hover {
  border-color: var(--color-primary);
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.dropdown-arrow {
  color: var(--color-text-secondary);
  transition: transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 280px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-section {
  padding: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color var(--transition-base);
}

.clear-btn:hover {
  background-color: var(--color-primary-light);
}

.stage-group {
  margin-bottom: 12px;
}

.stage-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.group-header:hover {
  background-color: var(--color-bg-secondary);
}

.group-label {
  font-weight: 600;
  font-size: 13px;
}

.group-count {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.group-stages {
  margin-left: 24px;
  margin-top: 4px;
}

.stage-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.stage-option:hover {
  background-color: var(--color-bg-secondary);
}

.stage-count {
  margin-left: auto;
  color: var(--color-text-tertiary);
  font-size: 12px;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}
</style>

