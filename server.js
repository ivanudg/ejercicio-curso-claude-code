'use strict';

const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kohi-dev-secret-change-in-prod';
const BCRYPT_ROUNDS = 10;

const db = new Database(path.join(__dirname, 'kohi.db'));

// Garantiza que email sea único a nivel de base de datos
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email)`);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Middleware JWT ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ─── POST /api/register ────────────────────────────────────────────────────────
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email y password son obligatorios' });
  }

  const existing = db.prepare('SELECT id FROM waitlist WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const maxRow = db.prepare('SELECT COALESCE(MAX(position), 0) AS max_pos FROM waitlist').get();
  const position = maxRow.max_pos + 1;

  db.prepare(
    'INSERT INTO waitlist (name, email, password_hash, position) VALUES (?, ?, ?, ?)'
  ).run(name, email, passwordHash, position);

  res.status(201).json({ ok: true, position });
});

// ─── POST /api/login ───────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const user = db.prepare('SELECT * FROM waitlist WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ ok: true, token });
});

// ─── GET /api/me ───────────────────────────────────────────────────────────────
app.get('/api/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT name, email, position FROM waitlist WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { count: total } = db.prepare('SELECT COUNT(*) AS count FROM waitlist').get();
  res.json({ name: user.name, email: user.email, position: user.position, total });
});

app.listen(PORT, () => console.log(`Kōhi server escuchando en http://localhost:${PORT}`));
