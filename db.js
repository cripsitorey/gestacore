// const { Pool } = require('pg');
// import pg from 'pg'
const pg= require('pg');
const config = require('dotenv');

// config()

const pool = new pg.Pool({
  // connectionString: process.env.DATABASE_URL,
  connectionString: 'postgresql://laboratorio_fisica_user:FIw0Byx63fzvkBzXf0X73LTcC0azFpsu@dpg-cr7aebq3esus7385ihd0-a.oregon-postgres.render.com/laboratorio_fisica',
  ssl: true
});

module.exports = pool;
