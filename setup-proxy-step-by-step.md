# 🛠️ Step-by-Step Proxy Setup Guide

## 🎯 **Option 1: Smartproxy (Recommended for LinkedIn)**

### **Step 1: Sign Up**
1. Go to [smartproxy.com](https://smartproxy.com)
2. Create account (usually $75/month minimum)
3. Choose "Residential Proxies" package
4. Get your dashboard credentials

### **Step 2: Get Proxy Details**
```bash
# From your Smartproxy dashboard, you'll get:
Endpoint: gate.smartproxy.com
Port: 10000-10002 (multiple ports available)
Username: your-username
Password: your-password
```

### **Step 3: Configure in Your System**
```bash
# Edit your .env file
nano .env

# Add this line:
LINKEDIN_PROXIES='[
  {
    "id": "smartproxy-1",
    "host": "gate.smartproxy.com",
    "port": 10000,
    "username": "your-username",
    "password": "your-password",
    "protocol": "http"
  },
  {
    "id": "smartproxy-2", 
    "host": "gate.smartproxy.com",
    "port": 10001,
    "username": "your-username",
    "password": "your-password",
    "protocol": "http"
  }
]'
```

### **Step 4: Test Configuration**
```bash
# Test proxy connectivity
node proxy-setup-examples.js test

# Start server
npm start

# Test LinkedIn extraction with proxy
curl -X POST http://localhost:3000/api/extract-company-details \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.linkedin.com/company/microsoft/"}'
```

---

## 🎯 **Option 2: IPRoyal (Budget-Friendly)**

### **Step 1: Sign Up**
1. Go to [iproyal.com](https://iproyal.com)
2. Create account (starts at $1.75/GB)
3. Choose "Residential Proxies" 
4. Purchase data package (start with 1GB for testing)

### **Step 2: Get Proxy Details**
```bash
# From IPRoyal dashboard:
Endpoint: residential.iproyal.com
Port: 12321
Username: your-username
Password: your-password
```

### **Step 3: Configure**
```bash
# Edit .env file
LINKEDIN_PROXIES='[
  {
    "id": "iproyal-1",
    "host": "residential.iproyal.com",
    "port": 12321,
    "username": "your-username",
    "password": "your-password",
    "protocol": "http"
  }
]'
```

---

## 🎯 **Option 3: Webshare (Budget + Free Trial)**

### **Step 1: Sign Up**
1. Go to [webshare.io](https://webshare.io)
2. Create account (10 free proxies!)
3. Verify email
4. Access dashboard

### **Step 2: Get Free Proxies**
```bash
# Download your proxy list from dashboard
# Each proxy will look like:
IP: 198.23.239.134
Port: 80
Username: your-username
Password: your-password
```

### **Step 3: Configure Multiple Proxies**
```bash
# Edit .env file with your actual proxy IPs
LINKEDIN_PROXIES='[
  {
    "id": "webshare-1",
    "host": "198.23.239.134",
    "port": 80,
    "username": "your-username-1",
    "password": "your-password-1",
    "protocol": "http"
  },
  {
    "id": "webshare-2",
    "host": "198.23.239.135",
    "port": 80,
    "username": "your-username-2",
    "password": "your-password-2",
    "protocol": "http"
  }
]'
```

---

## 🎯 **Option 4: Free Proxies (Not Recommended)**

### **Step 1: Find Free Proxy Lists**
```bash
# Visit these sites (use at your own risk):
- free-proxy-list.net
- proxy-list.org
- hidemy.name/en/proxy-list
```

### **Step 2: Test Each Proxy**
```bash
# Test proxy manually
curl --proxy http://proxy-ip:port https://httpbin.org/ip

# Look for proxies that:
- Support HTTPS
- Have good speed (<5 seconds)
- Are located in US/EU
- Don't require authentication
```

### **Step 3: Configure Working Proxies**
```bash
# Only use proxies that passed your tests
LINKEDIN_PROXIES='[
  {
    "id": "free-proxy-1",
    "host": "working-proxy-ip",
    "port": 8080,
    "username": "",
    "password": "",
    "protocol": "http"
  }
]'
```

---

## 🔧 **Advanced Configuration**

### **Proxy Health Monitoring**
```javascript
// Monitor proxy performance
curl http://localhost:3000/linkedin-stats | jq '.proxies'

// Expected output:
{
  "proxies": [
    {
      "id": "smartproxy-1",
      "successCount": 25,
      "failureCount": 2,
      "avgResponseTime": 3500,
      "status": "active"
    }
  ]
}
```

### **Proxy Rotation Settings**
```bash
# Edit .env file for custom rotation
LINKEDIN_PROXY_ROTATION_INTERVAL=600000    # 10 minutes
LINKEDIN_PROXY_RETRY_ATTEMPTS=3            # 3 attempts per proxy
LINKEDIN_PROXY_TIMEOUT=30000               # 30 seconds timeout
```

### **Geographic Targeting**
```javascript
// For providers that support geo-targeting
const geographicProxies = [
    {
        id: 'smartproxy-us',
        host: 'gate.smartproxy.com',
        port: 10000,
        username: 'your-username-session-us',
        password: 'your-password',
        protocol: 'http'
    },
    {
        id: 'smartproxy-uk',
        host: 'gate.smartproxy.com',
        port: 10000,
        username: 'your-username-session-uk',
        password: 'your-password',
        protocol: 'http'
    }
];
```

---

## 📊 **Cost Breakdown by Provider**

### **Smartproxy (Recommended)**
- **Setup**: $75/month minimum
- **LinkedIn requests**: ~$0.10 per request
- **Monthly cost for 100 requests**: ~$85

### **IPRoyal (Budget)**
- **Setup**: $1.75/GB
- **LinkedIn requests**: ~$0.05 per request
- **Monthly cost for 100 requests**: ~$20

### **Webshare (Testing)**
- **Setup**: $2.99/month for 10 proxies
- **LinkedIn requests**: ~$0.01 per request
- **Monthly cost for 100 requests**: ~$5

### **Free Proxies**
- **Setup**: $0
- **LinkedIn requests**: $0
- **Success rate**: 10-20% (not recommended)

---

## 🚀 **Quick Start Commands**

### **1. Test Proxy Configuration**
```bash
# Test your proxy setup
node proxy-setup-examples.js test
```

### **2. Start Server with Proxies**
```bash
# Restart server to load proxy config
sudo systemctl restart linkedin-extractor.service
```

### **3. Monitor Proxy Performance**
```bash
# Check proxy statistics
curl http://localhost:3000/linkedin-stats | jq '.proxies'
```

### **4. Test LinkedIn Extraction**
```bash
# Test with proxy rotation
curl -X POST http://localhost:3000/api/extract-company-details \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.linkedin.com/company/microsoft/"}'
```

---

## 🎯 **Best Practices**

1. **Start with 2-3 proxies** for testing
2. **Monitor success rates** - should be >80%
3. **Rotate every 10-15 requests** to avoid detection
4. **Use residential proxies** for better LinkedIn compatibility
5. **Test before production** - always verify your setup
6. **Monitor costs** - track usage to avoid overspending
7. **Have backup proxies** in case some fail

---

## 🔍 **Troubleshooting Common Issues**

### **Proxy Authentication Failed**
```bash
# Check credentials in .env file
# Ensure username/password are correct
# Test with curl:
curl --proxy http://username:password@proxy-host:port https://httpbin.org/ip
```

### **Proxy Too Slow**
```bash
# Test proxy speed:
time curl --proxy http://proxy-host:port https://httpbin.org/ip

# Should be <5 seconds
# If slower, try different proxy
```

### **LinkedIn Still Blocking**
```bash
# Check if proxy is already flagged:
curl --proxy http://proxy-host:port https://www.linkedin.com

# Look for challenge/block pages
# Try different proxy or provider
```

**🎉 With proper proxy configuration, your LinkedIn extraction success rate should increase to 85-95%!**