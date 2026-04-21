<template>
  <div class="audit-evidence">
    <!-- Header with actions -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">审计证据阶段</h2>
        <p class="text-gray-600 mt-1">证据收集与管理 - 问题管理与文档生成</p>
      </div>
      <div class="flex items-center space-x-3">
        <!-- 保存状态指示器 -->
        <div class="flex items-center text-sm" :class="saveStatusClass">
          <span class="mr-2">{{ saveStatusText }}</span>
          <div class="w-2 h-2 rounded-full animate-pulse" :class="saveStatusDotClass"></div>
        </div>
      </div>
    </div>

    <!-- 文件上传区域 -->
    <div class="mb-8">
      <FileUpload
        label="上传审计证据Word文档"
        :accept="['.docx', '.doc']"
        :max-size="20"
        :show-extract-button="true"
        :extracting="extracting"
        @file-selected="handleEvidenceFileSelected"
        @extract-content="extractEvidenceFileContent"
        @file-removed="handleEvidenceFileRemoved"
      />
    </div>

    <!-- 证据基本信息表单 -->
    <div class="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">证据基本信息</h3>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左侧：证据核心信息 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">证据标题 <span class="text-red-500">*</span></label>
            <input
              v-model="evidenceFormData.evidenceTitle"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入证据标题"
              @blur="saveEvidenceFormData"
            />
            <div v-if="showAutoFillHint && evidenceFormData.evidenceTitle" class="mt-1 text-xs text-green-600">
              <svg class="inline-block w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              已从通知阶段自动填充
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">证据类型</label>
            <select
              v-model="evidenceFormData.evidenceType"
              @change="saveEvidenceFormData"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择证据类型</option>
              <option value="document">文档</option>
              <option value="screenshot">截图</option>
              <option value="recording">录音</option>
              <option value="video">视频</option>
              <option value="email">邮件</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">证据来源</label>
            <input
              v-model="evidenceFormData.evidenceSource"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入证据来源"
              @blur="saveEvidenceFormData"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">收集日期</label>
            <input
              v-model="evidenceFormData.collectionDate"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入收集日期（YYYY-MM-DD）"
              @blur="saveEvidenceFormData"
            />
          </div>
        </div>

        <!-- 右侧：证据详细信息 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">收集方法</label>
            <select
              v-model="evidenceFormData.collectionMethod"
              @change="saveEvidenceFormData"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择收集方法</option>
              <option value="interview">访谈</option>
              <option value="observation">观察</option>
              <option value="document_review">文档审查</option>
              <option value="system_log">系统日志</option>
              <option value="inspection">检查</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">证据描述</label>
            <textarea
              v-model="evidenceFormData.evidenceDescription"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入证据描述"
              @blur="saveEvidenceFormData"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">相关发现问题</label>
              <input
                v-model="evidenceFormData.relatedFinding"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入相关问题"
                @blur="saveEvidenceFormData"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">重要性等级</label>
              <select
                v-model="evidenceFormData.importanceLevel"
                @change="saveEvidenceFormData"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择重要性</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="critical">关键</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">相关审计事项</label>
            <select
              v-model="evidenceFormData.relatedAuditItem"
              @change="saveEvidenceFormData"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择相关审计事项</option>
              <option v-for="(item, index) in projectStore.allAuditItems" :key="index" :value="item">
                {{ item }}
              </option>
            </select>
            <p class="mt-1 text-sm text-gray-500" v-if="projectStore.allAuditItems.length === 0">
              通知单中尚未提取审计事项，请在通知单页面先保存通知数据
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">相关法规要求</label>
            <input
              v-model="evidenceFormData.relatedRequirement"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入相关法规要求"
              @blur="saveEvidenceFormData"
            />
          </div>
        </div>
      </div>

      <!-- 表单操作按钮 -->
      <div class="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
        <button
          @click="exportEvidenceToWord"
          :disabled="!evidenceFormData.evidenceTitle || generatingWord"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="generatingWord">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            正在生成...
          </span>
          <span v-else class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            导出证据文档
          </span>
        </button>
      </div>
    </div>

    <!-- 问题管理区域 -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">审计问题管理</h3>
          <p class="text-gray-600 text-sm mt-1">管理审计发现的问题、建议和行动项</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="generateAllPapers"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            :disabled="generatingPapers || issues.length === 0"
          >
            <svg v-if="generatingPapers" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            {{ generatingPapers ? '正在生成...' : `生成所有工作底稿 (${issues.length})` }}
          </button>
          <button
            @click="addNewIssue"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            添加新问题
          </button>
        </div>
      </div>

      <!-- 问题列表 -->
      <div v-if="issues.length === 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h4 class="text-lg font-medium text-yellow-800 mb-1">暂无审计问题</h4>
        <p class="text-yellow-700">添加审计问题以创建相应的工作底稿。</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="(issue, index) in issues"
          :key="issue.localId || index"
          class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <h4 class="font-medium text-gray-900">问题 #{{ index + 1 }}: {{ issue.title || '未命名问题' }}</h4>
            <button
              @click="removeIssue(index)"
              class="text-red-500 hover:text-red-700 transition-colors"
              :disabled="isSaving"
              title="删除问题"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>

          <!-- 问题表单字段 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 左侧列 -->
            <div class="space-y-4">
              <!-- 标题 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  问题标题 <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  v-model="issue.title"
                  @input="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="简短描述性标题"
                  :disabled="isSaving"
                />
              </div>

              <!-- 描述 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  问题描述
                </label>
                <textarea
                  v-model="issue.description"
                  @input="saveIssue(index)"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="详细问题描述"
                  :disabled="isSaving"
                ></textarea>
              </div>

              <!-- 类别 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  类别 <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="issue.category"
                  @change="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="isSaving"
                >
                  <option value="evidence">证据</option>
                  <option value="finding">发现</option>
                  <option value="recommendation">建议</option>
                  <option value="action_item">行动项</option>
                </select>
              </div>
            </div>

            <!-- 右侧列 -->
            <div class="space-y-4">
              <!-- 严重程度 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  严重程度
                </label>
                <select
                  v-model="issue.severity"
                  @change="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="isSaving"
                >
                  <option value="">选择严重程度</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                  <option value="critical">关键</option>
                </select>
              </div>

              <!-- 状态 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  状态 <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="issue.status"
                  @change="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="isSaving"
                >
                  <option value="open">待处理</option>
                  <option value="in_progress">处理中</option>
                  <option value="resolved">已解决</option>
                  <option value="closed">已关闭</option>
                </select>
              </div>

              <!-- 负责人 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  负责人
                </label>
                <input
                  type="text"
                  v-model="issue.assigned_to"
                  @input="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="负责人姓名"
                  :disabled="isSaving"
                />
              </div>

              <!-- 截止日期 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  截止日期
                </label>
                <input
                  type="date"
                  v-model="issue.due_date"
                  @input="saveIssue(index)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>

          <!-- 保存状态指示器 -->
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div v-if="issue.saving" class="flex items-center text-sm text-blue-600">
              <div class="w-2 h-2 rounded-full bg-blue-600 animate-pulse mr-2"></div>
              正在保存...
            </div>
            <div v-else-if="issue.saveError" class="text-sm text-red-600">
              保存失败: {{ issue.saveError }}
            </div>
            <div v-else-if="issue.id" class="text-sm text-green-600">
              已保存到数据库 (ID: {{ issue.id }})
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成结果 -->
    <div v-if="generationResults.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">文档生成结果</h3>
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
              <span class="font-medium">{{ result.issue.title || `问题 ${index + 1}` }}</span>
            </div>
            <div>
              <span v-if="result.filePath" class="text-sm text-green-600">✓ 已生成</span>
              <span v-else class="text-sm text-red-600">✗ 生成失败</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助信息 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h4 class="font-medium text-blue-800">使用说明</h4>
          <ul class="text-sm text-blue-700 mt-1 space-y-1">
            <li>• 每个问题将保存到 <code>audit_issues</code> 数据库表中</li>
            <li>• 问题通过 <code>project_id</code> 链接到当前项目</li>
            <li>• 点击"生成所有工作底稿"为每个问题创建Word文档</li>
            <li>• 文档命名为 <code>[问题标题].docx</code></li>
            <li>• 确保 <code>tpl_audit_evidence.docx</code> 模板文件在模板文件夹中</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import FileUpload from '../components/FileUpload.vue'
