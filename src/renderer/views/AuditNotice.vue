<template>
  <div class="audit-notice">
    <!-- 头部状态和操作 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">审计通知书</h2>
        <p class="text-gray-600 mt-1">初始审计通知和范围定义</p>
      </div>
      <div class="flex items-center space-x-3">
        <!-- 保存状态指示器 -->
        <div class="flex items-center text-sm" :class="saveStatusClass">
          <span class="mr-2">{{ saveStatusText }}</span>
          <div class="w-2 h-2 rounded-full animate-pulse" :class="saveStatusDotClass"></div>
        </div>

        <!-- 导出Word按钮 -->
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
          {{ exporting ? '正在导出...' : '导出Word文档' }}
        </button>
      </div>
    </div>

    <!-- 表单字段 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧列 -->
      <div class="space-y-6">
        <!-- 通知书标题 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            通知书标题 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="formData.noticeTitle"
            @input="onFieldChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="关于XXX审计的通知"
          />
          <p class="mt-1 text-sm text-gray-500">例如：关于2024年财务审计的通知</p>
        </div>

        <!-- 通知内容 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            通知内容 <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="formData.noticeContent"
            @input="onFieldChange"
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="请在此输入通知的具体内容..."
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">详细说明审计的目的、范围和要求</p>
        </div>

        <!-- 附件文件名 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            附件文件名 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="formData.attachmentFileName"
            @input="onFieldChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="审计通知书附件.docx"
          />
          <p class="mt-1 text-sm text-gray-500">填写附件文件的完整名称</p>
        </div>

        <!-- 日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            日期 <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            v-model="formData.noticeDate"
            @input="onFieldChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
          />
          <p class="mt-1 text-sm text-gray-500">通知书的发布日期</p>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="space-y-6">
        <!-- 抄送 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            抄送
          </label>
          <div class="space-y-2">
            <div v-for="(recipient, index) in formData.ccRecipients" :key="index" class="flex items-center">
              <input
                type="text"
                v-model="formData.ccRecipients[index]"
                @input="onFieldChange"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
                :placeholder="`抄送单位 ${index + 1}`"
              />
              <button
                @click="removeCcRecipient(index)"
                class="ml-2 p-2 text-red-600 hover:text-red-800"
                type="button"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <button
            @click="addCcRecipient"
            class="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            type="button"
          >
            + 添加抄送单位
          </button>
          <p class="mt-1 text-sm text-gray-500">可添加多个抄送单位</p>
        </div>

        <!-- 印发机关 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            印发机关 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="formData.issuingAuthority"
            @input="onFieldChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="审计机关名称"
          />
          <p class="mt-1 text-sm text-gray-500">负责印发通知书的机关名称</p>
        </div>

        <!-- 印发日期 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            印发日期 <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            v-model="formData.issuingDate"
            @input="onFieldChange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gov-navy-500 focus:border-gov-navy-500"
            placeholder="****年**月**日印发"
          />
          <p class="mt-1 text-sm text-gray-500">格式：****年**月**日印发，例如：2024年12月31日印发</p>
        </div>

        <!-- 文件上传区域 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            文件上传
          </label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors"
            :class="{
              'border-blue-500 bg-blue-50': isDragOver,
              'border-gray-300': !isDragOver
            }"
            @dragover.prevent="onDragOver"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              type="file"
              accept=".docx,.doc"
              @change="handleFileSelect"
              class="hidden"
              ref="fileInput"
            />
            <div class="cursor-pointer">
              <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="mt-2 text-sm text-gray-600">点击或拖拽Word文档到此区域</p>
              <p class="text-xs text-gray-500">支持 .docx 和 .doc 格式</p>
            </div>
            <div v-if="uploadStatus" class="mt-4 text-sm">
              <div v-if="uploadStatus === 'uploading'" class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                上传中...
              </div>
              <div v-else-if="uploadStatus === 'success'" class="text-green-600">
                ✓ 上传成功: {{ uploadedFileName }}
              </div>
              <div v-else-if="uploadStatus === 'error'" class="text-red-600">
                ✗ 上传失败
              </div>
            </div>
            <button
              v-if="uploadedFile"
              @click.stop="extractContent"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              :disabled="extracting"
            >
              {{ extracting ? '正在提取...' : '智能提取内容' }}
            </button>
          </div>
          <p class="mt-1 text-sm text-gray-500">上传Word文档后，系统可智能提取内容填充表单</p>

          <!-- 上传的文件信息 -->
          <div v-if="formData.uploadedFile" class="mt-4 p-3 bg-gray-50 rounded-md">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-gray-700">已上传文件</p>
                <p class="text-xs text-gray-500">{{ formData.uploadedFile.originalName }}</p>
                <p class="text-xs text-gray-400">上传时间：{{ formData.uploadedFile.uploadDate }}</p>
              </div>
              <button
                @click="removeUploadedFile"
                class="text-red-600 hover:text-red-800"
                type="button"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表单验证摘要 -->
    <div v-if="validationErrors.length > 0" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <h3 class="text-sm font-medium text-red-800 mb-2">请解决以下问题：</h3>
      <ul class="text-sm text-red-700 list-disc list-inside">
        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <!-- 最后保存时间戳 -->
    <div class="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
      <div v-if="lastSaved">
        最后保存: {{ formatDateTime(lastSaved) }}
      </div>
      <div v-else>
        尚未保存
      </div>
    </div>

    <!-- 提取结果模态框 -->
    <div v-if="showExtractResult" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">文档内容提取结果</h3>
          <div v-if="extractResult" class="mb-6">
            <div v-if="extractResult.success" class="mb-4">
              <div class="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                <p class="text-green-700">✓ 成功从文档中提取内容，已自动填充到表单</p>
              </div>
              <div class="space-y-3">
                <div v-for="(field, key) in extractResult.extractedFields" :key="key" class="border-b pb-3">
                  <p class="text-sm font-medium text-gray-700">{{ getFieldLabel(key) }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ field }}</p>
                </div>
              </div>
            </div>
            <div v-else class="mb-4">
              <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <p class="text-yellow-700">⚠️ 无法自动提取表单字段，请从下方原始文本中手动复制内容</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700 mb-2">原始文本内容：</p>
                <div class="p-3 bg-gray-50 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                  <pre class="text-sm text-gray-800 whitespace-pre-wrap">{{ extractResult.rawText }}</pre>
                </div>
                <p class="text-sm text-gray-500 mt-2">请从上方文本中复制相关内容到对应的表单字段</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end pt-4 border-t">
            <button
              @click="showExtractResult = false"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { debounce } from '../utils/debounce'
