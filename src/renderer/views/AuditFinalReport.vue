<template>
  <div class="audit-final-report">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">审计报告阶段</h2>
        <p class="text-gray-600 mt-1">报告生成与签发 - 基于审计报告模板</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="exportToWord"
          :disabled="!formData.reportNumber || generatingWord"
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
        label="上传审计报告Word文档"
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
      <!-- 左侧：报告摘要与总体评价 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">报告摘要与总体评价</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">报告编号</label>
            <input
              v-model="formData.reportNumber"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入报告编号"
              @blur="autoSave"
            />
          </div>
            <div v-if="showAutoFillHint && formData.reportNumber" class="mt-1 text-xs text-green-600">
              <svg class="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              已从通知阶段自动生成
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">执行摘要</label>
            <textarea
              v-model="formData.executiveSummary"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入执行摘要"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">审计意见</label>
            <textarea
              v-model="formData.auditOpinion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入审计意见"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">总体评价</label>
            <textarea
              v-model="formData.overallAssessment"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入总体评价"
              @blur="autoSave"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：详细发现与管理回应 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">详细发现与管理回应</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">主要发现</label>
            <textarea
              v-model="formData.majorFindings"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入主要发现"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">重大事项</label>
            <textarea
              v-model="formData.significantIssues"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入重大事项"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">改进建议</label>
            <textarea
              v-model="formData.recommendations"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入改进建议"
              @blur="autoSave"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">管理回应</label>
              <textarea
                v-model="formData.managementResponse"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入管理回应"
                @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">实施计划</label>
              <textarea
                v-model="formData.implementationPlan"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入实施计划"
                @blur="autoSave"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">签发日期</label>
              <input
                v-model="formData.issueDate"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入签发日期（YYYY-MM-DD）"
                @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">报告期间</label>
              <input
                v-model="formData.reportPeriod"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入报告期间（如：2024年1月-12月）"
                @blur="autoSave"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">后续行动</label>
            <textarea
              v-model="formData.followUpActions"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入后续行动"
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import FileUpload from '../components/FileUpload.vue'
import { useProjectStore } from '../stores/project'
import type { FinalReportFormData } from '../../shared/types'

const props = defineProps<{
  projectId?: number
}>()

// 项目存储 - 用于跨页面数据共享
const projectStore = useProjectStore()

// 表单数据
const formData = ref<FinalReportFormData>({
  executiveSummary: '',
  auditOpinion: '',
  overallAssessment: '',
  majorFindings: '',
  significantIssues: '',
  recommendations: '',
  managementResponse: '',
  implementationPlan: '',
  followUpActions: '',
  reportNumber: '',
  issueDate: '',
  reportPeriod: '',
})

// 状态变量
const saving = ref(false)
const generatingWord = ref(false)
const extracting = ref(false)
const uploadedFile = ref<File | null>(null)
const lastSaved = ref<string | null>(null)
const errorMessage = ref('')
const showAutoFillHint = ref(false) // 显示自动填充提示

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
  }, 2000) // 2秒后自动保存
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
      stage: 'final_report',
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
    // 读取文件为ArrayBuffer
    const arrayBuffer = await uploadedFile.value.arrayBuffer()

    // 调用IPC提取Word内容
    const result = await window.electronAPI.extractDocumentContent(arrayBuffer, 'final_report')

    if (result.success) {
      console.log('Word内容提取成功:', result.data)

      // TODO: 根据Word模板结构解析数据并填充表单
      // 这里应该根据tpl_final_report.docx的结构提取字段并更新formData

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

  if (!formData.value.reportNumber) {
    errorMessage.value = '请填写报告编号'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  generatingWord.value = true

  try {
    const result = await window.electronAPI.generateDocument(
      'tpl_final_report.docx',
      formData.value,
      `审计报告_${formData.value.reportNumber}_${new Date().toISOString().slice(0, 10)}.docx`
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
    // 1. 先加载通知数据到项目存储中
    await projectStore.loadNoticeData(props.projectId)

    // 2. 检查是否有项目名称可以自动生成报告编号
    if (projectStore.extractedProjectName && !formData.value.reportNumber) {
      const currentYear = new Date().getFullYear()
      const projectAbbr = projectStore.extractedProjectName.substring(0, 4)
      formData.value.reportNumber = "REP-" + currentYear + "-" + projectAbbr + "-001"
      showAutoFillHint.value = true
      console.log("从通知数据中自动生成报告编号:", formData.value.reportNumber)
    }

    // 3. 加载最终报告阶段已保存的数据
    const result = await window.electronAPI.getForm(props.projectId, "final_report")

    if (result.success && result.data) {
      const savedData = JSON.parse(result.data.form_data)
      formData.value = { ...formData.value, ...savedData }
      console.log("表单数据已加载")
    }
  } catch (error) {
    console.error("加载表单数据失败:", error)
  }
}

// 监听项目存储中的通知数据变化，自动生成报告编号
watch(() => projectStore.extractedProjectName, (projectName) => {
  if (projectName && !formData.value.reportNumber) {
    // 自动生成报告编号
    const currentYear = new Date().getFullYear()
    const projectAbbr = projectName.substring(0, 4)
    formData.value.reportNumber = "REP-" + currentYear + "-" + projectAbbr + "-001"
    showAutoFillHint.value = true
    console.log("从通知数据中自动生成报告编号:", formData.value.reportNumber)
  }
})

// 监听用户编辑报告编号，隐藏自动填充提示
watch(() => formData.value.reportNumber, (newValue, oldValue) => {
  if (showAutoFillHint.value && oldValue && newValue !== oldValue) {
    showAutoFillHint.value = false
    console.log("用户手动编辑了报告编号，隐藏自动填充提示")
  }
})

// 监听projectId变化
watch(() => props.projectId, (newProjectId) => {
  if (newProjectId) {
    loadFormData()
  }
})

// 组件挂载时加载数据
onMounted(() => {
  if (props.projectId) {
    loadFormData()
  }
})
</script>

<style scoped>
.audit-final-report {
  font-family: 'Inter', sans-serif;
}
</style>