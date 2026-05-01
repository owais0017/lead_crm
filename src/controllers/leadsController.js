const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { isValidTransition } = require('../db/statusMachine');

// Helper: validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /leads
function createLead(req, res) {
  const { name, email, phone, source } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  if (!isValidEmail(email)) {
    return res.status(422).json({ error: 'email format is invalid' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO leads (id, name, email, phone, status, source, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'NEW', ?, ?, ?)
  `);

  stmt.run(id, name, email, phone || null, source || null, now, now);

  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
  return res.status(201).json(lead);
}

// GET /leads
function getAllLeads(req, res) {
  const { status } = req.query;

  if (status) {
    const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    const leads = db.prepare('SELECT * FROM leads WHERE status = ?').all(status);
    return res.status(200).json(leads);
  }

  const leads = db.prepare('SELECT * FROM leads').all();
  return res.status(200).json(leads);
}

// GET /leads/:id
function getLeadById(req, res) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  return res.status(200).json(lead);
}

// PUT /leads/:id
function updateLead(req, res) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const { name, email, phone, source } = req.body;

  if (email && !isValidEmail(email)) {
    return res.status(422).json({ error: 'email format is invalid' });
  }

  const updatedName   = name   ?? lead.name;
  const updatedEmail  = email  ?? lead.email;
  const updatedPhone  = phone  ?? lead.phone;
  const updatedSource = source ?? lead.source;
  const updatedAt     = new Date().toISOString();

  db.prepare(`
    UPDATE leads
    SET name = ?, email = ?, phone = ?, source = ?, updated_at = ?
    WHERE id = ?
  `).run(updatedName, updatedEmail, updatedPhone, updatedSource, updatedAt, req.params.id);

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  return res.status(200).json(updated);
}

// DELETE /leads/:id
function deleteLead(req, res) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  return res.status(200).json({ message: 'Lead deleted successfully' });
}

// PATCH /leads/:id/status
function updateStatus(req, res) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);

  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  if (!isValidTransition(lead.status, status)) {
    return res.status(400).json({
      error: `Invalid status transition from ${lead.status} to ${status}`
    });
  }

  const updatedAt = new Date().toISOString();
  db.prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, updatedAt, req.params.id);

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  return res.status(200).json(updated);
}

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  updateStatus
};