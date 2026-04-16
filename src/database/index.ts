import sqlite3 from 'sqlite3'
import path from 'path'
import { app } from 'electron'

let db: sqlite3.Database | null = null

export function initDatabase() {
  if (db) {
    return db
  }

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'auditsystem.db')

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to database:', err)
    } else {
      console.log('Connected to SQLite database at:', dbPath)
      createTables()
    }
  })

  return db
}

function createTables() {
  if (!db) return

  // Audit stages table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Audit cases table
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      current_stage_id INTEGER,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (current_stage_id) REFERENCES audit_stages (id)
    )
  `)

  // Stage progress table
  db.run(`
    CREATE TABLE IF NOT EXISTS stage_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      notes TEXT,
      FOREIGN KEY (case_id) REFERENCES audit_cases (id),
      FOREIGN KEY (stage_id) REFERENCES audit_stages (id)
    )
  `)

  // Evidence items table
  db.run(`
    CREATE TABLE IF NOT EXISTS evidence_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES audit_cases (id),
      FOREIGN KEY (stage_id) REFERENCES audit_stages (id)
    )
  `)

  // Working papers table
  db.run(`
    CREATE TABLE IF NOT EXISTS working_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      template_used TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES audit_cases (id)
    )
  `)

  // Insert default audit stages if not exists
  const defaultStages = [
    { name: 'Notice', description: 'Initial audit notification and scope definition', order: 1 },
    { name: 'Survey', description: 'Preliminary investigation and data collection', order: 2 },
    { name: 'Plan', description: 'Audit plan development and resource allocation', order: 3 },
    { name: 'Evidence', description: 'Evidence gathering and documentation', order: 4 },
    { name: 'Working Paper', description: 'Analysis and working paper preparation', order: 5 },
    { name: 'Final Report', description: 'Report generation and sign-off', order: 6 }
  ]

  defaultStages.forEach(stage => {
    db?.run(
      `INSERT OR IGNORE INTO audit_stages (name, description, order_index) VALUES (?, ?, ?)`,
      [stage.name, stage.description, stage.order]
    )
  })

  console.log('Database tables created/verified')
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}

// Utility functions for common operations
export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

export function getQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export function allQuery(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}