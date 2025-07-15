#!/bin/bash

# Chrome Installation Script for Ubuntu Server
# Optimized for LinkedIn data extraction

echo "🚀 Installing Chrome for Ubuntu Server..."

# Update package list
echo "📦 Updating package list..."
sudo apt-get update

# Install dependencies
echo "🔧 Installing dependencies..."
sudo apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    curl \
    unzip

# Add Google Chrome repository
echo "📥 Adding Google Chrome repository..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Update package list with new repository
sudo apt-get update

# Install Google Chrome
echo "🌐 Installing Google Chrome..."
sudo apt-get install -y google-chrome-stable

# Verify installation
echo "✅ Verifying Chrome installation..."
google-chrome --version

# Install Node.js dependencies if not already installed
echo "📦 Installing Node.js dependencies..."
npm install

# Test Chrome with Puppeteer
echo "🧪 Testing Chrome with Puppeteer..."
node check-puppeteer.js

echo "🎉 Chrome installation completed successfully!"
echo "💡 Chrome is now ready for LinkedIn data extraction on Ubuntu server"

# Display Chrome location
echo "📍 Chrome installed at:"
which google-chrome-stable || which google-chrome

# Additional optimizations for server environment
echo "🔧 Setting up server optimizations..."

# Create systemd override for better resource management (optional)
sudo mkdir -p /etc/systemd/system/
cat << EOF | sudo tee /etc/systemd/system/chrome-headless.service
[Unit]
Description=Chrome Headless Service
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/usr/bin/google-chrome-stable --headless --no-sandbox --disable-gpu --remote-debugging-port=9222
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Ubuntu Chrome setup completed!"
echo "🔗 Your server is now optimized for LinkedIn data extraction"