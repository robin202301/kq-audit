"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.closeDatabase = closeDatabase;
exports.getDatabase = getDatabase;
exports.query = query;
exports.queryOne = queryOne;
exports.execute = execute;
exports.beginTransaction = beginTransaction;
exports.commitTransaction = commitTransaction;
exports.rollbackTransaction = rollbackTransaction;
exports.createProject = createProject;
exports.getProject = getProject;
exports.getProjects = getProjects;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.saveForm = saveForm;
exports.getForm = getForm;
exports.getProjectForms = getProjectForms;
exports.createIssue = createIssue;
exports.getIssue = getIssue;
exports.getProjectIssues = getProjectIssues;
exports.updateIssue = updateIssue;
exports.deleteIssue = deleteIssue;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
// Database instance
let db = null;
/**
 * Initialize the SQLite database
 */
function initDatabase() {
    if (db) {
        return Promise.resolve(db);
    }
    return new Promise((resolve, reject) => {
        const userDataPath = electron_1.app.getPath('userData');
        const dbPath = path_1.default.join(userDataPath, 'audit_persistence.db');
        db = new sqlite3_1.default.Database(dbPath, async (err) => {
            if (err) {
                console.error('Failed to connect to database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database at:', dbPath);
            try {
                await createTables();
                resolve(db);
            }
            catch (error) {
                console.error('Failed to create database tables:', error);
                reject(error);
            }
        });
    });
}
/**
 * Close the database connection
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (!db) {
            resolve();
            return;
        }
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
                reject(err);
            }
            else {
                console.log('Database connection closed');
                db = null;
                resolve();
            }
        });
    });
}
/**
 * Create required tables if they don't exist
 */
function createTables() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not connected'));
            return;
        }
        const database = db;
        database.serialize(() => {
            let tablesCreated = 0;
            const totalTables = 3;
            let hasError = false;
            const handleTableCreation = (tableName) => (err) => {
                if (err) {
                    console.error(`Error creating ${tableName} table:`, err);
                    hasError = true;
                    reject(err);
                    return;
                }
                tablesCreated++;
                if (tablesCreated === totalTables && !hasError) {
                    // Create indexes and wait for completion
                    createIndexes()
                        .then(() => {
                        console.log('Database tables and indexes created/verified');
                        resolve();
                    })
                        .catch((error) => {
                        console.warn('Index creation had errors, but tables are ready:', error);
                        // Still resolve because tables are created successfully
                        console.log('Database tables created/verified (indexes may be incomplete)');
                        resolve();
                    });
                }
            };
            // Projects table
            database.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, handleTableCreation('projects'));
            // Audit forms table - stores JSON data for each stage
            database.run(`
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
      `, handleTableCreation('audit_forms'));
            // Audit issues table - 1:N items for Evidence/Working Papers
            database.run(`
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
      `, handleTableCreation('audit_issues'));
        });
    });
}
/**
 * Create indexes for better query performance
 */
function createIndexes() {
    return new Promise((resolve) => {
        if (!db) {
            console.warn('Database not connected, skipping index creation');
            resolve();
            return;
        }
        const database = db;
        const totalIndexes = 11;
        let indexesCreated = 0;
        const handleIndexCreation = (indexName) => (err) => {
            if (err) {
                console.warn(`Index ${indexName} creation failed:`, err);
                // Continue anyway - indexes are optional
            }
            indexesCreated++;
            if (indexesCreated === totalIndexes) {
                console.log('Database indexes creation completed');
                resolve();
            }
        };
        // Indexes for projects table
        database.run('CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)', handleIndexCreation('idx_projects_status'));
        database.run('CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at)', handleIndexCreation('idx_projects_created'));
        // Indexes for audit_forms table
        database.run('CREATE INDEX IF NOT EXISTS idx_forms_project ON audit_forms(project_id)', handleIndexCreation('idx_forms_project'));
        database.run('CREATE INDEX IF NOT EXISTS idx_forms_stage ON audit_forms(stage)', handleIndexCreation('idx_forms_stage'));
        database.run('CREATE INDEX IF NOT EXISTS idx_forms_project_stage ON audit_forms(project_id, stage)', handleIndexCreation('idx_forms_project_stage'));
        // Indexes for audit_issues table
        database.run('CREATE INDEX IF NOT EXISTS idx_issues_project ON audit_issues(project_id)', handleIndexCreation('idx_issues_project'));
        database.run('CREATE INDEX IF NOT EXISTS idx_issues_category ON audit_issues(category)', handleIndexCreation('idx_issues_category'));
        database.run('CREATE INDEX IF NOT EXISTS idx_issues_status ON audit_issues(status)', handleIndexCreation('idx_issues_status'));
        database.run('CREATE INDEX IF NOT EXISTS idx_issues_severity ON audit_issues(severity)', handleIndexCreation('idx_issues_severity'));
        database.run('CREATE INDEX IF NOT EXISTS idx_issues_due_date ON audit_issues(due_date)', handleIndexCreation('idx_issues_due_date'));
        database.run('CREATE INDEX IF NOT EXISTS idx_issues_form ON audit_issues(form_id)', handleIndexCreation('idx_issues_form'));
    });
}
/**
 * Error handler for index creation
 */
