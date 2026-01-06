<template>
  <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" :class="{ 'ai-panel-open': showAISettingsPanel }" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">Input your LinkedIn message</h2>
        <button class="modal-close" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="modal-tabs">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'primary' }"
          @click="activeTab = 'primary'"
        >
          Primary message
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'alternative' }"
          @click="activeTab = 'alternative'"
        >
          Alternative message (optional)
        </button>
      </div>

      <!-- Personalization Tokens -->
      <div class="personalization-tokens">
        <button
          v-for="token in visibleTokens"
          :key="token.key"
          class="token-button"
          @click="insertToken(token.key)"
        >
          {{ token.label }}
        </button>
        <div class="token-dropdown" v-click-outside="closeTokenDropdown">
          <button class="token-button more-button" @click="toggleTokenDropdown">
            More
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="dropdown-chevron" :class="{ 'is-open': showTokenDropdown }">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div v-if="showTokenDropdown" class="token-dropdown-menu">
            <button
              v-for="token in hiddenTokens"
              :key="token.key"
              class="token-dropdown-item"
              @click="insertToken(token.key)"
            >
              {{ token.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Message Editor with Toolbar -->
      <div class="message-editor-wrapper">
        <textarea
          v-model="messageText"
          class="message-textarea"
          placeholder="Type your message here..."
          @input="handleInput"
          ref="textareaRef"
        ></textarea>
        
        <!-- Toolbar -->
        <div class="message-toolbar">
          <button class="toolbar-button ai-button" @click="handleImproveWithAI">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9.5 6L14 7.5L9.5 9L8 13L6.5 9L2 7.5L6.5 6L8 2Z" fill="currentColor"/>
            </svg>
            <span>Improve with AI</span>
          </button>

          <div class="toolbar-actions">
            <button class="toolbar-icon-button" title="Preview">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3C4 3 1 6 1 8C1 10 4 13 8 13C12 13 15 10 15 8C15 6 12 3 8 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
            <button class="toolbar-icon-button" title="Template">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <path d="M2 6H14M6 2V14" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
            <button class="toolbar-icon-button" title="Attach" @click="triggerFileInput">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4H5C3.89543 4 3 4.89543 3 6V10C3 11.1046 3.89543 12 5 12H11C12.1046 12 13 11.1046 13 10V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 4L13 7H10V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <input
              ref="fileInputRef"
              type="file"
              class="file-input-hidden"
              @change="handleFileSelect"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
          </div>

          <div class="character-count">{{ characterCount }} / 4000</div>
        </div>
      </div>

      <!-- Attached File -->
      <div v-if="attachedFile" class="attached-file">
        <div class="file-info">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="file-icon">
            <path d="M10 4H5C3.89543 4 3 4.89543 3 6V10C3 11.1046 3.89543 12 5 12H11C12.1046 12 13 11.1046 13 10V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 4L13 7H10V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="file-name">{{ attachedFile.name }}</span>
          <span class="file-size">{{ attachedFile.size }}</span>
        </div>
        <button class="file-remove" @click="removeFile">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Save as Template -->
      <div class="template-option">
        <button class="template-button" @click="handleSaveAsTemplate">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M2 6H14M6 2V14" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 2V4M9 12V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span>Save as template</span>
        </button>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="footer-button cancel-button" @click="handleClose">Cancel</button>
        <button class="footer-button save-button" @click="handleSave">Save</button>
      </div>

      <!-- AI Settings Sidebar -->
      <div v-if="showAISettingsPanel" class="ai-settings-sidebar">
        <div class="ai-sidebar-header">
          <h3 class="ai-sidebar-title">AI Writing Style</h3>
          <button class="ai-sidebar-close" @click="closeAISettingsPanel">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="ai-sidebar-body">
          <p class="ai-sidebar-description">Customize how AI improves your message</p>
          
          <div class="settings-controls">
            <!-- Personalization Level -->
            <div class="setting-group">
              <div class="setting-label-row">
                <label class="setting-label">Personalization</label>
                <span class="setting-value">{{ personalizationLabel }}</span>
              </div>
              <div class="slider-container">
                <input
                  type="range"
                  v-model.number="styleSettings.personalization"
                  min="0"
                  max="100"
                  step="10"
                  class="style-slider"
                  :class="{ 'at-min': styleSettings.personalization === 0, 'at-max': styleSettings.personalization === 100 }"
                />
                <div class="slider-labels">
                  <span class="slider-label-left">Generic</span>
                  <span class="slider-label-right">Personal</span>
                </div>
              </div>
            </div>

            <!-- Salesy Level -->
            <div class="setting-group">
              <div class="setting-label-row">
                <label class="setting-label">Sales Tone</label>
                <span class="setting-value">{{ salesToneLabel }}</span>
              </div>
              <div class="slider-container">
                <input
                  type="range"
                  v-model.number="styleSettings.salesTone"
                  min="0"
                  max="100"
                  step="10"
                  class="style-slider"
                  :class="{ 'at-min': styleSettings.salesTone === 0, 'at-max': styleSettings.salesTone === 100 }"
                />
                <div class="slider-labels">
                  <span class="slider-label-left">Less Salesy</span>
                  <span class="slider-label-right">More Salesy</span>
                </div>
              </div>
            </div>

            <!-- Encourage Response -->
            <div class="setting-group checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="styleSettings.encourageResponse"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <span class="checkbox-title">Encourage response</span>
                  <span class="checkbox-hint">Include a clear call-to-action to encourage engagement</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div class="ai-sidebar-footer">
          <button class="ai-sidebar-button cancel-button" @click="closeAISettingsPanel">Cancel</button>
          <button class="ai-sidebar-button apply-button" @click="applyAIImprovement">Apply AI Improvement</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';

export default {
  name: 'LinkedInMessageModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'close', 'save'],
  setup(props, { emit }) {
    const activeTab = ref('primary');
    const messageText = ref(`Hey %%first name%%!
It's been a while since I messaged you the last time.
%%first name%% implementing Dripify to automate prospecting on LinkedIn might become a game-changer for your company and will take you far ahead from your competitors, so you can get this new`);
    const showTokenDropdown = ref(false);
    const attachedFile = ref(null);
    const textareaRef = ref(null);
    const fileInputRef = ref(null);
    const showAISettingsPanel = ref(false);

    // AI Style Settings
    const styleSettings = ref({
      personalization: 70, // Default: More personal
      salesTone: 40, // Default: Less salesy
      encourageResponse: true, // Default: Encourage response
    });

    const tokens = [
      { key: 'first_name', label: 'First name' },
      { key: 'last_name', label: 'Last name' },
      { key: 'position', label: 'Position' },
      { key: 'company', label: 'Company' },
      { key: 'country', label: 'Country' },
      { key: 'city', label: 'City' },
      { key: 'industry', label: 'Industry' },
      { key: 'company_size', label: 'Company size' },
    ];

    const visibleTokens = computed(() => tokens.slice(0, 5));
    const hiddenTokens = computed(() => tokens.slice(5));

    const characterCount = computed(() => {
      return messageText.value.length;
    });

    const toggleTokenDropdown = () => {
      showTokenDropdown.value = !showTokenDropdown.value;
    };

    const closeTokenDropdown = () => {
      showTokenDropdown.value = false;
    };

    const insertToken = (tokenKey) => {
      const token = `%%${tokenKey}%%`;
      const textarea = textareaRef.value;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = messageText.value;
        messageText.value = text.substring(0, start) + token + text.substring(end);
        nextTick(() => {
          textarea.focus();
          const newPosition = start + token.length;
          textarea.setSelectionRange(newPosition, newPosition);
        });
      }
      closeTokenDropdown();
    };

    const handleInput = () => {
      // Character count is computed automatically
    };

    const triggerFileInput = () => {
      if (fileInputRef.value) {
        fileInputRef.value.click();
      }
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileSelect = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        attachedFile.value = {
          name: file.name,
          size: formatFileSize(file.size),
          file: file, // Store the actual File object for potential upload
        };
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    };

    const removeFile = () => {
      attachedFile.value = null;
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    };

    const personalizationLabel = computed(() => {
      if (styleSettings.value.personalization === 0) return 'Generic';
      if (styleSettings.value.personalization <= 30) return 'Slightly Personal';
      if (styleSettings.value.personalization <= 60) return 'Moderately Personal';
      if (styleSettings.value.personalization <= 90) return 'Very Personal';
      return 'Highly Personal';
    });

    const salesToneLabel = computed(() => {
      if (styleSettings.value.salesTone === 0) return 'Not Salesy';
      if (styleSettings.value.salesTone <= 30) return 'Minimal Sales';
      if (styleSettings.value.salesTone <= 60) return 'Moderate Sales';
      if (styleSettings.value.salesTone <= 90) return 'Strong Sales';
      return 'Very Salesy';
    });

    const handleImproveWithAI = () => {
      showAISettingsPanel.value = true;
    };

    const closeAISettingsPanel = () => {
      showAISettingsPanel.value = false;
    };

    const applyAIImprovement = () => {
      const settings = {
        personalization: styleSettings.value.personalization,
        salesTone: styleSettings.value.salesTone,
        encourageResponse: styleSettings.value.encourageResponse,
      };
      console.log('Apply AI improvement with settings:', settings);
      // In a real implementation, this would call an AI service with these settings
      // and update messageText.value with the improved version
      closeAISettingsPanel();
    };

    const handleSaveAsTemplate = () => {
      console.log('Save as template clicked');
    };

    const handleClose = () => {
      emit('update:modelValue', false);
      emit('close');
    };

    const handleSave = () => {
      emit('save', {
        tab: activeTab.value,
        message: messageText.value,
        file: attachedFile.value,
      });
      handleClose();
    };

    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    };

    // Click outside directive
    const clickOutside = {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    };

    return {
      activeTab,
      messageText,
      showTokenDropdown,
      attachedFile,
      textareaRef,
      fileInputRef,
      visibleTokens,
      hiddenTokens,
      characterCount,
      toggleTokenDropdown,
      closeTokenDropdown,
      insertToken,
      handleInput,
      triggerFileInput,
      handleFileSelect,
      removeFile,
      handleImproveWithAI,
      handleSaveAsTemplate,
      handleClose,
      handleSave,
      handleOverlayClick,
      clickOutside,
      styleSettings,
      personalizationLabel,
      salesToneLabel,
      showAISettingsPanel,
      closeAISettingsPanel,
      applyAIImprovement,
    };
  },
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: max-width 0.3s ease;
}

