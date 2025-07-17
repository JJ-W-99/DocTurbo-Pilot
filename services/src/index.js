import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Initialize PostgreSQL pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Run lightweight schema migrations on startup (idempotent)
async function runMigrations() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS agreements (
      id SERIAL PRIMARY KEY,
      landlord_name TEXT NOT NULL,
      tenant_name TEXT NOT NULL,
      property_address TEXT NOT NULL,
      tenancy_type TEXT,
      lease_start DATE,
      lease_end DATE,
      monthly_rent NUMERIC,
      rent_due_day INT,
      security_deposit NUMERIC,
      pet_deposit NUMERIC,
      json_data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS tenancy_type TEXT;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS lease_start DATE;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS lease_end DATE;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS rent_due_day INT;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS security_deposit NUMERIC;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS pet_deposit NUMERIC;`,
    `ALTER TABLE agreements ADD COLUMN IF NOT EXISTS json_data JSONB;`
  ];
  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error('Migration failed for:', sql, err.message);
    }
  }
}

// kick off migrations, but don't block startup
runMigrations().catch(console.error);


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

// List latest agreements (read-only helper)
app.get('/api/agreements', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const { rows } = await pool.query(
      `SELECT id, landlord_name AS "landlordName", tenant_name AS "tenantName", property_address AS "propertyAddress", created_at AS "createdAt" 
       FROM agreements ORDER BY id DESC LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

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
      `INSERT INTO agreements (
        landlord_name, tenant_name, property_address,
        tenancy_type, lease_start, lease_end, monthly_rent, rent_due_day,
        security_deposit, pet_deposit, json_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        landlordName,
        tenantName,
        propertyAddress,
        req.body.tenancyType || null,
        req.body.leaseStartDate || null,
        req.body.leaseEndDate || null,
        req.body.monthlyRent || null,
        req.body.rentDueDay || null,
        req.body.securityDepositAmount || null,
        req.body.petDamageDepositAmount || null,
        req.body,
      ]
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
