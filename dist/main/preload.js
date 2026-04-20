"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getAuditStages: () => electron_1.ipcRenderer.invoke('get-audit-stages'),
    // Database operations
    dbQuery: (table, where, params) => electron_1.ipcRenderer.invoke('db:query', { table, where, params }),
    dbSave: (sql, params) => electron_1.ipcRenderer.invoke('db:save', { sql, params }),
    // Project operations
    createProject: (projectData) => electron_1.ipcRenderer.invoke('db:projects:create', projectData),
    listProjects: (status) => electron_1.ipcRenderer.invoke('db:projects:list', status),
    getProject: (id) => electron_1.ipcRenderer.invoke('db:projects:get', id),
    // Form operations
    saveForm: (formData) => electron_1.ipcRenderer.invoke('db:forms:save', formData),
    getForm: (projectId, stage) => electron_1.ipcRenderer.invoke('db:forms:get', projectId, stage),
    listForms: (projectId) => electron_1.ipcRenderer.invoke('db:forms:list', projectId),
    // Issue operations
    createIssue: (issueData) => electron_1.ipcRenderer.invoke('db:issues:create', issueData),
    updateIssue: (id, updates) => electron_1.ipcRenderer.invoke('db:issues:update', id, updates),
    listIssues: (projectId, category) => electron_1.ipcRenderer.invoke('db:issues:list', projectId, category),
    // Word document generation operations
    listTemplates: () => electron_1.ipcRenderer.invoke('word:templates:list'),
    getTemplatePreview: (templateName) => electron_1.ipcRenderer.invoke('word:templates:preview', templateName),
    generateDocument: (templateName, data, defaultFileName) => electron_1.ipcRenderer.invoke('word:generate', templateName, data, defaultFileName),
    batchGenerateDocuments: (templateName, items, fileNameFn, options) => electron_1.ipcRenderer.invoke('word:batch:generate', templateName, items, fileNameFn, options),
    generateWorkingPapers: (projectData, issues, templateName) => electron_1.ipcRenderer.invoke('word:working-papers:generate', projectData, issues, templateName),
    // Document content extraction operations
    extractNoticeContent: (fileBuffer) => electron_1.ipcRenderer.invoke('document:extract:content', fileBuffer, 'notice'),
    extractDocumentContent: (fileBuffer, stage) => electron_1.ipcRenderer.invoke('document:extract:content', fileBuffer, stage),
    extractExcelContent: (fileBuffer) => electron_1.ipcRenderer.invoke('document:excel:extract', fileBuffer),
    // Excel document generation
    generateExcelDocument: (templateName, data, defaultFileName) => electron_1.ipcRenderer.invoke('document:excel:generate', templateName, data, defaultFileName),
});
