<template>
  <div class="inbox-page">
    <div class="page-header">
      <h1 class="page-title">Inbox</h1>
      <button class="open-modal-button" @click="showModal = true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>Create LinkedIn Message</span>
      </button>
    </div>

    <div class="page-content">
      <p class="placeholder-text">Click "Create LinkedIn Message" to open the message editor modal.</p>
    </div>

    <!-- LinkedIn Message Modal -->
    <LinkedInMessageModal
      v-model="showModal"
      @save="handleSave"
      @close="handleClose"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import LinkedInMessageModal from '@/components/LinkedInMessageModal.vue';

export default {
  name: 'InboxPage',
  components: {
    LinkedInMessageModal,
  },
  setup() {
    const showModal = ref(false);

    const handleSave = (data) => {
      console.log('Message saved:', data);
    };

    const handleClose = () => {
      console.log('Modal closed');
    };

    return {
      showModal,
      handleSave,
      handleClose,
    };
  },
};
</script>

<style scoped>
.inbox-page {
  padding: 24px 32px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-family: 'THICCCBOI', sans-serif;
  font-weight: 600;
  font-size: 28px;
  color: var(--color-text);
  margin: 0;
}

.open-modal-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.open-modal-button:hover {
  background-color: var(--color-primary-dark, #7C3AED);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.page-content {
  padding: 40px;
  text-align: center;
}

.placeholder-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
