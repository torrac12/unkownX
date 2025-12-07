const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');

module.exports = {
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  files: {
    uploadDir,
    maxSize: Number(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024, // 25MB default
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || ['application/pdf'].join(','))
      .split(',')
      .map((type) => type.trim())
      .filter(Boolean),
  },
  cos: {
    enabled: process.env.COS_ENABLED !== 'false',
    bucket: process.env.COS_BUCKET || '',
    region: process.env.COS_REGION || '',
    secretId: process.env.COS_SECRET_ID || '',
    secretKey: process.env.COS_SECRET_KEY || '',
    baseUrl: process.env.COS_BASE_URL || '', // e.g. https://bucket.cos.region.myqcloud.com
  },
  deepseek: {
    enabled: process.env.DEEPSEEK_ENABLED !== 'false',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  },
};