function handleIndexError(indexName) {
    return (err) => {
        if (err) {
            console.error(`Error creating index ${indexName}:`, err);
            // Don't throw - indexes are optional for functionality
        }
    };
}
/**
 * Error handler for table creation
 */
function handleTableError(tableName) {
    return (err) => {
        if (err) {
            console.error(`Error creating ${tableName} table:`, err);
            throw err;
        }
    };
}
/**
 * Get the database instance
 * @throws Error if database not initialized
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return db;
}
/**
 * Execute a query with parameters and return results
 */
async function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Query error:', err, 'SQL:', sql, 'Params:', params);
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
/**
 * Execute a single row query
 */
async function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('QueryOne error:', err, 'SQL:', sql, 'Params:', params);
                reject(err);
            }
            else {
                resolve(row || null);
            }
        });
    });
}
/**
 * Execute an INSERT, UPDATE, or DELETE statement
 */
async function execute(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Execute error:', err, 'SQL:', sql, 'Params:', params);
                reject(err);
            }
            else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}
/**
 * Begin a transaction
 */
async function beginTransaction() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                console.error('Begin transaction error:', err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Commit a transaction
 */
async function commitTransaction() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.run('COMMIT', (err) => {
            if (err) {
                console.error('Commit transaction error:', err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Rollback a transaction
 */
async function rollbackTransaction() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.run('ROLLBACK', (err) => {
            if (err) {
                console.error('Rollback transaction error:', err);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
/**
 * Project CRUD operations
 */
async function createProject(project) {
    const result = await execute('INSERT INTO projects (name, description, status) VALUES (?, ?, ?)', [project.name, project.description || null, project.status]);
    return result.lastID;
}
async function getProject(id) {
    return queryOne('SELECT * FROM projects WHERE id = ?', [id]);
}
async function getProjects(status) {
    if (status) {
        return query('SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC', [status]);
    }
    return query('SELECT * FROM projects ORDER BY created_at DESC');
}
async function updateProject(id, updates) {
    const fields = [];
    const values = [];
    Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (fields.length === 0) {
        return 0;
    }
    // Always update the updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return result.changes;
}
async function deleteProject(id) {
    const result = await execute('DELETE FROM projects WHERE id = ?', [id]);
    return result.changes;
}
/**
 * Audit Form CRUD operations
 */
async function saveForm(form) {
    // Use INSERT OR REPLACE to handle unique constraint (project_id, stage)
    const result = await execute(`INSERT OR REPLACE INTO audit_forms (project_id, stage, form_data, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, [form.project_id, form.stage, form.form_data]);
    return result.lastID;
}
async function getForm(projectId, stage) {
    return queryOne('SELECT * FROM audit_forms WHERE project_id = ? AND stage = ?', [projectId, stage]);
}
async function getProjectForms(projectId) {
    return query('SELECT * FROM audit_forms WHERE project_id = ? ORDER BY stage', [projectId]);
}
/**
 * Audit Issue CRUD operations
 */
async function createIssue(issue) {
    const result = await execute(`INSERT INTO audit_issues (project_id, form_id, title, description, category, severity, status, assigned_to, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        issue.project_id,
        issue.form_id || null,
        issue.title,
        issue.description || null,
        issue.category,
        issue.severity || null,
        issue.status,
        issue.assigned_to || null,
        issue.due_date || null
    ]);
    return result.lastID;
}
async function getIssue(id) {
    return queryOne('SELECT * FROM audit_issues WHERE id = ?', [id]);
}
async function getProjectIssues(projectId, category) {
    if (category) {
        return query('SELECT * FROM audit_issues WHERE project_id = ? AND category = ? ORDER BY created_at DESC', [projectId, category]);
    }
    return query('SELECT * FROM audit_issues WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
}
async function updateIssue(id, updates) {
    const fields = [];
    const values = [];
    Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });
    if (fields.length === 0) {
        return 0;
    }
    // Always update the updated_at timestamp
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const sql = `UPDATE audit_issues SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return result.changes;
}
async function deleteIssue(id) {
    const result = await execute('DELETE FROM audit_issues WHERE id = ?', [id]);
    return result.changes;
}
