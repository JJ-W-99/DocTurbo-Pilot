import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  // create table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agreements (
      id SERIAL PRIMARY KEY,
      landlord_name TEXT NOT NULL,
      tenant_name TEXT NOT NULL,
      property_address TEXT NOT NULL,
      json_data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
})();

const app = express();
app.use(morgan('dev'));

// Explicit CORS handling for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  
  // Handle CORS for all other requests
  next();
});

// Handle OPTIONS explicitly for API routes
app.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
  res.sendStatus(204);
});

// Handle all other OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Foo, X-Bar');
  res.sendStatus(204);
});

// Continue with other middleware
app.use(express.json());
// handle preflight requests for all routes
app.options('*', cors());
app.use(express.json());

app.get('/api/ping', (_, res) => {
  res.json({ status: 'ok' });
});

// simple in-memory store for prototype
// in-memory fallback removed – we now persist to Postgres

app.post('/api/agreements', async (req, res) => {
  const { landlordName, tenantName, propertyAddress } = req.body;
  const errors = {};
  if (!landlordName) errors.landlordName = 'Required';
  if (!tenantName) errors.tenantName = 'Required';
  if (!propertyAddress) errors.propertyAddress = 'Required';
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO agreements (landlord_name, tenant_name, property_address, json_data)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [landlordName, tenantName, propertyAddress, req.body]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
