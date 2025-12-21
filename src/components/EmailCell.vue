<template>
  <div class="email-cell">
    <!-- Multiple emails with badge -->
    <div v-if="hasMultipleEmails" class="email-multiple">
      <span class="email-primary">{{ primaryEmail }}</span>
      <span class="email-badge">+{{ emails.length - 1 }}</span>
      <button
        v-if="primaryEmail"
        class="copy-button"
        @click.stop="copyEmail(primaryEmail)"
        :title="'Copy ' + primaryEmail"
      >
        <CopyIcon />
      </button>
    </div>
    
    <!-- Single email -->
    <div v-else-if="hasEmail" class="email-single">
      <span class="email-text">{{ primaryEmail }}</span>
      <button
        class="copy-button"
        @click.stop="copyEmail(primaryEmail)"
        :title="'Copy ' + primaryEmail"
      >
        <CopyIcon />
      </button>
    </div>
    
    <!-- Email not found -->
    <div v-else-if="emailStatus === 'not_found'" class="email-not-found">
      <span class="email-status-text">Email not found</span>
    </div>
    
    <!-- Find email CTA -->
    <div v-else-if="emailStatus === 'find'" class="email-find">
      <button class="find-email-button" @click.stop="handleFindEmail">
        <SearchIcon />
        <span>Find email</span>
      </button>
    </div>
    
    <!-- Empty state -->
    <div v-else class="email-empty">
      <span class="email-empty-text">—</span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EmailCell',
  props: {
    lead: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const emails = computed(() => {
      return props.lead.emails || [];
    });
    
    const primaryEmail = computed(() => {
      return emails.value.length > 0 ? emails.value[0] : null;
    });
    
    const hasEmail = computed(() => {
      return primaryEmail.value !== null;
    });
    
    const hasMultipleEmails = computed(() => {
      return emails.value.length > 1;
    });
    
    const emailStatus = computed(() => {
      if (hasEmail.value) return 'found';
      if (props.lead.emailStatus === 'not_found') return 'not_found';
      if (props.lead.emailStatus === 'find') return 'find';
      return 'empty';
    });
    
    const copyEmail = async (email) => {
      try {
        await navigator.clipboard.writeText(email);
        console.log('Email copied:', email);
      } catch (err) {
        console.error('Failed to copy email:', err);
      }
    };
    
    const handleFindEmail = () => {
      console.log('Find email for lead:', props.lead.id);
    };
    
    return {
      emails,
      primaryEmail,
      hasEmail,
      hasMultipleEmails,
      emailStatus,
      copyEmail,
      handleFindEmail,
    };
  },
  components: {
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
  },
};
</script>

<style scoped>
.email-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.email-single,
.email-multiple {
  display: flex;
  align-items: center;
  gap: 6px;
}

.email-text,
.email-primary {
  font-size: 13px;
  color: var(--color-text);
  font-family: monospace;
}

.email-badge {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.email-badge:hover {
  background-color: var(--color-primary);
  color: white;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0;
  transition: all var(--transition-base);
}

.email-cell:hover .copy-button {
  opacity: 1;
}

.copy-button:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.email-not-found {
  color: var(--color-text-tertiary);
  font-size: 13px;
  font-style: italic;
}

.email-find {
  display: flex;
  align-items: center;
}

.find-email-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all var(--transition-base);
}

.find-email-button:hover {
  background-color: var(--color-primary-light);
}

.email-empty-text {
  color: var(--color-text-tertiary);
}
</style>

