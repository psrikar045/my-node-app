#!/bin/bash

# Complete Ubuntu Server Deployment Script
# Optimized for LinkedIn Data Extraction

echo "🚀 Starting Ubuntu Server Deployment for LinkedIn Data Extraction..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Running as root. Consider creating a dedicated user for the application."
fi

# Update system
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Install Chrome for Ubuntu
echo "🌐 Installing Chrome for Ubuntu..."
npm run install-chrome-ubuntu

# Test the installation
echo "🧪 Testing Chrome installation..."
npm run check-puppeteer

# Test LinkedIn extraction
echo "🔗 Testing LinkedIn extraction..."
npm run test-linkedin

# Create systemd service for production
echo "⚙️  Setting up systemd service..."

SERVICE_NAME="linkedin-extractor"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
APP_DIR=$(pwd)
APP_USER=$(whoami)

sudo tee $SERVICE_FILE > /dev/null << EOF
[Unit]
Description=LinkedIn Data Extraction API
Documentation=https://github.com/your-repo
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096
MemoryMax=2G

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME

echo "🎉 Ubuntu deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "   1. Start the service: sudo systemctl start $SERVICE_NAME"
echo "   2. Check status: sudo systemctl status $SERVICE_NAME"
echo "   3. View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   4. Test API: curl http://localhost:3000/test"
echo ""
echo "🔧 Service Commands:"
echo "   Start:   sudo systemctl start $SERVICE_NAME"
echo "   Stop:    sudo systemctl stop $SERVICE_NAME"
echo "   Restart: sudo systemctl restart $SERVICE_NAME"
echo "   Status:  sudo systemctl status $SERVICE_NAME"
echo ""
echo "📊 Monitor the API:"
echo "   Test endpoint: curl http://localhost:3000/test-browser"
echo "   LinkedIn test: npm run test-linkedin"
echo ""
echo "🎯 Your LinkedIn Data Extraction API is ready!"