import type { AuditForm, NoticeFormData } from '@shared/types'

// Props
const props = defineProps<{
  projectId?: number
}>()

// 反应式表单数据
const formData = ref<NoticeFormData>({
  noticeTitle: '',
  noticeContent: '',
  attachmentFileName: '',
  noticeDate: '',
  ccRecipients: [],
  issuingAuthority: '',
  issuingDate: '',
  schema_version: '1.0'
})

// 文件上传状态
const uploadedFile = ref<File | null>(null)
const isDragOver = ref(false)
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
const uploadedFileName = ref('')
const extracting = ref(false)
const extractResult = ref<{
  success: boolean
  extractedFields?: Record<string, string>
  rawText?: string
} | null>(null)
const showExtractResult = ref(false)

// 保存状态
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)
const saveError = ref<string | null>(null)
const exporting = ref(false)

// 加载现有的表单数据
onMounted(async () => {
  if (props.projectId && window.electronAPI) {
    try {
      const result = await window.electronAPI.getForm(props.projectId, 'notice')
      if (result.success && result.data) {
        const savedData = JSON.parse(result.data.form_data || '{}')

        // 数据迁移：如果保存的是旧格式数据，转换为新格式
        if (!savedData.schema_version || savedData.schema_version === '1.0') {
          // 已经是新格式
          formData.value = { ...formData.value, ...savedData }
        } else {
          // 旧格式数据迁移
          formData.value = migrateOldData(savedData)
        }

        lastSaved.value = new Date(result.data.updated_at || result.data.created_at || Date.now())
      }
    } catch (error) {
      console.error('加载表单数据失败:', error)
    }
  }
})

