<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
    </div>

    <div class="settings-content">
      <LeadStagesManager />
    </div>
  </div>
</template>

<script>
import LeadStagesManager from '@/components/LeadStagesManager.vue';

export default {
  name: 'SettingsPage',
  components: {
    LeadStagesManager,
  },
};
</script>

<style scoped>
.settings-page {
  padding: 24px 32px;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: 'THICCCBOI', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.settings-content {
  max-width: 1400px;
}
</style>

