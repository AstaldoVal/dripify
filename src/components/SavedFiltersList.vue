<template>
  <div class="filters-list">
      <button
        v-for="filter in visibleSavedFilters"
        :key="filter.id"
        class="filter-chip custom"
        :class="{ active: activeFilterId === filter.id }"
        @click="loadFilter(filter)"
        :title="filter.name"
      >
        <span class="filter-chip-name">{{ filter.name }}</span>
        <div class="filter-chip-remove" @click.stop="confirmDelete(filter.id, filter.name)" title="Delete filter">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </button>

      <div v-if="hiddenSavedFiltersCount > 0" class="more-filters-wrapper" v-click-outside="closeMoreFilters">
        <button class="more-filters-btn" @click="toggleMoreFilters">
          <span>+{{ hiddenSavedFiltersCount }} more</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="dropdown-chevron" :class="{ 'is-open': showMoreFilters }">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div v-if="showMoreFilters" class="more-filters-menu">
          <div
            v-for="filter in hiddenSavedFilters"
            :key="filter.id"
            class="more-filter-item"
            :class="{ active: activeFilterId === filter.id }"
            @click="loadFilter(filter)"
          >
            <span class="filter-item-name">{{ filter.name }}</span>
            <div class="filter-item-delete" @click.stop="confirmDelete(filter.id, filter.name)" title="Delete filter">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="delete-modal-overlay" @click.self="cancelDelete">
        <div class="delete-modal">
          <div class="delete-modal-header">
            <h3 class="delete-modal-title">Delete filter</h3>
          </div>
          <div class="delete-modal-body">
            <p class="delete-modal-text">
              Are you sure you want to delete the custom filter "<strong>{{ filterToDeleteName }}</strong>"?
            </p>
          </div>
          <div class="delete-modal-footer">
            <button class="delete-modal-btn cancel-btn" @click="cancelDelete">No</button>
            <button class="delete-modal-btn confirm-btn" @click="confirmDeleteAction">Yes</button>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

const SAVED_FILTERS_KEY = 'dripify_saved_filters';

