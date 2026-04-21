<template>
  <div class="audit-working-paper">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">工作底稿阶段</h2>
        <p class="text-gray-600 mt-1">分析和工作底稿准备 - 基于工作底稿模板</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="exportToWord"
          :disabled="!formData.paperTitle || generatingWord"
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
        label="上传工作底稿Word文档"
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
      <!-- 左侧：工作底稿核心信息 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">工作底稿核心信息</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">底稿标题</label>
            <input
              v-model="formData.paperTitle"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入底稿标题"
              @blur="autoSave"
            />
          </div>
            <div v-if="showAutoFillHint && formData.paperTitle" class="mt-1 text-xs text-green-600">
              <svg class="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              已从通知阶段自动填充
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">审计程序</label>
            <textarea
              v-model="formData.auditProcedure"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入审计程序"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">样本选择</label>
            <textarea
              v-model="formData.sampleSelection"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入样本选择"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分析方法</label>
            <textarea
              v-model="formData.analysisMethod"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入分析方法"
              @blur="autoSave"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：发现和建议 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">发现和建议</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结论</label>
            <textarea
              v-model="formData.conclusions"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入结论"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">发现</label>
            <textarea
              v-model="formData.findings"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入发现"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">建议</label>
            <textarea
              v-model="formData.recommendations"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入建议"
              @blur="autoSave"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">根本原因分析</label>
              <textarea
                v-model="formData.rootCauseAnalysis"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入根本原因分析"
                @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">复核意见</label>
              <textarea
                v-model="formData.reviewerComments"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入复核意见"
                @blur="autoSave"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">质量评级</label>
            <input
              v-model="formData.qualityRating"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入质量评级"
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
import { ref, onMounted, watch, computed } from 'vue'
import FileUpload from '../components/FileUpload.vue'
import { useProjectStore } from '../stores/project'
import type { WorkingPaperFormData } from '../../shared/types'

const props = defineProps<{
  projectId?: number
}>()

// 项目存储 - 用于跨页面数据共享
const projectStore = useProjectStore()

// 表单数据
const formData = ref<WorkingPaperFormData>({
  paperTitle: '',
  auditProcedure: '',
  sampleSelection: '',
  analysisMethod: '',
  conclusions: '',
  findings: '',
  recommendations: '',
  rootCauseAnalysis: '',
  reviewerComments: '',
  qualityRating: '',
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
      stage: 'working_paper',
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
    const result = await window.electronAPI.extractDocumentContent(arrayBuffer, 'working_paper')

    if (result.success) {
      console.log('Word内容提取成功:', result.data)

      // TODO: 根据Word模板结构解析数据并填充表单
      // 这里应该根据tpl_working_paper.docx的结构提取字段并更新formData

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

  if (!formData.value.paperTitle) {
    errorMessage.value = '请填写底稿标题'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  generatingWord.value = true

  try {
    const result = await window.electronAPI.generateDocument(
      'tpl_working_paper.docx',
      formData.value,
      `工作底稿_${formData.value.paperTitle}_${new Date().toISOString().slice(0, 10)}.docx`
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

    // 2. 检查是否有项目名称可以自动填充工作底稿标题
    if (projectStore.extractedProjectName && !formData.value.paperTitle) {
      formData.value.paperTitle = projectStore.extractedProjectName + " 工作底稿"
      showAutoFillHint.value = true
      console.log("从通知数据中自动填充工作底稿标题:", projectStore.extractedProjectName)
    }

    // 3. 加载工作底稿阶段已保存的数据
    const result = await window.electronAPI.getForm(props.projectId, "working_paper")

    if (result.success && result.data) {
      const savedData = JSON.parse(result.data.form_data)
      formData.value = { ...formData.value, ...savedData }
      console.log("表单数据已加载")
    }
  } catch (error) {
    console.error("加载表单数据失败:", error)
  }
}

// 监听项目存储中的通知数据变化，自动填充工作底稿标题
watch(() => projectStore.extractedProjectName, (projectName) => {
  if (projectName && !formData.value.paperTitle) {
    // 自动填充工作底稿标题
    formData.value.paperTitle = projectName + " 工作底稿"
    showAutoFillHint.value = true
    console.log("从通知数据中自动填充工作底稿标题:", projectName)
  }
})

// 监听用户编辑工作底稿标题，隐藏自动填充提示
watch(() => formData.value.paperTitle, (newValue, oldValue) => {
  if (showAutoFillHint.value && oldValue && newValue !== oldValue) {
    showAutoFillHint.value = false
    console.log("用户手动编辑了工作底稿标题，隐藏自动填充提示")
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
.audit-working-paper {
  font-family: 'Inter', sans-serif;
}
</style>