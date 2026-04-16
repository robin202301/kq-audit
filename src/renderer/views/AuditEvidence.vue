<template>
  <div class="audit-evidence">
    <!-- Header with actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Audit Evidence</h2>
        <p class="text-gray-600 mt-1">Evidence gathering and documentation - Issues Management</p>
      </div>
      <div class="flex items-center space-x-3">
        <!-- Save status indicator -->
        <div class="flex items-center text-sm" :class="saveStatusClass">
          <span class="mr-2">{{ saveStatusText }}</span>
          <div class="w-2 h-2 rounded-full animate-pulse" :class="saveStatusDotClass"></div>
        </div>

        <!-- Generate All Papers button -->
        <button
          @click="generateAllPapers"
          class="flex items-center px-4 py-2 bg-gov-navy-700 text-white rounded-lg hover:bg-gov-navy-800 transition-colors"
          :disabled="generatingPapers || issues.length === 0"
        >
          <svg v-if="generatingPapers" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          {{ generatingPapers ? 'Generating...' : `Generate All Papers (${issues.length})` }}
        </button>
      </div>
    </div>

    <!-- Issues management section -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Audit Issues</h3>
        <button
          @click="addNewIssue"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add New Issue
        </button>
      </div>

      <!-- Issues list -->
      <div v-if="issues.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h4 class="text-lg font-medium text-yellow-800 mb-1">No Issues Added</h4>
        <p class="text-yellow-700">Add audit issues to create individual working papers for each finding.</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(issue, index) in issues"
          :key="issue.localId || index"
          class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h4 class="font-medium text-gray-900">Issue #{{ index + 1 }}: {{ issue.title || 'Untitled Issue' }}</h4>
            <button
              @click="removeIssue(index)"
              class="text-red-500 hover:text-red-700 transition-colors"
              :disabled="isSaving"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>

          <!-- Issue form fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Left column -->
            <div class="space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="issue.title"
                  @input="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  placeholder="Brief descriptive title"
                  :disabled="isSaving"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  v-model="issue.description"
                  @input="saveIssue(index)"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  placeholder="Detailed description of the issue"
                  :disabled="isSaving"
                ></textarea>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="issue.category"
                  @change="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  :disabled="isSaving"
                >
                  <option value="evidence">Evidence</option>
                  <option value="finding">Finding</option>
                  <option value="recommendation">Recommendation</option>
                  <option value="action_item">Action Item</option>
                </select>
              </div>
            </div>

            <!-- Right column -->
            <div class="space-y-4">
              <!-- Severity -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  v-model="issue.severity"
                  @change="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  :disabled="isSaving"
                >
                  <option value="">Select severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="issue.status"
                  @change="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  :disabled="isSaving"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <!-- Assigned To -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  v-model="issue.assigned_to"
                  @input="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  placeholder="Person responsible"
                  :disabled="isSaving"
                />
              </div>

              <!-- Due Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  v-model="issue.due_date"
                  @input="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>

          <!-- Save indicator for this issue -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div v-if="issue.saving" class="flex items-center text-sm text-blue-600">
              <div class="w-2 h-2 rounded-full bg-blue-600 animate-pulse mr-2"></div>
              Saving...
            </div>
            <div v-else-if="issue.saveError" class="text-sm text-red-600">
              Save failed: {{ issue.saveError }}
            </div>
            <div v-else-if="issue.id" class="text-sm text-green-600">
              Saved to database (ID: {{ issue.id }})
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generation results -->
    <div v-if="generationResults.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Generation Results</h3>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div class="space-y-2">
          <div
            v-for="(result, index) in generationResults"
            :key="index"
            class="flex items-center justify-between p-2 bg-white rounded border"
          >
            <div class="flex items-center">
              <svg v-if="result.filePath" class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg v-else class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="font-medium">{{ result.issue.title || `Issue ${index + 1}` }}</span>
            </div>
            <div>
              <span v-if="result.filePath" class="text-sm text-green-600">✓ Generated</span>
              <span v-else class="text-sm text-red-600">✗ Failed</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help text -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h4 class="font-medium text-blue-800">How it works</h4>
          <ul class="text-sm text-blue-700 mt-1 space-y-1">
            <li>• Each issue is saved as a separate row in the <code>audit_issues</code> table</li>
            <li>• Issues are linked to the current project by <code>project_id</code></li>
            <li>• Click "Generate All Papers" to create Word documents for each issue</li>
            <li>• Documents are named as <code>[Issue_Title].docx</code></li>
            <li>• Ensure you have <code>working_paper_template.docx</code> in templates folder</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AuditIssue } from '@shared/types'
import { debounce } from '../utils/debounce'

// Props
const props = defineProps<{
  projectId?: number
}>()

// Local type for issue with UI state
interface IssueWithState extends Omit<AuditIssue, 'id' | 'created_at' | 'updated_at'> {
  id?: number
  localId?: string
  saving?: boolean
  saveError?: string
  created_at?: string
  updated_at?: string
}

// Reactive state
const issues = ref<IssueWithState[]>([])
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)
const saveError = ref<string | null>(null)
const generatingPapers = ref(false)
const generationResults = ref<Array<{ issue: any; filePath: string | null }>>([])

