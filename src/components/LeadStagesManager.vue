<template>
  <div class="lead-stages-manager">
    <div class="section-header">
      <h2 class="section-title">Lead Stages Management</h2>
      <p class="section-description">Manage lead stages and organize them into groups</p>
    </div>

    <div class="stages-groups">
      <div
        v-for="group in groups"
        :key="group.id"
        class="stage-group-card"
      >
        <div class="group-header">
          <div class="group-info">
            <div class="group-color-indicator" :style="{ backgroundColor: group.color }"></div>
            <div>
              <h3 class="group-title">{{ group.label }}</h3>
              <p class="group-description">{{ group.description }}</p>
            </div>
          </div>
          <span class="group-badge">{{ group.stages.length }} stages</span>
        </div>

        <div class="stages-list">
          <div
            v-for="stage in group.stages"
            :key="stage.id"
            class="stage-item"
          >
            <div class="stage-content">
              <div class="stage-header">
                <div class="stage-badge-preview" :style="getStageStyle(stage)">
                  {{ stage.label }}
                </div>
                <div class="stage-actions">
                  <button
                    class="action-btn edit-btn"
                    @click="handleEditStage(stage)"
                    title="Edit stage"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M11.333 2.667a1.333 1.333 0 0 1 1.886 1.886L6.28 11.493l-2.667.667.667-2.667L11.333 2.667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="handleDeleteStage(stage)"
                    :disabled="isStageInUse(stage.id)"
                    :title="isStageInUse(stage.id) ? 'Cannot delete: stage is in use' : 'Delete stage'"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="stage-body" :data-stage-id="stage.id">
                <p class="stage-description">{{ stage.description }}</p>
                <div class="stage-ai-intent" v-if="stage.aiIntent">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="ai-icon">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1"/>
                    <path d="M6 3V6M6 9H6.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <span>{{ getAIIntentLabel(stage.aiIntent) }}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            class="add-stage-btn"
            @click="handleAddStage(group.id)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>Add Stage</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Stage Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingStage ? 'Edit Stage' : 'Add New Stage' }}</h3>
          <button class="modal-close" @click="closeModal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Stage Label</label>
            <input
              v-model="stageForm.label"
              type="text"
              placeholder="e.g., Qualified"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="stageForm.description"
              placeholder="Brief description of this stage"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Color</label>
            <div class="color-picker">
              <input
                v-model="stageForm.color"
                type="color"
                class="color-input"
              />
              <input
                v-model="stageForm.color"
                type="text"
                class="color-text-input"
                placeholder="#8B5CF6"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Group</label>
            <select v-model="stageForm.groupId" class="form-select">
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>
              AI Intent
              <span class="required-indicator">*</span>
            </label>
            <select v-model="stageForm.aiIntent" class="form-select" required>
              <option value="">Select AI Intent...</option>
              <option v-for="(config, intent) in aiIntentConfig" :key="intent" :value="intent">
                {{ config.label }}
              </option>
            </select>
            <p class="form-helper-text" v-if="stageForm.aiIntent">
              {{ getAIIntentDescription(stageForm.aiIntent) }}
            </p>
            <p class="form-helper-text" v-else>
              AI Intent represents the semantic meaning of this stage. AI will automatically assign this stage when it detects engagement patterns matching this intent. AI Signals (low-level events) are processed internally and resolved to AI Intent automatically.
            </p>
          </div>

          <!-- Advanced Contextual Matching Settings -->
          <div class="form-section-divider">
            <span class="divider-text">Advanced (Contextual Matching)</span>
          </div>

          <div class="form-group">
            <label class="label-with-info">
              Assignment Eligibility
              <button
                class="info-button"
                @click.stop="showEligibilityInfo = !showEligibilityInfo"
                title="Show information"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/>
                  <path d="M7 4V7M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </label>
            <div v-if="showEligibilityInfo" class="info-tooltip">
              Controls which stages this stage can be assigned from. "Any stage" allows flexible transitions, "Specific" restricts to selected stages.
            </div>
            <select v-model="stageForm.assignmentEligibility" class="form-select">
              <option :value="AssignmentEligibility.ANY">Can be assigned from any stage</option>
              <option :value="AssignmentEligibility.SPECIFIC">Can only be assigned from specific stages</option>
            </select>
          </div>

          <div class="form-group" v-if="stageForm.assignmentEligibility === AssignmentEligibility.SPECIFIC">
            <label>
              Eligible From Stages
            </label>
            <div class="multi-select-container">
              <div
                v-for="stage in allStages"
                :key="stage.id"
                class="multi-select-option"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="stage.id"
                    v-model="stageForm.eligibleFromStages"
                    class="checkbox-input"
                  />
                  <span class="checkbox-label-text">{{ stage.label }}</span>
                </label>
              </div>
            </div>
            <p class="form-helper-text">
              Select which stages this stage can be assigned from. If none selected, this stage cannot be automatically assigned.
            </p>
          </div>

          <div class="form-group">
            <label class="label-with-info">
              Assignment Strictness
              <button
                class="info-button"
                @click.stop="showStrictnessInfo = !showStrictnessInfo"
                title="Show information"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1"/>
                  <path d="M7 4V7M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </label>
            <div v-if="showStrictnessInfo" class="info-tooltip">
              Controls how strong the contextual match must be for AI to assign this stage. Higher strictness requires more evidence.
            </div>
            <select v-model="stageForm.assignmentStrictness" class="form-select">
              <option :value="AssignmentStrictness.LOW">Low - More permissive, assigns with lower confidence</option>
              <option :value="AssignmentStrictness.MEDIUM">Medium - Balanced matching</option>
              <option :value="AssignmentStrictness.HIGH">High - Requires strong contextual match</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">Cancel</button>
          <button class="btn-primary" @click="handleSaveStage" :disabled="!isFormValid">
            {{ editingStage ? 'Save Changes' : 'Add Stage' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useLeadsStore, LeadStageGroup, LeadStage, stageConfig, groupConfig, AIIntent, aiIntentConfig, AssignmentEligibility, AssignmentStrictness } from '@/stores/leads';

export default {
  name: 'LeadStagesManager',
  setup() {
    const leadsStore = useLeadsStore();
    const showModal = ref(false);
    const editingStage = ref(null);
    const currentGroupId = ref(null);
    const showEligibilityInfo = ref(false);
    const showStrictnessInfo = ref(false);

    // Преобразуем статические конфигурации в динамические структуры
    const groups = ref([
      {
        id: LeadStageGroup.NEW,
        label: 'New',
        description: 'Leads that have been added but not contacted yet',
        color: '#6366F1',
        stages: [],
      },
      {
        id: LeadStageGroup.IN_PROGRESS,
        label: 'In Progress',
        description: 'Leads that are actively being worked on',
        color: '#F59E0B',
        stages: [],
      },
      {
        id: LeadStageGroup.CLOSED,
        label: 'Closed',
        description: 'Leads that are no longer active',
        color: '#6B7280',
        stages: [],
      },
    ]);

    const stageForm = ref({
      label: '',
      description: '',
      color: '#8B5CF6',
      groupId: null,
      aiIntent: '',
      assignmentEligibility: AssignmentEligibility.ANY,
      eligibleFromStages: [],
      assignmentStrictness: AssignmentStrictness.MEDIUM,
    });

    // Загружаем текущие статусы из конфигурации
    const loadStages = () => {
      console.log('🔄 loadStages() called');
      console.log('📊 stageConfig:', stageConfig);
      console.log('📊 groups.value before:', groups.value);
      
      groups.value.forEach(group => {
        group.stages = [];
      });

      // Загружаем из stageConfig
      Object.entries(stageConfig).forEach(([stageKey, config]) => {
        console.log(`📝 Processing stage: ${stageKey}`, config);
        const groupKey = getGroupForStage(stageKey);
        console.log(`📁 Group for ${stageKey}:`, groupKey);
        const group = groups.value.find(g => g.id === groupKey);
        if (group) {
          const stageData = {
            id: stageKey,
            label: config.label,
            description: config.description,
            color: config.color,
            bgColor: config.bgColor,
            borderColor: config.borderColor,
            groupId: groupKey,
            aiIntent: config.aiIntent || null,
            assignmentEligibility: config.assignmentEligibility || AssignmentEligibility.ANY,
            eligibleFromStages: config.eligibleFromStages || [],
            assignmentStrictness: config.assignmentStrictness || AssignmentStrictness.MEDIUM,
          };
          console.log(`✅ Adding stage to group ${groupKey}:`, stageData);
          group.stages.push(stageData);
        } else {
          console.warn(`⚠️ Group not found for ${stageKey}, groupKey: ${groupKey}`);
        }
      });
      
      console.log('📊 groups.value after:', groups.value);
      groups.value.forEach(group => {
        console.log(`📊 Group ${group.id} has ${group.stages.length} stages:`, group.stages.map(s => s.label));
      });
    };

    const getGroupForStage = (stageKey) => {
      // Маппинг из stageToGroup
      const stageToGroupMap = {
        [LeadStage.NEW]: LeadStageGroup.NEW,
        [LeadStage.CONTACTED]: LeadStageGroup.IN_PROGRESS,
        [LeadStage.ENGAGED]: LeadStageGroup.IN_PROGRESS,
        [LeadStage.GHOSTED]: LeadStageGroup.IN_PROGRESS,
        [LeadStage.NOT_INTERESTED]: LeadStageGroup.CLOSED,
        [LeadStage.EXCLUDED]: LeadStageGroup.CLOSED,
      };
      return stageToGroupMap[stageKey] || LeadStageGroup.NEW;
    };

    const allStages = computed(() => {
      const stages = [];
      groups.value.forEach(group => {
        group.stages.forEach(stage => {
          stages.push({
            id: stage.id,
            label: stage.label,
          });
        });
      });
      return stages;
    });

    const isFormValid = computed(() => {
      return stageForm.value.label.trim().length > 0 &&
             stageForm.value.description.trim().length > 0 &&
             stageForm.value.groupId !== null &&
             stageForm.value.aiIntent !== '';
    });

    const isStageInUse = (stageId) => {
      const leads = leadsStore.leads;
      if (!leads || !Array.isArray(leads.value)) return false;
      return leads.value.some(lead => lead.leadStage === stageId);
    };

    const getStageStyle = (stage) => {
      return {
        backgroundColor: stage.bgColor || `rgba(${hexToRgb(stage.color)}, 0.12)`,
        color: stage.color,
        border: `1px solid ${stage.borderColor || stage.color}`,
      };
    };

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '139, 92, 246';
    };

    const handleAddStage = (groupId) => {
      currentGroupId.value = groupId;
      editingStage.value = null;
      stageForm.value = {
        label: '',
        description: '',
        color: '#8B5CF6',
        groupId: groupId,
        aiIntent: '',
        assignmentEligibility: AssignmentEligibility.ANY,
        eligibleFromStages: [],
        assignmentStrictness: AssignmentStrictness.MEDIUM,
      };
      showModal.value = true;
    };

    const handleEditStage = (stage) => {
      editingStage.value = stage;
      stageForm.value = {
        label: stage.label,
        description: stage.description,
        color: stage.color,
        groupId: stage.groupId,
        aiIntent: stage.aiIntent || '',
        assignmentEligibility: stage.assignmentEligibility || AssignmentEligibility.ANY,
        eligibleFromStages: stage.eligibleFromStages ? [...stage.eligibleFromStages] : [],
        assignmentStrictness: stage.assignmentStrictness || AssignmentStrictness.MEDIUM,
      };
      showModal.value = true;
    };

    const handleDeleteStage = (stage) => {
      if (isStageInUse(stage.id)) {
        const leads = leadsStore.leads;
        const count = leads && Array.isArray(leads.value) 
          ? leads.value.filter(l => l.leadStage === stage.id).length 
          : 0;
        alert(`Cannot delete "${stage.label}" because it is currently in use by ${count} lead(s).`);
        return;
      }

      if (confirm(`Are you sure you want to delete the stage "${stage.label}"?`)) {
        const group = groups.value.find(g => g.id === stage.groupId);
        if (group) {
          group.stages = group.stages.filter(s => s.id !== stage.id);
          // Здесь можно добавить вызов API для удаления
          console.log('Stage deleted:', stage.id);
        }
      }
    };

    const handleSaveStage = () => {
      if (!isFormValid.value) return;

      const stageData = {
        label: stageForm.value.label.trim(),
        description: stageForm.value.description.trim(),
        color: stageForm.value.color,
        bgColor: `rgba(${hexToRgb(stageForm.value.color)}, 0.12)`,
        borderColor: `rgba(${hexToRgb(stageForm.value.color)}, 0.3)`,
        groupId: stageForm.value.groupId,
        aiIntent: stageForm.value.aiIntent,
        assignmentEligibility: stageForm.value.assignmentEligibility,
        eligibleFromStages: [...stageForm.value.eligibleFromStages],
        assignmentStrictness: stageForm.value.assignmentStrictness,
      };

      if (editingStage.value) {
        // Обновление существующего статуса
        const group = groups.value.find(g => g.id === editingStage.value.groupId);
        if (group) {
          const stageIndex = group.stages.findIndex(s => s.id === editingStage.value.id);
          if (stageIndex !== -1) {
            group.stages[stageIndex] = {
              ...editingStage.value,
              ...stageData,
            };
          }
        }
        console.log('Stage updated:', editingStage.value.id, stageData);
      } else {
        // Добавление нового статуса
        const newStageId = `CUSTOM_${Date.now()}`;
        const group = groups.value.find(g => g.id === stageForm.value.groupId);
        if (group) {
          group.stages.push({
            id: newStageId,
            ...stageData,
          });
        }
        console.log('Stage added:', newStageId, stageData);
      }

      closeModal();
    };

    const getAIIntentLabel = (intent) => {
      return aiIntentConfig[intent]?.label || intent;
    };

    const getAIIntentDescription = (intent) => {
      return aiIntentConfig[intent]?.description || '';
    };

    const closeModal = () => {
      showModal.value = false;
      editingStage.value = null;
      currentGroupId.value = null;
      showEligibilityInfo.value = false;
      showStrictnessInfo.value = false;
      stageForm.value = {
        label: '',
        description: '',
        color: '#8B5CF6',
        groupId: null,
        aiIntent: '',
        assignmentEligibility: AssignmentEligibility.ANY,
        eligibleFromStages: [],
        assignmentStrictness: AssignmentStrictness.MEDIUM,
      };
    };

    onMounted(() => {
      console.log('🎨 LeadStagesManager mounted');
      loadStages();
      console.log('🎨 Stages loaded:', groups.value);
      console.log('🎨 First group stages:', groups.value[0]?.stages);
      
      // Проверяем стили после монтирования
      setTimeout(() => {
        const stageBodies = document.querySelectorAll('.stage-body');
        console.log('🎨 Found stage-body elements:', stageBodies.length);
        stageBodies.forEach((el, index) => {
          const computed = window.getComputedStyle(el);
          console.log(`🎨 stage-body ${index}:`, {
            display: computed.display,
            flexDirection: computed.flexDirection,
            alignItems: computed.alignItems,
            justifyContent: computed.justifyContent,
            gap: computed.gap,
            width: computed.width,
            className: el.className,
            innerHTML: el.innerHTML.substring(0, 100),
          });
          
          // Проверяем дочерние элементы
          const description = el.querySelector('.stage-description');
          const aiIntent = el.querySelector('.stage-ai-intent');
          console.log(`🎨 stage-body ${index} children:`, {
            hasDescription: !!description,
            hasAiIntent: !!aiIntent,
            descriptionText: description?.textContent,
            aiIntentText: aiIntent?.textContent,
          });
        });
      }, 500);
    });

    return {
      groups,
      showModal,
      editingStage,
      stageForm,
      isFormValid,
      isStageInUse,
      getStageStyle,
      aiIntentConfig,
      AssignmentEligibility,
      AssignmentStrictness,
      allStages,
      showEligibilityInfo,
      showStrictnessInfo,
      getAIIntentLabel,
      getAIIntentDescription,
      handleAddStage,
      handleEditStage,
      handleDeleteStage,
      handleSaveStage,
      closeModal,
    };
  },
};
</script>

