<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon"></div>
        <span class="logo-text">Dripify</span>
      </div>
    </div>
    
    <div class="user-profile">
      <div class="user-avatar">
        <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
        <div v-else class="avatar-placeholder">{{ user.initials }}</div>
      </div>
      <div class="user-info">
        <span class="user-name">{{ user.name }}</span>
        <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <router-link
        v-for="(item, index) in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: $route.name === item.name }"
      >
        <component 
          :is="item.icon" 
          class="nav-icon"
        />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <div class="whats-new">
        <span class="whats-new-label">What's new</span>
        <span class="whats-new-time">02:19</span>
      </div>
    </div>
  </aside>
</template>

<script>
import { h } from 'vue';

export default {
  name: 'Sidebar',
  setup() {
    console.log('🔧 Sidebar setup() called');
    
    const user = {
      name: 'Nate D.',
      avatar: null,
      initials: 'ND',
    };

    console.log('📦 Creating icon components...');
    const DashboardIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
      h('rect', { x: 2, y: 2, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 8, y: 2, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 14, y: 2, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 2, y: 8, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 8, y: 8, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 14, y: 8, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 2, y: 14, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 8, y: 14, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('rect', { x: 14, y: 14, width: 4, height: 4, rx: 0.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
    ]);

    const CampaignsIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
      h('path', { d: 'M5 6C5 4.89543 5.89543 4 7 4H13C14.1046 4 15 4.89543 15 6V10C15 11.1046 14.1046 12 13 12H7C5.89543 12 5 11.1046 5 10V6Z', stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M10 4V12', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
      h('path', { d: 'M15 10L18 13V7L15 10Z', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
    ]);

    const InboxIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
      h('rect', { x: 3, y: 4, width: 14, height: 12, rx: 1, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M3 6L10 11L17 6', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    ]);

    const LeadsIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
      h('path', { d: 'M10 2L12.09 7.26L18 8.18L14 12.14L14.91 18.02L10 15.77L5.09 18.02L6 12.14L2 8.18L7.91 7.26L10 2Z', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }),
      h('line', { x1: 10, y1: 6, x2: 10, y2: 8, stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
      h('line', { x1: 10, y1: 9, x2: 10, y2: 11, stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
      h('line', { x1: 10, y1: 12, x2: 10, y2: 14, stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
    ]);

    const TeamIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
      h('circle', { cx: 7, cy: 5, r: 2.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M2 17C2 13.5 4.5 11 8 11C11.5 11 14 13.5 14 17', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
      h('circle', { cx: 13, cy: 5, r: 2.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M18 17C18 13.5 15.5 11 12 11', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
    ]);

    const SettingsIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none' }, [
      h('circle', { cx: 10, cy: 10, r: 2.5, stroke: 'currentColor', 'stroke-width': 1.5 }),
      h('path', { d: 'M10 3V1M10 19V17M17 10H19M1 10H3M15.66 4.34L17.07 2.93M2.93 17.07L4.34 15.66M15.66 15.66L17.07 17.07M2.93 2.93L4.34 4.34', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
    ]);

    console.log('✅ All icon components created');
    console.log('📋 DashboardIcon:', typeof DashboardIcon, DashboardIcon);
    console.log('📋 CampaignsIcon:', typeof CampaignsIcon, CampaignsIcon);
    console.log('📋 LeadsIcon:', typeof LeadsIcon, LeadsIcon);
    
    const navItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        label: 'Dashboard',
        icon: DashboardIcon,
        badge: null,
      },
      {
        name: 'Campaigns',
        path: '/campaigns',
        label: 'Campaigns',
        icon: CampaignsIcon,
        badge: null,
      },
      {
        name: 'Inbox',
        path: '/inbox',
        label: 'Inbox',
        icon: InboxIcon,
        badge: 1,
      },
      {
        name: 'Leads',
        path: '/leads',
        label: 'Leads',
        icon: LeadsIcon,
        badge: null,
      },
      {
        name: 'Team',
        path: '/team',
        label: 'Team',
        icon: TeamIcon,
        badge: null,
      },
      {
        name: 'Settings',
        path: '/settings',
        label: 'Settings',
        icon: SettingsIcon,
        badge: null,
      },
    ];

    console.log('📋 navItems created:', navItems.length, 'items');
    console.log('📋 First navItem icon:', navItems[0].icon);
    console.log('📋 Leads navItem icon:', navItems.find(item => item.name === 'Leads')?.icon);

    return {
      user,
      navItems,
    };
  },
};
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: var(--color-bg);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary), #A78BFA);
  border-radius: 8px;
}

.logo-text {
  font-weight: 600;
  font-size: 18px;
  color: var(--color-text);
}

.user-profile {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text);
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-name {
  font-weight: 500;
  color: var(--color-text);
}

.dropdown-icon {
  color: var(--color-text-secondary);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-base);
  position: relative;
}

.nav-item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.nav-item.active {
  color: #A78BFA;
  background-color: rgba(167, 139, 250, 0.15);
  font-weight: 500;
}

.nav-item.active .nav-icon {
  color: #A78BFA;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  background-color: var(--color-error);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.whats-new {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.whats-new-time {
  font-weight: 500;
}
</style>
