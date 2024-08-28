// const { Pool } = require('pg');
// import pg from 'pg'
const pg= require('pg');
const config = require('dotenv');

// config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: true
});

module.exports = pool;
