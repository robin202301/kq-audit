"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const index_1 = require("../database/index");
const db_1 = require("./db");
const wordService_1 = require("./wordService");
const documentService_1 = require("./documentService");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
let mainWindow = null;
const createWindow = () => {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path_1.default.join(__dirname, '../../public/icon.ico')
    });
    // and load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, `../renderer/index.html`));
    }
    // Open the DevTools in development mode
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
electron_1.app.whenReady().then(async () => {
    try {
        // Initialize SQLite databases - wait for completion
        await (0, index_1.initDatabase)(); // Existing audit stages database
        await (0, db_1.initDatabase)(); // New persistence database
        createWindow();
        setupIpcHandlers();
    }
    catch (error) {
        console.error('Failed to initialize application:', error);
        // Optionally show error dialog to user
        electron_1.app.quit();
    }
    electron_1.app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Quit when all windows are closed, except on macOS.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Close database connections before quitting
electron_1.app.on('before-quit', async () => {
    try {
        await (0, db_1.closeDatabase)();
        console.log('Database connections closed');
    }
    catch (error) {
        console.error('Error closing database:', error);
    }
});
// Set up IPC handlers for database operations
function setupIpcHandlers() {
    const db = (0, index_1.getDatabase)();
    // Handle getting audit stages
    electron_1.ipcMain.handle('get-audit-stages', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM audit_stages ORDER BY order_index', (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    });
    // Generic database query handler
    electron_1.ipcMain.handle('db:query', async (event, { table, where, params = [] }) => {
        try {
            // Validate table name to prevent SQL injection
            const allowedTables = ['projects', 'audit_forms', 'audit_issues'];
            if (!allowedTables.includes(table)) {
                return { success: false, error: `Invalid table name: ${table}` };
            }
            let sql = `SELECT * FROM ${table}`;
            if (where) {
                sql += ` WHERE ${where}`;
            }
            const result = await (0, db_1.query)(sql, params);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('Database query error:', error);
            return { success: false, error: error.message };
        }
    });
    // Generic database save/execute handler
    electron_1.ipcMain.handle('db:save', async (event, { sql, params = [] }) => {
        try {
            // Basic SQL validation - only allow INSERT, UPDATE, DELETE on our tables
            const upperSql = sql.toUpperCase().trim();
            const allowedTables = ['PROJECTS', 'AUDIT_FORMS', 'AUDIT_ISSUES'];
            // Check if SQL starts with allowed operation
            if (!upperSql.startsWith('INSERT ') && !upperSql.startsWith('UPDATE ') && !upperSql.startsWith('DELETE ')) {
                return { success: false, error: 'Only INSERT, UPDATE, DELETE operations are allowed' };
            }
            // Check if table name is in allowed list (simple check)
            let tableMatch = false;
            for (const table of allowedTables) {
                if (upperSql.includes(table)) {
                    tableMatch = true;
                    break;
                }
            }
            if (!tableMatch) {
                return { success: false, error: 'Operation on non-allowed table' };
            }
            const result = await (0, db_1.execute)(sql, params);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('Database save error:', error);
            return { success: false, error: error.message };
        }
    });
    // Project operations
    electron_1.ipcMain.handle('db:projects:create', async (event, projectData) => {
        try {
            const id = await (0, db_1.createProject)(projectData);
            return { success: true, data: { id } };
        }
        catch (error) {
            console.error('Create project error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('db:projects:list', async (event, status) => {
        try {
            const projects = await (0, db_1.getProjects)(status);
            return { success: true, data: projects };
        }
        catch (error) {
            console.error('List projects error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('db:projects:get', async (event, id) => {
        try {
            const project = await (0, db_1.getProject)(id);
            return { success: true, data: project };
        }
        catch (error) {
            console.error('Get project error:', error);
            return { success: false, error: error.message };
        }
    });
    // Form operations
    electron_1.ipcMain.handle('db:forms:save', async (event, formData) => {
        try {
            const id = await (0, db_1.saveForm)(formData);
            return { success: true, data: { id } };
        }
        catch (error) {
            console.error('Save form error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('db:forms:get', async (event, projectId, stage) => {
        try {
            const form = await (0, db_1.getForm)(projectId, stage);
            return { success: true, data: form };
        }
        catch (error) {
            console.error('Get form error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('db:forms:list', async (event, projectId) => {
        try {
            const forms = await (0, db_1.getProjectForms)(projectId);
            return { success: true, data: forms };
        }
        catch (error) {
            console.error('List forms error:', error);
            return { success: false, error: error.message };
        }
    });
    // Issue operations
    electron_1.ipcMain.handle('db:issues:create', async (event, issueData) => {
        try {
            const id = await (0, db_1.createIssue)(issueData);
            return { success: true, data: { id } };
        }
        catch (error) {
            console.error('Create issue error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('db:issues:update', async (event, id, updates) => {
        try {
            const changes = await (0, db_1.updateIssue)(id, updates);
            return { success: true, data: { changes } };
        }
        catch (error) {
            console.error('Update issue error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('db:issues:list', async (event, projectId, category) => {
        try {
            const issues = await (0, db_1.getProjectIssues)(projectId, category);
            return { success: true, data: issues };
        }
        catch (error) {
            console.error('List issues error:', error);
            return { success: false, error: error.message };
        }
    });
    // Word document generation operations
    electron_1.ipcMain.handle('word:templates:list', async () => {
        try {
            const templates = await wordService_1.wordService.getAvailableTemplates();
            return { success: true, data: templates };
        }
        catch (error) {
            console.error('List templates error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('word:templates:preview', async (event, templateName) => {
        try {
            const preview = await wordService_1.wordService.extractTemplatePreview(templateName);
            return { success: true, data: preview };
        }
        catch (error) {
            console.error('Template preview error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('word:generate', async (event, templateName, data, defaultFileName) => {
        try {
            const filePath = await wordService_1.wordService.generateDocument(templateName, data, defaultFileName);
            return { success: true, data: { filePath } };
        }
        catch (error) {
            console.error('Document generation error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('word:batch:generate', async (event, templateName, items, fileNameFn, options) => {
        try {
            const results = await wordService_1.wordService.batchGenerateDocuments(templateName, items, fileNameFn, options);
            return { success: true, data: results };
        }
        catch (error) {
            console.error('Batch document generation error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('word:working-papers:generate', async (event, projectData, issues, templateName) => {
        try {
            const results = await wordService_1.wordService.generateWorkingPapers(projectData, issues, templateName);
            return { success: true, data: results };
        }
        catch (error) {
            console.error('Working papers generation error:', error);
            return { success: false, error: error.message };
        }
    });
    // Document content extraction operations
    electron_1.ipcMain.handle('document:extract:content', async (event, fileBuffer, stage) => {
        try {
            // Determine file type based on stage or analyze buffer
            // For now, use simple detection - implement better detection in production
            const fileType = stage === 'survey' ? 'xlsx' : 'docx';
            const result = await documentService_1.documentService.extractContent(fileBuffer, stage, fileType);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('Document content extraction error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('document:excel:extract', async (event, fileBuffer) => {
        try {
            // Save buffer to temp file for processing
            const fs = require('fs');
            const os = require('os');
            const path = require('path');
            const tempDir = path.join(os.tmpdir(), 'kq-audit');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const tempFilePath = path.join(tempDir, `temp_excel_${Date.now()}.xlsx`);
            await fs.promises.writeFile(tempFilePath, Buffer.from(fileBuffer));
            const result = await documentService_1.documentService.extractExcelContent(tempFilePath);
            // Clean up temp file
            fs.unlinkSync(tempFilePath);
            return { success: true, data: result };
        }
        catch (error) {
            console.error('Excel content extraction error:', error);
            return { success: false, error: error.message };
        }
    });
    electron_1.ipcMain.handle('document:excel:generate', async (event, templateName, data, defaultFileName) => {
        try {
            const filePath = await documentService_1.documentService.generateExcelDocument(templateName, data, defaultFileName);
            return { success: true, data: { filePath } };
        }
        catch (error) {
            console.error('Excel document generation error:', error);
            return { success: false, error: error.message };
        }
    });
    // Add more IPC handlers as needed
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
