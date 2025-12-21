<template>
  <div class="main-layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'MainLayout',
  components: {
    Sidebar,
  },
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  overflow-y: auto;
  background-color: var(--color-bg);
}
</style>

