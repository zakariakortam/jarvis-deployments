import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dbDir = join(__dirname, '../../../database')

// Ensure database directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

class DatabaseService {
  constructor() {
    this.db = new Database(join(dbDir, 'spc_data.db'))
    this.initializeTables()
  }

  initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS process_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        values TEXT NOT NULL,
        statistic REAL NOT NULL,
        chart_type TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        data TEXT,
        acknowledged INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS configuration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_process_data_timestamp
        ON process_data(timestamp);
      CREATE INDEX IF NOT EXISTS idx_alerts_timestamp
        ON alerts(timestamp);
    `)
    console.log('Database tables initialized')
  }

  saveProcessData(data) {
    const stmt = this.db.prepare(`
      INSERT INTO process_data (timestamp, values, statistic, chart_type, status)
      VALUES (?, ?, ?, ?, ?)
    `)

    try {
      stmt.run(
        data.timestamp,
        JSON.stringify(data.values),
        data.statistic,
        data.chartType,
        data.status
      )
    } catch (error) {
      console.error('Error saving process data:', error)
    }
  }

  getHistoricalData(startDate, endDate, variables = null) {
    let query = 'SELECT * FROM process_data WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp'
    const stmt = this.db.prepare(query)

    try {
      const rows = stmt.all(startDate, endDate)
      return rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        values: JSON.parse(row.values),
        statistic: row.statistic,
        chartType: row.chart_type,
        status: row.status
      }))
    } catch (error) {
      console.error('Error fetching historical data:', error)
      return []
    }
  }

  saveAlert(alert) {
    const stmt = this.db.prepare(`
      INSERT INTO alerts (type, message, timestamp, data)
      VALUES (?, ?, ?, ?)
    `)

    try {
      stmt.run(
        alert.type,
        alert.message,
        alert.timestamp,
        alert.data ? JSON.stringify(alert.data) : null
      )
    } catch (error) {
      console.error('Error saving alert:', error)
    }
  }

  getAlerts(limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM alerts
      ORDER BY timestamp DESC
      LIMIT ?
    `)

    try {
      const rows = stmt.all(limit)
      return rows.map(row => ({
        id: row.id,
        type: row.type,
        message: row.message,
        timestamp: row.timestamp,
        data: row.data ? JSON.parse(row.data) : null,
        acknowledged: row.acknowledged
      }))
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  acknowledgeAlert(alertId) {
    const stmt = this.db.prepare(`
      UPDATE alerts SET acknowledged = 1 WHERE id = ?
    `)

    try {
      stmt.run(alertId)
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  saveConfiguration(key, value) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO configuration (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `)

    try {
      stmt.run(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving configuration:', error)
    }
  }

  getConfiguration(key) {
    const stmt = this.db.prepare('SELECT value FROM configuration WHERE key = ?')

    try {
      const row = stmt.get(key)
      return row ? JSON.parse(row.value) : null
    } catch (error) {
      console.error('Error fetching configuration:', error)
      return null
    }
  }

  cleanOldData(daysToKeep = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const stmt = this.db.prepare(`
      DELETE FROM process_data WHERE timestamp < ?
    `)

    try {
      const result = stmt.run(cutoffDate.toISOString())
      console.log(`Cleaned ${result.changes} old records`)
      return result.changes
    } catch (error) {
      console.error('Error cleaning old data:', error)
      return 0
    }
  }

  getStatistics() {
    try {
      const processDataCount = this.db.prepare('SELECT COUNT(*) as count FROM process_data').get()
      const alertsCount = this.db.prepare('SELECT COUNT(*) as count FROM alerts').get()

      return {
        totalProcessData: processDataCount.count,
        totalAlerts: alertsCount.count,
        databaseSize: this.getDatabaseSize()
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return null
    }
  }

  getDatabaseSize() {
    try {
      const stat = this.db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get()
      return stat.size
    } catch (error) {
      console.error('Error getting database size:', error)
      return 0
    }
  }

  close() {
    this.db.close()
    console.log('Database connection closed')
  }
}

export default DatabaseService