.modal-content.ai-panel-open {
  max-width: 1200px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  font-family: 'THICCCBOI', sans-serif;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.modal-tabs {
  display: flex;
  gap: 0;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  margin-bottom: -1px;
}

.tab-button:hover {
  color: var(--color-text);
}

.tab-button.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.personalization-tokens {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--color-border);
}

.token-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.token-button:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.token-dropdown {
  position: relative;
}

.more-button {
  padding-right: 8px;
}

.dropdown-chevron {
  transition: transform 0.15s ease;
}

.dropdown-chevron.is-open {
  transform: rotate(180deg);
}

.token-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  min-width: 160px;
  padding: 4px;
}

.token-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-family: inherit;
}

.token-dropdown-item:hover {
  background-color: var(--color-bg-secondary);
}

.message-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 24px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg);
  overflow: hidden;
  transition: all 0.15s ease;
  min-height: 300px;
}

.message-editor-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.message-textarea {
  flex: 1;
  width: 100%;
  min-height: 200px;
  padding: 16px;
  background-color: transparent;
  border: none;
  border-radius: 0;
  color: var(--color-text);
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.message-textarea::placeholder {
  color: var(--color-text-secondary);
}

.settings-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.setting-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  padding: 4px 10px;
  background-color: var(--color-primary-light);
  border-radius: 4px;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.style-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.style-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: 2px solid var(--color-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.15s ease;
}

.style-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.style-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: 2px solid var(--color-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.15s ease;
}

.style-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-secondary);
}

