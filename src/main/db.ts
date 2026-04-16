import sqlite3 from 'sqlite3'
import path from 'path'
import { app } from 'electron'
import type { Project, AuditForm, AuditIssue } from '@shared/types'

// Database instance
let db: sqlite3.Database | null = null

/**
 * Initialize the SQLite database
 */
export function initDatabase(): sqlite3.Database {
  if (db) {
    return db
  }

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'audit_persistence.db')

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to database:', err)
      throw err
    } else {
      console.log('Connected to SQLite database at:', dbPath)
      createTables()
    }
  })

  return db
}

/**
 * Close the database connection
 */
export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve()
      return
    }

    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err)
        reject(err)
      } else {
        console.log('Database connection closed')
        db = null
        resolve()
      }
    })
  })
}

/**
 * Create required tables if they don't exist
 */
function createTables() {
  if (!db) return

  // Projects table
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, handleTableError('projects'))

  // Audit forms table - stores JSON data for each stage
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      stage TEXT NOT NULL,
      template_name TEXT, -- Added: Associated template file name
      form_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
      UNIQUE(project_id, stage)
    )
  `, handleTableError('audit_forms'))

  // Audit issues table - 1:N items for Evidence/Working Papers
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      form_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      severity TEXT,
      status TEXT DEFAULT 'open',
      assigned_to TEXT,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
      FOREIGN KEY (form_id) REFERENCES audit_forms (id) ON DELETE SET NULL
    )
  `, handleTableError('audit_issues'))

  // Create indexes for better performance
  createIndexes()

  console.log('Database tables created/verified')
}

/**
 * Create indexes for better query performance
 */
function createIndexes() {
  if (!db) return

  // Indexes for projects table
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)', handleIndexError('idx_projects_status'))
  db.run('CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at)', handleIndexError('idx_projects_created'))

  // Indexes for audit_forms table
  db.run('CREATE INDEX IF NOT EXISTS idx_forms_project ON audit_forms(project_id)', handleIndexError('idx_forms_project'))
  db.run('CREATE INDEX IF NOT EXISTS idx_forms_stage ON audit_forms(stage)', handleIndexError('idx_forms_stage'))
  db.run('CREATE INDEX IF NOT EXISTS idx_forms_project_stage ON audit_forms(project_id, stage)', handleIndexError('idx_forms_project_stage'))

  // Indexes for audit_issues table
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_project ON audit_issues(project_id)', handleIndexError('idx_issues_project'))
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_category ON audit_issues(category)', handleIndexError('idx_issues_category'))
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_status ON audit_issues(status)', handleIndexError('idx_issues_status'))
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_severity ON audit_issues(severity)', handleIndexError('idx_issues_severity'))
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_due_date ON audit_issues(due_date)', handleIndexError('idx_issues_due_date'))
  db.run('CREATE INDEX IF NOT EXISTS idx_issues_form ON audit_issues(form_id)', handleIndexError('idx_issues_form'))

  console.log('Database indexes created/verified')
}

/**
 * Error handler for index creation
 */
function handleIndexError(indexName: string) {
  return (err: Error | null) => {
    if (err) {
      console.error(`Error creating index ${indexName}:`, err)
      // Don't throw - indexes are optional for functionality
    }
  }
}

/**
 * Error handler for table creation
 */
function handleTableError(tableName: string) {
  return (err: Error | null) => {
    if (err) {
      console.error(`Error creating ${tableName} table:`, err)
      throw err
    }
  }
}

/**
 * Get the database instance
 * @throws Error if database not initialized
 */
export function getDatabase(): sqlite3.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}

/**
 * Execute a query with parameters and return results
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err, 'SQL:', sql, 'Params:', params)
        reject(err)
      } else {
        resolve(rows as T[])
      }
    })
  })
}

/**
 * Execute a single row query
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('QueryOne error:', err, 'SQL:', sql, 'Params:', params)
        reject(err)
      } else {
        resolve(row as T || null)
      }
    })
  })
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement
 */