export default {
  name: 'SavedFiltersList',
  props: {
    activeFilterId: {
      type: String,
      default: null,
    },
  },
  emits: ['load-filter', 'custom-filters-count', 'filter-deleted'],
  setup(props, { emit }) {
    const savedFilters = ref([]);
    const showMoreFilters = ref(false);
    const maxVisibleFilters = ref(5);
    const showDeleteModal = ref(false);
    const filterToDeleteId = ref(null);
    const filterToDeleteName = ref('');

    // Load saved filters from localStorage
    const loadSavedFilters = () => {
      try {
        const stored = localStorage.getItem(SAVED_FILTERS_KEY);
        if (stored) {
          savedFilters.value = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
        savedFilters.value = [];
      }
    };

    // Save filters to localStorage
    const saveFiltersToStorage = () => {
      try {
        localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters.value));
      } catch (error) {
        console.error('Error saving filters:', error);
      }
    };

    // Computed: visible saved filters (first N)
    const visibleSavedFilters = computed(() => {
      return savedFilters.value.slice(0, maxVisibleFilters.value);
    });

    // Computed: hidden saved filters (after first N)
    const hiddenSavedFilters = computed(() => {
      return savedFilters.value.slice(maxVisibleFilters.value);
    });

    // Computed: count of hidden filters
    const hiddenSavedFiltersCount = computed(() => {
      return Math.max(0, savedFilters.value.length - maxVisibleFilters.value);
    });

    // Load saved filter
    const loadFilter = (filter) => {
      // If clicking the same filter, emit null to deactivate
      if (props.activeFilterId === filter.id) {
        emit('load-filter', null);
      } else {
        emit('load-filter', filter);
      }
      closeMoreFilters();
    };

    // Confirm delete (show modal)
    const confirmDelete = (filterId, filterName) => {
      filterToDeleteId.value = filterId;
      filterToDeleteName.value = filterName;
      showDeleteModal.value = true;
    };

    // Cancel delete
    const cancelDelete = () => {
      showDeleteModal.value = false;
      filterToDeleteId.value = null;
      filterToDeleteName.value = '';
    };

    // Confirm delete action
    const confirmDeleteAction = () => {
      if (filterToDeleteId.value) {
        const filterId = filterToDeleteId.value;
        savedFilters.value = savedFilters.value.filter(f => f.id !== filterId);
        saveFiltersToStorage();
        if (props.activeFilterId === filterId) {
          emit('load-filter', null);
        }
        // Emit event that filter was deleted
        emit('filter-deleted', filterId);
      }
      cancelDelete();
    };

    // Toggle more filters menu
    const toggleMoreFilters = () => {
      showMoreFilters.value = !showMoreFilters.value;
    };

    // Close more filters menu
    const closeMoreFilters = () => {
      showMoreFilters.value = false;
    };

    // Expose method to reload filters
    const reloadFilters = () => {
      loadSavedFilters();
      emit('custom-filters-count', savedFilters.value.length);
    };

    // Load saved filters on mount
    onMounted(() => {
      loadSavedFilters();
      // Emit count of custom filters
      emit('custom-filters-count', savedFilters.value.length);
    });

    // Watch for changes in saved filters count
    watch(savedFilters, (newVal) => {
      emit('custom-filters-count', newVal.length);
    }, { deep: true });

    return {
      activeFilterId: computed(() => props.activeFilterId),
      savedFilters,
      visibleSavedFilters,
      hiddenSavedFilters,
      hiddenSavedFiltersCount,
      showMoreFilters,
      showDeleteModal,
      filterToDeleteName,
      toggleMoreFilters,
      closeMoreFilters,
      reloadFilters,
      loadFilter,
      confirmDelete,
      cancelDelete,
      confirmDeleteAction,
    };
  },
  expose: ['reloadFilters'],
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
.filters-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}


.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  color: var(--color-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.filter-chip:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter-chip.active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.filter-chip.custom {
  padding-right: 8px;
}

.filter-chip-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.filter-chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.filter-chip.active .filter-chip-remove {
  color: rgba(255, 255, 255, 0.8);
}

.filter-chip-remove:hover {
  background-color: var(--color-danger-light, rgba(239, 68, 68, 0.1));
  color: var(--color-danger, #EF4444);
}

.filter-chip.active .filter-chip-remove:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.more-filters-wrapper {
  position: relative;
  display: inline-block;
}

.more-filters-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;
}

.more-filters-btn:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.dropdown-chevron {
  transition: transform 0.15s ease;
}

.dropdown-chevron.is-open {
  transform: rotate(180deg);
}

.more-filters-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  min-width: 200px;
  max-width: 300px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.more-filter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  color: var(--color-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  font-family: inherit;
}

.more-filter-item:hover {
  background-color: var(--color-bg-secondary);
}

.more-filter-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.filter-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-item-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.filter-item-delete:hover {
  background-color: var(--color-danger-light, rgba(239, 68, 68, 0.1));
  color: var(--color-danger, #EF4444);
}

/* Delete Confirmation Modal */
.delete-modal-overlay {
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
}

.delete-modal {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.delete-modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
}

.delete-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  font-family: 'THICCCBOI', sans-serif;
}

.delete-modal-body {
  padding: 20px 24px;
}

.delete-modal-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

.delete-modal-text strong {
  color: var(--color-text);
  font-weight: 600;
}

.delete-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--color-border);
}

.delete-modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  border: 1px solid transparent;
}

.cancel-btn {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  border-color: var(--color-border);
}

.cancel-btn:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border);
}

.confirm-btn {
  background-color: var(--color-danger, #EF4444);
  color: white;
  border-color: var(--color-danger, #EF4444);
}

.confirm-btn:hover {
  background-color: var(--color-danger-dark, #DC2626);
  border-color: var(--color-danger-dark, #DC2626);
}
</style>
