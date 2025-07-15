#!/usr/bin/env node

/**
 * LinkedIn Proxy Management System
 * Handles proxy rotation to avoid IP-based blocking
 */

class LinkedInProxyManager {
    constructor() {
        this.proxies = [];
        this.currentProxyIndex = 0;
        this.failedProxies = new Set();
        this.proxyStats = new Map();
        this.lastProxyRotation = Date.now();
        this.rotationInterval = 10 * 60 * 1000; // Rotate every 10 minutes
    }

    /**
     * Add proxy configuration
     */
    addProxy(proxy) {
        this.proxies.push({
            ...proxy,
            id: proxy.id || `proxy_${this.proxies.length}`,
            addedAt: Date.now(),
            lastUsed: null,
            successCount: 0,
            failureCount: 0,
            avgResponseTime: 0
        });
        
        console.log(`[Proxy Manager] Added proxy: ${proxy.id || 'unnamed'}`);
    }

    /**
     * Add multiple proxies from environment or config
     */
    loadProxiesFromConfig() {
        // Load from environment variables
        const proxyList = process.env.LINKEDIN_PROXIES;
        if (proxyList) {
            try {
                const proxies = JSON.parse(proxyList);
                proxies.forEach(proxy => this.addProxy(proxy));
            } catch (error) {
                console.error('[Proxy Manager] Error parsing LINKEDIN_PROXIES:', error.message);
            }
        }

        // Example proxy configurations (replace with your actual proxies)
        const exampleProxies = [
            {
                id: 'proxy1',
                host: 'proxy1.example.com',
                port: 8080,
                username: 'user1',
                password: 'pass1',
                protocol: 'http'
            },
            {
                id: 'proxy2', 
                host: 'proxy2.example.com',
                port: 8080,
                username: 'user2',
                password: 'pass2',
                protocol: 'http'
            }
        ];

        // Only add example proxies if no real proxies are configured
        if (this.proxies.length === 0 && process.env.NODE_ENV !== 'production') {
            console.log('[Proxy Manager] No proxies configured, running without proxy rotation');
        }
    }

    /**
     * Get next available proxy
     */
    getNextProxy() {
        if (this.proxies.length === 0) {
            return null;
        }

        const now = Date.now();
        
        // Check if we should rotate proxy
        if (now - this.lastProxyRotation > this.rotationInterval) {
            this.rotateProxy();
        }

        // Find next working proxy
        let attempts = 0;
        while (attempts < this.proxies.length) {
            const proxy = this.proxies[this.currentProxyIndex];
            
            if (!this.failedProxies.has(proxy.id)) {
                proxy.lastUsed = now;
                return proxy;
            }

            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
            attempts++;
        }

        console.warn('[Proxy Manager] All proxies failed, running without proxy');
        return null;
    }

    /**
     * Rotate to next proxy
     */
    rotateProxy() {
        if (this.proxies.length <= 1) return;

        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
        this.lastProxyRotation = Date.now();
        
        const currentProxy = this.proxies[this.currentProxyIndex];
        console.log(`[Proxy Manager] Rotated to proxy: ${currentProxy.id}`);
    }

    /**
     * Mark proxy as failed
     */
    markProxyFailed(proxyId) {
        this.failedProxies.add(proxyId);
        const proxy = this.proxies.find(p => p.id === proxyId);
        
        if (proxy) {
            proxy.failureCount++;
            console.log(`[Proxy Manager] Marked proxy as failed: ${proxyId} (failures: ${proxy.failureCount})`);
        }

        // Auto-recovery: Remove from failed list after 30 minutes
        setTimeout(() => {
            this.failedProxies.delete(proxyId);
            console.log(`[Proxy Manager] Proxy recovery: ${proxyId} re-enabled`);
        }, 30 * 60 * 1000);
    }

    /**
     * Mark proxy as successful
     */
    markProxySuccess(proxyId, responseTime) {
        const proxy = this.proxies.find(p => p.id === proxyId);
        
        if (proxy) {
            proxy.successCount++;
            proxy.avgResponseTime = (proxy.avgResponseTime + responseTime) / 2;
            this.failedProxies.delete(proxyId); // Remove from failed list
        }
    }

    /**
     * Get proxy configuration for Puppeteer
     */
    getPuppeteerProxyConfig(proxy) {
        if (!proxy) return {};

        const config = {
            args: [
                `--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`
            ]
        };

        return config;
    }

    /**
     * Authenticate proxy if needed
     */
    async authenticateProxy(page, proxy) {
        if (proxy && proxy.username && proxy.password) {
            await page.authenticate({
                username: proxy.username,
                password: proxy.password
            });
        }
    }

    /**
     * Get proxy statistics
     */
    getStats() {
        return {
            totalProxies: this.proxies.length,
            failedProxies: this.failedProxies.size,
            currentProxy: this.proxies[this.currentProxyIndex]?.id || 'none',
            lastRotation: new Date(this.lastProxyRotation).toISOString(),
            proxies: this.proxies.map(proxy => ({
                id: proxy.id,
                successCount: proxy.successCount,
                failureCount: proxy.failureCount,
                avgResponseTime: Math.round(proxy.avgResponseTime),
                lastUsed: proxy.lastUsed ? new Date(proxy.lastUsed).toISOString() : null,
                status: this.failedProxies.has(proxy.id) ? 'failed' : 'active'
            }))
        };
    }

    /**
     * Test proxy connectivity
     */
    async testProxy(proxy) {
        const puppeteer = require('puppeteer');
        
        try {
            const config = this.getPuppeteerProxyConfig(proxy);
            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    ...config.args
                ]
            });

            const page = await browser.newPage();
            await this.authenticateProxy(page, proxy);
            
            const startTime = Date.now();
            await page.goto('https://www.linkedin.com', { timeout: 30000 });
            const responseTime = Date.now() - startTime;
            
            await browser.close();
            
            this.markProxySuccess(proxy.id, responseTime);
            return { success: true, responseTime };
            
        } catch (error) {
            this.markProxyFailed(proxy.id);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test all proxies
     */
    async testAllProxies() {
        console.log('[Proxy Manager] Testing all proxies...');
        const results = [];
        
        for (const proxy of this.proxies) {
            const result = await this.testProxy(proxy);
            results.push({
                id: proxy.id,
                ...result
            });
        }
        
        return results;
    }
}

// Export singleton instance
const linkedInProxyManager = new LinkedInProxyManager();

module.exports = { 
    linkedInProxyManager, 
    LinkedInProxyManager 
};

// If run directly, test proxy functionality
if (require.main === module) {
    console.log('🌐 LinkedIn Proxy Manager');
    console.log('═══════════════════════════════════════');
    
    linkedInProxyManager.loadProxiesFromConfig();
    console.log('Current stats:', linkedInProxyManager.getStats());
    
    // Test proxies if available
    if (linkedInProxyManager.proxies.length > 0) {
        linkedInProxyManager.testAllProxies()
            .then(results => {
                console.log('Proxy test results:', results);
            })
            .catch(error => {
                console.error('Proxy testing failed:', error);
            });
    }
}