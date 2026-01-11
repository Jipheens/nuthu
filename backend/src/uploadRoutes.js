const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage to save files with a timestamp prefix
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/upload/image
// Accepts: multipart/form-data with field name "image"
// Returns: { url: string } where url is a public URL to the stored image
router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const relativePath = `/uploads/${req.file.filename}`;
  const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl.replace(/\/$/, '')}${relativePath}`;

  res.status(201).json({ url, path: relativePath });
});

module.exports = router;