.slider-label-left,
.slider-label-right {
  font-weight: 500;
}

.checkbox-group {
  padding-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.checkbox-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.checkbox-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.message-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
}

.ai-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.ai-button:hover {
  background-color: var(--color-primary-dark, #7C3AED);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-icon-button:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.character-count {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-left: auto;
}

.attached-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.file-name {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.file-remove:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-danger, #EF4444);
}

.template-option {
  padding: 12px 24px;
  border-top: 1px solid var(--color-border);
}

.template-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.template-button:hover {
  color: var(--color-primary-dark, #7C3AED);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
}

.footer-button {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  border: none;
}

.cancel-button {
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.cancel-button:hover {
  background-color: var(--color-bg-secondary);
}

.save-button {
  background-color: var(--color-primary);
  color: white;
}

.save-button:hover {
  background-color: var(--color-primary-dark, #7C3AED);
}

.file-input-hidden {
  display: none;
}

/* AI Settings Sidebar */
.ai-settings-sidebar {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  background-color: var(--color-bg);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.ai-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.ai-sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  font-family: 'THICCCBOI', sans-serif;
}

.ai-sidebar-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.ai-sidebar-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.ai-sidebar-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ai-sidebar-description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.ai-sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.ai-sidebar-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  border: none;
}

.ai-sidebar-button.cancel-button {
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.ai-sidebar-button.cancel-button:hover {
  background-color: var(--color-bg-secondary);
}

.ai-sidebar-button.apply-button {
  background-color: var(--color-primary);
  color: white;
}

.ai-sidebar-button.apply-button:hover {
  background-color: var(--color-primary-dark, #7C3AED);
}
</style>

