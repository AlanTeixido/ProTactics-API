const path = require('path');
const multer = require('multer');

const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB

// Browsers report CSV files with different MIME types depending on the OS.
const CSV_MIME_TYPES = new Set([
  'text/csv',
  'text/plain',
  'text/x-csv',
  'application/csv',
  'application/x-csv',
  'application/vnd.ms-excel',
  'text/comma-separated-values',
  'application/octet-stream',
]);

// Single CSV file in the "csv" field, kept in memory (never written to disk).
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CSV_BYTES, files: 1, fields: 10 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (extension === '.csv' && CSV_MIME_TYPES.has(file.mimetype)) return cb(null, true);

    const err = new Error('Només s\'accepten arxius CSV (.csv).');
    err.status = 400;
    err.expose = true;
    return cb(err);
  },
}).single('csv');

module.exports = { csvUpload, MAX_CSV_BYTES };
