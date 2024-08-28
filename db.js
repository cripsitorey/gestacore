// const { Pool } = require('pg');
import pg from 'pg'
import {config} from 'dotenv'

config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

module.exports = pool;
