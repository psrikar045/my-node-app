const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { extractCompanyDetails } = require('../services/extractCompanyDetails');
const { createError } = require('../utils/errorUtils');

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  const { url, linkedin } = req.body || {};
  if (!url) {
    return res.status(400).json(createError('ValidationError', 'URL is required'));
  }
  const data = await extractCompanyDetails(url, linkedin);
  res.json(data);
}));

module.exports = router;
