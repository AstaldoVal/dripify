<template>
  <button
    class="stage-badge"
    :class="[`stage-${stage.toLowerCase()}`, { clickable }]"
    :style="badgeStyles"
    @click.stop="handleClick"
    :title="stageInfo.description"
  >
    <span class="stage-icon" v-if="showIcon">
      <component :is="stageIcon" />
    </span>
    <span class="stage-label">{{ stageInfo.label }}</span>
    <span v-if="showSource && source" class="stage-source">
      <AIIcon v-if="source === 'AI'" class="source-icon" />
      <ManualIcon v-else class="source-icon" />
    </span>
  </button>
</template>

<script>
import { computed } from 'vue';
import { stageConfig, LeadStage } from '@/stores/leads';

export default {
  name: 'LeadStageBadge',
  props: {
    stage: {
      type: String,
      required: true,
      validator: (value) => Object.values(LeadStage).includes(value),
    },
    source: {
      type: String,
      default: null,
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    showSource: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: 'sm',
      validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value),
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const stageInfo = computed(() => {
      return stageConfig[props.stage] || {
        label: props.stage,
        description: '',
        color: '#6B7280',
        bgColor: '#F3F4F6',
      };
    });

    const badgeStyles = computed(() => {
      const info = stageInfo.value;
      return {
        '--badge-color': info.color,
        '--badge-bg': info.bgColor,
        '--badge-border': info.borderColor || info.color,
      };
    });

    const stageIcon = computed(() => {
      const icons = {
        [LeadStage.NEW]: 'NewIcon',
        [LeadStage.CONTACTED]: 'ContactedIcon',
        [LeadStage.ENGAGED]: 'EngagedIcon',
        [LeadStage.GHOSTED]: 'GhostedIcon',
        [LeadStage.NOT_INTERESTED]: 'NotInterestedIcon',
        [LeadStage.EXCLUDED]: 'ExcludedIcon',
      };
      return icons[props.stage] || 'NewIcon';
    });

    const handleClick = () => {
      if (props.clickable) {
        emit('click', props.stage);
      }
    };

    return {
      stageInfo,
      badgeStyles,
      stageIcon,
      handleClick,
    };
  },
  components: {
    NewIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      `,
    },
    ContactedIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 7L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      `,
    },
    EngagedIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
    },
    GhostedIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 4V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="6" cy="8" r="0.5" fill="currentColor"/>
        </svg>
      `,
    },
    NotInterestedIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
    },
    ExcludedIcon: {
      template: `
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
    },
    AIIcon: {
      template: `
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1L6 4H9L6.5 6L7.5 9L5 7L2.5 9L3.5 6L1 4H4L5 1Z" fill="currentColor"/>
        </svg>
      `,
    },
    ManualIcon: {
      template: `
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 8L7 3L8 4L3 9H2V8Z" stroke="currentColor" stroke-width="1"/>
        </svg>
      `,
    },
  },
};
</script>

<style scoped>
.stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  background-color: var(--badge-bg);
  color: var(--badge-color);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: default;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  letter-spacing: 0.2px;
}

.stage-badge.clickable {
  cursor: pointer;
}

.stage-badge.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-color: var(--badge-border);
  background-color: var(--badge-bg);
  filter: brightness(1.05);
}

.stage-badge.clickable:active {
  transform: translateY(0);
}

.stage-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.stage-label {
  line-height: 1;
}

.stage-source {
  display: flex;
  align-items: center;
  opacity: 0.7;
  margin-left: 2px;
}

.source-icon {
  width: 10px;
  height: 10px;
}

/* Size variants */
.stage-badge[data-size="xs"] {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 8px;
}

.stage-badge[data-size="md"] {
  padding: 6px 12px;
  font-size: 13px;
}

.stage-badge[data-size="lg"] {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 16px;
}
</style>

