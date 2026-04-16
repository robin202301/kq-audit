import { dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

/**
 * Word document generation service using docxtemplater
 */
export class WordService {
  private templatesDir: string

  constructor() {
    // Determine templates directory based on environment
    if (process.env.NODE_ENV === 'development') {
      this.templatesDir = path.join(__dirname, '../../resources/templates')
    } else {
      // In production, templates are in resources directory relative to executable
      this.templatesDir = path.join(process.resourcesPath, 'templates')
    }

    console.log('WordService initialized with templates dir:', this.templatesDir)
  }

  /**
   * Get list of available templates
   */
  async getAvailableTemplates(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.templatesDir)) {
        console.warn('Templates directory does not exist:', this.templatesDir)
        return []
      }

      const files = fs.readdirSync(this.templatesDir)
      return files.filter(file => file.endsWith('.docx') || file.endsWith('.DOCX'))
    } catch (error) {
      console.error('Error reading templates directory:', error)
      return []
    }
  }

  /**
   * Generate a single document from template
   * @param templateName Name of the template file (e.g., 'notice_template.docx')
   * @param data Object containing placeholder data
   * @param defaultFileName Suggested default filename for save dialog
   * @returns Promise resolving to saved file path or null if cancelled
   */
  async generateDocument(
    templateName: string,
    data: Record<string, any>,
    defaultFileName?: string
  ): Promise<string | null> {
    try {
      // Validate template exists
      const templatePath = path.join(this.templatesDir, templateName)
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`)
      }

      // Read template file
      const content = await readFile(templatePath, 'binary')

      // Create docxtemplater instance
      const zip = new PizZip(content)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      // Set the template variables
      doc.setData(data)

      // Render the document
      doc.render()

      // Generate output
      const buf = doc.getZip().generate({ type: 'nodebuffer' })

      // Show save dialog
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Document',
        defaultPath: defaultFileName || `${data.project_name || 'document'}.docx`,
        filters: [
          { name: 'Word Documents', extensions: ['docx'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      if (canceled || !filePath) {
        return null
      }

      // Ensure .docx extension
      let finalPath = filePath
      if (!finalPath.toLowerCase().endsWith('.docx')) {
        finalPath += '.docx'
      }

      // Write the file
      await writeFile(finalPath, buf)
      console.log('Document generated successfully:', finalPath)

      return finalPath
    } catch (error: any) {
      console.error('Error generating document:', error)
      throw new Error(`Failed to generate document: ${error.message}`)
    }
  }

  /**
   * Extract text from template to provide preview
   * @param templateName Name of the template file
   * @returns Promise resolving to extracted text (first 500 chars)
   */
  async extractTemplatePreview(templateName: string): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, templateName)
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templateName}`)
      }

      const content = await readFile(templatePath, 'binary')
      const zip = new PizZip(content)

      // Extract document.xml which contains the main text
      const xmlContent = zip.file('word/document.xml')?.asText() || ''

      // Remove XML tags and get first 500 characters
      const text = xmlContent
        .replace(/<[^>]+>/g, ' ') // Replace tags with spaces
        .replace(/\s+/g, ' ')      // Collapse multiple spaces
        .trim()

      return text.substring(0, 500) + (text.length > 500 ? '...' : '')
    } catch (error: any) {
      console.error('Error extracting template preview:', error)
      return `Unable to extract preview: ${error.message}`
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
  async batchGenerateDocuments(
    templateName: string,
    items: Array<Record<string, any>>,
    fileNameFn: (item: Record<string, any>, index: number) => string,
    options: {
      outputDir?: string
      showDialogs?: boolean
      onProgress?: (current: number, total: number) => void
    } = {}
  ): Promise<Array<{ item: any; filePath: string | null }>> {
    const {
      outputDir = undefined,
      showDialogs = false,
      onProgress = undefined
    } = options

    const results: Array<{ item: any; filePath: string | null }> = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      try {
        let filePath: string | null = null

        if (showDialogs) {
          // Show save dialog for each document
          filePath = await this.generateDocument(
            templateName,
            item,
            fileNameFn(item, i)
          )
        } else {
          // Generate without dialogs to specified directory
          if (!outputDir) {
            throw new Error('outputDir is required when showDialogs is false')
          }

          // Ensure output directory exists
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
          }

          const templatePath = path.join(this.templatesDir, templateName)
          if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templateName}`)
          }

          const content = await readFile(templatePath, 'binary')
          const zip = new PizZip(content)
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
          })

          doc.setData(item)
          doc.render()

          const buf = doc.getZip().generate({ type: 'nodebuffer' })
          const fileName = fileNameFn(item, i)
          const finalFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`
          const finalPath = path.join(outputDir, finalFileName)

          await writeFile(finalPath, buf)
          filePath = finalPath
          console.log(`Batch document ${i + 1}/${items.length} generated:`, finalPath)
        }

        results.push({ item, filePath })
      } catch (error: any) {
        console.error(`Error generating document for item ${i + 1}:`, error)
        results.push({ item, filePath: null })
      }

      // Report progress
      if (onProgress) {
        onProgress(i + 1, items.length)
      }
    }

    return results
  }

  /**
   * Generate working papers for audit issues
   * This is a specialized batch generation for working papers
   * @param projectData Project information
   * @param issues Array of audit issues
   * @param templateName Template to use (default: 'working_paper_template.docx')
   * @returns Promise resolving to generation results
   */
  async generateWorkingPapers(
    projectData: Record<string, any>,
    issues: Array<Record<string, any>>,
    templateName: string = 'working_paper_template.docx'
  ): Promise<Array<{ issue: any; filePath: string | null }>> {
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
    }))

    // File name generator for working papers
    const fileNameFn = (item: Record<string, any>) => {
      const projectName = (item.project_name || 'Project').replace(/[^a-z0-9]/gi, '_')
      const issueTitle = (item.title || `Issue_${item.issue_number}`).replace(/[^a-z0-9]/gi, '_')
      return `${projectName}_WorkingPaper_${issueTitle}_${item.issue_number}`
    }

    // Show save dialog for the first document to get output directory
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save First Working Paper',
      defaultPath: fileNameFn(items[0]) + '.docx',
      filters: [
        { name: 'Word Documents', extensions: ['docx'] },
      ],
    })

    if (canceled || !filePath) {
      return items.map(item => ({ issue: item, filePath: null }))
    }

    const outputDir = path.dirname(filePath)

    // Generate all documents
    const batchResults = await this.batchGenerateDocuments(
      templateName,
      items,
      fileNameFn,
      {
        outputDir,
        showDialogs: false,
        onProgress: (current, total) => {
          console.log(`Generating working papers: ${current}/${total}`)
        }
      }
    )

    return batchResults.map(result => ({
      issue: result.item,
      filePath: result.filePath
    }))
  }
}

// Create singleton instance
export const wordService = new WordService()