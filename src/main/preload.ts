import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAuditStages: () => ipcRenderer.invoke('get-audit-stages'),

  // Database operations
  dbQuery: (table: string, where?: string, params?: any[]) =>
    ipcRenderer.invoke('db:query', { table, where, params }),

  dbSave: (sql: string, params?: any[]) =>
    ipcRenderer.invoke('db:save', { sql, params }),

  // Project operations
  createProject: (projectData: any) =>
    ipcRenderer.invoke('db:projects:create', projectData),

  listProjects: (status?: string) =>
    ipcRenderer.invoke('db:projects:list', status),

  getProject: (id: number) =>
    ipcRenderer.invoke('db:projects:get', id),

  // Form operations
  saveForm: (formData: any) =>
    ipcRenderer.invoke('db:forms:save', formData),

  getForm: (projectId: number, stage: string) =>
    ipcRenderer.invoke('db:forms:get', projectId, stage),

  listForms: (projectId: number) =>
    ipcRenderer.invoke('db:forms:list', projectId),

  // Issue operations
  createIssue: (issueData: any) =>
    ipcRenderer.invoke('db:issues:create', issueData),

  updateIssue: (id: number, updates: any) =>
    ipcRenderer.invoke('db:issues:update', id, updates),

  listIssues: (projectId: number, category?: string) =>
    ipcRenderer.invoke('db:issues:list', projectId, category),

  // Word document generation operations
  listTemplates: () =>
    ipcRenderer.invoke('word:templates:list'),

  getTemplatePreview: (templateName: string) =>
    ipcRenderer.invoke('word:templates:preview', templateName),

  generateDocument: (templateName: string, data: Record<string, any>, defaultFileName?: string) =>
    ipcRenderer.invoke('word:generate', templateName, data, defaultFileName),

  batchGenerateDocuments: (
    templateName: string,
    items: Array<Record<string, any>>,
    fileNameFn: (item: Record<string, any>, index: number) => string,
    options?: { outputDir?: string; showDialogs?: boolean; onProgress?: (current: number, total: number) => void }
  ) =>
    ipcRenderer.invoke('word:batch:generate', templateName, items, fileNameFn, options),

  generateWorkingPapers: (
    projectData: Record<string, any>,
    issues: Array<Record<string, any>>,
    templateName?: string
  ) =>
    ipcRenderer.invoke('word:working-papers:generate', projectData, issues, templateName),

  // Document content extraction operations
  extractNoticeContent: (fileBuffer: ArrayBuffer) =>
    ipcRenderer.invoke('document:extract:content', fileBuffer, 'notice'),

  extractDocumentContent: (fileBuffer: ArrayBuffer, stage: string) =>
    ipcRenderer.invoke('document:extract:content', fileBuffer, stage),

  extractExcelContent: (fileBuffer: ArrayBuffer) =>
    ipcRenderer.invoke('document:excel:extract', fileBuffer),

  // Excel document generation
  generateExcelDocument: (templateName: string, data: Record<string, any>, defaultFileName?: string) =>
    ipcRenderer.invoke('document:excel:generate', templateName, data, defaultFileName),
})