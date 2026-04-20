<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2" v-if="label">
      {{ label }}
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
        :accept="acceptString"
        @change="handleFileSelect"
        class="hidden"
        ref="fileInput"
      />
      <div class="cursor-pointer">
        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="mt-2 text-sm text-gray-600">{{ instructionText }}</p>
        <p class="text-xs text-gray-500">支持 {{ acceptString }} 格式</p>
      </div>
      <div v-if="uploadStatus !== 'idle'" class="mt-4 text-sm">
        <div v-if="uploadStatus === 'uploading'" class="flex items-center justify-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          上传中...
        </div>
        <div v-else-if="uploadStatus === 'success'" class="text-green-600">
          ✓ 上传成功: {{ uploadedFileName }}
        </div>
        <div v-else-if="uploadStatus === 'error'" class="text-red-600">
          ✗ 上传失败: {{ errorMessage }}
        </div>
      </div>
      <div v-if="showExtractButton && uploadedFile" class="mt-4">
        <button
          @click.stop="$emit('extract-content')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
          :disabled="extracting"
        >
          {{ extracting ? '正在提取...' : '智能提取内容' }}
        </button>
      </div>
    </div>

    <!-- 上传的文件信息 -->
    <div v-if="uploadedFile" class="mt-4 p-3 bg-gray-50 rounded-md">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm font-medium text-gray-700">已上传文件</p>
          <p class="text-xs text-gray-500">{{ uploadedFileName }}</p>
          <p class="text-xs text-gray-400">文件大小: {{ formatFileSize(uploadedFile.size) }}</p>
          <p class="text-xs text-gray-400">最后修改: {{ formatFileDate(uploadedFile.lastModified) }}</p>
        </div>
        <div>
          <button
            @click.stop="removeFile"
            class="text-red-600 hover:text-red-800 mr-2"
            type="button"
            title="移除文件"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            v-if="enableViewFile"
            @click.stop="viewFile"
            class="text-blue-600 hover:text-blue-800"
            type="button"
            title="查看文件"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  label?: string
  accept?: string[] // 例如：['.docx', '.doc', '.xlsx', '.xls']
  maxSize?: number // 单位：MB
  showExtractButton?: boolean
  extracting?: boolean
  enableViewFile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  accept: () => ['.docx', '.doc'],
  maxSize: 10, // 10MB
  showExtractButton: true,
  extracting: false,
  enableViewFile: false
})

interface Emits {
  (e: 'file-selected', file: File): void
  (e: 'extract-content'): void
  (e: 'file-removed'): void
}

const emit = defineEmits<Emits>()

// 状态
const uploadedFile = ref<File | null>(null)
const isDragOver = ref(false)
const uploadStatus = ref<'idle' | 'uploading' | 'success' | 'error'>('idle')
const uploadedFileName = ref('')
const errorMessage = ref('')

// 计算属性
const acceptString = computed(() => {
  return props.accept.join(',')
})

const instructionText = computed(() => {
  const fileTypes = props.accept.map(ext => {
    if (ext.includes('doc')) return 'Word文档'
    if (ext.includes('xls')) return 'Excel文件'
    if (ext.includes('pdf')) return 'PDF文档'
    return '文档'
  }).join('、')

  return `点击或拖拽${fileTypes}到此区域`
})

// 文件大小格式化
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 文件日期格式化
const formatFileDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 事件处理
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

const handleFile = (file: File) => {
  // 验证文件扩展名
  const isValidExtension = props.accept.some(ext => {
    return file.name.toLowerCase().endsWith(ext.toLowerCase())
  })

  if (!isValidExtension) {
    errorMessage.value = `请上传${acceptString.value}格式的文件`
    uploadStatus.value = 'error'
    setTimeout(() => { uploadStatus.value = 'idle'; errorMessage.value = '' }, 3000)
    return
  }

  // 验证文件大小
  const maxSizeBytes = props.maxSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    errorMessage.value = `文件大小不能超过${props.maxSize}MB`
    uploadStatus.value = 'error'
    setTimeout(() => { uploadStatus.value = 'idle'; errorMessage.value = '' }, 3000)
    return
  }

  uploadedFile.value = file
  uploadedFileName.value = file.name
  uploadStatus.value = 'uploading'

  try {
    // 模拟上传过程
    setTimeout(() => {
      uploadStatus.value = 'success'
      emit('file-selected', file)
    }, 500)
  } catch (error) {
    console.error('文件上传失败:', error)
    errorMessage.value = '上传失败，请重试'
    uploadStatus.value = 'error'
    setTimeout(() => { uploadStatus.value = 'idle'; errorMessage.value = '' }, 3000)
  }
}

const removeFile = () => {
  uploadedFile.value = null
  uploadedFileName.value = ''
  uploadStatus.value = 'idle'
  emit('file-removed')
}

const viewFile = () => {
  if (uploadedFile.value) {
    // 在实际应用中，这里可以打开文件预览或下载
    console.log('查看文件:', uploadedFile.value.name)
    alert(`文件查看功能：${uploadedFile.value.name}`)
  }
}

// 监听extracting状态变化
watch(() => props.extracting, (newValue) => {
  if (!newValue && uploadStatus.value === 'success') {
    // 提取完成后可以重置状态
  }
})

// 暴露方法给父组件
defineExpose({
  clearFile: removeFile,
  getFile: () => uploadedFile.value
})
</script>

<style scoped>
.file-upload-container {
  cursor: pointer;
}
</style>