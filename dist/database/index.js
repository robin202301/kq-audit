"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.runQuery = runQuery;
exports.getQuery = getQuery;
exports.allQuery = allQuery;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
let db = null;
function initDatabase() {
    if (db) {
        return Promise.resolve(db);
    }
    return new Promise((resolve, reject) => {
        const userDataPath = electron_1.app.getPath('userData');
        const dbPath = path_1.default.join(userDataPath, 'auditsystem.db');
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
function createTables() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not connected'));
            return;
        }
        const database = db;
        database.serialize(() => {
            const totalTables = 5;
            let tablesCreated = 0;
            let hasTableError = false;
            const handleTableCreation = (tableName) => (err) => {
                if (err) {
                    console.error(`Error creating ${tableName} table:`, err);
                    hasTableError = true;
                    reject(err);
                    return;
                }
                tablesCreated++;
                if (tablesCreated === totalTables && !hasTableError) {
                    // All tables created successfully, now insert default stages
                    insertDefaultStages()
                        .then(() => {
                        console.log('Database tables created and default data inserted');
                        resolve();
                    })
                        .catch((error) => {
                        console.error('Failed to insert default data:', error);
                        // Still resolve because tables are created
                        console.log('Database tables created (default data may be incomplete)');
                        resolve();
                    });
                }
            };
            // Audit stages table
            database.run(`
        CREATE TABLE IF NOT EXISTS audit_stages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          order_index INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, handleTableCreation('audit_stages'));
            // Audit cases table
            database.run(`
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
      `, handleTableCreation('audit_cases'));
            // Stage progress table
            database.run(`
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
      `, handleTableCreation('stage_progress'));
            // Evidence items table
            database.run(`
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
      `, handleTableCreation('evidence_items'));
            // Working papers table
            database.run(`
        CREATE TABLE IF NOT EXISTS working_papers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          case_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          template_used TEXT,
          generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (case_id) REFERENCES audit_cases (id)
        )
      `, handleTableCreation('working_papers'));
        });
    });
}
function insertDefaultStages() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not connected'));
            return;
        }
        const database = db;
        const defaultStages = [
            { name: 'Notice', description: 'Initial audit notification and scope definition', order: 1 },
            { name: 'Survey', description: 'Preliminary investigation and data collection', order: 2 },
            { name: 'Plan', description: 'Audit plan development and resource allocation', order: 3 },
            { name: 'Evidence', description: 'Evidence gathering and documentation', order: 4 },
            { name: 'Working Paper', description: 'Analysis and working paper preparation', order: 5 },
            { name: 'Final Report', description: 'Report generation and sign-off', order: 6 }
        ];
        let remainingInserts = defaultStages.length;
        let hasError = false;
        defaultStages.forEach(stage => {
            database.run(`INSERT OR IGNORE INTO audit_stages (name, description, order_index) VALUES (?, ?, ?)`, [stage.name, stage.description, stage.order], (err) => {
                if (err) {
                    console.error(`Error inserting stage ${stage.name}:`, err);
                    hasError = true;
                    // Don't reject immediately - let all inserts attempt
                }
                remainingInserts--;
                if (remainingInserts === 0) {
                    if (hasError) {
                        reject(new Error('Some default stages failed to insert'));
                    }
                    else {
                        resolve();
                    }
                }
            });
        });
    });
}
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return db;
}
// Utility functions for common operations
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(row);
            }
        });
    });
}
function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