export async function execute(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    db.run(sql, params, function(err) {
      if (err) {
        console.error('Execute error:', err, 'SQL:', sql, 'Params:', params)
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

/**
 * Begin a transaction
 */
export async function beginTransaction(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Begin transaction error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Commit a transaction
 */
export async function commitTransaction(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    db.run('COMMIT', (err) => {
      if (err) {
        console.error('Commit transaction error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Rollback a transaction
 */
export async function rollbackTransaction(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    db.run('ROLLBACK', (err) => {
      if (err) {
        console.error('Rollback transaction error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * Project CRUD operations
 */
export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const result = await execute(
    'INSERT INTO projects (name, description, status) VALUES (?, ?, ?)',
    [project.name, project.description || null, project.status]
  )
  return result.lastID
}

export async function getProject(id: number): Promise<Project | null> {
  return queryOne<Project>('SELECT * FROM projects WHERE id = ?', [id])
}

export async function getProjects(status?: string): Promise<Project[]> {
  if (status) {
    return query<Project>('SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC', [status])
  }
  return query<Project>('SELECT * FROM projects ORDER BY created_at DESC')
}

export async function updateProject(id: number, updates: Partial<Project>): Promise<number> {
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (fields.length === 0) {
    return 0
  }

  // Always update the updated_at timestamp
  fields.push('updated_at = CURRENT_TIMESTAMP')

  values.push(id)

  const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`
  const result = await execute(sql, values)
  return result.changes
}

export async function deleteProject(id: number): Promise<number> {
  const result = await execute('DELETE FROM projects WHERE id = ?', [id])
  return result.changes
}

/**
 * Audit Form CRUD operations
 */
export async function saveForm(form: Omit<AuditForm, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  // Use INSERT OR REPLACE to handle unique constraint (project_id, stage)
  const result = await execute(
    `INSERT OR REPLACE INTO audit_forms (project_id, stage, form_data, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [form.project_id, form.stage, form.form_data]
  )
  return result.lastID
}

export async function getForm(projectId: number, stage: string): Promise<AuditForm | null> {
  return queryOne<AuditForm>('SELECT * FROM audit_forms WHERE project_id = ? AND stage = ?', [projectId, stage])
}

export async function getProjectForms(projectId: number): Promise<AuditForm[]> {
  return query<AuditForm>('SELECT * FROM audit_forms WHERE project_id = ? ORDER BY stage', [projectId])
}

/**
 * Audit Issue CRUD operations
 */
export async function createIssue(issue: Omit<AuditIssue, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const result = await execute(
    `INSERT INTO audit_issues (project_id, form_id, title, description, category, severity, status, assigned_to, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      issue.project_id,
      issue.form_id || null,
      issue.title,
      issue.description || null,
      issue.category,
      issue.severity || null,
      issue.status,
      issue.assigned_to || null,
      issue.due_date || null
    ]
  )
  return result.lastID
}

export async function getIssue(id: number): Promise<AuditIssue | null> {
  return queryOne<AuditIssue>('SELECT * FROM audit_issues WHERE id = ?', [id])
}

export async function getProjectIssues(projectId: number, category?: string): Promise<AuditIssue[]> {
  if (category) {
    return query<AuditIssue>('SELECT * FROM audit_issues WHERE project_id = ? AND category = ? ORDER BY created_at DESC', [projectId, category])
  }
  return query<AuditIssue>('SELECT * FROM audit_issues WHERE project_id = ? ORDER BY created_at DESC', [projectId])
}

export async function updateIssue(id: number, updates: Partial<AuditIssue>): Promise<number> {
  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (fields.length === 0) {
    return 0
  }

  // Always update the updated_at timestamp
  fields.push('updated_at = CURRENT_TIMESTAMP')

  values.push(id)

  const sql = `UPDATE audit_issues SET ${fields.join(', ')} WHERE id = ?`
  const result = await execute(sql, values)
  return result.changes
}

export async function deleteIssue(id: number): Promise<number> {
  const result = await execute('DELETE FROM audit_issues WHERE id = ?', [id])
  return result.changes
}

// Re-export types for convenience
export type { Project, AuditForm, AuditIssue }