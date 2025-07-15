#!/bin/bash

# LinkedIn Anti-Block Deployment Script for Ubuntu Server
# This script sets up the environment with anti-blocking measures

echo "🚀 LinkedIn Anti-Block Deployment Script"
echo "========================================"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  This script should not be run as root"
   exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y

# Install Chrome with dependencies
echo "🌐 Installing Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update -y
sudo apt-get install -y google-chrome-stable

# Install additional dependencies for anti-blocking
echo "🔧 Installing additional dependencies..."
sudo apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libxss1 \
    libgconf-2-4

# Install Node.js (if not already installed)
echo "🟢 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Create project directory and navigate
PROJECT_DIR="/opt/linkedin-extractor"
echo "📁 Setting up project directory: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create environment file with anti-blocking settings
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
# LinkedIn Anti-Block Configuration for Ubuntu Server
NODE_ENV=production
PORT=3000

# Aggressive anti-blocking settings
LINKEDIN_BASE_DELAY=12000
LINKEDIN_MAX_DELAY=60000
LINKEDIN_BURST_DELAY=120000
LINKEDIN_MAX_REQUESTS_PER_HOUR=8

# Browser session settings
LINKEDIN_SESSION_DURATION=900000
LINKEDIN_ROTATE_USER_AGENT=true
LINKEDIN_HUMAN_BEHAVIOR=true

# Anti-block detection
LINKEDIN_COOLDOWN_PERIOD=900000
LINKEDIN_MAX_COOLDOWN_PERIOD=3600000
LINKEDIN_BACKOFF_MULTIPLIER=2
LINKEDIN_AUTO_RESET=true

# Retry configuration
LINKEDIN_MAX_ATTEMPTS=3
LINKEDIN_BASE_RETRY_DELAY=2000
LINKEDIN_RETRY_MULTIPLIER=2

# Timeout settings for server environment
LINKEDIN_NAVIGATION_TIMEOUT=45000
LINKEDIN_EXTRACTION_TIMEOUT=60000
LINKEDIN_TOTAL_TIMEOUT=300000

# Puppeteer cache
PUPPETEER_CACHE_DIR=/tmp/puppeteer_cache
EOF

# Create session directory
echo "📁 Creating session directory..."
mkdir -p sessions
chmod 755 sessions

# Create startup script
echo "🚀 Creating startup script..."
cat > start-linkedin-server.sh << 'EOF'
#!/bin/bash
# LinkedIn Server Startup Script with Anti-Block Measures

echo "🔍 Starting LinkedIn Extraction Server with Anti-Block Protection..."

# Create log directory
mkdir -p logs

# Start server with enhanced logging
NODE_ENV=production npm start 2>&1 | tee -a logs/server-$(date +%Y%m%d).log
EOF

chmod +x start-linkedin-server.sh

# Create systemd service file
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/linkedin-extractor.service > /dev/null << EOF
[Unit]
Description=LinkedIn Data Extraction Service with Anti-Block Protection
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=30
Environment=NODE_ENV=production
Environment=PATH=/usr/local/bin:/usr/bin:/bin

# Resource limits
LimitNOFILE=65536
MemoryMax=2G

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=linkedin-extractor

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "🎯 Enabling LinkedIn service..."
sudo systemctl daemon-reload
sudo systemctl enable linkedin-extractor.service

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > monitor-linkedin.sh << 'EOF'
#!/bin/bash
# LinkedIn Service Monitoring Script

echo "📊 LinkedIn Extraction Service Status"
echo "===================================="

# Service status
echo "🔍 Service Status:"
sudo systemctl status linkedin-extractor.service --no-pager -l

echo ""
echo "📈 Anti-Block Statistics:"
curl -s http://localhost:3000/linkedin-stats | jq '.' || echo "Service not responding"

echo ""
echo "🔍 Recent Logs:"
sudo journalctl -u linkedin-extractor.service -n 20 --no-pager

echo ""
echo "💾 Memory Usage:"
ps aux | grep "node index.js" | grep -v grep

echo ""
echo "🌐 Port Status:"
netstat -tlnp | grep :3000 || echo "Port 3000 not listening"
EOF

chmod +x monitor-linkedin.sh

# Create troubleshooting script
echo "🔧 Creating troubleshooting script..."
cat > troubleshoot-linkedin.sh << 'EOF'
#!/bin/bash
# LinkedIn Troubleshooting Script

echo "🔧 LinkedIn Extraction Troubleshooting"
echo "====================================="

# Test Chrome installation
echo "🌐 Testing Chrome installation..."
google-chrome --version || echo "❌ Chrome not installed properly"

# Test Node.js and npm
echo "🟢 Testing Node.js..."
node --version
npm --version

# Test LinkedIn extraction
echo "🔍 Testing LinkedIn extraction..."
node troubleshoot-linkedin.js

# Check for blocking
echo "🛡️  Checking for blocking signs..."
curl -s http://localhost:3000/linkedin-stats | jq '.antiBlock' || echo "Service not responding"

# Check system resources
echo "💾 System Resources:"
free -h
df -h

echo ""
echo "🔍 Recent Error Logs:"
sudo journalctl -u linkedin-extractor.service -p err -n 10 --no-pager
EOF

chmod +x troubleshoot-linkedin.sh

# Run initial tests
echo "🧪 Running initial tests..."
node troubleshoot-linkedin.js

echo ""
echo "✅ LinkedIn Anti-Block Deployment Complete!"
echo "=========================================="
echo ""
echo "🎯 Next Steps:"
echo "1. Start the service: sudo systemctl start linkedin-extractor.service"
echo "2. Monitor performance: ./monitor-linkedin.sh"
echo "3. Test extraction: curl -X POST http://localhost:3000/api/extract-company-details -H 'Content-Type: application/json' -d '{\"url\":\"https://www.linkedin.com/company/microsoft/\"}'"
echo "4. Check anti-block status: curl http://localhost:3000/linkedin-stats"
echo ""
echo "🔧 Troubleshooting:"
echo "- Run: ./troubleshoot-linkedin.sh"
echo "- Check logs: sudo journalctl -u linkedin-extractor.service -f"
echo "- Monitor system: ./monitor-linkedin.sh"
echo ""
echo "⚠️  Important: Monitor the anti-block statistics and adjust settings if needed"
EOF