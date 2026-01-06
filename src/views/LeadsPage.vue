<template>
  <div class="leads-page">
    <div class="page-header">
      <div class="header-top">
        <h1 class="page-title">Leads</h1>
        
        <!-- View Toggle -->
        <div class="view-toggle">
          <button
            class="view-button"
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
            title="Table View"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M2 6H14M2 10H14M6 2V14M10 2V14" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button
            class="view-button"
            :class="{ active: viewMode === 'kanban' }"
            @click="viewMode = 'kanban'"
            title="Kanban View"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="4" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="8" y="2" width="4" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <rect x="2" y="2" width="12" height="4" rx="1" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Filters: Search first, then filters, Export on the right -->
      <div class="header-controls">
        <div class="filters-left">
          <!-- Search first -->
          <SearchInput
            v-model="searchQuery"
            placeholder="Search"
            @search="handleSearch"
          />
          
          <!-- Filter Type Toggle (always visible, stable position) -->
          <div class="filter-type-toggle">
            <button
              class="toggle-btn"
              :class="{ active: filterType === 'standard' }"
              @click="filterType = 'standard'"
            >
              Standard filters
            </button>
            <button
              class="toggle-btn"
              :class="{ active: filterType === 'custom' }"
              @click="filterType = 'custom'"
              :disabled="!hasCustomFilters"
            >
              Custom filters
            </button>
          </div>
          
          <!-- Standard Filters (shown when filterType === 'standard') -->
          <template v-if="filterType === 'standard'">
            <LeadsScopeFilter
              v-model="filters.scope"
              :total-count="totalLeads"
              @change="handleScopeChange"
            />
            
            <TagsFilter
              v-model="filters.tag"
              @change="handleTagChange"
            />
            
            <CampaignFilter
              v-model="filters.campaign"
              @change="handleCampaignChange"
            />
            
            <LeadStageFilter
              v-model:selectedStages="selectedStages"
              :stage-stats="stageStats"
              :group-stats="groupStats"
              @change="handleStageFilterChange"
            />
          </template>
          
          <!-- Custom Filters (shown when filterType === 'custom') -->
          <SavedFiltersList
            v-if="filterType === 'custom'"
            ref="savedFiltersListRef"
            :active-filter-id="activeSavedFilter?.id || null"
            @load-filter="handleLoadSavedFilter"
            @custom-filters-count="handleCustomFiltersCount"
            @filter-deleted="handleFilterDeleted"
          />
          
          <!-- Add Filter Button (always visible, on the right) -->
          <button class="add-filter-btn" @click="handleAddFilterClick">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span>Add filter</span>
          </button>
        </div>
      </div>

      <!-- Inline Filter Builder - shown only when creating new filter (not when saved filter is active) -->
      <InlineFilterBuilder
        v-if="inlineFilterConditions.length > 0 && !activeSavedFilter"
        v-model="inlineFilterConditions"
        :available-stages="availableStages"
        :total-leads="totalLeads"
        :filtered-leads="filteredLeads"
        @change="handleInlineFilterChange"
        @filter-saved="handleFilterSaved"
      />

      <!-- Active Saved Filter Display (read-only) -->
      <div v-if="activeSavedFilter && activeSavedFilter.expression" class="active-filter-display">
        <div class="active-filter-conditions">
          <span class="filter-preview-text">{{ getFilterPreview(activeSavedFilter) }}</span>
        </div>
      </div>
    </div>
    
    <div class="page-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="skeleton-loader">
          <div class="skeleton-line" v-for="i in 5" :key="i"></div>
        </div>
      </div>
      
      <!-- Table View -->
      <LeadsTable
        v-else-if="viewMode === 'table'"
        :leads="filteredLeads"
        :loading="loading"
        :selected-ids="selectedLeadIds"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @action="handleAction"
      />
      
      <!-- Kanban View -->
      <LeadsKanban
        v-else-if="viewMode === 'kanban'"
        :leads="filteredLeads"
        @card-menu="handleAction"
        @stage-change="handleStageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import LeadsTable from '@/components/LeadsTable.vue';
