<template>
  <div class="audit-notice">
    <!-- Header with status and actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Audit Notice</h2>
        <p class="text-gray-600 mt-1">Initial audit notification and scope definition</p>
      </div>
      <div class="flex items-center space-x-3">
        <!-- Save status indicator -->
        <div class="flex items-center text-sm" :class="saveStatusClass">
          <span class="mr-2">{{ saveStatusText }}</span>
          <div class="w-2 h-2 rounded-full animate-pulse" :class="saveStatusDotClass"></div>
        </div>

        <!-- Export to Word button -->
        <button
          @click="exportToWord"
          class="flex items-center px-4 py-2 bg-gov-navy-700 text-white rounded-lg hover:bg-gov-navy-800 transition-colors"
          :disabled="exporting"
        >
          <svg v-if="exporting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          {{ exporting ? 'Exporting...' : 'Export to Word' }}
        </button>
      </div>
    </div>

    <!-- Form fields -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left column -->
      <div class="space-y-6">
        <!-- Audit Scope -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Audit Scope <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="formData.scope"
            @input="onFieldChange"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="Describe the scope of the audit, including departments, processes, and time periods to be reviewed..."
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">Define what will and will not be included in the audit.</p>
        </div>

        <!-- Audit Objectives -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Audit Objectives <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="formData.objectives"
            @input="onFieldChange"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="List the specific objectives of this audit..."
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">What do you aim to achieve with this audit?</p>
        </div>

        <!-- Timeline -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Timeline <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                v-model="formData.startDate"
                @input="onFieldChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                v-model="formData.endDate"
                @input="onFieldChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <!-- Responsible Parties -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Responsible Parties
          </label>
          <div class="space-y-3">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Audit Lead</label>
              <input
                type="text"
                v-model="formData.auditLead"
                @input="onFieldChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                placeholder="Name of audit lead"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Audit Team Members</label>
              <textarea
                v-model="formData.teamMembers"
                @input="onFieldChange"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                placeholder="List team members (separate with commas)"
              ></textarea>
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">Point of Contact (Auditee)</label>
              <input
                type="text"
                v-model="formData.pointOfContact"
                @input="onFieldChange"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                placeholder="Name of auditee point of contact"
              />
            </div>
          </div>
        </div>

        <!-- Legal & Compliance -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Legal & Compliance References
          </label>
          <textarea
            v-model="formData.legalReferences"
            @input="onFieldChange"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="List relevant laws, regulations, or standards..."
          ></textarea>
        </div>

        <!-- Risk Assessment -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Initial Risk Assessment
          </label>
          <select
            v-model="formData.riskLevel"
            @change="onFieldChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
          >
            <option value="">Select risk level</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
          </select>
          <div class="mt-2">
            <label class="block text-xs text-gray-500 mb-1">Risk Justification</label>
            <textarea
              v-model="formData.riskJustification"
              @input="onFieldChange"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
              placeholder="Briefly explain the risk assessment..."
            ></textarea>
          </div>
        </div>

        <!-- Additional Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            v-model="formData.additionalNotes"
            @input="onFieldChange"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="Any additional information or special considerations..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Form validation summary -->
    <div v-if="validationErrors.length > 0" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <h3 class="text-sm font-medium text-red-800 mb-2">Please address the following issues:</h3>
      <ul class="text-sm text-red-700 list-disc list-inside">
        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <!-- Last saved timestamp -->
    <div class="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
      <div v-if="lastSaved">
        Last saved: {{ formatDateTime(lastSaved) }}
      </div>
      <div v-else>
        Not saved yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { debounce } from '../utils/debounce'
import type { AuditForm } from '@shared/types'

// Props
const props = defineProps<{
  projectId?: number
}>()

// Reactive form data
const formData = ref({
  scope: '',
  objectives: '',
  startDate: '',
  endDate: '',
  auditLead: '',
  teamMembers: '',
  pointOfContact: '',
  legalReferences: '',
  riskLevel: '',
  riskJustification: '',
  additionalNotes: '',
})

