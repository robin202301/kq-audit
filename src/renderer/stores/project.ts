import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NoticeFormData } from '@shared/types'

export const useProjectStore = defineStore('project', () => {
  // 当前项目ID
  const currentProjectId = ref<number | null>(null)

  // 通知单数据
  const noticeData = ref<NoticeFormData | null>(null)

  // 从通知内容中提取的审计事项（数组）
  const auditItems = ref<string[]>([])

  // 其他需要共享的项目信息
  const projectInfo = ref<{
    projectName?: string
    auditScope?: string
    auditPeriod?: string
  }>({})

  // 计算属性：从通知标题中提取项目名称
  const extractedProjectName = computed(() => {
    if (!noticeData.value?.noticeTitle) return null

    // 尝试从通知标题中提取项目名称
    // 格式通常是："关于XXX审计的通知"
    const title = noticeData.value.noticeTitle
    const match = title.match(/关于(.+?)审计的通知/)
    return match ? match[1].trim() : null
  })

  // 计算属性：从通知内容中提取审计事项
  const extractedAuditItems = computed(() => {
    if (!noticeData.value?.noticeContent) return []

    const content = noticeData.value.noticeContent

    // 尝试提取审计事项（可能是列表或段落）
    // 1. 查找常见的审计事项标记
    const patterns = [
      /审计事项：\s*([^。]+)/,
      /审计事项如下：\s*([^。]+)/,
      /主要审计事项包括：\s*([^。]+)/,
      /审计事项\s*[：:]\s*([^。]+)/
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        // 尝试分割不同的审计事项（支持逗号、分号、换行等分隔符）
        const items = match[1]
          .split(/[,;、，；\n]/)
          .map(item => item.trim())
          .filter(item => item.length > 0)
        return items
      }
    }

    return []
  })

  // 获取所有可用的审计事项（用户手动添加的和自动提取的）
  const allAuditItems = computed(() => {
    const combined = [...auditItems.value, ...extractedAuditItems.value]
    // 去重
    return Array.from(new Set(combined.filter(item => item.length > 0)))
  })

  // 设置通知单数据
  function setNoticeData(data: NoticeFormData) {
    noticeData.value = data

    // 自动更新项目信息
    if (data.noticeTitle) {
      const projectName = extractedProjectName.value
      if (projectName) {
        projectInfo.value.projectName = projectName
      }
    }
  }

  // 添加审计事项（用户手动添加）
  function addAuditItem(item: string) {
    if (item && !auditItems.value.includes(item)) {
      auditItems.value.push(item)
    }
  }

  // 移除审计事项
  function removeAuditItem(item: string) {
    const index = auditItems.value.indexOf(item)
    if (index !== -1) {
      auditItems.value.splice(index, 1)
    }
  }

  // 设置当前项目ID
  function setCurrentProjectId(id: number) {
    currentProjectId.value = id
  }

  // 从数据库加载通知单数据
  async function loadNoticeData(projectId: number) {
    if (!window.electronAPI) return

    try {
      const result = await window.electronAPI.getForm(projectId, 'notice')
      if (result.success && result.data) {
        const formData = JSON.parse(result.data.form_data)
        setNoticeData(formData)
      }
    } catch (error) {
      console.error('加载通知单数据失败:', error)
    }
  }

  // 清空数据（切换项目时使用）
  function clearData() {
    noticeData.value = null
    auditItems.value = []
    projectInfo.value = {}
  }

  return {
    // 状态
    currentProjectId,
    noticeData,
    auditItems,
    projectInfo,

    // 计算属性
    extractedProjectName,
    extractedAuditItems,
    allAuditItems,

    // 方法
    setNoticeData,
    addAuditItem,
    removeAuditItem,
    setCurrentProjectId,
    loadNoticeData,
    clearData
  }
})