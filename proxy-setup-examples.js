#!/usr/bin/env node

/**
 * Proxy Configuration Examples for Different Providers
 * Copy the configuration for your chosen provider
 */

// =============================================================================
// 1. SMARTPROXY CONFIGURATION (Recommended for LinkedIn)
// =============================================================================
const smartproxyConfig = {
    // Get these from your Smartproxy dashboard
    endpoint: 'gate.smartproxy.com',
    port: 10000,
    username: 'your-smartproxy-username',
    password: 'your-smartproxy-password',
    
    // Multiple proxy endpoints
    proxies: [
        {
            id: 'smartproxy-1',
            host: 'gate.smartproxy.com',
            port: 10000,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'smartproxy-2',
            host: 'gate.smartproxy.com',
            port: 10001,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'smartproxy-3',
            host: 'gate.smartproxy.com',
            port: 10002,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        }
    ]
};

// =============================================================================
// 2. OXYLABS CONFIGURATION (Enterprise)
// =============================================================================
const oxylabsConfig = {
    proxies: [
        {
            id: 'oxylabs-residential-1',
            host: 'pr.oxylabs.io',
            port: 7777,
            username: 'customer-your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'oxylabs-datacenter-1',
            host: 'dc.oxylabs.io',
            port: 8001,
            username: 'customer-your-username',
            password: 'your-password',
            protocol: 'http'
        }
    ]
};

// =============================================================================
// 3. IPROYAL CONFIGURATION (Beginner-Friendly)
// =============================================================================
const iproyalConfig = {
    proxies: [
        {
            id: 'iproyal-residential-1',
            host: 'residential.iproyal.com',
            port: 12321,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'iproyal-datacenter-1',
            host: 'datacenter.iproyal.com',
            port: 12323,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        }
    ]
};

// =============================================================================
// 4. WEBSHARE CONFIGURATION (Budget Option)
// =============================================================================
const webshareConfig = {
    proxies: [
        {
            id: 'webshare-1',
            host: 'proxy.webshare.io',
            port: 80,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'webshare-2',
            host: 'proxy.webshare.io',
            port: 80,
            username: 'your-username-2',
            password: 'your-password-2',
            protocol: 'http'
        }
    ]
};

// =============================================================================
// 5. PROXYMESH CONFIGURATION (Simple Setup)
// =============================================================================
const proxymeshConfig = {
    proxies: [
        {
            id: 'proxymesh-us',
            host: 'us-wa.proxymesh.com',
            port: 31280,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'proxymesh-uk',
            host: 'uk.proxymesh.com',
            port: 31280,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        }
    ]
};

// =============================================================================
// 6. CUSTOM PROXY CONFIGURATION (Your Own Proxies)
// =============================================================================
const customProxyConfig = {
    proxies: [
        {
            id: 'custom-proxy-1',
            host: 'your-proxy-server.com',
            port: 8080,
            username: 'your-username',
            password: 'your-password',
            protocol: 'http'
        },
        {
            id: 'custom-proxy-2',
            host: 'another-proxy.com',
            port: 3128,
            username: 'username2',
            password: 'password2',
            protocol: 'http'
        }
    ]
};

// =============================================================================
// CONFIGURATION HELPER FUNCTIONS
// =============================================================================

/**
 * Generate environment variable string for proxy configuration
 */
function generateProxyEnvString(config) {
    return `LINKEDIN_PROXIES='${JSON.stringify(config.proxies, null, 2)}'`;
}

/**
 * Test proxy configuration
 */
async function testProxyConfig(config) {
    console.log('🧪 Testing proxy configuration...');
    
    for (const proxy of config.proxies) {
        console.log(`Testing proxy: ${proxy.id}`);
        
        try {
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    `--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`
                ]
            });
            
            const page = await browser.newPage();
            
            // Authenticate if needed
            if (proxy.username && proxy.password) {
                await page.authenticate({
                    username: proxy.username,
                    password: proxy.password
                });
            }
            
            // Test connection
            const startTime = Date.now();
            await page.goto('https://httpbin.org/ip', { timeout: 30000 });
            const responseTime = Date.now() - startTime;
            
            const ipResult = await page.evaluate(() => {
                return document.body.textContent;
            });
            
            await browser.close();
            
            console.log(`✅ ${proxy.id}: Success (${responseTime}ms)`);
            console.log(`   IP: ${JSON.parse(ipResult).origin}`);
            
        } catch (error) {
            console.log(`❌ ${proxy.id}: Failed - ${error.message}`);
        }
    }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

// Export configurations for easy use
module.exports = {
    smartproxyConfig,
    oxylabsConfig,
    iproyalConfig,
    webshareConfig,
    proxymeshConfig,
    customProxyConfig,
    generateProxyEnvString,
    testProxyConfig
};

// If run directly, show configuration examples
if (require.main === module) {
    console.log('🌐 Proxy Configuration Examples');
    console.log('================================');
    
    console.log('\n1. SMARTPROXY (Recommended):');
    console.log(generateProxyEnvString(smartproxyConfig));
    
    console.log('\n2. IPROYAL (Beginner-Friendly):');
    console.log(generateProxyEnvString(iproyalConfig));
    
    console.log('\n3. WEBSHARE (Budget):');
    console.log(generateProxyEnvString(webshareConfig));
    
    console.log('\n🔧 To use:');
    console.log('1. Choose a provider from PROXY_PROVIDERS.md');
    console.log('2. Copy the appropriate configuration above');
    console.log('3. Replace with your actual credentials');
    console.log('4. Add to your .env file');
    console.log('5. Restart the server');
    
    console.log('\n🧪 To test configuration:');
    console.log('node proxy-setup-examples.js test');
}

// Test functionality if requested
if (process.argv[2] === 'test') {
    // Test with sample configuration (you'd replace with your actual config)
    const sampleConfig = {
        proxies: [
            {
                id: 'test-proxy',
                host: 'httpbin.org',
                port: 80,
                username: '',
                password: '',
                protocol: 'http'
            }
        ]
    };
    
    testProxyConfig(sampleConfig);
}