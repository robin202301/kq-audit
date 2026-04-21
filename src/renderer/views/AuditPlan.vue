<template>
  <div class="audit-plan">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">审计计划阶段</h2>
        <p class="text-gray-600 mt-1">审计计划制定与资源配置 - 基于审计计划模板</p>
      </div>
      <div class="flex space-x-3">
        <button
            @click="exportToWord"
            :disabled="!formData.auditObjectives || generatingWord"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="generatingWord">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            正在生成...
          </span>
          <span v-else>导出Word文档</span>
        </button>
        <button
            @click="saveFormData"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="saving">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            保存中...
          </span>
          <span v-else>保存表单数据</span>
        </button>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="mb-8">
      <FileUpload
          label="上传审计计划Word文档"
          :accept="['.docx', '.doc']"
          :max-size="10"
          :show-extract-button="true"
          :extracting="extracting"
          @file-selected="handleFileSelected"
          @extract-content="extractFileContent"
          @file-removed="handleFileRemoved"
      />
    </div>

    <!-- 主要表单区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 左侧：审计计划核心信息 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">审计计划核心信息</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">审计目标</label>
            <textarea
                v-model="formData.auditObjectives"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入审计目标"
                @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">审计范围</label>
            <textarea
                v-model="formData.auditScope"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入审计范围"
                @blur="autoSave"
            />
            <!-- 修复：提示信息放在正确位置 -->
            <div v-if="showAutoFillHint && formData.auditScope" class="mt-1 text-xs text-green-600">
              <svg class="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              已从通知阶段自动填充
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">审计方法</label>
            <textarea
                v-model="formData.auditMethodology"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入审计方法"
                @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">时间安排</label>
            <textarea
                v-model="formData.auditTimeline"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入时间安排"
                @blur="autoSave"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：资源配置与风险评估 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">资源配置与风险评估</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">资源分配</label>
            <textarea
                v-model="formData.resourceAllocation"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入资源分配"
                @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">风险评估</label>
            <textarea
                v-model="formData.riskAssessment"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入风险评估"
                @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">审计组成员</label>
            <textarea
                v-model="formData.auditTeamMembers"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入审计组成员"
                @blur="autoSave"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">审计组长</label>
              <input
                  v-model="formData.teamLeader"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入审计组长"
                  @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">技术专家</label>
              <input
                  v-model="formData.technicalExpert"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入技术专家"
                  @blur="autoSave"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">质量复核人</label>
            <input
                v-model="formData.qualityReviewer"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入质量复核人"
                @blur="autoSave"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 保存状态提示 -->
    <div v-if="lastSaved" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="text-green-700 text-sm">已保存于 {{ lastSaved }}</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <span class="text-red-700 text-sm">{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import FileUpload from '../components/FileUpload.vue'
import type { PlanFormData } from '../../shared/types'
import { useProjectStore } from '../stores/project'

const projectStore = useProjectStore()

// 修复：defineProps 只保留类型，无注释/代码
const props = defineProps<{
  projectId?: number
}>()

// 表单数据
const formData = ref<PlanFormData>({
  auditObjectives: '',
  auditScope: '',
  auditMethodology: '',
  auditTimeline: '',
  resourceAllocation: '',
  riskAssessment: '',
  auditTeamMembers: '',
  teamLeader: '',
  technicalExpert: '',
  qualityReviewer: '',
})

// 状态变量
const saving = ref(false)
const generatingWord = ref(false)
const extracting = ref(false)
const uploadedFile = ref<File | null>(null)
const lastSaved = ref<string | null>(null)
const errorMessage = ref('')
const showAutoFillHint = ref(false)

// 自动保存定时器
let autoSaveTimer: NodeJS.Timeout | null = null

// 自动保存功能
const autoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  autoSaveTimer = setTimeout(() => {
    if (props.projectId) {
      saveFormData()
    }
  }, 2000)
}