import { useProjectStore } from '../stores/project'
import type { EvidenceFormData, AuditIssue } from '../../shared/types'
import { debounce } from '../utils/debounce'

// Props
const props = defineProps<{
  projectId?: number
}>()

// 项目存储（用于访问通知单数据和审计事项）
const projectStore = useProjectStore()

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
const evidenceFormData = ref<EvidenceFormData>({
  evidenceTitle: '',
  evidenceType: '',
  evidenceSource: '',
  collectionDate: '',
  collectionMethod: '',
  evidenceDescription: '',
  relatedFinding: '',
  relatedAuditItem: '',
  relatedRequirement: '',
  importanceLevel: '',
})

const issues = ref<IssueWithState[]>([])
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)
const saveError = ref<string | null>(null)
const generatingPapers = ref(false)
const generatingWord = ref(false)
const extracting = ref(false)
const generationResults = ref<Array<{ issue: any; filePath: string | null }>>([])
const evidenceFile = ref<File | null>(null)
const showAutoFillHint = ref(false) // 显示自动填充提示

// 自动保存定时器
let evidenceAutoSaveTimer: NodeJS.Timeout | null = null

// 自动保存证据表单数据
const autoSaveEvidenceFormData = () => {
  if (evidenceAutoSaveTimer) {
    clearTimeout(evidenceAutoSaveTimer)
  }

  evidenceAutoSaveTimer = setTimeout(() => {
    if (props.projectId) {
      saveEvidenceFormData()
    }
  }, 2000) // 2秒后自动保存
}