// Load existing issues on mount
onMounted(async () => {
  if (props.projectId && window.electronAPI) {
    try {
      const result = await window.electronAPI.listIssues(props.projectId, 'evidence')
      if (result.success && result.data) {
        issues.value = result.data.map((issue: any) => ({
          ...issue,
          localId: `issue-${issue.id || Date.now()}-${Math.random()}`,
          saving: false,
          saveError: undefined
        }))
        lastSaved.value = new Date()
      }
    } catch (error) {
      console.error('Failed to load issues:', error)
    }
  }
})

// Add new issue
function addNewIssue() {
  const newIssue: IssueWithState = {
    localId: `new-${Date.now()}-${Math.random()}`,
    project_id: props.projectId || 0,
    title: '',
    description: '',
    category: 'evidence',
    severity: 'medium',
    status: 'open',
    assigned_to: '',
    due_date: '',
    saving: false,
    saveError: undefined
  }

  issues.value.push(newIssue)
}

// Remove issue
function removeIssue(index: number) {
  const issue = issues.value[index]

  // If issue has been saved to DB, we should delete it
  if (issue.id && window.electronAPI) {
    // Could implement delete functionality here
    console.log('Issue should be deleted from DB:', issue.id)
  }

  issues.value.splice(index, 1)
}

// Save individual issue to database
const saveIssue = debounce(async (index: number) => {
  if (!props.projectId || !window.electronAPI) return

  const issue = issues.value[index]

  // Validation
  if (!issue.title.trim()) {
    issue.saveError = 'Title is required'
    return
  }

  if (!issue.category) {
    issue.saveError = 'Category is required'
    return
  }

  if (!issue.status) {
    issue.saveError = 'Status is required'
    return
  }

  issue.saving = true
  issue.saveError = undefined
  isSaving.value = true

  try {
    // Prepare issue data for DB
    const issueData = {
      project_id: props.projectId,
      form_id: null, // Not linked to specific form for now
      title: issue.title,
      description: issue.description || null,
      category: issue.category,
      severity: issue.severity || null,
      status: issue.status,
      assigned_to: issue.assigned_to || null,
      due_date: issue.due_date || null
    }

    let result

    if (issue.id) {
      // Existing issue - update
      result = await window.electronAPI.updateIssue(issue.id, issueData)
      if (result.success && result.data?.changes) {
        issue.saveError = undefined
        lastSaved.value = new Date()
        saveError.value = null
      } else {
        issue.saveError = result.error || 'Failed to update issue'
        saveError.value = issue.saveError
      }
    } else {
      // New issue - create
      result = await window.electronAPI.createIssue(issueData)
      if (result.success && result.data?.id) {
        issue.id = result.data.id
        issue.saveError = undefined
        lastSaved.value = new Date()
        saveError.value = null
      } else {
        issue.saveError = result.error || 'Failed to save issue'
        saveError.value = issue.saveError
      }
    }
  } catch (error: any) {
    issue.saveError = error.message || 'Unknown error occurred'
    saveError.value = issue.saveError
    console.error('Save issue error:', error)
  } finally {
    issue.saving = false
    isSaving.value = false
  }
}, 500)

// Generate all papers
async function generateAllPapers() {
  if (!props.projectId || !window.electronAPI || issues.value.length === 0) {
    alert('No issues to generate')
    return
  }

  // Validate all issues have titles
  const invalidIssues = issues.value.filter(issue => !issue.title.trim())
  if (invalidIssues.length > 0) {
    alert('Please provide titles for all issues before generating papers')
    return
  }

  generatingPapers.value = true
  generationResults.value = []

  try {
    // First, ensure all issues are saved
    for (const issue of issues.value) {
      if (!issue.id) {
        // Trigger save for unsaved issues
        const index = issues.value.indexOf(issue)
        await saveIssue(index)
        // Wait a bit for save to complete
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Fetch project data for the template
    let projectData = {}
    try {
      const projectResult = await window.electronAPI.getProject(props.projectId)
      if (projectResult.success && projectResult.data) {
        projectData = {
          project_name: projectResult.data.name || `Project ${props.projectId}`,
          project_description: projectResult.data.description || '',
          project_status: projectResult.data.status || 'active'
        }
      }
    } catch (error) {
      console.warn('Could not fetch project data:', error)
      projectData = {
        project_name: `Project ${props.projectId}`,
        project_description: 'Audit evidence collection',
        project_status: 'active'
      }
    }

    // Prepare issues for generation
    const issuesForGeneration = issues.value.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description || '',
      category: issue.category,
      severity: issue.severity || 'medium',
      status: issue.status,
      assigned_to: issue.assigned_to || '',
      due_date: issue.due_date || '',
      created_at: issue.created_at || new Date().toISOString()
    }))

    // Call the Word service
    const result = await window.electronAPI.generateWorkingPapers(
      projectData,
      issuesForGeneration,
      'working_paper_template.docx'
    )

    if (result.success && result.data) {
      generationResults.value = result.data

      // Show success message
      const successful = result.data.filter(r => r.filePath).length
      const failed = result.data.filter(r => !r.filePath).length

      if (successful > 0) {
        alert(`Successfully generated ${successful} working paper${successful !== 1 ? 's' : ''}${failed > 0 ? ` (${failed} failed)` : ''}`)
      } else {
        alert('Failed to generate any working papers. Check console for errors.')
      }
    } else {
      throw new Error(result.error || 'Failed to generate working papers')
    }
  } catch (error: any) {
    console.error('Generate papers error:', error)
    alert(`Failed to generate working papers: ${error.message}`)
  } finally {
    generatingPapers.value = false
  }
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
</script>

<style scoped>
.audit-evidence {
  font-family: 'Inter', sans-serif;
}
</style>