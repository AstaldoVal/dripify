<template>
  <div class="dashboard-page">
    <TeamsChart />
  </div>
</template>

<script>
import TeamsChart from '@/components/TeamsChart.vue';

export default {
  name: 'DashboardPage',
  components: {
    TeamsChart,
  },
};
</script>

<style scoped>
.dashboard-page {
  padding: 24px 32px;
  min-height: 100vh;
  background-color: #F9FAFB;
}
</style>
