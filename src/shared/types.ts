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