import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initDatabase, getDatabase } from '@database/index'
import { initDatabase as initPersistenceDb, query, execute, createProject, getProject, saveForm, getForm, createIssue, updateIssue, getProjects, getProjectForms, getProjectIssues, closeDatabase } from './db'
import { wordService } from './wordService'
import { documentService } from './documentService'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../../public/icon.ico')
  })

  // and load the index.html of the app.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/index.html`))
  }

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(async () => {
  try {
    // Initialize SQLite databases - wait for completion
    await initDatabase() // Existing audit stages database
    await initPersistenceDb() // New persistence database

    createWindow()
    setupIpcHandlers()
  } catch (error) {
    console.error('Failed to initialize application:', error)
    // Optionally show error dialog to user
    app.quit()
  }

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Close database connections before quitting
app.on('before-quit', async () => {
  try {
    await closeDatabase()
    console.log('Database connections closed')
  } catch (error) {
    console.error('Error closing database:', error)
  }
})

// Set up IPC handlers for database operations
function setupIpcHandlers() {
  const db = getDatabase()

  // Handle getting audit stages
  ipcMain.handle('get-audit-stages', async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM audit_stages ORDER BY order_index', (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  })

  // Generic database query handler
  ipcMain.handle('db:query', async (event, { table, where, params = [] }: { table: string; where?: string; params?: any[] }) => {
    try {
      // Validate table name to prevent SQL injection
      const allowedTables = ['projects', 'audit_forms', 'audit_issues']
      if (!allowedTables.includes(table)) {
        return { success: false, error: `Invalid table name: ${table}` }
      }

      let sql = `SELECT * FROM ${table}`
      if (where) {
        sql += ` WHERE ${where}`
      }
      const result = await query(sql, params)
      return { success: true, data: result }
    } catch (error: any) {
      console.error('Database query error:', error)
      return { success: false, error: error.message }
    }
  })

  // Generic database save/execute handler
  ipcMain.handle('db:save', async (event, { sql, params = [] }: { sql: string; params?: any[] }) => {
    try {
      // Basic SQL validation - only allow INSERT, UPDATE, DELETE on our tables
      const upperSql = sql.toUpperCase().trim()
      const allowedTables = ['PROJECTS', 'AUDIT_FORMS', 'AUDIT_ISSUES']

      // Check if SQL starts with allowed operation
      if (!upperSql.startsWith('INSERT ') && !upperSql.startsWith('UPDATE ') && !upperSql.startsWith('DELETE ')) {
        return { success: false, error: 'Only INSERT, UPDATE, DELETE operations are allowed' }
      }

      // Check if table name is in allowed list (simple check)
      let tableMatch = false
      for (const table of allowedTables) {
        if (upperSql.includes(table)) {
          tableMatch = true
          break
        }
      }

      if (!tableMatch) {
        return { success: false, error: 'Operation on non-allowed table' }
      }

      const result = await execute(sql, params)
      return { success: true, data: result }
    } catch (error: any) {
      console.error('Database save error:', error)
      return { success: false, error: error.message }
    }
  })

  // Project operations
  ipcMain.handle('db:projects:create', async (event, projectData) => {
    try {
      const id = await createProject(projectData)
      return { success: true, data: { id } }
    } catch (error: any) {
      console.error('Create project error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:projects:list', async (event, status?: string) => {
    try {
      const projects = await getProjects(status)
      return { success: true, data: projects }
    } catch (error: any) {
      console.error('List projects error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:projects:get', async (event, id: number) => {
    try {
      const project = await getProject(id)
      return { success: true, data: project }
    } catch (error: any) {
      console.error('Get project error:', error)
      return { success: false, error: error.message }
    }
  })

  // Form operations
  ipcMain.handle('db:forms:save', async (event, formData) => {
    try {
      const id = await saveForm(formData)
      return { success: true, data: { id } }
    } catch (error: any) {
      console.error('Save form error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:forms:get', async (event, projectId: number, stage: string) => {
    try {
      const form = await getForm(projectId, stage)
      return { success: true, data: form }
    } catch (error: any) {
      console.error('Get form error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:forms:list', async (event, projectId: number) => {
    try {
      const forms = await getProjectForms(projectId)
      return { success: true, data: forms }
    } catch (error: any) {
      console.error('List forms error:', error)
      return { success: false, error: error.message }
    }
  })

  // Issue operations
  ipcMain.handle('db:issues:create', async (event, issueData) => {
    try {
      const id = await createIssue(issueData)
      return { success: true, data: { id } }
    } catch (error: any) {
      console.error('Create issue error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:issues:update', async (event, id: number, updates: any) => {
    try {
      const changes = await updateIssue(id, updates)
      return { success: true, data: { changes } }
    } catch (error: any) {
      console.error('Update issue error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:issues:list', async (event, projectId: number, category?: string) => {
    try {
      const issues = await getProjectIssues(projectId, category)
      return { success: true, data: issues }
    } catch (error: any) {
      console.error('List issues error:', error)
      return { success: false, error: error.message }
    }
  })

  // Word document generation operations
  ipcMain.handle('word:templates:list', async () => {
    try {
      const templates = await wordService.getAvailableTemplates()
      return { success: true, data: templates }
    } catch (error: any) {
      console.error('List templates error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('word:templates:preview', async (event, templateName: string) => {
    try {
      const preview = await wordService.extractTemplatePreview(templateName)
      return { success: true, data: preview }
    } catch (error: any) {
      console.error('Template preview error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('word:generate', async (event, templateName: string, data: Record<string, any>, defaultFileName?: string) => {
    try {
      const filePath = await wordService.generateDocument(templateName, data, defaultFileName)
      return { success: true, data: { filePath } }
    } catch (error: any) {
      console.error('Document generation error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('word:batch:generate', async (
    event,
    templateName: string,
    items: Array<Record<string, any>>,
    fileNameFn: (item: Record<string, any>, index: number) => string,
    options?: { outputDir?: string; showDialogs?: boolean; onProgress?: (current: number, total: number) => void }
  ) => {
    try {
      const results = await wordService.batchGenerateDocuments(templateName, items, fileNameFn, options)
      return { success: true, data: results }
    } catch (error: any) {
      console.error('Batch document generation error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('word:working-papers:generate', async (
    event,
    projectData: Record<string, any>,
    issues: Array<Record<string, any>>,
    templateName?: string
  ) => {
    try {
      const results = await wordService.generateWorkingPapers(projectData, issues, templateName)
      return { success: true, data: results }
    } catch (error: any) {
      console.error('Working papers generation error:', error)
      return { success: false, error: error.message }
    }
  })

  // Document content extraction operations
  ipcMain.handle('document:extract:content', async (event, fileBuffer: ArrayBuffer, stage: string) => {
    try {
      // Determine file type based on stage or analyze buffer
      // For now, use simple detection - implement better detection in production
      const fileType = stage === 'survey' ? 'xlsx' : 'docx'
      const result = await documentService.extractContent(fileBuffer, stage, fileType)
      return { success: true, data: result }
    } catch (error: any) {
      console.error('Document content extraction error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('document:excel:extract', async (event, fileBuffer: ArrayBuffer) => {
    try {
      // Save buffer to temp file for processing
      const fs = require('fs')
      const os = require('os')
      const path = require('path')

      const tempDir = path.join(os.tmpdir(), 'kq-audit')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const tempFilePath = path.join(tempDir, `temp_excel_${Date.now()}.xlsx`)
      await fs.promises.writeFile(tempFilePath, Buffer.from(fileBuffer))

      const result = await documentService.extractExcelContent(tempFilePath)

      // Clean up temp file
      fs.unlinkSync(tempFilePath)

      return { success: true, data: result }
    } catch (error: any) {
      console.error('Excel content extraction error:', error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('document:excel:generate', async (event, templateName: string, data: Record<string, any>, defaultFileName?: string) => {
    try {
      const filePath = await documentService.generateExcelDocument(templateName, data, defaultFileName)
      return { success: true, data: { filePath } }
    } catch (error: any) {
      console.error('Excel document generation error:', error)
      return { success: false, error: error.message }
    }
  })

  // Add more IPC handlers as needed
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.