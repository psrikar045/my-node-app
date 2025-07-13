const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const extractRoute = require('./src/routes/extract');
const { createError } = require('./src/utils/errorUtils');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: (_, res) => {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
});
app.use(limiter);

// Routes
app.use('/api/extract-company-details', extractRoute);

// Error handling
app.use((err, req, res, _next) => {
  if (err && err.errorType) {
    res.status(400).json(err);
  } else {
    res.status(500).json(createError('ExtractionError', err.message));
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
