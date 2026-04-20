export interface AuditStage {
  id: number
  name: string
  description?: string
  order_index: number
  created_at: string
}

export interface AuditCase {
  id: number
  case_number: string
  title: string
  current_stage_id: number
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface StageProgress {
  id: number
  case_id: number
  stage_id: number
  started_at: string
  completed_at?: string
  notes?: string
}

export interface EvidenceItem {
  id: number
  case_id: number
  stage_id: number
  title: string
  description?: string
  file_path?: string
  created_at: string
}

export interface WorkingPaper {
  id: number
  case_id: number
  title: string
  content?: string
  template_used?: string
  generated_at: string
}

export interface DocumentTemplate {
  id: number
  name: string
  description?: string
  file_path: string
  created_at: string
}

// New persistence layer types
export interface Project {
  id?: number
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at?: string
  updated_at?: string
}

export interface AuditForm {
  id?: number
  project_id: number
  stage: 'notice' | 'survey' | 'plan' | 'evidence' | 'working_paper' | 'final_report'
  form_data: string // JSON string
  created_at?: string
  updated_at?: string
}

export interface AuditIssue {
  id?: number
  project_id: number
  form_id?: number // Optional link to specific form
  title: string
  description?: string
  category: 'evidence' | 'finding' | 'recommendation' | 'action_item'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: string
  due_date?: string
  created_at?: string
  updated_at?: string
}

// Notice stage specific form data structure
export interface NoticeFormData {
  // 基本信息
  noticeTitle: string        // 通知书标题（关于xxx审计的通知）
  noticeContent: string      // 通知内容（多行文本）
  attachmentFileName: string // 附件文件名
  noticeDate: string         // 日期

  // 抄送和印发信息
  ccRecipients: string[]     // 抄送列表（数组，支持多个）
  issuingAuthority: string   // 印发机关
  issuingDate: string        // 印发日期（****年**月**日）

  // 文件信息
  uploadedFile?: {
    originalName: string     // 原始文件名
    savedPath: string        // 保存路径
    uploadDate: string       // 上传时间
  }

  // 向后兼容字段
  _original?: any            // 原始数据（用于迁移）
  schema_version?: string    // 数据模式版本
}

// Survey stage specific form data structure
export interface SurveyFormData {
  // Excel模板字段 - 基于tpl_investigation_record_auditee_basic_info.xlsx
  // 被审计单位基本信息
  auditeeName: string               // 被审计单位名称
  auditeeAddress: string            // 地址
  auditeeContact: string            // 联系人
  auditeePhone: string              // 联系电话
  industryType: string              // 行业类型
  registeredCapital: string         // 注册资本
  establishmentDate: string         // 成立日期
  legalRepresentative: string       // 法定代表人

  // 调查记录信息
  investigationDate: string         // 调查日期
  investigationLocation: string     // 调查地点
  investigationParticipants: string // 调查参与人员
  investigationContent: string      // 调查内容摘要
  keyFindings: string              // 主要发现

  // 文件信息
  uploadedFile?: {
    originalName: string            // 原始文件名
    savedPath: string               // 保存路径
    uploadDate: string              // 上传时间
  }

  schema_version?: string           // 数据模式版本
}

// Plan stage specific form data structure
export interface PlanFormData {
  // 审计计划信息
  auditObjectives: string           // 审计目标
  auditScope: string                // 审计范围
  auditMethodology: string          // 审计方法
  auditTimeline: string             // 时间安排
  resourceAllocation: string        // 资源分配
  riskAssessment: string            // 风险评估

  // 人员信息
  auditTeamMembers: string          // 审计组成员
  teamLeader: string                // 审计组长
  technicalExpert: string           // 技术专家
  qualityReviewer: string           // 质量复核人

  // 文件信息
  uploadedFile?: {
    originalName: string            // 原始文件名
    savedPath: string               // 保存路径
    uploadDate: string              // 上传时间
  }

  schema_version?: string           // 数据模式版本
}

// Evidence stage specific form data structure
export interface EvidenceFormData {
  // 证据基本信息
  evidenceTitle: string             // 证据标题
  evidenceType: string              // 证据类型（文档、截图、录音等）
  evidenceSource: string            // 证据来源
  collectionDate: string            // 收集日期
  collectionMethod: string          // 收集方法
  evidenceDescription: string       // 证据描述

  // 关联信息
  relatedFinding: string            // 相关发现问题
  relatedRequirement: string        // 相关法规要求
  importanceLevel: string           // 重要性等级

  // 文件信息
  uploadedFile?: {
    originalName: string            // 原始文件名
    savedPath: string               // 保存路径
    uploadDate: string              // 上传时间
  }

  schema_version?: string           // 数据模式版本
}

// Working Paper stage specific form data structure
export interface WorkingPaperFormData {
  // 工作底稿信息
  paperTitle: string                // 底稿标题
  auditProcedure: string            // 审计程序
  sampleSelection: string           // 样本选择
  analysisMethod: string            // 分析方法
  conclusions: string               // 结论

  // 发现和建议
  findings: string                  // 发现
  recommendations: string           // 建议
  rootCauseAnalysis: string         // 根本原因分析

  // 质量复核
  reviewerComments: string          // 复核意见
  qualityRating: string             // 质量评级

  // 文件信息
  uploadedFile?: {
    originalName: string            // 原始文件名
    savedPath: string               // 保存路径
    uploadDate: string              // 上传时间
  }

  schema_version?: string           // 数据模式版本
}

// Final Report stage specific form data structure
export interface FinalReportFormData {
  // 报告摘要
  executiveSummary: string          // 执行摘要
  auditOpinion: string              // 审计意见
  overallAssessment: string         // 总体评价

  // 详细发现
  majorFindings: string             // 主要发现
  significantIssues: string         // 重大事项
  recommendations: string           // 改进建议

  // 管理回应
  managementResponse: string        // 管理回应
  implementationPlan: string        // 实施计划
  followUpActions: string           // 后续行动

  // 报告信息
  reportNumber: string              // 报告编号
  issueDate: string                 // 签发日期
  reportPeriod: string              // 报告期间

  // 文件信息
  uploadedFile?: {
    originalName: string            // 原始文件名
    savedPath: string               // 保存路径
    uploadDate: string              // 上传时间
  }

  schema_version?: string           // 数据模式版本
}