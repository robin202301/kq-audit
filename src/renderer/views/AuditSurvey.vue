<template>
  <div class="audit-survey">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">审计调查阶段</h2>
        <p class="text-gray-600 mt-1">初步调查与数据收集 - 基于被审计单位基本情况调查记录</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="exportToExcel"
          :disabled="!formData.auditeeName || generatingExcel"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <span v-if="generatingExcel">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            正在生成...
          </span>
          <span v-else>导出Excel文件</span>
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
        label="上传调查记录Excel文件"
        :accept="['.xlsx', '.xls']"
        :max-size="20"
        :show-extract-button="true"
        :extracting="extracting"
        @file-selected="handleFileSelected"
        @extract-content="extractFileContent"
        @file-removed="handleFileRemoved"
      />
    </div>

    <!-- 主要表单区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 左侧：被审计单位基本信息 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">被审计单位基本信息</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">被审计单位名称</label>
            <input
              v-model="formData.auditeeName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入被审计单位名称"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input
              v-model="formData.auditeeAddress"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入地址"
              @blur="autoSave"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">联系人</label>
              <input
                v-model="formData.auditeeContact"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入联系人"
                @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <input
                v-model="formData.auditeePhone"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入联系电话"
                @blur="autoSave"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">行业类型</label>
            <input
              v-model="formData.industryType"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入行业类型"
              @blur="autoSave"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">注册资本</label>
              <input
                v-model="formData.registeredCapital"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入注册资本"
                @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">成立日期</label>
              <input
                v-model="formData.establishmentDate"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入成立日期（YYYY-MM-DD）"
                @blur="autoSave"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">法定代表人</label>
            <input
              v-model="formData.legalRepresentative"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入法定代表人"
              @blur="autoSave"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：调查记录信息 -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">调查记录信息</h3>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">调查日期</label>
              <input
                v-model="formData.investigationDate"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入调查日期（YYYY-MM-DD）"
                @blur="autoSave"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">调查地点</label>
              <input
                v-model="formData.investigationLocation"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入调查地点"
                @blur="autoSave"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">调查参与人员</label>
            <textarea
              v-model="formData.investigationParticipants"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入调查参与人员（可多行）"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">调查内容摘要</label>
            <textarea
              v-model="formData.investigationContent"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入调查内容摘要"
              @blur="autoSave"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">主要发现</label>
            <textarea
              v-model="formData.keyFindings"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入主要发现"
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
import type { SurveyFormData } from '../../shared/types'

const props = defineProps<{
  projectId?: number
}>()

// 表单数据
const formData = ref<SurveyFormData>({
  auditeeName: '',
  auditeeAddress: '',
  auditeeContact: '',
  auditeePhone: '',
  industryType: '',
  registeredCapital: '',
  establishmentDate: '',
  legalRepresentative: '',
  investigationDate: '',
  investigationLocation: '',
  investigationParticipants: '',
  investigationContent: '',
  keyFindings: '',
})

// 状态变量
const saving = ref(false)
const generatingExcel = ref(false)
const extracting = ref(false)
const uploadedFile = ref<File | null>(null)
const lastSaved = ref<string | null>(null)
const errorMessage = ref('')

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
      stage: 'survey',
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
    errorMessage.value = '请先上传Excel文件'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  extracting.value = true

  try {
    // 读取文件为ArrayBuffer
    const arrayBuffer = await uploadedFile.value.arrayBuffer()

    // 调用IPC提取Excel内容
    const result = await window.electronAPI.extractExcelContent(arrayBuffer)

    if (result.success) {
      console.log('Excel内容提取成功:', result.data)

      // TODO: 根据Excel模板结构解析数据并填充表单
      // 这里应该根据tpl_investigation_record_auditee_basic_info.xlsx的结构
      // 提取字段并更新formData

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

// 导出Excel文件
const exportToExcel = async () => {
  if (!props.projectId) {
    errorMessage.value = '请先选择一个审计项目'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  if (!formData.value.auditeeName) {
    errorMessage.value = '请填写被审计单位名称'
    setTimeout(() => { errorMessage.value = '' }, 3000)
    return
  }

  generatingExcel.value = true

  try {
    const result = await window.electronAPI.generateExcelDocument(
      'tpl_investigation_record_auditee_basic_info.xlsx',
      formData.value,
      `调查记录_${formData.value.auditeeName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    )

    if (result.success && result.data?.filePath) {
      console.log('Excel文件已保存:', result.data.filePath)
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
    generatingExcel.value = false
  }
}

// 从数据库加载已保存的数据
const loadFormData = async () => {
  if (!props.projectId) return

  try {
    const result = await window.electronAPI.getForm(props.projectId, 'survey')

    if (result.success && result.data) {
      const savedData = JSON.parse(result.data.form_data)
      formData.value = { ...formData.value, ...savedData }
      console.log('表单数据已加载')
    }
  } catch (error) {
    console.error('加载表单数据失败:', error)
  }
}

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
.audit-survey {
  font-family: 'Inter', sans-serif;
}
</style>