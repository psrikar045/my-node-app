# SumNode - Company Details Extraction API

A Node.js API service that extracts company details from websites using Puppeteer and web scraping.

## Features

- Extract company details from any website URL
- LinkedIn company page scraping
- Automatic browser detection (Edge/Chrome)
- Production-ready deployment
- CORS enabled for cross-origin requests

## API Endpoints

### POST /api/extract-company-details

Extracts company details from a given URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "companyName": "Example Company",
  "description": "Company description...",
  "website": "https://example.com",
  // ... other extracted details
}
```

### GET /test

Simple health check endpoint.

### GET /test-browser

Browser detection test endpoint. Returns information about detected browsers and environment.

**Response:**
```json
{
  "success": true,
  "environment": "production",
  "generalBrowser": "/path/to/chrome",
  "linkedinBrowser": "/path/to/chrome",
  "platform": "linux",
  "puppeteerCacheDir": "default"
}
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Production Deployment

### Ubuntu Server Deployment (Recommended for LinkedIn extraction)

1. **Install Chrome on Ubuntu server:**
   ```bash
   npm run install-chrome-ubuntu
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test LinkedIn extraction:**
   ```bash
   npm run test-linkedin
   ```

4. **Troubleshoot LinkedIn issues (if needed):**
   ```bash
   npm run troubleshoot-linkedin
   ```

5. **Start the server:**
   ```bash
   NODE_ENV=production npm start
   ```

6. **Monitor LinkedIn performance:**
   ```bash
   # Check real-time stats
   curl http://localhost:3000/linkedin-stats
   
   # Run continuous monitoring
   npm run monitor-linkedin
   ```

### General Cloud Deployment

1. For cloud deployment, use the following settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Node Version:** 18+ (specified in package.json)

2. Set environment variables:
   - `NODE_ENV=production`

## Environment Variables

- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Server port (defaults to 3000)


## Browser Configuration

The application uses intelligent browser detection with different strategies:

### General Company Extraction:
- **Local Development:** Tries Edge → Chrome → Puppeteer bundled Chromium
- **Production:** Uses Puppeteer bundled Chromium

### LinkedIn Extraction:
- **Local Development:** Prefers Edge (better for LinkedIn) → Chrome → Puppeteer bundled Chromium  
- **Production:** Uses Puppeteer bundled Chromium

### Additional Features:
- Stealth measures for LinkedIn scraping (custom user agent, webdriver property removal)
- Container-optimized Chrome flags for production environments

### Test Browser Detection:
Use the `/test-browser` endpoint to verify browser detection:
```bash
curl http://localhost:3000/test-browser
```

## Dependencies

- **express**: Web framework
- **puppeteer**: Browser automation
- **cors**: Cross-origin resource sharing
- **dns**: Domain name resolution (Node.js built-in)

## Error Handling

The API includes comprehensive error handling for:
- Invalid URLs
- Unresolvable domains
- Browser launch failures
- Page load timeouts
- Network errors

## Ubuntu Server Troubleshooting

### LinkedIn Extraction Issues

**Problem:** LinkedIn extraction failing or timing out on Ubuntu server

**Solutions:**

1. **Install Chrome properly:**
   ```bash
   npm run install-chrome-ubuntu
   ```

2. **Check Chrome installation:**
   ```bash
   google-chrome --version
   npm run check-puppeteer
   ```

3. **Test LinkedIn extraction:**
   ```bash
   npm run test-linkedin
   ```

4. **Increase server resources:**
   - Minimum 2GB RAM recommended
   - Ensure sufficient disk space
   - Check CPU usage during extraction

5. **Network considerations:**
   - Ensure outbound HTTPS access to LinkedIn
   - Check for corporate firewalls blocking LinkedIn
   - Consider using a proxy if needed

6. **Optimize for your server:**
   - Increase timeouts if network is slow
   - Reduce concurrent extractions
   - Monitor memory usage

**Common Error Messages:**

- `Navigation timeout`: Increase timeout values in code
- `Protocol error`: Usually indicates Chrome/Chromium issues
- `net::ERR_`: Network connectivity problems
- `LinkedIn may be blocking requests`: Implement delays between requests

**Advanced Troubleshooting:**

```bash
# Run comprehensive diagnostics
npm run troubleshoot-linkedin

# Check LinkedIn extraction stats
curl http://localhost:3000/linkedin-stats

# Monitor performance in real-time
npm run monitor-linkedin
```

**Performance Optimization Features:**

- ✅ **Browser Session Reuse**: 30-minute shared browser sessions
- ✅ **Rate Limiting**: 2-second delays between LinkedIn requests
- ✅ **Retry Logic**: 3 attempts with exponential backoff
- ✅ **Resource Blocking**: Disabled images/ads for faster loading
- ✅ **Enhanced Stealth**: Linux-specific user agents and anti-detection
- ✅ **Memory Optimization**: Ubuntu server-specific Chrome flags
- ✅ **Performance Monitoring**: Real-time stats and error tracking

## License

ISC