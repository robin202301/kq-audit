"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordService = exports.WordService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const pizzip_1 = __importDefault(require("pizzip"));
const util_1 = require("util");
const readFile = (0, util_1.promisify)(fs_1.default.readFile);
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
/**
 * Word document generation service using docxtemplater
 */
class WordService {
    constructor() {
        // Determine templates directory based on environment
        if (process.env.NODE_ENV === 'development') {
            this.templatesDir = path_1.default.join(__dirname, '../../resources/templates');
        }
        else {
            // In production, templates are in resources directory relative to executable
            this.templatesDir = path_1.default.join(process.resourcesPath, 'templates');
        }
        console.log('WordService initialized with templates dir:', this.templatesDir);
    }
    /**
     * Get list of available templates
     */
    async getAvailableTemplates() {
        try {
            if (!fs_1.default.existsSync(this.templatesDir)) {
                console.warn('Templates directory does not exist:', this.templatesDir);
                return [];
            }
            const files = fs_1.default.readdirSync(this.templatesDir);
            return files.filter(file => file.endsWith('.docx') || file.endsWith('.DOCX'));
        }
        catch (error) {
            console.error('Error reading templates directory:', error);
            return [];
        }
    }
    /**
     * Generate a single document from template
     * @param templateName Name of the template file (e.g., 'notice_template.docx')
     * @param data Object containing placeholder data
     * @param defaultFileName Suggested default filename for save dialog
     * @returns Promise resolving to saved file path or null if cancelled
     */
    async generateDocument(templateName, data, defaultFileName) {
        try {
            // Validate template exists
            const templatePath = path_1.default.join(this.templatesDir, templateName);
            if (!fs_1.default.existsSync(templatePath)) {
                throw new Error(`Template not found: ${templateName}`);
            }
            // Read template file
            const content = await readFile(templatePath, 'binary');
            // Create docxtemplater instance
            const zip = new pizzip_1.default(content);
            const doc = new docxtemplater_1.default(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            // Set the template variables
            doc.setData(data);
            // Render the document
            doc.render();
            // Generate output
            const buf = doc.getZip().generate({ type: 'nodebuffer' });
            // Show save dialog
            const { canceled, filePath } = await electron_1.dialog.showSaveDialog({
                title: 'Save Document',
                defaultPath: defaultFileName || `${data.project_name || 'document'}.docx`,
                filters: [
                    { name: 'Word Documents', extensions: ['docx'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            });
            if (canceled || !filePath) {
                return null;
            }
            // Ensure .docx extension
            let finalPath = filePath;
            if (!finalPath.toLowerCase().endsWith('.docx')) {
                finalPath += '.docx';
            }
            // Write the file
            await writeFile(finalPath, buf);
            console.log('Document generated successfully:', finalPath);
            return finalPath;
        }
        catch (error) {
            console.error('Error generating document:', error);
            throw new Error(`Failed to generate document: ${error.message}`);
        }
    }
    /**
     * Extract text from template to provide preview
     * @param templateName Name of the template file
     * @returns Promise resolving to extracted text (first 500 chars)
     */
    async extractTemplatePreview(templateName) {
        try {
            const templatePath = path_1.default.join(this.templatesDir, templateName);
            if (!fs_1.default.existsSync(templatePath)) {
                throw new Error(`Template not found: ${templateName}`);
            }
            const content = await readFile(templatePath, 'binary');
            const zip = new pizzip_1.default(content);
            // Extract document.xml which contains the main text
            const xmlContent = zip.file('word/document.xml')?.asText() || '';
            // Remove XML tags and get first 500 characters
            const text = xmlContent
                .replace(/<[^>]+>/g, ' ') // Replace tags with spaces
                .replace(/\s+/g, ' ') // Collapse multiple spaces
                .trim();
            return text.substring(0, 500) + (text.length > 500 ? '...' : '');
        }
        catch (error) {
            console.error('Error extracting template preview:', error);
            return `Unable to extract preview: ${error.message}`;
        }
    }
    /**
     * Batch generate documents for multiple issues (1:N generation)
     * @param templateName Template to use for each document
     * @param items Array of items, each containing data for a document
     * @param fileNameFn Function to generate filename for each item
     * @param options Configuration options
     * @returns Promise resolving to array of generated file paths
     */
    async batchGenerateDocuments(templateName, items, fileNameFn, options = {}) {
        const { outputDir = undefined, showDialogs = false, onProgress = undefined } = options;
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            try {
                let filePath = null;
                if (showDialogs) {
                    // Show save dialog for each document
                    filePath = await this.generateDocument(templateName, item, fileNameFn(item, i));
                }
                else {
                    // Generate without dialogs to specified directory
                    if (!outputDir) {
                        throw new Error('outputDir is required when showDialogs is false');
                    }
                    // Ensure output directory exists
                    if (!fs_1.default.existsSync(outputDir)) {
                        fs_1.default.mkdirSync(outputDir, { recursive: true });
                    }
                    const templatePath = path_1.default.join(this.templatesDir, templateName);
                    if (!fs_1.default.existsSync(templatePath)) {
                        throw new Error(`Template not found: ${templateName}`);
                    }
                    const content = await readFile(templatePath, 'binary');
                    const zip = new pizzip_1.default(content);
                    const doc = new docxtemplater_1.default(zip, {
                        paragraphLoop: true,
                        linebreaks: true,
                    });
                    doc.setData(item);
                    doc.render();
                    const buf = doc.getZip().generate({ type: 'nodebuffer' });
                    const fileName = fileNameFn(item, i);
                    const finalFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
                    const finalPath = path_1.default.join(outputDir, finalFileName);
                    await writeFile(finalPath, buf);
                    filePath = finalPath;
                    console.log(`Batch document ${i + 1}/${items.length} generated:`, finalPath);
                }
                results.push({ item, filePath });
            }
            catch (error) {
                console.error(`Error generating document for item ${i + 1}:`, error);
                results.push({ item, filePath: null });
            }
            // Report progress
            if (onProgress) {
                onProgress(i + 1, items.length);
            }
        }
        return results;
    }
    /**
     * Generate working papers for audit issues
     * This is a specialized batch generation for working papers
     * @param projectData Project information
     * @param issues Array of audit issues
     * @param templateName Template to use (default: 'working_paper_template.docx')
     * @returns Promise resolving to generation results
     */
    async generateWorkingPapers(projectData, issues, templateName = 'working_paper_template.docx') {
        // Prepare data for each issue
        const items = issues.map((issue, index) => ({
            ...projectData,
            ...issue,
            issue_number: index + 1,
            issue_index: index + 1,
            generated_date: new Date().toLocaleDateString(),
            // Ensure all required fields have defaults
            title: issue.title || `Issue ${index + 1}`,
            description: issue.description || '',
            severity: issue.severity || 'medium',
            status: issue.status || 'open',
            category: issue.category || 'finding',
        }));
        // File name generator for working papers
        const fileNameFn = (item) => {
            const projectName = (item.project_name || 'Project').replace(/[^a-z0-9]/gi, '_');
            const issueTitle = (item.title || `Issue_${item.issue_number}`).replace(/[^a-z0-9]/gi, '_');
            return `${projectName}_WorkingPaper_${issueTitle}_${item.issue_number}`;
        };
        // Show save dialog for the first document to get output directory
        const { canceled, filePath } = await electron_1.dialog.showSaveDialog({
            title: 'Save First Working Paper',
            defaultPath: fileNameFn(items[0]) + '.docx',
            filters: [
                { name: 'Word Documents', extensions: ['docx'] },
            ],
        });
        if (canceled || !filePath) {
            return items.map(item => ({ issue: item, filePath: null }));
        }
        const outputDir = path_1.default.dirname(filePath);
        // Generate all documents
        const batchResults = await this.batchGenerateDocuments(templateName, items, fileNameFn, {
            outputDir,
            showDialogs: false,
            onProgress: (current, total) => {
                console.log(`Generating working papers: ${current}/${total}`);
            }
        });
        return batchResults.map(result => ({
            issue: result.item,
            filePath: result.filePath
        }));
    }
}
exports.WordService = WordService;
// Create singleton instance
exports.wordService = new WordService();
