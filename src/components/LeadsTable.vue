<template>
  <div class="leads-table-wrapper">
    <table class="leads-table">
      <thead class="table-header">
        <tr>
          <th class="col-checkbox">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="handleSelectAllChange"
            />
          </th>
          <th class="col-name">Name</th>
          <th class="col-stage">Stage</th>
          <th class="col-headline">Headline</th>
          <th class="col-emails">Emails</th>
          <th class="col-location">Location</th>
          <th class="col-last-action">Last action</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody class="table-body">
        <tr
          v-for="lead in visibleLeads"
          :key="lead.id"
          class="table-row"
          :class="{ 
            selected: isSelected(lead.id),
            [`stage-${lead.leadStage?.toLowerCase().replace('_', '-')}`]: lead.leadStage
          }"
        >
          <td class="col-checkbox" @click.stop>
            <input
              type="checkbox"
              :checked="isSelected(lead.id)"
              @change="handleSelectChange(lead.id, $event.target.checked)"
            />
          </td>
          <td class="col-name">
            <div class="name-cell">
              <div class="avatar">
                <img v-if="lead.avatar" :src="lead.avatar" :alt="lead.name" />
                <div v-else class="avatar-placeholder">{{ getInitials(lead.name) }}</div>
              </div>
              <span class="name-text">{{ lead.name }}</span>
            </div>
          </td>
          <td class="col-stage" @click.stop>
            <LeadStageBadge
              :stage="lead.leadStage"
              :source="lead.leadStageSource"
              :show-source="true"
              @click="handleStageClick(lead.leadStage)"
            />
          </td>
          <td class="col-headline">
            <span class="headline-text" :title="lead.headline">{{ truncate(lead.headline, 50) }}</span>
          </td>
          <td class="col-emails" @click.stop>
            <EmailCell :lead="lead" />
          </td>
          <td class="col-location">{{ lead.location || '—' }}</td>
          <td class="col-last-action">{{ formatDate(lead.lastAction) }}</td>
          <td class="col-actions" @click.stop>
            <button class="action-button" @click="handleActionMenu(lead)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </td>
        </tr>
        <tr v-if="loading" class="loading-row">
          <td colspan="8" class="loading-cell">
            <div class="skeleton-loader">
              <div class="skeleton-line" v-for="i in 5" :key="i"></div>
            </div>
          </td>
        </tr>
        <tr v-if="!loading && (!Array.isArray(leads) || leads.length === 0)" class="empty-row">
          <td colspan="8" class="empty-cell">
            <div class="empty-state">
              <p>No leads found</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed } from 'vue';
import EmailCell from './EmailCell.vue';
import LeadStageBadge from './LeadStageBadge.vue';
import { stageConfig } from '@/stores/leads';

export default {
  name: 'LeadsTable',
  components: {
    EmailCell,
    LeadStageBadge,
  },
  props: {
    leads: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    selectedIds: {
      type: Set,
      default: () => new Set(),
    },
  },
  watch: {
    leads: {
      handler(newVal) {
        console.log('📊 LeadsTable: leads prop changed:', {
          type: typeof newVal,
          isArray: Array.isArray(newVal),
          length: newVal?.length || 0
        });
        if (Array.isArray(newVal) && newVal.length > 0) {
          console.log('👤 First lead in table:', newVal[0].name);
        }
      },
      immediate: true,
    },
  },
  emits: ['select', 'select-all', 'action', 'stage-click'],
  setup(props, { emit }) {
    const visibleLeads = computed(() => {
      if (!Array.isArray(props.leads)) return [];
      return props.leads.slice(0, 100);
    });
    
    const allSelected = computed(() => {
      if (!Array.isArray(props.leads) || props.leads.length === 0) return false;
      return props.leads.every(lead => props.selectedIds.has(lead.id));
    });
    
    const someSelected = computed(() => {
      if (!Array.isArray(props.leads) || props.leads.length === 0) return false;
      return props.leads.some(lead => props.selectedIds.has(lead.id)) && !allSelected.value;
    });
    
    const isSelected = (leadId) => {
      return props.selectedIds.has(leadId);
    };
    
    const handleSelectChange = (leadId, selected) => {
      emit('select', leadId, selected);
    };
    
    const handleSelectAllChange = (event) => {
      emit('select-all', event.target.checked);
    };
    
    const handleActionMenu = (lead) => {
      emit('action', 'menu', lead);
    };

    const handleStageClick = (stage) => {
      emit('stage-click', stage);
    };
    
    const getInitials = (name) => {
      if (!name) return '?';
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    };
    
    const truncate = (text, maxLength) => {
      if (!text) return '—';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };
    
    const formatDate = (date) => {
      if (!date) return '—';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return {
      visibleLeads,
      allSelected,
      someSelected,
      isSelected,
      handleSelectChange,
      handleSelectAllChange,
      handleActionMenu,
      handleStageClick,
      getInitials,
      truncate,
      formatDate,
    };
  },
};
</script>

<style scoped>
.leads-table-wrapper {
  overflow-x: auto;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.leads-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-bg);
}