// 验证
const validationErrors = computed(() => {
  const errors: string[] = []
  if (!formData.value.noticeTitle.trim()) errors.push('通知书标题是必填项')
  if (!formData.value.noticeContent.trim()) errors.push('通知内容是必填项')
  if (!formData.value.attachmentFileName.trim()) errors.push('附件文件名是必填项')
  if (!formData.value.noticeDate) errors.push('日期是必填项')
  if (!formData.value.issuingAuthority.trim()) errors.push('印发机关是必填项')
  if (!formData.value.issuingDate.trim()) errors.push('印发日期是必填项')
  return errors
})

// 保存函数（防抖）
const saveForm = debounce(async () => {
  if (!props.projectId || !window.electronAPI) return

  // 如果有验证错误，不保存
  if (validationErrors.value.length > 0) {
    saveError.value = '存在验证错误，无法保存'
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
      saveError.value = result.error || '保存表单失败'
    }
  } catch (error: any) {
    saveError.value = error.message || '发生未知错误'
    console.error('保存错误:', error)
  } finally {
    isSaving.value = false
  }
}, 500)

// 字段变化时触发保存
const onFieldChange = () => {
  saveForm()
}

// 添加抄送单位
const addCcRecipient = () => {
  formData.value.ccRecipients.push('')
  onFieldChange()
}

// 移除抄送单位
const removeCcRecipient = (index: number) => {
  formData.value.ccRecipients.splice(index, 1)
  onFieldChange()
}

// 文件上传处理
const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
  isDragOver.value = false
}

const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files.length) {
    handleFile(event.dataTransfer.files[0])
  }
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    handleFile(input.files[0])
  }
}

const handleFile = async (file: File) => {
  if (!file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.doc')) {
    alert('请上传.docx或.doc格式的Word文档')
    return
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB限制
    alert('文件大小不能超过10MB')
    return
  }

  uploadedFile.value = file
  uploadedFileName.value = file.name
  uploadStatus.value = 'uploading'

  try {
    // TODO: 实际项目中需要实现文件上传到服务器的逻辑
    // 这里暂时模拟上传成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 保存文件信息到表单数据
    formData.value.uploadedFile = {
      originalName: file.name,
      savedPath: '', // 实际项目中这里应该是服务器返回的文件路径
      uploadDate: new Date().toLocaleString('zh-CN')
    }

    uploadStatus.value = 'success'
    onFieldChange() // 触发保存
  } catch (error) {
    console.error('文件上传失败:', error)
    uploadStatus.value = 'error'
  }
}

// 智能提取内容
const extractContent = async () => {
  if (!uploadedFile.value || !window.electronAPI) {
    alert('请先上传Word文档')
    return
  }

  extracting.value = true

  try {
    // 将文件转换为ArrayBuffer
    const arrayBuffer = await uploadedFile.value.arrayBuffer()

    // 调用主进程的智能提取功能
    const result = await window.electronAPI.extractNoticeContent(arrayBuffer)

    if (result.success) {
      extractResult.value = {
        success: true,
        extractedFields: result.data.extractedFields || {},
        rawText: result.data.rawText || ''
      }

      // 自动填充表单字段
      if (result.data.extractedFields) {
        Object.keys(result.data.extractedFields).forEach(key => {
          if (key in formData.value) {
            // @ts-ignore - 动态属性访问
            formData.value[key] = result.data.extractedFields[key]
          }
        })
        onFieldChange() // 触发保存
      }
    } else {
      extractResult.value = {
        success: false,
        rawText: result.data?.rawText || '无法提取文本内容'
      }
    }

    showExtractResult.value = true
  } catch (error: any) {
    console.error('内容提取失败:', error)
    extractResult.value = {
      success: false,
      rawText: error.message || '提取过程发生错误'
    }
    showExtractResult.value = true
  } finally {
    extracting.value = false
  }
}

