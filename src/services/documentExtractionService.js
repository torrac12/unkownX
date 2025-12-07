const cosService = require('./cosService');
const deepseekService = require('./deepseekService');

async function processDocument(file) {
  const cosResult = await cosService.uploadToCos(file);

  // Placeholder for local parsing hook. Developers can plug in
  // a parsing pipeline before or after the AI call.
  const fields = await deepseekService.extractFieldsFromDocument(file);

  return {
    fileId: cosResult.fileId,
    fileUrl: cosResult.fileUrl,
    fields,
  };
}

module.exports = {
  processDocument,
};
