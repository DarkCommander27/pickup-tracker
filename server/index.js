const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Load configuration
let config = {
  organization: {
    name: "Food Pantry Management",
    subtitle: "Pickup Tracking System",
    logoUrl: "",
    logoText: "Organization Logo"
  },
  app: {
    title: "Pickup Tracker",
    port: 3000
  },
  items: ["Food", "Household Items", "Clothes"],
  demo: {
    enabled: false,
    loadSampleData: false
  }
};

const configPath = path.join(__dirname, 'config.json');
if (fs.existsSync(configPath)) {
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = { ...config, ...JSON.parse(configData) };
  } catch (err) {
    console.warn('Could not load config.json, using defaults');
  }
}

// parse JSON bodies early so routes can rely on req.body
app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());

// sessions for admin
const session = require('express-session');
app.use(session({ secret: process.env.SESSION_SECRET || 'change-this-secret', resave: false, saveUninitialized: false }));
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');

// SECURITY WARNING: Change default credentials in production!
// Set ADMIN_USER and ADMIN_PASS environment variables
// Set SESSION_SECRET environment variable to a strong random string
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'password';
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASS, 8);

// Warn if using default credentials
if (process.env.NODE_ENV === 'production' && ADMIN_PASS === 'password') {
  console.warn('⚠️  WARNING: Using default admin password in production!');
  console.warn('⚠️  Please set ADMIN_PASS environment variable to a secure password.');
}

// Input validation and sanitization
function validateAndSanitizeInput(input, maxLength = 1000) {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  res.status(401).json({ error: 'unauthorized' });
}


// Serve static client files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Serve configuration to frontend
app.get('/api/config', (req, res) => {
  res.json(config);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const defaultData = { pickups: [], nextId: 1 };
const db = new Low(adapter, defaultData);

async function initDb() {
  await db.read();
  db.data = db.data || { pickups: [], nextId: 1 };
  db.data.persons = db.data.persons || [];
  db.data.nextPersonId = db.data.nextPersonId || 1;
  
  // Load sample data if enabled and database is empty
  if (config.demo.loadSampleData && db.data.pickups.length === 0) {
    console.log('Loading sample data...');
    db.data.persons = [
      { id: 1, name: 'John Smith' },
      { id: 2, name: 'Mary Johnson' },
      { id: 3, name: 'Robert Davis' },
      { id: 4, name: 'Lisa Wilson' },
      { id: 5, name: 'Michael Brown' }
    ];
    db.data.nextPersonId = 6;
    
    const today = new Date().toISOString().slice(0, 10);
    db.data.pickups = [
      { id: 1, name: 'John Smith', date: today, notes: 'First visit', items: ['Food', 'Household Items'], signature: null },
      { id: 2, name: 'Mary Johnson', date: today, notes: 'Regular client', items: ['Food'], signature: null },
      { id: 3, name: 'Robert Davis', date: today, notes: '', items: ['Clothes'], signature: null }
    ];
    db.data.nextId = 4;
    
    await db.write();
    console.log('Sample data loaded successfully');
  }
  
  await db.write();
}

initDb();

// JSON parse error handler (returns JSON instead of HTML stack)
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid json' });
  }
  next(err);
});

// Admin: View client intake submissions (protected)
app.get('/admin/client-intake', requireAdmin, async (req, res) => {
  await db.read();
  res.json(db.data.clientIntake || []);
});

