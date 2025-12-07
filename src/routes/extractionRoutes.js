const express = require('express');
const multer = require('multer');
const fs = require('fs');
const config = require('../config');
const { processDocument } = require('../services/documentExtractionService');
const ApiError = require('../utils/ApiError');

fs.mkdirSync(config.files.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.files.uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (config.files.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'UNSUPPORTED_FILE_TYPE',
        `Only ${config.files.allowedMimeTypes.join(', ')} are allowed`
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.files.maxSize,
  },
});

const router = express.Router();

router.post('/documents/extract', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'FILE_REQUIRED', 'A PDF or Word file is required');
    }

    const payload = await processDocument(req.file);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
