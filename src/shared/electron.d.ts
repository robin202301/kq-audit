export {}

declare global {
  interface Window {
    electronAPI: {
      getAuditStages: () => Promise<any>

      // Database operations
      dbQuery: (table: string, where?: string, params?: any[]) => Promise<any>
      dbSave: (sql: string, params?: any[]) => Promise<any>

      // Project operations
      createProject: (projectData: any) => Promise<any>
      listProjects: (status?: string) => Promise<any>
      getProject: (id: number) => Promise<any>

      // Form operations
      saveForm: (formData: any) => Promise<any>
      getForm: (projectId: number, stage: string) => Promise<any>
      listForms: (projectId: number) => Promise<any>

      // Issue operations
      createIssue: (issueData: any) => Promise<any>
      updateIssue: (id: number, updates: any) => Promise<any>
      listIssues: (projectId: number, category?: string) => Promise<any>

      // Word document generation operations
      listTemplates: () => Promise<{ success: boolean; data?: string[]; error?: string }>
      getTemplatePreview: (templateName: string) => Promise<{ success: boolean; data?: string; error?: string }>
      generateDocument: (templateName: string, data: Record<string, any>, defaultFileName?: string) => Promise<{ success: boolean; data?: { filePath: string | null }; error?: string }>
      batchGenerateDocuments: (
        templateName: string,
        items: Array<Record<string, any>>,
        fileNameFn: (item: Record<string, any>, index: number) => string,
        options?: { outputDir?: string; showDialogs?: boolean; onProgress?: (current: number, total: number) => void }
      ) => Promise<{ success: boolean; data?: Array<{ item: any; filePath: string | null }>; error?: string }>
      generateWorkingPapers: (
        projectData: Record<string, any>,
        issues: Array<Record<string, any>>,
        templateName?: string
      ) => Promise<{ success: boolean; data?: Array<{ issue: any; filePath: string | null }>; error?: string }>

      // Document content extraction
      extractNoticeContent: (fileBuffer: ArrayBuffer) => Promise<{ success: boolean; data?: any; error?: string }>
      extractDocumentContent: (fileBuffer: ArrayBuffer, stage: string) => Promise<{ success: boolean; data?: any; error?: string }>
      extractExcelContent: (fileBuffer: ArrayBuffer) => Promise<{ success: boolean; data?: any; error?: string }>
      generateExcelDocument: (templateName: string, data: Record<string, any>, defaultFileName?: string) => Promise<{ success: boolean; data?: { filePath: string | null }; error?: string }>
    }
  }
}