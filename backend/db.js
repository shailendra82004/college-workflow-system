require('dotenv').config()
const mysql = require('mysql2')

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'college_workflow',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
})

const promisePool = pool.promise()

// promise-based query helper
async function query(sql, params = []) {
  const [rows] = await promisePool.execute(sql, params)
  return rows
}

module.exports = { pool: promisePool, query }