// 保存证据表单数据到数据库
const saveEvidenceFormData = async () => {
  if (!props.projectId) {
    saveError.value = '请先选择一个审计项目'
    setTimeout(() => { saveError.value = null }, 3000)
    return
  }

  if (!evidenceFormData.value.evidenceTitle) {
    saveError.value = '请填写证据标题'
    setTimeout(() => { saveError.value = null }, 3000)
    return
  }

  isSaving.value = true

  try {
    const result = await window.electronAPI.saveForm({
      project_id: props.projectId,
      stage: 'evidence',
      form_data: JSON.stringify({
        ...evidenceFormData.value,
        schema_version: '1.0'
      })
    })

    if (result.success) {
      lastSaved.value = new Date()
      saveError.value = null
      console.log('证据表单数据已保存')
    } else {
      throw new Error(result.error || '保存失败')
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    saveError.value = `保存失败: ${error.message}`
    setTimeout(() => { saveError.value = null }, 5000)
  } finally {
    isSaving.value = false
  }
}

// 处理证据文件选择
const handleEvidenceFileSelected = (file: File) => {
  evidenceFile.value = file
  console.log('证据文件已选择:', file.name)
}

// 处理证据文件移除
const handleEvidenceFileRemoved = () => {
  evidenceFile.value = null
  console.log('证据文件已移除')
}

// 提取证据文件内容
const extractEvidenceFileContent = async () => {
  if (!evidenceFile.value) {
    saveError.value = '请先上传Word文档'
    setTimeout(() => { saveError.value = null }, 3000)
    return
  }

  extracting.value = true

  try {
    // 读取文件为ArrayBuffer
    const arrayBuffer = await evidenceFile.value.arrayBuffer()

    // 调用IPC提取Word内容
    const result = await window.electronAPI.extractDocumentContent(arrayBuffer, 'evidence')

    if (result.success) {
      console.log('证据文件内容提取成功:', result.data)

      // TODO: 根据证据模板结构解析数据并填充表单
      // 这里应该根据tpl_audit_evidence.docx的结构提取字段并更新evidenceFormData

      saveError.value = '内容提取成功，请手动填写相关字段'
      setTimeout(() => { saveError.value = null }, 3000)
    } else {
      throw new Error(result.error || '提取失败')
    }
  } catch (error: any) {
    console.error('提取失败:', error)
    saveError.value = `提取失败: ${error.message}`
    setTimeout(() => { saveError.value = null }, 5000)
  } finally {
    extracting.value = false
  }
}

// 导出证据文档
const exportEvidenceToWord = async () => {
  if (!props.projectId) {
    saveError.value = '请先选择一个审计项目'
    setTimeout(() => { saveError.value = null }, 3000)
    return
  }

  if (!evidenceFormData.value.evidenceTitle) {
    saveError.value = '请填写证据标题'
    setTimeout(() => { saveError.value = null }, 3000)
    return
  }

  generatingWord.value = true

  try {
    const result = await window.electronAPI.generateDocument(
      'tpl_audit_evidence.docx',
      evidenceFormData.value,
      `审计证据_${evidenceFormData.value.evidenceTitle}_${new Date().toISOString().slice(0, 10)}.docx`
    )

    if (result.success && result.data?.filePath) {
      console.log('证据文档已保存:', result.data.filePath)
      saveError.value = `文件已保存到: ${result.data.filePath}`
      setTimeout(() => { saveError.value = null }, 5000)
    } else {
      throw new Error('导出失败')
    }
  } catch (error: any) {
    console.error('导出失败:', error)
    saveError.value = `导出失败: ${error.message}`
    setTimeout(() => { saveError.value = null }, 5000)
  } finally {
    generatingWord.value = false
  }
}

// 从数据库加载已保存的证据表单数据
const loadEvidenceFormData = async () => {
  if (!props.projectId) return

  try {
    // 1. 先加载通知数据到项目存储中
    await projectStore.loadNoticeData(props.projectId)

    // 2. 自动填充证据标题（基于项目名称）
    if (projectStore.extractedProjectName && !evidenceFormData.value.evidenceTitle) {
      evidenceFormData.value.evidenceTitle = `${projectStore.extractedProjectName}审计证据`
      showAutoFillHint.value = true
      console.log('从通知数据中自动填充证据标题:', evidenceFormData.value.evidenceTitle)
    }

    // 3. 自动选择第一个审计事项（如果有）
    if (projectStore.allAuditItems.length > 0 && !evidenceFormData.value.relatedAuditItem) {
      evidenceFormData.value.relatedAuditItem = projectStore.allAuditItems[0]
      console.log('自动选择第一个审计事项:', evidenceFormData.value.relatedAuditItem)
    }

    // 4. 加载证据阶段已保存的数据
    const result = await window.electronAPI.getForm(props.projectId, 'evidence')

    if (result.success && result.data) {
      const savedData = JSON.parse(result.data.form_data)
      evidenceFormData.value = { ...evidenceFormData.value, ...savedData }
      console.log('证据表单数据已加载')
    }
  } catch (error) {
    console.error('加载证据表单数据失败:', error)
  }
}

// 监听表单字段变化
watch(() => evidenceFormData.value, () => {
  autoSaveEvidenceFormData()
}, { deep: true })

// 监听项目存储中的项目名称变化，自动填充证据标题
watch(() => projectStore.extractedProjectName, (projectName) => {
  if (projectName && !evidenceFormData.value.evidenceTitle) {
    // 自动填充证据标题
    evidenceFormData.value.evidenceTitle = `${projectName}审计证据`
    showAutoFillHint.value = true
    console.log('从通知数据中自动填充证据标题:', evidenceFormData.value.evidenceTitle)
  }
})

// 监听项目存储中的审计事项变化，自动选择第一个
watch(() => projectStore.allAuditItems, (auditItems) => {
  if (auditItems.length > 0 && !evidenceFormData.value.relatedAuditItem) {
    evidenceFormData.value.relatedAuditItem = auditItems[0]
    console.log('自动选择第一个审计事项:', evidenceFormData.value.relatedAuditItem)
  }
})

// 监听用户编辑证据标题，隐藏自动填充提示
watch(() => evidenceFormData.value.evidenceTitle, (newValue, oldValue) => {
  if (showAutoFillHint.value && oldValue && newValue !== oldValue) {
    showAutoFillHint.value = false
    console.log('用户手动编辑了证据标题，隐藏自动填充提示')
  }
})

// Load existing issues on mount
onMounted(async () => {
  if (props.projectId && window.electronAPI) {
    try {
      // 加载证据表单数据
      await loadEvidenceFormData()

      // 加载问题数据
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
      console.error('Failed to load data:', error)
    }
  }
})

// 监听projectId变化
watch(() => props.projectId, (newProjectId) => {
  if (newProjectId) {
    loadEvidenceFormData()
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
    issue.saveError = '标题不能为空'
    return
  }

  if (!issue.category) {
    issue.saveError = '请选择问题类别'
    return
  }

  if (!issue.status) {
    issue.saveError = '请选择问题状态'
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
        issue.saveError = result.error || '更新失败'
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
        issue.saveError = result.error || '保存失败'
        saveError.value = issue.saveError
      }
    }
  } catch (error: any) {
    issue.saveError = error.message || '发生未知错误'
    saveError.value = issue.saveError
    console.error('保存问题失败:', error)
  } finally {
    issue.saving = false
    isSaving.value = false
  }
}, 500)