// Admin: Export pickups as CSV (protected)
app.get('/admin/pickups/export', requireAdmin, async (req, res) => {
  await db.read();
  const data = db.data.pickups || [];
  const csv = [
    'ID,Name,Date,Items,Notes,Has Signature',
    ...data.map(p => [
      p.id, 
      p.name, 
      p.date, 
      (p.items || []).join('; '), 
      (p.notes || '').replace(/"/g,'""'), 
      p.signature ? 'Yes' : 'No'
    ].map(v => '"'+String(v).replace(/"/g,'""')+'"').join(','))
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pickups.csv"');
  res.send(csv);
});

// Client intake endpoint
app.post('/api/client-intake', async (req, res) => {
  const name = validateAndSanitizeInput(req.body.name, 255);
  const date = validateAndSanitizeInput(req.body.date, 20);
  const notes = validateAndSanitizeInput(req.body.notes, 1000);
  if (!name || !date) return res.status(400).json({ error: 'name and date required' });
  await db.read();
  db.data.clientIntake = db.data.clientIntake || [];
  const entry = { id: (db.data.clientIntake.length + 1), name, date, notes, submitted: new Date().toISOString() };
  db.data.clientIntake.push(entry);
  await db.write();
  res.status(201).json({ ok: true });
});

app.get('/api/pickups', async (req, res) => {
  await db.read();
  res.json(db.data.pickups);
});

app.post('/api/pickups', async (req, res) => {
  const name = validateAndSanitizeInput(req.body.name, 255);
  const date = validateAndSanitizeInput(req.body.date, 20);
  const notes = validateAndSanitizeInput(req.body.notes, 1000);
  if (!name || !date) return res.status(400).json({ error: 'name and date required' });
  await db.read();
  const pickup = { id: db.data.nextId++, name, date, notes: notes || '' };
  db.data.pickups.push(pickup);
  await db.write();
  res.status(201).json(pickup);
});

// Create pickup with optional signature
app.post('/api/pickups/sign', async (req, res) => {
  // Accepts { name, date, notes, signature, items }
  const name = validateAndSanitizeInput(req.body.name, 255);
  const date = validateAndSanitizeInput(req.body.date, 20);
  const notes = validateAndSanitizeInput(req.body.notes, 1000);
  const signature = req.body.signature; // Keep signature as-is (base64 data URL)
  const items = Array.isArray(req.body.items) ? req.body.items.map(item => validateAndSanitizeInput(item, 100)) : [];
  if (!name || !date) return res.status(400).json({ error: 'name and date required' });
  await db.read();
  const pickup = { id: db.data.nextId++, name, date, notes: notes || '', signature: signature || null, items };
  db.data.pickups.push(pickup);
  await db.write();
  res.status(201).json(pickup);
});

// Persons endpoints

// Public: Get persons for autocomplete
app.get('/api/persons', async (req, res) => {
  await db.read();
  res.json(db.data.persons || []);
});

// Admin: View people (protected)
app.get('/admin/persons', requireAdmin, async (req, res) => {
  await db.read();
  res.json(db.data.persons || []);
});

// Admin: Add person (protected)
app.post('/admin/persons', requireAdmin, async (req, res) => {
  const name = validateAndSanitizeInput(req.body.name, 255);
  if (!name) return res.status(400).json({ error: 'name required' });
  await db.read();
  db.data.persons = db.data.persons || [];
  const person = { id: (db.data.nextPersonId || 1), name };
  db.data.nextPersonId = (db.data.nextPersonId || 1) + 1;
  db.data.persons.push(person);
  await db.write();
  res.status(201).json(person);
});

// Public: Add person (for clients during pickup)
app.post('/api/persons', async (req, res) => {
  const name = validateAndSanitizeInput(req.body.name, 255);
  if (!name) return res.status(400).json({ error: 'name required' });
  await db.read();
  db.data.persons = db.data.persons || [];
  // Check if person already exists
  const existing = db.data.persons.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) return res.status(200).json(existing);
  // Add new person
  const person = { id: (db.data.nextPersonId || 1), name };
  db.data.nextPersonId = (db.data.nextPersonId || 1) + 1;
  db.data.persons.push(person);
  await db.write();
  res.status(201).json(person);
});

app.put('/admin/persons/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.read();
  db.data.persons = db.data.persons || [];
  const idx = db.data.persons.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const updatedData = { ...db.data.persons[idx], ...req.body };
  delete updatedData.address; // Ensure address is not updated
  db.data.persons[idx] = updatedData;
  await db.write();
  res.json(db.data.persons[idx]);
});

app.delete('/admin/persons/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.read();
  db.data.persons = db.data.persons || [];
  const before = db.data.persons.length;
  db.data.persons = db.data.persons.filter(p => p.id !== id);
  await db.write();
  res.json({ deleted: before - db.data.persons.length });
});

// Admin login routes
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_HASH)) {
    req.session.admin = { user: ADMIN_USER };
    return res.json({ ok: true });
  }
  return res.status(401).json({ error: 'invalid' });
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Admin UI (simple JSON pages — client-side viewing is disabled per request)
app.get('/admin/data', requireAdmin, async (req, res) => {
  await db.read();
  res.json({ persons: db.data.persons || [], pickups: db.data.pickups || [] });
});