// 保存表单数据到数据库
const saveFormData = async () => {
  if (!props.projectId) {
    errorMessage.value = '请先选择一个审计项目'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  saving.value = true
  try {
    const result = await window.electronAPI.saveForm({
      project_id: props.projectId,
      stage: 'plan',
      form_data: JSON.stringify({
        ...formData.value,
        schema_version: '1.0'
      })
    })

    if (result.success) {
      lastSaved.value = new Date().toLocaleString('zh-CN')
      console.log('表单数据已保存')
    } else {
      throw new Error(result.error || '保存失败')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    errorMessage.value = `保存失败: ${error.message}`
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    saving.value = false
  }
}

// 处理文件选择
const handleFileSelected = (file: File) => {
  uploadedFile.value = file
  console.log('文件已选择:', file.name)
}

// 处理文件移除
const handleFileRemoved = () => {
  uploadedFile.value = null
  console.log('文件已移除')
}

// 提取文件内容
const extractFileContent = async () => {
  if (!uploadedFile.value) {
    errorMessage.value = '请先上传Word文档'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  extracting.value = true

  try {
    const arrayBuffer = await uploadedFile.value.arrayBuffer()
    const result = await window.electronAPI.extractDocumentContent(arrayBuffer, 'plan')

    if (result.success) {
      console.log('Word内容提取成功:', result.data)
      errorMessage.value = '内容提取成功，请手动填写相关字段'
      setTimeout(() => { errorMessage.value = '' }, 3000)
    } else {
      throw new Error(result.error || '提取失败')
    }
  } catch (error: any) {
    console.error('提取失败:', error)
    errorMessage.value = `提取失败: ${error.message}`
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    extracting.value = false
  }
}

// 导出Word文档
const exportToWord = async () => {
  if (!props.projectId) {
    errorMessage.value = '请先选择一个审计项目'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  if (!formData.value.auditObjectives) {
    errorMessage.value = '请填写审计目标'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  generatingWord.value = true

  try {
    const result = await window.electronAPI.generateDocument(
        'tpl_audit_plan.doc',
        formData.value,
        `审计计划_${new Date().toISOString().slice(0, 10)}.docx`
    )

    if (result.success && result.data?.filePath) {
      console.log('Word文档已保存:', result.data.filePath)
      errorMessage.value = `文件已保存到: ${result.data.filePath}`
      setTimeout(() => { errorMessage.value = '' }, 5000)
    } else {
      throw new Error('导出失败')
    }
  } catch (error: any) {
    console.error('导出失败:', error)
    errorMessage.value = `导出失败: ${error.message}`
    setTimeout(() => { errorMessage.value = '' }, 5000)
  } finally {
    generatingWord.value = false
  }
}

// 从数据库加载已保存的数据
const loadFormData = async () => {
  if (!props.projectId) return

  try {
    await projectStore.loadNoticeData(props.projectId)

    if (projectStore.extractedProjectName && !formData.value.auditScope) {
      formData.value.auditScope = projectStore.extractedProjectName
      showAutoFillHint.value = true
      console.log("从通知数据中自动填充审计范围:", projectStore.extractedProjectName)
    }

    const result = await window.electronAPI.getForm(props.projectId, "plan")

    if (result.success && result.data) {
      const savedData = JSON.parse(result.data.form_data)
      formData.value = { ...formData.value, ...savedData }
      console.log("表单数据已加载")
    }
  } catch (error) {
    console.error("加载表单数据失败:", error)
  }
}

watch(() => projectStore.extractedProjectName, (projectName) => {
  if (projectName && !formData.value.auditScope) {
    formData.value.auditScope = projectName
    showAutoFillHint.value = true
    console.log("从通知数据中自动填充审计范围:", projectName)
  }
})

watch(() => formData.value.auditScope, (newValue, oldValue) => {
  if (showAutoFillHint.value && oldValue && newValue !== oldValue) {
    showAutoFillHint.value = false
    console.log("用户手动编辑了审计范围，隐藏自动填充提示")
  }
})

watch(() => props.projectId, (newProjectId) => {
  if (newProjectId) {
    loadFormData()
  }
})

onMounted(() => {
  if (props.projectId) {
    loadFormData()
  }
})
</script>

<style scoped>
.audit-plan {
  font-family: 'Inter', sans-serif;
}
</style>