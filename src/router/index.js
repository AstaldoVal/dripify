import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import LeadsPage from '@/views/LeadsPage.vue';
import LeadProfilePage from '@/views/LeadProfilePage.vue';
import DashboardPage from '@/views/DashboardPage.vue';
import CampaignsPage from '@/views/CampaignsPage.vue';
import InboxPage from '@/views/InboxPage.vue';
import TeamPage from '@/views/TeamPage.vue';
import SettingsPage from '@/views/SettingsPage.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
      },
      {
        path: 'campaigns',
        name: 'Campaigns',
        component: CampaignsPage,
      },
      {
        path: 'inbox',
        name: 'Inbox',
        component: InboxPage,
      },
      {
        path: 'leads',
        name: 'Leads',
        component: LeadsPage,
      },
      {
        path: 'leads/:leadId',
        name: 'LeadProfile',
        component: LeadProfilePage,
      },
      {
        path: 'team',
        name: 'Team',
        component: TeamPage,
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsPage,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
