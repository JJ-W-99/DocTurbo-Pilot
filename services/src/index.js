import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(cors());
// handle preflight requests for all routes
app.options('*', cors());
app.use(express.json());

app.get('/api/ping', (_, res) => {
  res.json({ status: 'ok' });
});

// simple in-memory store for prototype
const agreements = [];

app.post('/api/agreements', (req, res) => {
  const { landlordName, tenantName, propertyAddress } = req.body;
  if (!landlordName || !tenantName || !propertyAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = agreements.length + 1;
  const record = {
    id,
    landlordName,
    tenantName,
    propertyAddress,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  agreements.push(record);
  return res.status(201).json(record);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
