const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

/**
 * Uploads file to Tencent COS.
 * Placeholder implementation that just simulates an upload and
 * returns a fake URL composed from the configured baseUrl.
 * Replace with official COS SDK integration when credentials are available.
 */
async function uploadToCos(file) {
  if (!config.cos.enabled) {
    return {
      fileId: file.filename || path.basename(file.path),
      fileUrl: '',
    };
  }

  if (!config.cos.baseUrl) {
    throw new Error('COS baseUrl is required when COS is enabled');
  }

  const fileId = uuidv4();
  const cosKey = `${fileId}_${file.originalname}`;

  // TODO: Replace with COS SDK upload using config.cos credentials.
  // Keeping file on disk for now to allow user-managed upload lifecycle.
  await fs.access(file.path);

  const normalizedBase = config.cos.baseUrl.replace(/\/$/, '');
  const fileUrl = `${normalizedBase}/${cosKey}`;

  return {
    fileId: cosKey,
    fileUrl,
  };
}

module.exports = {
  uploadToCos,
};