// Save state
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)
const saveError = ref<string | null>(null)
const exporting = ref(false)

// Load existing form data on mount
onMounted(async () => {
  if (props.projectId && window.electronAPI) {
    try {
      const result = await window.electronAPI.getForm(props.projectId, 'notice')
      if (result.success && result.data) {
        const savedData = JSON.parse(result.data.form_data || '{}')
        formData.value = { ...formData.value, ...savedData }
        lastSaved.value = new Date(result.data.updated_at || result.data.created_at || Date.now())
      }
    } catch (error) {
      console.error('Failed to load form data:', error)
    }
  }
})

// Validation
const validationErrors = computed(() => {
  const errors: string[] = []
  if (!formData.value.scope.trim()) errors.push('Audit scope is required')
  if (!formData.value.objectives.trim()) errors.push('Audit objectives are required')
  if (!formData.value.startDate) errors.push('Start date is required')
  if (!formData.value.endDate) errors.push('End date is required')
  return errors
})

// Save function with debounce
const saveForm = debounce(async () => {
  if (!props.projectId || !window.electronAPI) return

  // Don't save if there are validation errors
  if (validationErrors.value.length > 0) {
    saveError.value = 'Cannot save with validation errors'
    return
  }

  isSaving.value = true
  saveError.value = null

  try {
    const formPayload = {
      project_id: props.projectId,
      stage: 'notice' as const,
      form_data: JSON.stringify(formData.value)
    }

    const result = await window.electronAPI.saveForm(formPayload)

    if (result.success) {
      lastSaved.value = new Date()
      saveError.value = null
    } else {
      saveError.value = result.error || 'Failed to save form'
    }
  } catch (error: any) {
    saveError.value = error.message || 'Unknown error occurred'
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}, 500)

// Trigger save when fields change
const onFieldChange = () => {
  saveForm()
}

// Save status UI
const saveStatusClass = computed(() => {
  if (isSaving.value) return 'text-blue-600'
  if (saveError.value) return 'text-red-600'
  if (lastSaved.value) return 'text-green-600'
  return 'text-gray-500'
})

const saveStatusText = computed(() => {
  if (isSaving.value) return 'Saving...'
  if (saveError.value) return 'Save failed'
  if (lastSaved.value) return 'Saved'
  return 'Not saved'
})

const saveStatusDotClass = computed(() => {
  if (isSaving.value) return 'bg-blue-600'
  if (saveError.value) return 'bg-red-600'
  if (lastSaved.value) return 'bg-green-600'
  return 'bg-gray-500'
})

// Export to Word function
const exportToWord = async () => {
  if (!window.electronAPI) {
    alert('Electron API not available')
    return
  }

  // Validate required fields
  if (validationErrors.value.length > 0) {
    alert('Please fix validation errors before exporting')
    return
  }

  exporting.value = true

  try {
    // Prepare data for Word template
    const exportData = {
      ...formData.value,
      project_name: `Audit Notice - ${new Date().toLocaleDateString()}`,
      audit_date: new Date().toLocaleDateString(),
      // Format team members as list
      team_members_list: formData.value.teamMembers
        .split(',')
        .map(m => m.trim())
        .filter(m => m)
        .join(', '),
    }

    const result = await window.electronAPI.generateDocument(
      'notice_template.docx',
      exportData,
      `Audit_Notice_${new Date().toISOString().slice(0, 10)}.docx`
    )

    if (result.success && result.data?.filePath) {
      console.log('Document exported to:', result.data.filePath)
      alert(`Document saved successfully:\n${result.data.filePath}`)
    } else {
      throw new Error(result.error || 'Failed to generate document')
    }
  } catch (error: any) {
    console.error('Export error:', error)
    alert(`Export failed: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

// Format date for display
const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Auto-save on component unmount (final save)
onUnmounted(() => {
  if (props.projectId && window.electronAPI) {
    saveForm()
  }
})
</script>

<style scoped>
.audit-notice {
  font-family: 'Inter', sans-serif;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 38, 77, 0.1);
}
</style>