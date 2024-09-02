// const { Pool } = require('pg');
// import pg from 'pg'
const pg= require('pg');
const config = require('dotenv');

// config()

const pool = new pg.Pool({
  // Usar la linea comentada cuando se suba a produccion, esta configurada la variable de entorno en render
  // connectionString: process.env.DATABASE_URL,
  connectionString: 'postgresql://laboratorio_fisica_user:FIw0Byx63fzvkBzXf0X73LTcC0azFpsu@dpg-cr7aebq3esus7385ihd0-a.oregon-postgres.render.com/laboratorio_fisica',
  ssl: true
});

module.exports = pool;
