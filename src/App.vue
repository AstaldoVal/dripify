<template>
  <div id="app" :class="themeClass">
    <router-view />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const updateTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'theme-dark' : 'theme-light';
      document.documentElement.className = theme;
      return theme;
    };

    const themeClass = computed(() => {
      return updateTheme();
    });

    onMounted(() => {
      // Set initial theme
      updateTheme();
      
      // Listen for theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        updateTheme();
      };
      mediaQuery.addEventListener('change', handleChange);
    });

    return {
      themeClass,
    };
  },
};
</script>

<style>
#app {
  font-family: 'THICCCBOI', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}
</style>