.table-header {
  position: sticky;
  top: 0;
  background-color: var(--color-bg-secondary);
  z-index: 10;
  border-bottom: 2px solid var(--color-border);
}

.table-header th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.col-checkbox {
  width: 48px;
  text-align: center;
}

.col-name {
  width: 200px;
  min-width: 180px;
}

.col-stage {
  width: 140px;
  min-width: 120px;
}

.col-headline {
  width: 300px;
  min-width: 250px;
}

.col-emails {
  width: 250px;
  min-width: 200px;
}

.col-location {
  width: 180px;
  min-width: 150px;
}

.col-last-action {
  width: 140px;
  text-align: right;
}

.col-actions {
  width: 48px;
  text-align: center;
}

.table-body {
  background-color: var(--color-bg);
}

.table-row {
  border-bottom: 1px solid var(--color-border);
  border-left: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: var(--color-bg);
  position: relative;
}

.table-row:hover {
  background-color: var(--color-bg-secondary);
  transform: translateX(2px);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.table-row.selected {
  background-color: var(--color-row-selected);
}

/* Stage-based row styling - мягкое выделение по стейджу */
.table-row.stage-new {
  border-left-color: rgba(139, 92, 246, 0.4);
  background-color: rgba(139, 92, 246, 0.03);
}

.table-row.stage-new:hover {
  background-color: rgba(139, 92, 246, 0.06);
  border-left-color: rgba(139, 92, 246, 0.6);
}

.table-row.stage-contacted {
  border-left-color: rgba(245, 158, 11, 0.4);
  background-color: rgba(245, 158, 11, 0.03);
}

.table-row.stage-contacted:hover {
  background-color: rgba(245, 158, 11, 0.06);
  border-left-color: rgba(245, 158, 11, 0.6);
}

.table-row.stage-engaged {
  border-left-color: rgba(16, 185, 129, 0.4);
  background-color: rgba(16, 185, 129, 0.03);
}

.table-row.stage-engaged:hover {
  background-color: rgba(16, 185, 129, 0.06);
  border-left-color: rgba(16, 185, 129, 0.6);
}

.table-row.stage-ghosted {
  border-left-color: rgba(249, 115, 22, 0.4);
  background-color: rgba(249, 115, 22, 0.03);
}

.table-row.stage-ghosted:hover {
  background-color: rgba(249, 115, 22, 0.06);
  border-left-color: rgba(249, 115, 22, 0.6);
}

.table-row.stage-not-interested {
  border-left-color: rgba(100, 116, 139, 0.4);
  background-color: rgba(100, 116, 139, 0.03);
}

.table-row.stage-not-interested:hover {
  background-color: rgba(100, 116, 139, 0.06);
  border-left-color: rgba(100, 116, 139, 0.6);
}

.table-row.stage-excluded {
  border-left-color: rgba(71, 85, 105, 0.4);
  background-color: rgba(71, 85, 105, 0.03);
}

.table-row.stage-excluded:hover {
  background-color: rgba(71, 85, 105, 0.06);
  border-left-color: rgba(71, 85, 105, 0.6);
}

.table-row td {
  padding: 14px 16px;
  vertical-align: middle;
  color: var(--color-text);
  font-size: 14px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: var(--color-text);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 600;
  font-size: 12px;
  color: var(--color-text);
}

.name-text {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
}

.headline-text {
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.col-last-action {
  text-align: right;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
}

.col-location {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all var(--transition-base);
}

.action-button:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.loading-cell,
.empty-cell {
  padding: 40px;
  text-align: center;
}

.empty-state {
  color: var(--color-text-secondary);
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.skeleton-line {
  height: 20px;
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