// Generate all papers
async function generateAllPapers() {
  if (!props.projectId || !window.electronAPI || issues.value.length === 0) {
    alert('没有可生成的问题')
    return
  }

  // Validate all issues have titles
  const invalidIssues = issues.value.filter(issue => !issue.title.trim())
  if (invalidIssues.length > 0) {
    alert('请在生成文档前为所有问题填写标题')
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
          project_name: projectResult.data.name || `项目 ${props.projectId}`,
          project_description: projectResult.data.description || '',
          project_status: projectResult.data.status || '进行中'
        }
      }
    } catch (error) {
      console.warn('无法获取项目数据:', error)
      projectData = {
        project_name: `项目 ${props.projectId}`,
        project_description: '审计证据收集',
        project_status: '进行中'
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
      'tpl_audit_evidence.docx'
    )

    if (result.success && result.data) {
      generationResults.value = result.data

      // Show success message
      const successful = result.data.filter(r => r.filePath).length
      const failed = result.data.filter(r => !r.filePath).length

      if (successful > 0) {
        alert(`成功生成 ${successful} 个工作底稿${failed > 0 ? ` (${failed} 个失败)` : ''}`)
      } else {
        alert('未能生成任何工作底稿，请查看控制台获取错误信息。')
      }
    } else {
      throw new Error(result.error || '生成工作底稿失败')
    }
  } catch (error: any) {
    console.error('生成工作底稿失败:', error)
    alert(`生成工作底稿失败: ${error.message}`)
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
  if (isSaving.value) return '正在保存...'
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
</script>

<style scoped>
.audit-evidence {
  font-family: 'Inter', sans-serif;
}
</style>