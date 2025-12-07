const axios = require('axios');
const fs = require('fs/promises');
const ApiError = require('../utils/ApiError');
const config = require('../config');

function buildPrompt(originalName, base64Content) {
  return `
You are an expert at analyzing business contracts and procurement documents.
Identify every placeholder or field that typically requires human input (e.g., company name, contract amount, signature dates).

Return strictly JSON in the following shape:
{
  "fields": [
    {
      "fieldId": "string",
      "label": "concise field name",
      "extractedText": "original snippet containing the blank",
      "page": 1,
      "coordinates": { "x": 0, "y": 0, "width": 0, "height": 0 },
      "aiSuggestion": "guidance for what to fill in",
      "confidence": 0.5
    }
  ]
}

If position data is unknown, keep coordinates null.

Document metadata:
- File name: ${originalName}
- File content (Base64, UTF-8 encoded): ${base64Content}

Respond ONLY with JSON. Do not wrap in markdown.
  `.trim();
}

function parseJsonResponse(messageContent) {
  if (!messageContent) {
    throw new Error('Empty response from DeepSeek');
  }

  const jsonStart = messageContent.indexOf('{');
  const jsonEnd = messageContent.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('JSON payload missing in DeepSeek response');
  }

  const jsonString = messageContent.slice(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonString);
}

function buildMockFields(originalName) {
  return [
    {
      fieldId: 'mock-1',
      label: '合同编号',
      extractedText: '合同编号：__________',
      page: 1,
      coordinates: null,
      aiSuggestion: `填写 ${originalName} 对应的合同编号`,
      confidence: 0.5,
    },
  ];
}

async function extractFieldsFromDocument(file) {
  const buffer = await fs.readFile(file.path);
  const base64 = buffer.toString('base64');

  if (!config.deepseek.enabled || !config.deepseek.apiKey) {
    return buildMockFields(file.originalname);
  }

  try {
    const prompt = buildPrompt(file.originalname, base64);
    const response = await axios.post(
      `${config.deepseek.baseUrl.replace(/\/$/, '')}/v1/chat/completions`,
      {
        model: config.deepseek.model,
        messages: [
          {
            role: 'system',
            content:
              'You detect fillable fields from business documents and respond with clean JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.deepseek.apiKey}`,
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    const parsed = parseJsonResponse(content);
    return Array.isArray(parsed.fields) ? parsed.fields : [];
  } catch (error) {
    throw new ApiError(
      502,
      'DEEPSEEK_ERROR',
      'Failed to extract fields via DeepSeek',
      error.response?.data || error.message
    );
  }
}

module.exports = {
  extractFieldsFromDocument,
};
