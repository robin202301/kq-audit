import { dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import * as XLSX from 'xlsx'
import { promisify } from 'util'
import { WordService } from './wordService'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

export interface ExcelData {
  sheets: Record<string, any[][]>
  metadata: {
    sheetNames: string[]
    totalSheets: number
    totalCells: number
  }
}

/**
 * Document service extending WordService to support both Word and Excel documents
 */
export class DocumentService extends WordService {
  constructor() {
    super()
  }

  /**
   * Extract content from Excel file
   * @param filePath Path to Excel file
   * @returns Excel data structure
   */
  async extractExcelContent(filePath: string): Promise<ExcelData> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Excel file not found: ${filePath}`)
      }

      const workbook = XLSX.readFile(filePath)
      const sheets: Record<string, any[][]> = {}
      let totalCells = 0

      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        sheets[sheetName] = jsonData
        totalCells += jsonData.length * (jsonData[0]?.length || 0)
      })

      return {
        sheets,
        metadata: {
          sheetNames: workbook.SheetNames,
          totalSheets: workbook.SheetNames.length,
          totalCells,
        },
      }
    } catch (error: any) {
      console.error('Error extracting Excel content:', error)
      throw new Error(`Failed to extract Excel content: ${error.message}`)
    }
  }

  /**
   * Extract structured data from Word document
   * @param fileBuffer Word file buffer
   * @returns Extracted text content
   */
  async extractWordContent(fileBuffer: ArrayBuffer): Promise<string> {
    try {
      // For now, implement basic text extraction
      // This is a simplified version - actual implementation would need docxtemplater parsing
      const text = Buffer.from(fileBuffer).toString('utf-8')

      // Simple text extraction - remove binary/garbage characters
      const cleanText = text.replace(/[^\x20-\x7E\u4E00-\u9FFF\u3000-\u303F\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      return cleanText.substring(0, 2000) // Limit to first 2000 characters
    } catch (error: any) {
      console.error('Error extracting Word content:', error)
      throw new Error(`Failed to extract Word content: ${error.message}`)
    }
  }

  /**
   * Generic content extraction method
   * @param fileBuffer File buffer
   * @param stage Audit stage
   * @param fileType File type based on extension
   * @returns Extracted data structure
   */
  async extractContent(
    fileBuffer: ArrayBuffer,
    stage: string,
    fileType: 'docx' | 'doc' | 'xlsx' | 'xls'
  ): Promise<any> {
    try {
      // Save buffer to temp file for processing
      const tempDir = path.join(require('os').tmpdir(), 'kq-audit')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      const tempFilePath = path.join(tempDir, `temp_${Date.now()}.${fileType}`)
      await writeFile(tempFilePath, Buffer.from(fileBuffer))

      if (fileType === 'xlsx' || fileType === 'xls') {
        // Extract Excel content
        const excelData = await this.extractExcelContent(tempFilePath)

        // Clean up temp file
        fs.unlinkSync(tempFilePath)

        return {
          stage,
          fileType: 'excel',
          data: excelData,
          extractedAt: new Date().toISOString(),
        }
      } else {
        // Extract Word content
        const wordContent = await this.extractWordContent(fileBuffer)

        // Clean up temp file
        fs.unlinkSync(tempFilePath)

        return {
          stage,
          fileType: 'word',
          content: wordContent,
          extractedAt: new Date().toISOString(),
        }
      }
    } catch (error: any) {
      console.error(`Error extracting content for stage ${stage}:`, error)
      throw new Error(`Content extraction failed: ${error.message}`)
    }
  }

  /**
   * Generate Excel document from template
   * @param templateName Excel template file name
   * @param data Data to fill into template
   * @param defaultFileName Default file name for save dialog
   * @returns Saved file path or null if cancelled
   */
  async generateExcelDocument(
    templateName: string,
    data: Record<string, any>,
    defaultFileName?: string
  ): Promise<string | null> {
    try {
      const templatePath = path.join(this.templatesDir, templateName)
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Excel template not found: ${templateName}`)
      }

      // Read and modify Excel template
      const workbook = XLSX.readFile(templatePath)

      // Simple data insertion - this is a basic implementation
      // In production, would need more sophisticated template system for Excel
      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName]
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')

        // Simple cell replacement based on data keys
        Object.keys(data).forEach((key) => {
          // Look for cells containing the key as placeholder
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
              const cell = worksheet[cellAddress]

              if (cell && cell.v && typeof cell.v === 'string' && cell.v.includes(`{${key}}`)) {
                worksheet[cellAddress].v = cell.v.replace(`{${key}}`, data[key])
              }
            }
          }
        })
      })

      // Show save dialog
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Excel Document',
        defaultPath: defaultFileName || `${data.project_name || 'document'}.xlsx`,
        filters: [
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      if (canceled || !filePath) {
        return null
      }

      // Ensure .xlsx extension
      let finalPath = filePath
      if (!finalPath.toLowerCase().endsWith('.xlsx') && !finalPath.toLowerCase().endsWith('.xls')) {
        finalPath += '.xlsx'
      }

      // Write the file
      XLSX.writeFile(workbook, finalPath)
      console.log('Excel document generated successfully:', finalPath)

      return finalPath
    } catch (error: any) {
      console.error('Error generating Excel document:', error)
      throw new Error(`Failed to generate Excel document: ${error.message}`)
    }
  }

  /**
   * Get file type from buffer or file name
   * @param fileName File name with extension
   * @returns File type
   */
  getFileType(fileName: string): 'docx' | 'doc' | 'xlsx' | 'xls' | 'unknown' {
    const ext = path.extname(fileName).toLowerCase()
    switch (ext) {
      case '.docx':
        return 'docx'
      case '.doc':
        return 'doc'
      case '.xlsx':
        return 'xlsx'
      case '.xls':
        return 'xls'
      default:
        return 'unknown'
    }
  }

  /**
   * Stage-specific content extraction
   * @param fileBuffer File buffer
   * @param stage Audit stage
   * @returns Extracted data structured for specific stage
   */
  async extractStageContent(fileBuffer: ArrayBuffer, stage: string): Promise<any> {
    // For now, return generic extraction
    // Stage-specific logic can be added here
    return {
      stage,
      content: 'Content extracted successfully',
      extractedAt: new Date().toISOString(),
    }
  }
}

// Create singleton instance
export const documentService = new DocumentService()