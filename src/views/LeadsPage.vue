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
      
      <!-- Stage Summary Bar -->
      <div class="stage-summary">
        <div
          v-for="(config, stage) in stageConfigMap"
          :key="stage"
          class="stage-summary-item"
          :class="{ active: selectedStages.includes(stage) }"
          @click="handleStageClick(stage)"
        >
          <span class="stage-count" :style="{ color: config.color }">
            {{ getStageCount(stage) }}
          </span>
          <span class="stage-name">{{ config.label }}</span>
        </div>
      </div>
      
      <!-- Inline Filter Builder -->
      <InlineFilterBuilder
        v-model="inlineFilterConditions"
        :available-stages="availableStages"
        :total-leads="totalLeads"
        :filtered-leads="filteredLeads"
        @change="handleInlineFilterChange"
      />

      <!-- Filters in correct order: All Leads, Search, All Tags, All Campaigns, All Stages -->
      <div class="header-controls">
        <LeadsScopeFilter
          v-model="filters.scope"
          :total-count="totalLeads"
          @change="handleScopeChange"
        />
        
        <SearchInput
          v-model="searchQuery"
          placeholder="Search"
          @search="handleSearch"
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
        
        <ExportButton
          :disabled="filteredLeads.length === 0"
          :leads="filteredLeads"
          @export="handleExport"
        />
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
        @row-click="handleRowClick"
        @action="handleAction"
        @stage-click="handleStageClick"
      />
      
      <!-- Kanban View -->
      <LeadsKanban
        v-else-if="viewMode === 'kanban'"
        :leads="filteredLeads"
        @card-click="handleRowClick"
        @card-menu="handleAction"
        @stage-change="handleStageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LeadsTable from '@/components/LeadsTable.vue';
import LeadsKanban from '@/components/LeadsKanban.vue';
import LeadsScopeFilter from '@/components/LeadsScopeFilter.vue';
import LeadStageFilter from '@/components/LeadStageFilter.vue';
import TagsFilter from '@/components/TagsFilter.vue';
import SearchInput from '@/components/SearchInput.vue';
import CampaignFilter from '@/components/CampaignFilter.vue';
import ExportButton from '@/components/ExportButton.vue';
import InlineFilterBuilder from '@/components/InlineFilterBuilder.vue';
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
    ExportButton,
    InlineFilterBuilder,
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

    const handleStageClick = (stage) => {
      const current = [...selectedStages.value];
      const index = current.indexOf(stage);
      
      if (index === -1) {
        selectedStages.value = [stage];
      } else {
        selectedStages.value = [];
      }
      
      leadsStore.setStageFilter(selectedStages.value);
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
    
    const handleRowClick = (lead) => {
      router.push(`/leads/${lead.id}`);
    };
    
    const handleAction = (action, lead) => {
      console.log('Action:', action, lead);
    };
    
    const handleStageChange = ({ leadId, newStage, oldStage }) => {
      console.log('Stage change:', { leadId, newStage, oldStage });
      leadsStore.updateLeadStage(leadId, newStage, `Moved from ${oldStage} to ${newStage} via drag-and-drop`);
    };
    
    const getStageCount = (stage) => {
      const count = stageStats.value?.[stage] || 0;
      console.log(`🔢 getStageCount(${stage}):`, count, 'from stageStats.value:', stageStats.value);
      return count;
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
    
    const handleExport = (leads) => {
      console.log('Exporting leads:', leads.length);
    };
    
    onMounted(async () => {
      console.log('🚀 LeadsPage mounted, starting to load leads...');
      loading.value = true;
      
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
      handleStageClick,
      handleSelect,
      handleSelectAll,
      handleRowClick,
      handleAction,
      handleStageChange,
      getStageCount,
      handleInlineFilterChange,
      handleExport,
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

.stage-summary {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stage-summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 90px;
}

.stage-summary-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stage-summary-item.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.stage-count {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stage-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