<style scoped>
.lead-stages-manager {
  max-width: 1200px;
}

.section-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.stages-groups {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

@media (min-width: 1401px) {
  .stages-groups {
    flex-wrap: nowrap;
  }
}

.stage-group-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  min-width: 350px;
  flex: 1 1 350px;
}

.stage-group-card:hover {
  box-shadow: var(--shadow-md);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  gap: 12px;
  min-width: 0;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.group-color-indicator {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px 0;
}

.group-description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.group-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background-color: var(--color-bg-secondary);
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stage-item {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.stage-item:hover {
  background-color: var(--color-bg-tertiary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stage-content {
  padding: 12px;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
}

.stage-badge-preview {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.stage-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.stage-item:hover .stage-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.action-btn:hover:not(:disabled) {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.action-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.edit-btn:hover:not(:disabled) {
  background-color: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.delete-btn:hover:not(:disabled) {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.stage-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: nowrap;
  width: 100%;
}

.stage-description {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stage-ai-intent {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-tertiary);
  padding: 4px 8px;
  background-color: var(--color-bg);
  border-radius: 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.stage-ai-intent .ai-icon {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.add-stage-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background-color: var(--color-bg-secondary);
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-stage-btn:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--color-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  font-size: 20px;
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
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 8px;
}

.label-with-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
}

.info-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  vertical-align: middle;
  line-height: 1;
}

.info-button:hover {
  color: var(--color-primary);
  background-color: rgba(139, 92, 246, 0.1);
}

.info-button svg {
  width: 14px;
  height: 14px;
}

.info-tooltip {
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.2s ease;
}

.form-select {
  width: 100%;
  padding: 10px 32px 10px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
  cursor: pointer;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-helper-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 6px;
  margin-bottom: 0;
  line-height: 1.4;
}

.required-indicator {
  color: #EF4444;
  margin-left: 4px;
}

.form-section-divider {
  margin: 24px 0 16px 0;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
  position: relative;
}

.divider-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.multi-select-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg);
  padding: 4px;
}

.multi-select-option {
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  width: 100%;
  margin: 0;
}

.checkbox-label:hover {
  background-color: var(--color-bg-secondary);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
  vertical-align: middle;
}

.checkbox-label-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.5;
  display: inline-block;
  vertical-align: middle;
  flex: 1;
}

.color-picker {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  min-height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  background-color: var(--color-bg);
  transition: all 0.2s ease;
}

.color-input:hover {
  border-color: var(--color-primary);
}

.color-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.color-text-input {
  flex: 1;
  padding: 10px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.2s ease;
  font-family: inherit;
}

.color-text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg-tertiary);
}
</style>