// 移除已上传的文件
const removeUploadedFile = () => {
  uploadedFile.value = null
  uploadedFileName.value = ''
  uploadStatus.value = 'idle'
  formData.value.uploadedFile = undefined
  onFieldChange() // 触发保存
}

// 获取字段标签
const getFieldLabel = (key: string): string => {
  const labels: Record<string, string> = {
    noticeTitle: '通知书标题',
    noticeContent: '通知内容',
    attachmentFileName: '附件文件名',
    noticeDate: '日期',
    issuingAuthority: '印发机关',
    issuingDate: '印发日期'
  }
  return labels[key] || key
}

// 数据迁移函数
const migrateOldData = (oldData: any): NoticeFormData => {
  return {
    noticeTitle: oldData.scope || '',
    noticeContent: oldData.objectives || '',
    attachmentFileName: '',
    noticeDate: oldData.startDate || '',
    ccRecipients: [],
    issuingAuthority: '',
    issuingDate: '',
    _original: oldData,
    schema_version: '1.0'
  }
}

// 保存状态UI
const saveStatusClass = computed(() => {
  if (isSaving.value) return 'text-blue-600'
  if (saveError.value) return 'text-red-600'
  if (lastSaved.value) return 'text-green-600'
  return 'text-gray-500'
})

const saveStatusText = computed(() => {
  if (isSaving.value) return '保存中...'
  if (saveError.value) return '保存失败'
  if (lastSaved.value) return '已保存'
  return '未保存'
})

const saveStatusDotClass = computed(() => {
  if (isSaving.value) return 'bg-blue-600'
  if (saveError.value) return 'bg-red-600'
  if (lastSaved.value) return 'bg-green-600'
  return 'bg-gray-500'
})

// 导出Word文档函数
const exportToWord = async () => {
  if (!window.electronAPI) {
    alert('Electron API不可用')
    return
  }

  // 验证必填字段
  if (validationErrors.value.length > 0) {
    alert('请在导出前修复验证错误')
    return
  }

  exporting.value = true

  try {
    // 获取项目信息以生成项目编号
    let projectNumber = '未编号'
    let projectName = '未命名项目'

    if (props.projectId) {
      const projectResult = await window.electronAPI.getProject(props.projectId)
      if (projectResult.success && projectResult.data) {
        projectName = projectResult.data.name
        // TODO: 实际项目中需要从项目信息中获取项目编号
        // 这里暂时使用项目ID作为编号
        projectNumber = `KQQ${new Date().getFullYear()}${String(props.projectId).padStart(4, '0')}`
      }
    }

    // 准备Word模板数据
    const exportData = {
      ...formData.value,
      project_number: projectNumber,
      project_name: projectName,
      cc_recipients_list: formData.value.ccRecipients.filter(r => r.trim()).join('、'),
      export_date: new Date().toLocaleDateString('zh-CN'),
      audit_stage: 'Notice',
      generated_by: 'KQQ审计系统'
    }

    // 导出文件名：审计通知书_项目编号.docx
    const exportFileName = `审计通知书_${projectNumber}.docx`

    const result = await window.electronAPI.generateDocument(
      'tpl_audit_notice.docx',
      exportData,
      exportFileName
    )

    if (result.success && result.data?.filePath) {
      console.log('文档导出到:', result.data.filePath)
      alert(`文档保存成功:\n${result.data.filePath}`)
    } else {
      throw new Error(result.error || '生成文档失败')
    }
  } catch (error: any) {
    console.error('导出错误:', error)
    alert(`导出失败: ${error.message}`)
  } finally {
    exporting.value = false
  }
}

// 格式化日期显示
const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件卸载时自动保存（最终保存）
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