// PDF export endpoints
app.get('/admin/export/pdf', requireAdmin, async (req, res) => {
  await db.read();
  const pickups = db.data.pickups || [];
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="pickups.pdf"');
  const doc = new PDFDocument({ margin: 30 });
  doc.pipe(res);
  doc.fontSize(18).text('Pickups Report', { align: 'center' });
  doc.moveDown();
  pickups.forEach((p) => {
    doc.fontSize(12).text(`ID: ${p.id} — ${p.name} — ${p.date}`);
    if (p.address) doc.text(`Address: ${p.address}`);
    if (p.items && p.items.length) doc.text(`Items: ${p.items.join(', ')}`);
    if (p.notes) doc.text(`Notes: ${p.notes}`);
    if (p.signature) {
      // embed signature image (data URL)
      try {
        const data = p.signature.split(',')[1];
        const img = Buffer.from(data, 'base64');
        doc.image(img, { width: 200 });
      } catch (err) {
        doc.text('[signature could not be rendered]');
      }
    }
    doc.moveDown();
  });
  doc.end();
});

app.get('/admin/export/pdf/:id', requireAdmin, async (req, res) => {
  await db.read();
  const id = Number(req.params.id);
  const p = (db.data.pickups || []).find(x => x.id === id);
  if (!p) return res.status(404).send('not found');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="pickup-${id}.pdf"`);
  const doc = new PDFDocument({ margin: 30 });
  doc.pipe(res);
  doc.fontSize(16).text(`Pickup ${p.id}`, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Name: ${p.name}`);
  doc.text(`Date: ${p.date}`);
  if (p.address) doc.text(`Address: ${p.address}`);
  if (p.items && p.items.length) doc.text(`Items: ${p.items.join(', ')}`);
  if (p.notes) doc.text(`Notes: ${p.notes}`);
  if (p.signature) {
    try {
      const data = p.signature.split(',')[1];
      const img = Buffer.from(data, 'base64');
      doc.moveDown();
      doc.image(img, { width: 300 });
    } catch (err) {
      doc.text('[signature could not be rendered]');
    }
  }
  doc.end();
});

app.put('/api/pickups/:id', async (req, res) => {
  const id = Number(req.params.id);
  await db.read();
  const idx = db.data.pickups.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const updated = Object.assign(db.data.pickups[idx], req.body);
  db.data.pickups[idx] = updated;
  await db.write();
  res.json(updated);
});

app.delete('/api/pickups/:id', async (req, res) => {
  const id = Number(req.params.id);
  await db.read();
  const before = db.data.pickups.length;
  db.data.pickups = db.data.pickups.filter(p => p.id !== id);
  await db.write();
  res.json({ deleted: before - db.data.pickups.length });
});

// Public JSON export should be restricted to admins
app.get('/api/export', requireAdmin, async (req, res) => {
  await db.read();
  res.setHeader('Content-Disposition', 'attachment; filename="pickups.json"');
  res.json(db.data.pickups);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
