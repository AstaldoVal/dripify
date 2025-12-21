<template>
  <button
    class="export-button"
    :disabled="disabled"
    @click="handleExport"
  >
    <DownloadIcon />
    <span>Export</span>
  </button>
</template>

<script>
export default {
  name: 'ExportButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    leads: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['export'],
  methods: {
    handleExport() {
      if (this.disabled || this.leads.length === 0) return;
      
      const csv = this.generateCSV(this.leads);
      this.downloadCSV(csv, 'leads-export.csv');
      this.$emit('export', this.leads);
    },
    
    generateCSV(leads) {
      const headers = [
        'name',
        'linkedin_url',
        'email',
        'headline',
        'location',
        'last_action',
        'campaign_name',
      ];
      
      const rows = leads.map(lead => [
        this.escapeCSV(lead.name || ''),
        this.escapeCSV(lead.linkedinUrl || ''),
        this.escapeCSV((lead.emails && lead.emails[0]) || ''),
        this.escapeCSV(lead.headline || ''),
        this.escapeCSV(lead.location || ''),
        this.escapeCSV(lead.lastAction ? new Date(lead.lastAction).toISOString() : ''),
        this.escapeCSV(lead.campaignName || ''),
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');
      
      return csvContent;
    },
    
    escapeCSV(value) {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    },
    
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  components: {
    DownloadIcon: {
      template: `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 11V3M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      `,
    },
  },
};
</script>

<style scoped>
.export-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.export-button:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.export-button svg {
  width: 16px;
  height: 16px;
}
</style>