import LeadsKanban from '@/components/LeadsKanban.vue';
import LeadsScopeFilter from '@/components/LeadsScopeFilter.vue';
import LeadStageFilter from '@/components/LeadStageFilter.vue';
import TagsFilter from '@/components/TagsFilter.vue';
import SearchInput from '@/components/SearchInput.vue';
import CampaignFilter from '@/components/CampaignFilter.vue';
import InlineFilterBuilder from '@/components/InlineFilterBuilder.vue';
import SavedFiltersList from '@/components/SavedFiltersList.vue';
import { useLeadsStore, stageConfig } from '@/stores/leads';

export default {
  name: 'LeadsPage',
  components: {
    LeadsTable,
    LeadsKanban,
    LeadsScopeFilter,
    LeadStageFilter,
    TagsFilter,
    SearchInput,
    CampaignFilter,
    InlineFilterBuilder,
    SavedFiltersList,
  },
  setup() {
    const router = useRouter();
    const leadsStore = useLeadsStore();
    
    const loading = ref(true);
    const viewMode = ref('table'); // 'table' or 'kanban'
    const searchQuery = ref('');
    const selectedLeadIds = ref(new Set());
    const selectedStages = ref([]);
    const inlineFilterConditions = ref([]);
    const filterType = ref('standard'); // 'standard' or 'custom'
    const hasCustomFilters = ref(false);
    const savedFiltersListRef = ref(null);
    const activeSavedFilter = ref(null); // Currently applied saved filter
    const filters = ref({
      scope: 'all',
      campaign: null,
      tag: null,
    });
    
    const totalLeads = computed(() => {
      // CRITICAL: totalLeads is a computed ref, need to access .value
      const total = leadsStore.totalLeads.value;
      console.log('📊 totalLeads computed:', total);
      return total;
    });
    
    const filteredLeads = computed(() => {
      console.log('📋 filteredLeads in LeadsPage computed - accessing leadsStore.filteredLeads...');
      // CRITICAL: filteredLeads is a computed ref, need to access .value
      const leads = leadsStore.filteredLeads.value;
      console.log('📋 leadsStore.filteredLeads.value:', leads);
      console.log('📋 leadsStore.filteredLeads.value type:', typeof leads);
      console.log('📋 leadsStore.filteredLeads.value isArray:', Array.isArray(leads));
      
      const result = Array.isArray(leads) ? leads : [];
      console.log('📋 filteredLeads in LeadsPage computed result:', {
        type: typeof leads,
        isArray: Array.isArray(leads),
        length: leads?.length || 0,
        resultLength: result.length,
        result: result
      });
      if (result.length > 0) {
        console.log('👤 First filtered lead in page:', result[0].name);
        console.log('👤 Full lead object in page:', result[0]);
      } else {
        console.warn('⚠️ filteredLeads is empty in LeadsPage!');
        console.warn('⚠️ leadsStore.filteredLeads.value:', leads);
        console.warn('⚠️ leadsStore.leads.value:', leadsStore.leads?.value);
      }
      return result;
    });
    const stageStats = computed(() => {
      const stats = leadsStore.stageStats;
      console.log('📊 LeadsPage: stageStats computed - accessing leadsStore.stageStats');
      console.log('📊 LeadsPage: stageStats type:', typeof stats);
      console.log('📊 LeadsPage: stageStats value:', stats);
      console.log('📊 LeadsPage: stageStats is computed ref?', stats?.value !== undefined);
      
      // Если это computed ref, нужно получить .value
      const result = stats?.value !== undefined ? stats.value : stats;
      console.log('📊 LeadsPage: stageStats result:', result);
      
      // Проверяем примеры значений
      if (result && typeof result === 'object') {
        Object.keys(result).forEach(key => {
          console.log(`📊 LeadsPage: ${key} = ${result[key]}`);
        });
      }
      
      return result;
    });
    
    const groupStats = computed(() => {
      const stats = leadsStore.groupStats;
      console.log('📁 LeadsPage: groupStats computed - accessing leadsStore.groupStats');
      console.log('📁 LeadsPage: groupStats type:', typeof stats);
      console.log('📁 LeadsPage: groupStats value:', stats);
      
      // Если это computed ref, нужно получить .value
      const result = stats?.value !== undefined ? stats.value : stats;
      console.log('📁 LeadsPage: groupStats result:', result);
      
      return result;
    });
    
    // Debounced search
    let searchTimeout = null;
    const handleSearch = (query) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        leadsStore.setSearchQuery(query);
      }, 400);
    };
    
    watch(searchQuery, (newVal) => {
      handleSearch(newVal);
    });
    
    const handleScopeChange = (scope) => {
      filters.value.scope = scope;
      leadsStore.setScope(scope);
    };
    
    const handleCampaignChange = (campaignId) => {
      filters.value.campaign = campaignId;
      leadsStore.setCampaignFilter(campaignId);
    };

    const handleTagChange = (tagId) => {
      filters.value.tag = tagId;
      // Tag filtering logic would go here
      console.log('Tag filter changed:', tagId);
    };

    const handleStageFilterChange = (stages) => {
      leadsStore.setStageFilter(stages);
    };

    const handleSelect = (leadId, selected) => {
      if (selected) {
        selectedLeadIds.value.add(leadId);
      } else {
        selectedLeadIds.value.delete(leadId);
      }
    };
    
    const handleSelectAll = (selected) => {
      if (selected) {
        const leads = filteredLeads.value;
        if (Array.isArray(leads)) {
          leads.forEach(lead => {
            selectedLeadIds.value.add(lead.id);
          });
        }
      } else {
        selectedLeadIds.value.clear();
      }
    };
    
    const handleAction = (action, lead) => {
      console.log('Action:', action, lead);
    };
    
    const handleStageChange = ({ leadId, newStage, oldStage }) => {
      console.log('Stage change:', { leadId, newStage, oldStage });
      leadsStore.updateLeadStage(leadId, newStage, `Moved from ${oldStage} to ${newStage} via drag-and-drop`);
    };
    

    const availableStages = computed(() => {
      return Object.entries(stageConfig).map(([id, config]) => ({
        id,
        label: config.label,
      }));
    });

    const handleInlineFilterChange = (expression) => {
      leadsStore.setInlineFilterExpression(expression);
    };

    const handleAddFilterClick = () => {
      // Clear active saved filter if any
      activeSavedFilter.value = null;
      // Add first condition to show the inline filter builder
      if (inlineFilterConditions.value.length === 0) {
        inlineFilterConditions.value.push({
          id: `condition-${Date.now()}-${Math.random()}`,
          field: 'stage',
          operator: 'eq',
          value: undefined,
        });
      }
    };

    const handleCustomFiltersCount = (count) => {
      hasCustomFilters.value = count > 0;
    };

    const handleFilterSaved = (savedFilter) => {
      // Clear inline filter conditions to hide the filter builder UI
      inlineFilterConditions.value = [];
      // Switch to custom filters view
      filterType.value = 'custom';
      // Update hasCustomFilters to enable the toggle
      hasCustomFilters.value = true;
      // Wait for component to mount, then reload and apply filter
      nextTick(() => {
        // Reload saved filters list to show the new one
        if (savedFiltersListRef.value && savedFiltersListRef.value.reloadFilters) {
          savedFiltersListRef.value.reloadFilters();
        }
        // Load and apply the saved filter (this will set activeSavedFilter)
        handleLoadSavedFilter(savedFilter);
      });
    };

    const handleLoadSavedFilter = (filter) => {
      // If filter is null, deactivate current filter
      if (!filter) {
        handleRemoveActiveFilter();
        return;
      }

      if (!filter.expression || !filter.expression.conditions) return;

      // Set active saved filter (read-only mode)
      activeSavedFilter.value = filter;
      // Clear inline filter conditions to hide the builder
      inlineFilterConditions.value = [];

      // Extract conditions and connectors from expression
      const newConditions = [];
      filter.expression.conditions.forEach((item) => {
        if (!item.logic) {
          newConditions.push({ ...item });
        }
      });

      // Apply the filter
      handleInlineFilterChange({
        conditions: newConditions,
        connectors: filter.expression.conditions
          .filter(item => item.logic)
          .map(item => item.logic),
      });
    };

    const handleRemoveActiveFilter = () => {
      // Clear active filter
      activeSavedFilter.value = null;
      // Clear filter conditions
      inlineFilterConditions.value = [];
      // Clear filter expression in store
      leadsStore.setInlineFilterExpression({ conditions: [] });
    };

    const handleFilterDeleted = (filterId) => {
      // If the deleted filter was active, clear it
      if (activeSavedFilter.value && activeSavedFilter.value.id === filterId) {
        handleRemoveActiveFilter();
      }
      // Update hasCustomFilters
      checkCustomFilters();
    };

    const getFilterPreview = (filter) => {
      if (!filter || !filter.expression || !filter.expression.conditions || filter.expression.conditions.length === 0) {
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
              const stage = availableStages.value.find(s => s.id === item.value);
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
    
    const handleExport = (leads) => {
      console.log('Exporting leads:', leads.length);
    };
    
    // Check if there are custom filters on mount
    const checkCustomFilters = () => {
      try {
        const stored = localStorage.getItem('dripify_saved_filters');
        if (stored) {
          const filters = JSON.parse(stored);
          hasCustomFilters.value = filters.length > 0;
        }
      } catch (error) {
        console.error('Error checking custom filters:', error);
      }
    };

    onMounted(async () => {
      console.log('🚀 LeadsPage mounted, starting to load leads...');
      loading.value = true;
      
      // Check for existing custom filters
      checkCustomFilters();
      
      try {
        await leadsStore.fetchLeads();
        console.log('✅ Leads fetched, total:', leadsStore.totalLeads.value);
        console.log('✅ Filtered leads:', leadsStore.filteredLeads.value?.length || 0);
        console.log('✅ First filtered lead:', leadsStore.filteredLeads.value?.[0]?.name || 'NO DATA');
      } catch (error) {
        console.error('❌ Error in LeadsPage onMounted:', error);
      } finally {
        loading.value = false;
        console.log('🏁 Loading completed');
      }
    });
    
    return {
      loading,
      viewMode,
      searchQuery,
      selectedLeadIds,
      selectedStages,
      inlineFilterConditions,
      filterType,
      hasCustomFilters,
      activeSavedFilter,
      availableStages,
      filters,
      totalLeads,
      filteredLeads,
      stageStats,
      groupStats,
      stageConfigMap: stageConfig,
      handleSearch,
      handleScopeChange,
      handleCampaignChange,
      handleTagChange,
      handleStageFilterChange,
      handleSelect,
      handleSelectAll,
      handleAction,
      handleStageChange,
      handleInlineFilterChange,
      handleAddFilterClick,
      handleCustomFiltersCount,
      handleFilterSaved,
      handleLoadSavedFilter,
      handleRemoveActiveFilter,
      getFilterPreview,
      getFieldLabel,
      getOperatorLabel,
    };
  },
};
</script>

<style scoped>
.leads-page {
  padding: 24px 32px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-title {
  font-family: 'THICCCBOI', sans-serif;
  font-weight: 600;
  font-size: 22px;
  color: var(--color-text);
  margin: 0;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 4px;
}

.view-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.view-button:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.view-button.active {
  background-color: var(--color-primary);
  color: white;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
  position: relative;
}

.filter-type-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 2px;
  flex-shrink: 0;
}

.toggle-btn {
  padding: 6px 12px;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.toggle-btn:hover:not(:disabled) {
  color: var(--color-text);
}

.toggle-btn.active {
  background-color: var(--color-bg);
  color: var(--color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.active-filter-display {
  margin-top: 12px;
  padding: 10px 14px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.active-filter-conditions {
  display: flex;
  align-items: center;
}

.filter-preview-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.add-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
  margin-left: auto;
}

.add-filter-btn:hover {
  background-color: var(--color-primary-dark, #7C3AED);
}

.page-content {
  background-color: var(--color-bg);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  min-height: 400px;
}

.loading-container {
  padding: 40px;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

@media (max-width: 1400px) {
  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>



