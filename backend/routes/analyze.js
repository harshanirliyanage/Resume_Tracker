const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { analyzeResume } = require('../services/aiService');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed.'));
    }
    cb(null, true);
  },
});

// POST /api/analyze — Upload PDF + job description, run AI analysis
router.post('/', authenticate, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Resume PDF is required.' });
  }

  const { jobDescription } = req.body;
  if (!jobDescription || jobDescription.trim().length < 50) {
    return res.status(400).json({ error: 'Job description must be at least 50 characters.' });
  }

  let filePath = req.file.path;

  try {
    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ error: 'Could not extract enough text from the PDF. Ensure it is not image-only.' });
    }

    // Call Claude AI
    const aiResult = await analyzeResume(resumeText, jobDescription.trim());

    // Save result to database
    const stmt = db.prepare(`
      INSERT INTO analyses (user_id, job_title, company, match_score, missing_keywords, improvement_tips, resume_filename, job_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.id,
      aiResult.jobTitle || 'Not specified',
      aiResult.company || 'Not specified',
      aiResult.matchScore,
      JSON.stringify(aiResult.missingKeywords),
      JSON.stringify({ tips: aiResult.improvementTips, strengths: aiResult.strengths }),
      req.file.originalname,
      jobDescription.trim()
    );

    res.json({
      id: result.lastInsertRowid,
      matchScore: aiResult.matchScore,
      jobTitle: aiResult.jobTitle,
      company: aiResult.company,
      missingKeywords: aiResult.missingKeywords,
      improvementTips: aiResult.improvementTips,
      strengths: aiResult.strengths,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Analysis error:', err);
    if (err.message.includes('JSON')) {
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }
    res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' });
  } finally {
    // Clean up uploaded file
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
});

// GET /api/analyze/history — Get all past analyses for the logged-in user
router.get('/history', authenticate, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, job_title, company, match_score, missing_keywords, improvement_tips, resume_filename, created_at
      FROM analyses
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    const analyses = rows.map((row) => ({
      id: row.id,
      jobTitle: row.job_title,
      company: row.company,
      matchScore: row.match_score,
      missingKeywords: JSON.parse(row.missing_keywords),
      improvementTips: JSON.parse(row.improvement_tips),
      resumeFilename: row.resume_filename,
      createdAt: row.created_at,
    }));

    res.json({ analyses });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// GET /api/analyze/:id — Get single analysis detail
router.get('/:id', authenticate, (req, res) => {
  try {
    const row = db.prepare(`
      SELECT * FROM analyses WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!row) return res.status(404).json({ error: 'Analysis not found.' });

    res.json({
      id: row.id,
      jobTitle: row.job_title,
      company: row.company,
      matchScore: row.match_score,
      missingKeywords: JSON.parse(row.missing_keywords),
      improvementTips: JSON.parse(row.improvement_tips),
      resumeFilename: row.resume_filename,
      jobDescription: row.job_description,
      createdAt: row.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
});

// DELETE /api/analyze/:id — Delete a single analysis
router.delete('/:id', authenticate, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM analyses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Analysis not found.' });
    res.json({ message: 'Analysis deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete analysis.' });
  }
});

module.exports = router;
