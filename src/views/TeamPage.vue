<template>
  <div class="team-page">
    <!-- Top Bar -->
    <div class="team-top-bar">
      <div class="top-bar-left">
        <div class="team-name-section">
          <h1 class="team-name">You're in US growth team</h1>
          <button class="edit-team-name-btn" title="Edit team name">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 2L12 5.5M10.5 1L13 3.5L9.5 7L7 4.5L10.5 1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L4.5 9.5L7 12L4.5 14.5L2 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="top-bar-right">
        <button class="invite-members-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Invite members</span>
        </button>
        <button class="team-menu-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Tabs, Search, and Quick Filters -->
    <div class="team-controls">
      <div class="controls-left">
        <div class="team-tabs">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'members' }"
            @click="activeTab = 'members'"
          >
            Team members
            <span class="tab-badge">8</span>
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'invitations' }"
            @click="activeTab = 'invitations'"
          >
            Invitations
            <span class="tab-badge">1</span>
          </button>
        </div>
      </div>

      <div class="team-search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="search-icon">
          <circle cx="7" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 10L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="search-input"
        />
      </div>
    </div>

    <!-- Metrics Period and Legend (compact) -->
    <div class="metrics-info-bar">
      <div class="period-selector">
        <span class="period-label">Metrics:</span>
        <div class="period-buttons">
          <button
            v-for="period in metricsPeriods"
            :key="period.value"
            class="period-btn"
            :class="{ active: metricsPeriod === period.value }"
            @click="metricsPeriod = period.value"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-icon orange">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 4V7M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="legend-text">Warning</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon red">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
              <path d="M7 4V7M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <span class="legend-text">Critical</span>
        </div>
      </div>
    </div>

    <!-- Team Members Table -->
    <div class="team-table-container">
      <table class="team-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input type="checkbox" class="table-checkbox" />
            </th>
            <th class="user-col">User</th>
            <th 
              class="campaigns-col sortable"
              :class="{ 'sort-asc': sortColumn === 'campaigns' && sortDirection === 'asc', 'sort-desc': sortColumn === 'campaigns' && sortDirection === 'desc' }"
              @click="handleSort('campaigns')"
            >
              <div class="sortable-header">
                <span>Active campaigns</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="sort-icon">
                  <path d="M3 4.5L6 1.5L9 4.5M3 7.5L6 10.5L9 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </th>
            <th 
              class="messages-col sortable"
              :class="{ 'sort-asc': sortColumn === 'messages' && sortDirection === 'asc', 'sort-desc': sortColumn === 'messages' && sortDirection === 'desc' }"
              @click="handleSort('messages')"
            >
              <div class="sortable-header">
                <span>Unread messages</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="sort-icon">
                  <path d="M3 4.5L6 1.5L9 4.5M3 7.5L6 10.5L9 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </th>
            <th class="linkedin-col">
              <div class="linkedin-header">
                <span>LinkedIn</span>
                <div class="linkedin-subheaders">
                  <span 
                    class="sortable-subheader"
                    :class="{ 'sort-asc': sortColumn === 'acceptance' && sortDirection === 'asc', 'sort-desc': sortColumn === 'acceptance' && sortDirection === 'desc' }"
                    @click.stop="handleSort('acceptance')"
                  >
                    Acceptance rate
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="sort-icon-small">
                      <path d="M2.5 3.75L5 1.25L7.5 3.75M2.5 6.25L5 8.75L7.5 6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span 
                    class="sortable-subheader"
                    :class="{ 'sort-asc': sortColumn === 'response' && sortDirection === 'asc', 'sort-desc': sortColumn === 'response' && sortDirection === 'desc' }"
                    @click.stop="handleSort('response')"
                  >
                    Response rate
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" class="sort-icon-small">
                      <path d="M2.5 3.75L5 1.25L7.5 3.75M2.5 6.25L5 8.75L7.5 6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </th>
            <th class="last-active-col">
              <div class="sortable-header"
                :class="{ 'sort-asc': sortColumn === 'lastActive' && sortDirection === 'asc', 'sort-desc': sortColumn === 'lastActive' && sortDirection === 'desc' }"
                @click="handleSort('lastActive')"
              >
                <span>Last active</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="sort-icon">
                  <path d="M3 4.5L6 1.5L9 4.5M3 7.5L6 10.5L9 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </th>
            <th class="plan-status-col">
              <div class="plan-status-header">
                <span>Plan & Status</span>
                <div class="plan-status-subheaders">
                  <span>Plan</span>
                  <span>Status</span>
                </div>
              </div>
            </th>
            <th class="actions-col">
              <button class="column-menu-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="member in sortedAndFilteredMembers"
            :key="member.id"
            class="team-member-row"
          >
            <td class="checkbox-col">
              <input type="checkbox" class="table-checkbox" />
            </td>
            <td class="user-col">
              <div class="user-cell">
                <div class="user-avatar-wrapper">
                  <img :src="member.avatar" :alt="member.name" class="user-avatar" />
                  <span v-if="member.isOnline" class="online-indicator"></span>
                </div>
                <div class="user-info">
                  <div class="user-name-row">
                    <span class="user-name">{{ member.name }}</span>
                    <span v-if="member.isYou" class="you-badge">(You)</span>
                  </div>
                  <div class="user-meta">
                    <span class="user-role">{{ member.role }}</span>
                  </div>
                </div>
              </div>
            </td>
            <td class="campaigns-col">
              <div class="campaigns-cell">
                <span class="campaigns-count">{{ member.activeCampaigns }}</span>
                <span 
                  v-if="member.campaignWarning === 'orange'" 
                  class="campaign-warning orange"
                  :title="'Warning: Campaign needs attention'"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M7 4V7M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </span>
                <span 
                  v-if="member.campaignWarning === 'red'" 
                  class="campaign-warning red"
                  :title="'Critical: Campaign has errors'"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M7 4V7M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </span>
              </div>
            </td>
            <td class="messages-col">
              <span class="messages-count">{{ member.unreadMessages }}</span>
            </td>
            <td class="linkedin-col">
              <div class="linkedin-metrics">
                <div class="metric-item" :title="getMetricTooltip(member, 'acceptance')">
                  <span class="metric-value">{{ member.linkedinAcceptance }}%</span>
                  <span class="metric-denominator">({{ member.acceptanceSent }}/{{ member.acceptanceTotal }})</span>
                </div>
                <div class="metric-item" :title="getMetricTooltip(member, 'response')">
                  <span class="metric-value">{{ member.linkedinResponse }}%</span>
                  <span class="metric-denominator">({{ member.responseSent }}/{{ member.responseTotal }})</span>
                </div>
              </div>
            </td>
            <td class="last-active-col">
              <span class="last-active-text">{{ formatLastActive(member.lastActive) }}</span>
            </td>
            <td class="plan-status-col">
              <div class="plan-status-cell">
                <span class="plan-name">{{ member.plan }}</span>
                <span class="status-badge" :class="member.statusClass">{{ member.status }}</span>
              </div>
            </td>
            <td class="actions-col">
              <button class="member-menu-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'TeamPage',
  setup() {
    const activeTab = ref('members');
    const searchQuery = ref('');
    const metricsPeriod = ref(30); // 7, 30, 90 days
    const sortColumn = ref(null); // 'campaigns', 'messages', 'acceptance', 'response', 'lastActive'
    const sortDirection = ref('asc'); // 'asc', 'desc'

    const metricsPeriods = [
      { label: '7 days', value: 7 },
      { label: '30 days', value: 30 },
      { label: '90 days', value: 90 },
    ];

    const teamMembers = [
      {
        id: 1,
        name: 'Kayla D.',
        isYou: true,
        role: 'Owner',
        avatar: 'https://i.pravatar.cc/40?img=47',
        isOnline: true,
        lastActive: null,
        lastActiveTimestamp: Date.now(),
        activeCampaigns: 3,
        campaignWarning: null,
        unreadMessages: 10,
        linkedinAcceptance: 94,
        linkedinResponse: 1.9,
        acceptanceSent: 23,
        acceptanceTotal: 220,
        responseSent: 5,
        responseTotal: 260,
        plan: 'Advanced',
        status: 'Active',
        statusClass: 'active',
      },
      {
        id: 2,
        name: 'Arthur Olsen',
        isYou: false,
        role: 'Manager',
        avatar: 'https://i.pravatar.cc/40?img=12',
        isOnline: false,
        lastActive: '5 hours ago',
        lastActiveTimestamp: Date.now() - 5 * 60 * 60 * 1000,
        activeCampaigns: 2,
        campaignWarning: null,
        unreadMessages: 3,
        linkedinAcceptance: 18.4,
        linkedinResponse: 0.5,
        acceptanceSent: 12,
        acceptanceTotal: 65,
        responseSent: 2,
        responseTotal: 380,
        plan: 'Advanced',
        status: 'Active',
        statusClass: 'active',
      },
      {
        id: 3,
        name: 'Martin Foster',
        isYou: false,
        role: 'User',
        avatar: 'https://i.pravatar.cc/40?img=33',
        isOnline: false,
        lastActive: '3 hours ago',
        lastActiveTimestamp: Date.now() - 3 * 60 * 60 * 1000,
        activeCampaigns: 2,
        campaignWarning: 'orange',
        unreadMessages: 17,
        linkedinAcceptance: 16.1,
        linkedinResponse: 2.7,
        acceptanceSent: 8,
        acceptanceTotal: 50,
        responseSent: 3,
        responseTotal: 110,
        plan: 'Advanced',
        status: 'Active',
        statusClass: 'active',
      },
      {
        id: 4,
        name: 'Rachel Page',
        isYou: false,
        role: 'User',
        avatar: 'https://i.pravatar.cc/40?img=45',
        isOnline: false,
        lastActive: '6 hours ago',
        lastActiveTimestamp: Date.now() - 6 * 60 * 60 * 1000,
        activeCampaigns: 2,
        campaignWarning: 'red',
        unreadMessages: 0,
        linkedinAcceptance: 0,
        linkedinResponse: 0,
        acceptanceSent: 0,
        acceptanceTotal: 15,
        responseSent: 0,
        responseTotal: 20,
        plan: 'Advanced',
        status: 'Active',
        statusClass: 'active',
      },
      {
        id: 5,
        name: 'Emma Brown',
        isYou: false,
        role: 'Manager',
        avatar: 'https://i.pravatar.cc/40?img=20',
        isOnline: false,
        lastActive: '4 hours ago',
        lastActiveTimestamp: Date.now() - 4 * 60 * 60 * 1000,
        activeCampaigns: 3,
        campaignWarning: null,
        unreadMessages: 3,
        linkedinAcceptance: 33.3,
        linkedinResponse: 33.3,
        acceptanceSent: 3,
        acceptanceTotal: 9,
        responseSent: 2,
        responseTotal: 6,
        plan: 'Advanced',
        status: 'Free trial',
        statusClass: 'trial',
      },
    ];

    // Filter members by search and quick filters
    const filteredMembers = computed(() => {
      let members = [...teamMembers];

      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        members = members.filter(member =>
          member.name.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query)
        );
      }

      return members;
    });

    // Sort members
    const sortedAndFilteredMembers = computed(() => {
      const members = [...filteredMembers.value];

      if (!sortColumn.value) {
        return members;
      }

      return members.sort((a, b) => {
        let aVal, bVal;

        switch (sortColumn.value) {
          case 'campaigns':
            aVal = a.activeCampaigns;
            bVal = b.activeCampaigns;
            break;
          case 'messages':
            aVal = a.unreadMessages;
            bVal = b.unreadMessages;
            break;
          case 'acceptance':
            aVal = a.linkedinAcceptance;
            bVal = b.linkedinAcceptance;
            break;
          case 'response':
            aVal = a.linkedinResponse;
            bVal = b.linkedinResponse;
            break;
          case 'lastActive':
            aVal = a.lastActiveTimestamp || 0;
            bVal = b.lastActiveTimestamp || 0;
            // For last active, we want most recent first (desc by default)
            if (sortDirection.value === 'asc') {
              return bVal - aVal;
            } else {
              return aVal - bVal;
            }
          default:
            return 0;
        }

        if (sortColumn.value === 'lastActive') {
          return sortDirection.value === 'asc' ? bVal - aVal : aVal - bVal;
        }

        if (sortDirection.value === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    });

    const handleSort = (column) => {
      if (sortColumn.value === column) {
        // Toggle direction
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
      }
    };

    const formatLastActive = (lastActive) => {
      if (!lastActive) return 'Now';
      return lastActive;
    };

    const getMetricTooltip = (member, type) => {
      if (type === 'acceptance') {
        return `${member.linkedinAcceptance}% acceptance rate (${member.acceptanceSent} accepted out of ${member.acceptanceTotal} sent) - Last ${metricsPeriod.value} days`;
      } else {
        return `${member.linkedinResponse}% response rate (${member.responseSent} responses out of ${member.responseTotal} sent) - Last ${metricsPeriod.value} days`;
      }
    };

    return {
      activeTab,
      searchQuery,
      metricsPeriod,
      metricsPeriods,
      sortColumn,
      sortDirection,
      teamMembers,
      filteredMembers,
      sortedAndFilteredMembers,
      handleSort,
      formatLastActive,
      getMetricTooltip,
    };
  },
};
</script>

<style scoped>
.team-page {
  padding: 0;
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* Top Bar */
.team-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.top-bar-left {
  flex: 1;
}

.team-name-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  font-family: 'THICCCBOI', sans-serif;
}

.edit-team-name-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.edit-team-name-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.invite-members-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.invite-members-btn:hover {
  background-color: var(--color-primary-dark, #7C3AED);
}

.team-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.team-menu-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

/* Tabs, Search, and Quick Filters */
.team-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
  gap: 16px;
}

.controls-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.team-tabs {
  display: flex;
  align-items: center;
  gap: 0;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.tab-button:hover {
  color: var(--color-text);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-badge {
  padding: 2px 6px;
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.tab-button.active .tab-badge {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.team-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  min-width: 200px;
}

.search-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

/* Metrics Period and Legend (compact) */
.metrics-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 32px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.period-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.period-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.period-btn {
  padding: 3px 10px;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.period-btn:hover {
  color: var(--color-text);
}

.period-btn.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.legend-items {
  display: flex;
  align-items: center;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-icon.orange {
  color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.legend-icon.red {
  color: #EF4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.legend-text {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Table */
.team-table-container {
  padding: 0 32px 32px;
  overflow-x: auto;
}

.team-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-bg);
}

.team-table thead {
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.team-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.team-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.team-table th.sortable:hover {
  background-color: var(--color-bg-tertiary);
}

.sortable-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-icon {
  width: 12px;
  height: 12px;
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.team-table th.sortable:hover .sort-icon,
.team-table th.sort-asc .sort-icon,
.team-table th.sort-desc .sort-icon {
  opacity: 1;
}

.team-table th.sort-asc .sort-icon path:first-child,
.team-table th.sort-desc .sort-icon path:last-child {
  opacity: 0.3;
}

.sortable-subheader {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.sortable-subheader:hover {
  color: var(--color-text);
}

.sort-icon-small {
  width: 10px;
  height: 10px;
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.sortable-subheader:hover .sort-icon-small,
.sortable-subheader.sort-asc .sort-icon-small,
.sortable-subheader.sort-desc .sort-icon-small {
  opacity: 1;
}

.team-table td {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.team-member-row:hover {
  background-color: var(--color-bg-secondary);
}

.checkbox-col {
  width: 40px;
}

.table-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.user-col {
  min-width: 250px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background-color: #10B981;
  border: 2px solid var(--color-bg);
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.you-badge {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.user-role {
  font-weight: 500;
}

.campaigns-col {
  min-width: 140px;
}

.campaigns-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.campaigns-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.campaign-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: help;
}

.campaign-warning.orange {
  color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.campaign-warning.red {
  color: #EF4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.messages-col {
  min-width: 140px;
}

.messages-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.linkedin-col {
  min-width: 200px;
}

.linkedin-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.linkedin-subheaders {
  display: flex;
  gap: 16px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

.linkedin-metrics {
  display: flex;
  gap: 16px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 60px;
  cursor: help;
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.metric-denominator {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.last-active-col {
  min-width: 120px;
}

.last-active-text {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.plan-status-col {
  min-width: 180px;
}

.plan-status-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-status-subheaders {
  display: flex;
  gap: 16px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

.plan-status-cell {
  display: flex;
  gap: 16px;
  align-items: center;
}

.plan-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  min-width: 60px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-badge.trial {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.actions-col {
  width: 40px;
}

.column-menu-btn,
.member-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.column-menu-btn:hover,
.member-menu-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
</style>
