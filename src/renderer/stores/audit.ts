import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AuditStage, AuditCase, StageProgress } from '@shared/types'

export const useAuditStore = defineStore('audit', () => {
  const stages = ref<AuditStage[]>([])
  const cases = ref<AuditCase[]>([])
  const currentCase = ref<AuditCase | null>(null)
  const currentStage = ref<AuditStage | null>(null)

  async function loadStages() {
    if (window.electronAPI) {
      try {
        const data = await window.electronAPI.getAuditStages()
        stages.value = data
      } catch (error) {
        console.error('Failed to load audit stages:', error)
      }
    }
  }

  async function loadCases() {
    // TODO: Implement IPC call to load cases
    cases.value = []
  }

  async function createCase(caseData: Partial<AuditCase>) {
    // TODO: Implement IPC call to create case
    console.log('Creating case:', caseData)
  }

  async function updateCaseProgress(progress: Partial<StageProgress>) {
    // TODO: Implement IPC call to update progress
    console.log('Updating progress:', progress)
  }

  return {
    stages,
    cases,
    currentCase,
    currentStage,
    loadStages,
    loadCases,
    createCase,
    updateCaseProgress
  }
})