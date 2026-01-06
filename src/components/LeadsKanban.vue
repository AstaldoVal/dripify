<template>
  <div class="leads-kanban">
    <div
      v-for="stage in stages"
      :key="stage.value"
      class="kanban-column"
    >
      <div class="column-header">
        <div class="column-title">
          <LeadStageBadge
            :stage="stage.value"
            :clickable="false"
            size="sm"
          />
          <span class="column-count">({{ getStageLeads(stage.value).length }})</span>
        </div>
      </div>
      
      <div 
        class="column-content"
        :data-stage="stage.value"
        @dragover.prevent="handleDragOver"
        @drop="handleDrop"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
      >
        <div
          v-for="lead in getStageLeads(stage.value)"
          :key="lead.id"
          class="kanban-card"
          :class="{ 'dragging': draggedLeadId === lead.id }"
          :draggable="true"
          @dragstart="handleDragStart($event, lead)"
          @dragend="handleDragEnd"
        >
          <div class="card-header">
            <div class="card-avatar">
              <img v-if="lead.avatar" :src="lead.avatar" :alt="lead.name" />
              <div v-else class="avatar-placeholder">{{ getInitials(lead.name) }}</div>
            </div>
            <div class="card-info">
              <div class="card-name">{{ lead.name }}</div>
              <div class="card-headline">{{ truncate(lead.headline, 40) }}</div>
            </div>
          </div>
          
          <div class="card-details">
            <div class="card-email" v-if="lead.emails && lead.emails.length > 0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1"/>
                <path d="M1 4L6 7L11 4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
              </svg>
              <span>{{ lead.emails[0] }}</span>
            </div>
            <div class="card-location" v-if="lead.location">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1"/>
                <path d="M6 1V3M6 9V11M1 6H3M9 6H11" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
              </svg>
              <span>{{ lead.location }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <span class="card-date">{{ formatDate(lead.lastAction) }}</span>
            <button
              class="card-menu-button"
              @click.stop="handleCardMenu(lead)"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="3.5" r="1.5" fill="currentColor"/>
                <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                <circle cx="7" cy="10.5" r="1.5" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="getStageLeads(stage.value).length === 0" class="empty-column">
          <p>No leads in this stage</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import LeadStageBadge from './LeadStageBadge.vue';
import { LeadStage, stageConfig } from '@/stores/leads';

export default {
  name: 'LeadsKanban',
  components: {
    LeadStageBadge,
  },
  props: {
    leads: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['card-menu', 'stage-change'],
  setup(props, { emit }) {
    const draggedLeadId = ref(null);
    const draggedFromStage = ref(null);
    const dragOverStage = ref(null);

    const stages = computed(() => {
      return Object.entries(stageConfig).map(([value, config]) => ({
        value,
        label: config.label,
        color: config.color,
        bgColor: config.bgColor,
      }));
    });

    const getStageLeads = (stage) => {
      if (!Array.isArray(props.leads)) return [];
      return props.leads.filter(lead => lead.leadStage === stage);
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
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleCardMenu = (lead) => {
      emit('card-menu', lead);
    };

    const handleDragStart = (event, lead) => {
      draggedLeadId.value = lead.id;
      draggedFromStage.value = lead.leadStage;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', lead.id.toString());
      // Add visual feedback
      event.target.style.opacity = '0.5';
    };

    const handleDragEnd = (event) => {
      draggedLeadId.value = null;
      draggedFromStage.value = null;
      dragOverStage.value = null;
      event.target.style.opacity = '1';
      // Remove all drag-over classes
      document.querySelectorAll('.column-content').forEach(el => {
        el.classList.remove('drag-over');
      });
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (event) => {
      const columnContent = event.currentTarget;
      const stage = columnContent.dataset.stage;
      if (stage && stage !== draggedFromStage.value) {
        dragOverStage.value = stage;
        columnContent.classList.add('drag-over');
      }
    };

    const handleDragLeave = (event) => {
      const columnContent = event.currentTarget;
      // Only remove if we're actually leaving the column (not just moving to a child)
      if (!columnContent.contains(event.relatedTarget)) {
        columnContent.classList.remove('drag-over');
        if (dragOverStage.value === columnContent.dataset.stage) {
          dragOverStage.value = null;
        }
      }
    };

    const handleDrop = (event) => {
      event.preventDefault();
      const columnContent = event.currentTarget;
      const newStage = columnContent.dataset.stage;
      const leadId = parseInt(event.dataTransfer.getData('text/plain'));

      if (newStage && leadId && newStage !== draggedFromStage.value) {
        emit('stage-change', {
          leadId,
          newStage,
          oldStage: draggedFromStage.value,
        });
      }

      // Cleanup
      columnContent.classList.remove('drag-over');
      draggedLeadId.value = null;
      draggedFromStage.value = null;
      dragOverStage.value = null;
    };

    return {
      draggedLeadId,
      stages,
      getStageLeads,
      getInitials,
      truncate,
      formatDate,
      handleCardMenu,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
    };
  },
};
</script>

<style scoped>
.leads-kanban {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px;
  min-height: calc(100vh - 300px);
}

.kanban-column {
  min-width: 300px;
  max-width: 300px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 320px);
}

.column-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
  border-radius: 8px 8px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-count {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
  min-height: 100px;
}

.column-content.drag-over {
  background-color: rgba(139, 92, 246, 0.08);
  border: 2px dashed rgba(139, 92, 246, 0.5);
  border-radius: 8px;
  transform: scale(1.02);
}

.column-content.drag-over::after {
  content: 'Drop here';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(139, 92, 246, 0.8);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.kanban-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  cursor: grab;
  transition: all var(--transition-base);
  user-select: none;
}

.kanban-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
  margin-bottom: 4px;
}

.card-headline {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.card-email,
.card-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.card-email svg,
.card-location svg {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.card-date {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.card-menu-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0;
  transition: all var(--transition-base);
}

.kanban-card:hover .card-menu-button {
  opacity: 1;
}

.card-menu-button:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.empty-column {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 13px;
}

/* Scrollbar styling */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.leads-kanban::-webkit-scrollbar {
  height: 8px;
}

.leads-kanban::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
  border-radius: 4px;
}

.leads-kanban::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.leads-kanban::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
</style>

