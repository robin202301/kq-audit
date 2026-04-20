# AuditSystem-Win (Windows Standalone)
# lang 
- **项目所有页面使用中文** 
## Project Overview
Desktop application for audit workflow management, designed to run offline on a single Windows machine. Implements a 6-stage audit workflow with SQLite data persistence and Word template filling capabilities.

## Tech Stack
- **Framework**: Electron
- **Frontend**: Vue 3 + Vite
- **Styling**: Tailwind CSS
- **Database**: SQLite3
- **Document Generation**: docxtemplater
- **Build Tools**: Electron Forge / Electron Builder

## Business Logic: 6-Stage Audit Workflow
1. **Notice** - Initial audit notification and scope definition
2. **Survey** - Preliminary investigation and data collection
3. **Plan** - Audit plan development and resource allocation
4. **Evidence** - Evidence gathering and documentation
5. **Working Paper** - Analysis and working paper preparation
6. **Final Report** - Report generation and sign-off

## Core Requirements
- Single-machine offline operation
- Data persistence using SQLite (local file database)
- Word document generation from templates
- No server dependency, no cloud requirements
- Windows-focused but cross-platform capable

## Project Structure
```
auditsystem-win/
├── src/
│   ├── main/          # Electron main process
│   ├── renderer/      # Vue 3 frontend
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/     # Workflow stages
│   │   ├── stores/    # Pinia state management
│   │   └── utils/
│   ├── shared/        # Shared types and utilities
│   └── database/      # SQLite initialization and models
├── public/            # Static assets
├── templates/         # Word document templates
├── build/             # Build configuration
└── dist/              # Distribution artifacts
```

## Development Guidelines
- Use TypeScript throughout the project
- Follow Vue 3 Composition API patterns
- Implement proper error handling for offline scenarios
- Ensure data integrity with SQLite transactions
- Maintain clear separation between main and renderer processes

## Key Dependencies
- electron
- vue@3
- vite
- sqlite3
- docxtemplater
- tailwindcss
- pinia (state management)
- electron-builder (packaging)

## Getting Started
```bash
npm install
npm run dev          # Development mode
npm run build        # Production build
npm run package      # Create Windows installer
```

## Notes for Contributors
- This is a standalone desktop application, avoid network dependencies
- All user data must be stored locally in SQLite
- Word templates should be customizable by end-users
- Consider performance with large audit datasets

## Persistence Layer API

The backend persistence layer is implemented in `src/main/db.ts` with the following tables:

### Tables
1. **projects** - Audit project metadata
2. **audit_forms** - JSON data for each audit stage (Notice, Survey, Plan, Evidence, Working Paper, Final Report)
3. **audit_issues** - 1:N items for Evidence/Working Papers (findings, recommendations, action items)

### IPC Handlers
Available via `window.electronAPI` in the renderer process:

#### Generic Operations
- `dbQuery(table, where?, params?)` - Query data from specified table
- `dbSave(sql, params?)` - Execute INSERT/UPDATE/DELETE statements

#### Project Operations
- `createProject(projectData)` - Create new audit project
- `getProject(id)` - Get project by ID
- `listProjects(status?)` - List projects with optional status filter

#### Form Operations
- `saveForm(formData)` - Save/update form data for a project stage
- `getForm(projectId, stage)` - Get form data for specific project and stage
- `listForms(projectId)` - List all forms for a project

#### Issue Operations
- `createIssue(issueData)` - Create new audit issue
- `listIssues(projectId, category?)` - List issues for a project with optional category filter

### TypeScript Interfaces
See `src/shared/types.ts` for `Project`, `AuditForm`, and `AuditIssue` interfaces.

### Error Handling
All database operations return promises that resolve to `{ success: boolean, data?: any, error?: string }` objects. Always check `success` before using `data`.

### Example Usage
```typescript
// Create a new project
const result = await window.electronAPI.createProject({
  name: '2024 Financial Audit',
  description: 'Annual financial statements audit',
  status: 'active'
})

if (result.success) {
  const projectId = result.data.id
  // Save form data for Notice stage
  await window.electronAPI.saveForm({
    project_id: projectId,
    stage: 'notice',
    form_data: JSON.stringify({ scope: 'Financial statements', deadline: '2024-12-31' })
  })
}
```

## Word Document Generation API

The Word document generation service is implemented in `src/main/wordService.ts` using docxtemplater and PizZip libraries.
注意这部分功能要求如下：
所有页面支持上传和导出对应格式文件，上传后可进行编辑，变保持版式不变的情况下导出
### Template Requirements
- Templates must be placed in `resources/templates/` directory
- Use curly braces `{}` for placeholders (e.g., `{project_name}`, `{audit_date}`)
- Required templates for each audit stage:
  - `notice.docx` - Notice stage,这个名称依据上传的文件内容来确定，这个页面包含以下输入框，内容首先引用上传文件对应内容，相关输入框内容都应存放进本地数据库，以便后续页面引用
  - 通知书标题（关于xxx审计的通知）
  - 通知内容
  - 附件文件名
  - 日期
  - 抄送 
  - （印发机关） 印发日期（****年**月**日印发）
  - `resources/templates/tpl_investigation_record_auditee_basic_info.xlsx` - Survey stage 按照模版生成输入框，内容支持通过上传文件来填入
  - `resources/templates/tpl_audit_plan.doc` - Plan stage
  - `resources/templates/tpl_audit_evidence.docx` - Evidence stage
  - `working_paper_template.docx` - Working Paper stage
  - `final_report_template.docx` - Final Report stage
-上述所有页面支持文件上传和导出，根据不同段落或者表格生成对应的输入框，导出word/excel时，必须遵照模版或者上传文件的版式
### IPC Handlers
Available via `window.electronAPI` in the renderer process:

#### Template Management
- `listTemplates()` - Get list of available template files
- `getTemplatePreview(templateName)` - Extract preview text from template

#### Document Generation
- `generateDocument(templateName, data, defaultFileName?)` - Generate single document with save dialog
- `batchGenerateDocuments(templateName, items, fileNameFn, options?)` - Generate multiple documents (1:N)
- `generateWorkingPapers(projectData, issues, templateName?)` - Specialized batch generation for audit issues

### TypeScript Interfaces
See `src/shared/electron.d.ts` for complete API type definitions.

### Error Handling
All Word operations return promises that resolve to `{ success: boolean, data?: any, error?: string }` objects. Always check `success` before using `data`.

### Example Usage
```typescript
// List available templates
const templatesResult = await window.electronAPI.listTemplates()
if (templatesResult.success) {
  console.log('Available templates:', templatesResult.data)
}

// Generate a document
const generateResult = await window.electronAPI.generateDocument(
  'notice_template.docx',
  {
    project_name: '2024 Financial Audit',
    audit_date: '2024-12-31',
    scope: 'Financial statements review'
  },
  'Notice_2024_Financial_Audit.docx'
)

if (generateResult.success && generateResult.data?.filePath) {
  console.log('Document saved to:', generateResult.data.filePath)
}

// Generate working papers for audit issues
const workingPapersResult = await window.electronAPI.generateWorkingPapers(
  {
    project_name: '2024 Financial Audit',
    audit_lead: 'John Doe',
    audit_date: '2024-12-31'
  },
  [
    { title: 'Inadequate documentation', description: 'Missing supporting documents', severity: 'high' },
    { title: 'Control weakness', description: 'Lack of segregation of duties', severity: 'medium' }
  ],
  'working_paper_template.docx'
)

if (workingPapersResult.success) {
  console.log(`Generated ${workingPapersResult.data.length} working papers`)
}
```