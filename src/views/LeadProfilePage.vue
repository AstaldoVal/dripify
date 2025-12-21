<template>
  <div class="lead-profile-page">
    <div v-if="loading" class="loading-state">
      <div class="skeleton-loader">
        <div class="skeleton-header"></div>
        <div class="skeleton-content"></div>
      </div>
    </div>
    
    <div v-else-if="lead" class="lead-profile">
      <div class="profile-header">
        <button class="back-button" @click="goBack">
          <ArrowLeftIcon />
          <span>Back to Leads</span>
        </button>
        
        <div class="profile-main">
          <div class="profile-avatar">
            <img v-if="lead.avatar" :src="lead.avatar" :alt="lead.name" />
            <div v-else class="avatar-placeholder">{{ getInitials(lead.name) }}</div>
          </div>
          
          <div class="profile-info">
            <h1 class="profile-name">{{ lead.name }}</h1>
            <p class="profile-headline">{{ lead.headline }}</p>
            <p class="profile-location">{{ lead.location }}</p>
          </div>
          
          <div class="profile-actions">
            <a
              v-if="lead.linkedinUrl"
              :href="lead.linkedinUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="action-button linkedin-button"
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </a>
            <button class="action-button inbox-button">
              <InboxIcon />
              <span>Dripify Inbox</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="profile-content">
        <!-- Lead Stage Section - Prominently displayed -->
        <div class="content-section stage-section">
          <div class="section-header-row">
            <h2 class="section-title">Lead Stage</h2>
            <LeadStageBadge
              :stage="lead.leadStage"
              :source="lead.leadStageSource"
              :show-source="true"
              :show-icon="true"
              :clickable="false"
              size="md"
            />
          </div>
          
          <div class="stage-details">
            <div class="stage-meta">
              <div class="meta-item">
                <span class="meta-label">Source:</span>
                <span class="meta-value" :class="lead.leadStageSource?.toLowerCase()">
                  <AIIcon v-if="lead.leadStageSource === 'AI'" class="source-icon" />
                  <ManualIcon v-else class="source-icon" />
                  {{ lead.leadStageSource === 'AI' ? 'AI Assigned' : 'Manually Set' }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Updated:</span>
                <span class="meta-value">{{ formatDate(lead.leadStageUpdatedAt) }}</span>
              </div>
            </div>
            
            <!-- AI Explanation -->
            <div v-if="lead.leadStageReason && lead.leadStageSource === 'AI'" class="ai-explanation">
              <div class="ai-badge">
                <AIIcon class="ai-icon" />
                <span>AI Insight</span>
              </div>
              <p class="ai-reason">{{ lead.leadStageReason }}</p>
            </div>
            
            <!-- Stage Selector -->
            <div class="stage-selector">
              <label class="selector-label">Change Stage:</label>
              <select
                v-model="selectedStage"
                class="stage-select"
                @change="handleStageChange"
              >
                <option
                  v-for="stage in availableStages"
                  :key="stage.value"
                  :value="stage.value"
                >
                  {{ stage.label }}
                </option>
              </select>
            </div>
            
            <!-- Stage History -->
            <div v-if="lead.stageHistory && lead.stageHistory.length > 0" class="stage-history">
              <button class="history-toggle" @click="showHistory = !showHistory">
                <span>Stage History</span>
                <ChevronIcon :class="{ open: showHistory }" />
              </button>
              <div v-if="showHistory" class="history-list">
                <div
                  v-for="(entry, index) in lead.stageHistory"
                  :key="index"
                  class="history-entry"
                >
                  <div class="history-dot"></div>
                  <div class="history-content">
                    <span class="history-stage">{{ getStageLabel(entry.stage) }}</span>
                    <span class="history-source">{{ entry.source === 'AI' ? 'AI' : 'Manual' }}</span>
                    <span class="history-time">{{ formatDate(entry.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <h2 class="section-title">Contact Information</h2>
          <div class="emails-section">
            <div
              v-for="(email, index) in lead.emails"
              :key="index"
              class="email-item"
            >
              <span class="email-value">{{ email }}</span>
              <button class="copy-button" @click="copyEmail(email)">
                <CopyIcon />
              </button>
            </div>
            <button
              v-if="lead.emailStatus === 'find' || !lead.emails || lead.emails.length === 0"
              class="find-email-button"
              @click="handleFindEmail"
            >
              <SearchIcon />
              <span>Find email</span>
            </button>
            <p v-if="lead.emailStatus === 'not_found'" class="email-not-found">
              Email not found
            </p>
          </div>
        </div>
        
        <div class="content-section">
          <h2 class="section-title">Campaigns</h2>
          <div class="campaigns-list">
            <div
              v-for="campaign in leadCampaigns"
              :key="campaign.id"
              class="campaign-item"
            >
              <span class="campaign-name">{{ campaign.name }}</span>
              <span class="campaign-status" :class="campaign.status">
                {{ campaign.status }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <h2 class="section-title">Engagement Signals</h2>
          <div class="signals-list">
            <div class="signal-item">
              <span class="signal-label">Messages Sent</span>
              <span class="signal-value">{{ lead.messagesSent || 0 }}</span>
            </div>
            <div class="signal-item">
              <span class="signal-label">Replies Received</span>
              <span class="signal-value">{{ lead.repliesReceived || 0 }}</span>
            </div>
            <div class="signal-item">
              <span class="signal-label">Follow-ups</span>
              <span class="signal-value">{{ lead.followUpCount || 0 }}</span>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <h2 class="section-title">Notes</h2>
          <textarea
            v-model="notes"
            class="notes-textarea"
            placeholder="Add notes about this lead..."
            rows="6"
          ></textarea>
          <button class="save-button" @click="saveNotes">Save Notes</button>
        </div>
        
        <div class="content-section">
          <h2 class="section-title">Actions</h2>
          <div class="actions-list">
            <button class="action-item-button" @click="handleBlacklist">
              <span>Blacklist</span>
            </button>
            <button class="action-item-button" @click="handleWhitelist">
              <span>Whitelist</span>
            </button>
            <button class="action-item-button danger" @click="handleDelete">
              <span>Delete Lead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <p>Lead not found</p>
      <button class="back-button" @click="goBack">Back to Leads</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeadsStore, LeadStage, stageConfig } from '@/stores/leads';
import LeadStageBadge from '@/components/LeadStageBadge.vue';

export default {
  name: 'LeadProfilePage',
  components: {
    LeadStageBadge,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const leadsStore = useLeadsStore();
    
    const loading = ref(true);
    const lead = ref(null);
    const notes = ref('');
    const selectedStage = ref('');
    const showHistory = ref(false);
    
    const availableStages = computed(() => {
      return Object.entries(stageConfig).map(([value, config]) => ({
        value,
        label: config.label,
      }));
    });

    const leadCampaigns = computed(() => {
      if (!lead.value) return [];
      return [
        {
          id: 1,
          name: lead.value.campaignName || 'Unknown Campaign',
          status: 'active',
        },
      ];
    });

    watch(() => lead.value, (newLead) => {
      if (newLead) {
        selectedStage.value = newLead.leadStage;
      }
    });
    
    const getInitials = (name) => {
      if (!name) return '?';
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    };

    const getStageLabel = (stage) => {
      return stageConfig[stage]?.label || stage;
    };

    const formatDate = (date) => {
      if (!date) return '—';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };
    
    const copyEmail = async (email) => {
      try {
        await navigator.clipboard.writeText(email);
        console.log('Email copied:', email);
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    };
    
    const handleFindEmail = () => {
      console.log('Find email for lead:', lead.value.id);
    };

    const handleStageChange = () => {
      if (selectedStage.value && selectedStage.value !== lead.value.leadStage) {
        leadsStore.updateLeadStage(lead.value.id, selectedStage.value);
        lead.value = leadsStore.getLeadById(lead.value.id);
      }
    };
    
    const saveNotes = () => {
      console.log('Saving notes:', notes.value);
    };
    
    const handleBlacklist = () => {
      if (confirm('Are you sure you want to blacklist this lead?')) {
        leadsStore.updateLeadStage(lead.value.id, LeadStage.EXCLUDED, 'Manually blacklisted');
        lead.value = leadsStore.getLeadById(lead.value.id);
      }
    };
    
    const handleWhitelist = () => {
      console.log('Whitelisting lead:', lead.value.id);
    };
    
    const handleDelete = () => {
      if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
        console.log('Deleting lead:', lead.value.id);
        router.push('/leads');
      }
    };
    
    const goBack = () => {
      router.push('/leads');
    };
    
    onMounted(async () => {
      const leadId = parseInt(route.params.leadId);
      loading.value = true;
      
      if (leadsStore.leads.value?.length === 0) {
        await leadsStore.fetchLeads();
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      lead.value = leadsStore.getLeadById(leadId);
      if (lead.value) {
        selectedStage.value = lead.value.leadStage;
      }
      loading.value = false;
    });
    
    return {
      loading,
      lead,
      notes,
      selectedStage,
      showHistory,
      availableStages,
      leadCampaigns,
      getInitials,
      getStageLabel,
      formatDate,
      copyEmail,
      handleFindEmail,
      handleStageChange,
      saveNotes,
      handleBlacklist,
      handleWhitelist,
      handleDelete,
      goBack,
    };
  },
  components: {
    LeadStageBadge: LeadStageBadge,
    ArrowLeftIcon: {
      template: `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
    },
    LinkedInIcon: {
      template: `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14.5 0h-13C.67 0 0 .67 0 1.5v13c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-13c0-.83-.67-1.5-1.5-1.5zM5.33 13H2.67V6h2.66v7zM4 4.67c-.85 0-1.54-.69-1.54-1.54S3.15 1.59 4 1.59s1.54.69 1.54 1.54S4.85 4.67 4 4.67zm9.33 8.33H10.67V9.67c0-.95-.02-2.17-1.33-2.17-1.33 0-1.53 1.04-1.53 2.1V13H5.33V6h2.48v1.02h.03c.35-.66 1.2-1.36 2.47-1.36 2.64 0 3.13 1.74 3.13 4V13z"/>
        </svg>
      `,
    },
    InboxIcon: {
      template: `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <path d="M2 5L8 9L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
    },
    CopyIcon: {
      template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.2"/>
          <path d="M4 6C4 4.89543 4.89543 4 6 4H8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      `,
    },
    SearchIcon: {
      template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.2"/>
          <path d="M9 9L12 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      `,
    },
    AIIcon: {
      template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L8.5 5H12.5L9.25 7.5L10.5 12L7 9.5L3.5 12L4.75 7.5L1.5 5H5.5L7 1Z" fill="currentColor"/>
        </svg>
      `,
    },
    ManualIcon: {
      template: `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 11L9 5L11 7L5 13H3V11Z" stroke="currentColor" stroke-width="1.2"/>
          <path d="M9 5L10 4L12 6L11 7L9 5Z" fill="currentColor"/>
        </svg>
      `,
    },
    ChevronIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="chevron-icon">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
    },
  },
};
</script>

<style scoped>
.lead-profile-page {
  padding: 24px 32px;
  min-height: 100vh;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
  transition: color var(--transition-base);
}

.back-button:hover {
  color: var(--color-text);
}

.profile-header {
  margin-bottom: 32px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 600;
  font-size: 32px;
  color: var(--color-text);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-weight: 600;
  font-size: 28px;
  color: var(--color-text);
  margin-bottom: 8px;
}

.profile-headline {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.profile-location {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.action-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.linkedin-button {
  background-color: #0077B5;
  color: white;
  border-color: #0077B5;
}

.linkedin-button:hover {
  background-color: #006399;
  border-color: #006399;
  color: white;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.content-section {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}

.stage-section {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
  border: 2px solid var(--color-primary-light);
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  font-size: 18px;
  color: var(--color-text);
  margin: 0;
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.meta-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-value.ai {
  color: var(--color-primary);
}

.source-icon {
  width: 14px;
  height: 14px;
}

.ai-explanation {
  background-color: var(--color-primary-light);
  border-radius: 8px;
  padding: 16px;
  border-left: 3px solid var(--color-primary);
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.ai-icon {
  width: 14px;
  height: 14px;
}

.ai-reason {
  font-size: 14px;
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.stage-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selector-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.stage-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  min-width: 180px;
}

.stage-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.stage-history {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.history-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-base);
}

.history-toggle:hover {
  color: var(--color-text);
}

.history-toggle .chevron-icon {
  transition: transform 0.2s ease;
}

.history-toggle .chevron-icon.open {
  transform: rotate(180deg);
}

.history-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-entry {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-left: 4px;
}

.history-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-text-tertiary);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.history-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.history-stage {
  font-weight: 500;
  color: var(--color-text);
}

.history-source {
  color: var(--color-text-tertiary);
  font-size: 11px;
  padding: 2px 6px;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
}

.history-time {
  color: var(--color-text-tertiary);
}

.signals-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.signal-item {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
}

.signal-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.signal-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
}

.emails-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.email-value {
  font-family: monospace;
  font-size: 14px;
  color: var(--color-text);
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  transition: color var(--transition-base);
}

.copy-button:hover {
  color: var(--color-text);
}

.find-email-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: none;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.find-email-button:hover {
  background-color: var(--color-primary-light);
}

.email-not-found {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.campaign-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.campaign-name {
  font-weight: 500;
  color: var(--color-text);
}

.campaign-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.campaign-status.active {
  background-color: var(--color-success);
  color: white;
}

.notes-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;
}

.notes-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.save-button {
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.save-button:hover {
  background-color: var(--color-primary-hover);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item-button {
  padding: 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-base);
}

.action-item-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-item-button.danger {
  color: var(--color-error);
}

.action-item-button.danger:hover {
  border-color: var(--color-error);
  background-color: var(--color-error-light);
}

.loading-state,
.not-found {
  padding: 40px;
  text-align: center;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-header,
.skeleton-content {
  height: 200px;
  background: linear-gradient(
    90deg,
    var(--color-bg-tertiary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 8px;
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
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .signals-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

