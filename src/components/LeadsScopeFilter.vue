<template>
  <div class="scope-filter">
    <div class="filter-dropdown" v-click-outside="closeDropdown">
      <button class="filter-trigger" @click="toggleDropdown">
        <span class="trigger-text">All leads ({{ totalCount }})</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="trigger-chevron" :class="{ 'is-open': showDropdown }">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div v-if="showDropdown" class="filter-dropdown-menu">
        <!-- Tabs -->
        <div class="filter-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="filter-tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="filter-tab-content">
          <!-- General Tab -->
          <div v-if="activeTab === 'general'" class="status-list">
            <div
              v-for="status in generalStatuses"
              :key="status.id"
              class="status-item"
              :class="{ active: selectedStatus === status.id }"
              @click="selectStatus(status.id)"
            >
              <span class="status-icon" v-html="getStatusIconSvg(status.icon)"></span>
              <span class="status-label">{{ status.label }}</span>
              <span v-if="status.count !== undefined" class="status-count">{{ status.count }}</span>
            </div>
          </div>

          <!-- Failed Tab -->
          <div v-if="activeTab === 'failed'" class="status-list">
            <div class="empty-state">
              <p>No failed leads</p>
              <span class="empty-hint">Leads that failed to connect will appear here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LeadsScopeFilter',
  props: {
    modelValue: {
      type: String,
      default: 'all',
    },
    totalCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const showDropdown = ref(false);
    const activeTab = ref('general');
    const selectedStatus = ref('all');
    const customFilters = ref([]);

    const tabs = [
      { id: 'general', label: 'General' },
      { id: 'failed', label: 'Failed' },
    ];

    const generalStatuses = ref([
      { id: 'all', label: 'All leads', icon: 'all', count: props.totalCount },
      { id: 'getting_ready', label: 'Getting ready', icon: 'gettingReady' },
      { id: 'invite_sent', label: 'Invite sent', icon: 'inviteSent' },
      { id: 'accepted_invite', label: 'Accepted invite', icon: 'acceptedInvite' },
      { id: 'pending_invite', label: 'Pending invite', icon: 'pendingInvite' },
      { id: 'email_sent', label: 'Email sent', icon: 'emailSent' },
      { id: 'messaged', label: 'Messaged', icon: 'messaged' },
      { id: 'message_viewed', label: 'Message viewed', icon: 'messageViewed' },
      { id: 'replied', label: 'Replied', icon: 'replied' },
      { id: 'endorsed', label: 'Endorsed', icon: 'endorsed' },
      { id: 'profile_viewed', label: 'Profile viewed', icon: 'profileViewed' },
      { id: 'followed', label: 'Followed', icon: 'followed' },
      { id: 'liked', label: 'Liked', icon: 'liked' },
      { id: 'email_available', label: 'Email available', icon: 'emailAvailable' },
      { id: 'invite_withdrawn', label: 'Invite withdrawn', icon: 'inviteWithdrawn' },
      { id: 'inmail_sent', label: 'InMail sent', icon: 'inmailSent' },
    ]);

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const closeDropdown = () => {
      showDropdown.value = false;
    };

    const selectStatus = (statusId) => {
      selectedStatus.value = statusId;
      emit('update:modelValue', statusId);
      emit('change', statusId);
      closeDropdown();
    };


    // Get status icon SVG
    const getStatusIconSvg = (iconName) => {
      const icons = {
        all: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M5 8H11M8 5V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        gettingReady: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 4V8L10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        inviteSent: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4L8 8L14 4M2 4L8 8M2 4V12L8 8M14 4V12L8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        acceptedInvite: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 3L6 10L3 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        pendingInvite: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5V8M8 11H8.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        emailSent: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M2 5L8 9L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        messaged: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4V10C14 10.5523 13.5523 11 13 11H5L2 14V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        messageViewed: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4V10C14 10.5523 13.5523 11 13 11H5L2 14V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7L7 9L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        replied: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4L8 8L14 4M2 4L8 8M2 4V12L8 8M14 4V12L8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10L2 14L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        endorsed: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L10 6L14 7L11 10L11.5 14L8 12L4.5 14L5 10L2 7L6 6L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        profileViewed: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 14C3 11.2386 5.23858 9 8 9C10.7614 9 13 11.2386 13 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        followed: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L10 6L14 7L11 10L11.5 14L8 12L4.5 14L5 10L2 7L6 6L8 2Z" fill="currentColor"/></svg>',
        liked: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2.5C6.5 1 3.5 1 3.5 4.5C3.5 8 8 13.5 8 13.5C8 13.5 12.5 8 12.5 4.5C12.5 1 9.5 1 8 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        emailAvailable: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M2 5L8 9L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="4" r="1.5" fill="currentColor"/></svg>',
        inviteWithdrawn: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4L8 8L14 4M2 4L8 8M2 4V12L8 8M14 4V12L8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 2L12 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
        inmailSent: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M2 5L8 9L14 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 4L14 2L12 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      };
      return icons[iconName] || icons.all;
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

    return {
      showDropdown,
      activeTab,
      selectedStatus,
      customFilters,
      tabs,
      generalStatuses,
      toggleDropdown,
      closeDropdown,
      selectStatus,
      getStatusIconSvg,
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
.scope-filter {
  position: relative;
}

.filter-dropdown {
  position: relative;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 32px 8px 12px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  min-width: 150px;
}

.filter-trigger:hover {
  border-color: var(--color-primary);
}

.trigger-chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  transition: transform 0.15s ease;
}

.trigger-chevron.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.filter-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  min-width: 320px;
  max-width: 400px;
  overflow: hidden;
}

.filter-tabs {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding: 0 12px;
  gap: 4px;
}

.filter-tab {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  margin-bottom: -1px;
}

.filter-tab:hover {
  color: var(--color-text);
}

.filter-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.filter-tab-content {
  max-height: 400px;
  overflow-y: auto;
}

.status-list {
  padding: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--color-text);
}

.status-item:hover {
  background-color: var(--color-bg-secondary);
}

.status-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.status-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: currentColor;
}

.status-label {
  flex: 1;
  font-size: 13px;
}

.status-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.status-item.active .status-count {
  color: var(--color-primary);
}

.empty-state {
  padding: 32px 24px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state p {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.empty-hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
</style>
