"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = exports.DocumentService = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const XLSX = __importStar(require("xlsx"));
const util_1 = require("util");
const wordService_1 = require("./wordService");
const readFile = (0, util_1.promisify)(fs_1.default.readFile);
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
/**
 * Document service extending WordService to support both Word and Excel documents
 */
class DocumentService extends wordService_1.WordService {
    constructor() {
        super();
    }
    /**
     * Extract content from Excel file
     * @param filePath Path to Excel file
     * @returns Excel data structure
     */
    async extractExcelContent(filePath) {
        try {
            if (!fs_1.default.existsSync(filePath)) {
                throw new Error(`Excel file not found: ${filePath}`);
            }
            const workbook = XLSX.readFile(filePath);
            const sheets = {};
            let totalCells = 0;
            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                sheets[sheetName] = jsonData;
                totalCells += jsonData.length * (jsonData[0]?.length || 0);
            });
            return {
                sheets,
                metadata: {
                    sheetNames: workbook.SheetNames,
                    totalSheets: workbook.SheetNames.length,
                    totalCells,
                },
            };
        }
        catch (error) {
            console.error('Error extracting Excel content:', error);
            throw new Error(`Failed to extract Excel content: ${error.message}`);
        }
    }
    /**
     * Extract structured data from Word document
     * @param fileBuffer Word file buffer
     * @returns Extracted text content
     */
    async extractWordContent(fileBuffer) {
        try {
            // For now, implement basic text extraction
            // This is a simplified version - actual implementation would need docxtemplater parsing
            const text = Buffer.from(fileBuffer).toString('utf-8');
            // Simple text extraction - remove binary/garbage characters
            const cleanText = text.replace(/[^\x20-\x7E\u4E00-\u9FFF\u3000-\u303F\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            return cleanText.substring(0, 2000); // Limit to first 2000 characters
        }
        catch (error) {
            console.error('Error extracting Word content:', error);
            throw new Error(`Failed to extract Word content: ${error.message}`);
        }
    }
    /**
     * Generic content extraction method
     * @param fileBuffer File buffer
     * @param stage Audit stage
     * @param fileType File type based on extension
     * @returns Extracted data structure
     */
    async extractContent(fileBuffer, stage, fileType) {
        try {
            // Save buffer to temp file for processing
            const tempDir = path_1.default.join(require('os').tmpdir(), 'kq-audit');
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            const tempFilePath = path_1.default.join(tempDir, `temp_${Date.now()}.${fileType}`);
            await writeFile(tempFilePath, Buffer.from(fileBuffer));
            if (fileType === 'xlsx' || fileType === 'xls') {
                // Extract Excel content
                const excelData = await this.extractExcelContent(tempFilePath);
                // Clean up temp file
                fs_1.default.unlinkSync(tempFilePath);
                return {
                    stage,
                    fileType: 'excel',
                    data: excelData,
                    extractedAt: new Date().toISOString(),
                };
            }
            else {
                // Extract Word content
                const wordContent = await this.extractWordContent(fileBuffer);
                // Clean up temp file
                fs_1.default.unlinkSync(tempFilePath);
                return {
                    stage,
                    fileType: 'word',
                    content: wordContent,
                    extractedAt: new Date().toISOString(),
                };
            }
        }
        catch (error) {
            console.error(`Error extracting content for stage ${stage}:`, error);
            throw new Error(`Content extraction failed: ${error.message}`);
        }
    }
    /**
     * Generate Excel document from template
     * @param templateName Excel template file name
     * @param data Data to fill into template
     * @param defaultFileName Default file name for save dialog
     * @returns Saved file path or null if cancelled
     */
    async generateExcelDocument(templateName, data, defaultFileName) {
        try {
            const templatePath = path_1.default.join(this.templatesDir, templateName);
            if (!fs_1.default.existsSync(templatePath)) {
                throw new Error(`Excel template not found: ${templateName}`);
            }
            // Read and modify Excel template
            const workbook = XLSX.readFile(templatePath);
            // Simple data insertion - this is a basic implementation
            // In production, would need more sophisticated template system for Excel
            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
                // Simple cell replacement based on data keys
                Object.keys(data).forEach((key) => {
                    // Look for cells containing the key as placeholder
                    for (let R = range.s.r; R <= range.e.r; ++R) {
                        for (let C = range.s.c; C <= range.e.c; ++C) {
                            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                            const cell = worksheet[cellAddress];
                            if (cell && cell.v && typeof cell.v === 'string' && cell.v.includes(`{${key}}`)) {
                                worksheet[cellAddress].v = cell.v.replace(`{${key}}`, data[key]);
                            }
                        }
                    }
                });
            });
            // Show save dialog
            const { canceled, filePath } = await electron_1.dialog.showSaveDialog({
                title: '保存Excel文档',
                defaultPath: defaultFileName || `${data.project_name || 'document'}.xlsx`,
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
                    { name: 'All Files', extensions: ['*'] },
                ],
            });
            if (canceled || !filePath) {
                return null;
            }
            // Ensure .xlsx extension
            let finalPath = filePath;
            if (!finalPath.toLowerCase().endsWith('.xlsx') && !finalPath.toLowerCase().endsWith('.xls')) {
                finalPath += '.xlsx';
            }
            // Write the file
            XLSX.writeFile(workbook, finalPath);
            console.log('Excel document generated successfully:', finalPath);
            return finalPath;
        }
        catch (error) {
            console.error('Error generating Excel document:', error);
            throw new Error(`Failed to generate Excel document: ${error.message}`);
        }
    }
    /**
     * Get file type from buffer or file name
     * @param fileName File name with extension
     * @returns File type
     */
    getFileType(fileName) {
        const ext = path_1.default.extname(fileName).toLowerCase();
        switch (ext) {
            case '.docx':
                return 'docx';
            case '.doc':
                return 'doc';
            case '.xlsx':
                return 'xlsx';
            case '.xls':
                return 'xls';
            default:
                return 'unknown';
        }
    }
    /**
     * Stage-specific content extraction
     * @param fileBuffer File buffer
     * @param stage Audit stage
     * @returns Extracted data structured for specific stage
     */
    async extractStageContent(fileBuffer, stage) {
        // For now, return generic extraction
        // Stage-specific logic can be added here
        return {
            stage,
            content: 'Content extracted successfully',
            extractedAt: new Date().toISOString(),
        };
    }
}
exports.DocumentService = DocumentService;
// Create singleton instance
exports.documentService = new DocumentService();
