#!/usr/bin/env node

/**
 * LinkedIn Session Management System
 * Handles session persistence and cookie management to appear more human-like
 */

const fs = require('fs');
const path = require('path');

class LinkedInSessionManager {
    constructor() {
        this.sessionDir = path.join(__dirname, 'sessions');
        this.cookieFile = path.join(this.sessionDir, 'linkedin-cookies.json');
        this.sessionFile = path.join(this.sessionDir, 'linkedin-session.json');
        this.currentSession = null;
        this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
        
        this.ensureSessionDirectory();
    }

    /**
     * Ensure session directory exists
     */
    ensureSessionDirectory() {
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
        }
    }

    /**
     * Save cookies to file
     */
    async saveCookies(page) {
        try {
            const cookies = await page.cookies();
            const sessionData = {
                cookies,
                timestamp: Date.now(),
                userAgent: await page.evaluate(() => navigator.userAgent),
                url: page.url()
            };
            
            fs.writeFileSync(this.cookieFile, JSON.stringify(sessionData, null, 2));
            console.log(`[Session Manager] Saved ${cookies.length} cookies`);
            
        } catch (error) {
            console.error('[Session Manager] Error saving cookies:', error.message);
        }
    }

    /**
     * Load cookies from file
     */
    async loadCookies(page) {
        try {
            if (!fs.existsSync(this.cookieFile)) {
                console.log('[Session Manager] No saved cookies found');
                return false;
            }

            const sessionData = JSON.parse(fs.readFileSync(this.cookieFile, 'utf8'));
            
            // Check if session is still valid (not expired)
            const sessionAge = Date.now() - sessionData.timestamp;
            if (sessionAge > this.sessionTimeout) {
                console.log('[Session Manager] Saved session expired, starting fresh');
                this.clearSession();
                return false;
            }

            // Set cookies
            await page.setCookie(...sessionData.cookies);
            console.log(`[Session Manager] Loaded ${sessionData.cookies.length} cookies`);
            
            return true;
            
        } catch (error) {
            console.error('[Session Manager] Error loading cookies:', error.message);
            return false;
        }
    }

    /**
     * Save session state
     */
    async saveSession(additionalData = {}) {
        try {
            const sessionData = {
                timestamp: Date.now(),
                lastActivity: Date.now(),
                sessionId: this.generateSessionId(),
                ...additionalData
            };
            
            fs.writeFileSync(this.sessionFile, JSON.stringify(sessionData, null, 2));
            this.currentSession = sessionData;
            
            console.log(`[Session Manager] Session saved: ${sessionData.sessionId}`);
            
        } catch (error) {
            console.error('[Session Manager] Error saving session:', error.message);
        }
    }

    /**
     * Load session state
     */
    loadSession() {
        try {
            if (!fs.existsSync(this.sessionFile)) {
                return null;
            }

            const sessionData = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
            
            // Check if session is still valid
            const sessionAge = Date.now() - sessionData.timestamp;
            if (sessionAge > this.sessionTimeout) {
                console.log('[Session Manager] Session expired');
                this.clearSession();
                return null;
            }

            this.currentSession = sessionData;
            console.log(`[Session Manager] Session loaded: ${sessionData.sessionId}`);
            
            return sessionData;
            
        } catch (error) {
            console.error('[Session Manager] Error loading session:', error.message);
            return null;
        }
    }

    /**
     * Clear session and cookies
     */
    clearSession() {
        try {
            if (fs.existsSync(this.cookieFile)) {
                fs.unlinkSync(this.cookieFile);
            }
            if (fs.existsSync(this.sessionFile)) {
                fs.unlinkSync(this.sessionFile);
            }
            
            this.currentSession = null;
            console.log('[Session Manager] Session cleared');
            
        } catch (error) {
            console.error('[Session Manager] Error clearing session:', error.message);
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Setup page with session persistence
     */
    async setupPageWithSession(page) {
        try {
            // Load existing session if available
            const sessionLoaded = await this.loadCookies(page);
            
            if (sessionLoaded) {
                console.log('[Session Manager] Using existing session');
            } else {
                console.log('[Session Manager] Starting new session');
            }

            // Setup session saving on page events
            this.setupSessionHandlers(page);
            
            return sessionLoaded;
            
        } catch (error) {
            console.error('[Session Manager] Error setting up session:', error.message);
            return false;
        }
    }

    /**
     * Setup handlers to maintain session
     */
    setupSessionHandlers(page) {
        // Save cookies periodically
        const saveInterval = setInterval(async () => {
            if (!page.isClosed()) {
                await this.saveCookies(page);
            } else {
                clearInterval(saveInterval);
            }
        }, 5 * 60 * 1000); // Every 5 minutes

        // Save session on page close
        page.on('close', async () => {
            await this.saveCookies(page);
            clearInterval(saveInterval);
        });
    }

    /**
     * Warm up session by visiting LinkedIn pages
     */
    async warmUpSession(page) {
        console.log('[Session Manager] Warming up session...');
        
        try {
            // Visit LinkedIn home page first
            await page.goto('https://www.linkedin.com', { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            // Random delay
            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
            
            // Scroll a bit to simulate reading
            await page.evaluate(() => {
                window.scrollTo(0, 300);
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            
            // Save the warmed-up session
            await this.saveCookies(page);
            
            console.log('[Session Manager] Session warmed up');
            
        } catch (error) {
            console.error('[Session Manager] Error warming up session:', error.message);
        }
    }

    /**
     * Get session statistics
     */
    getSessionStats() {
        return {
            hasActiveSession: !!this.currentSession,
            sessionAge: this.currentSession ? Date.now() - this.currentSession.timestamp : 0,
            sessionId: this.currentSession?.sessionId || null,
            cookieFileExists: fs.existsSync(this.cookieFile),
            sessionFileExists: fs.existsSync(this.sessionFile),
            sessionTimeout: this.sessionTimeout
        };
    }

    /**
     * Check if session needs refresh
     */
    needsRefresh() {
        if (!this.currentSession) return true;
        
        const sessionAge = Date.now() - this.currentSession.timestamp;
        return sessionAge > (this.sessionTimeout * 0.8); // Refresh at 80% of timeout
    }

    /**
     * Create human-like browsing session
     */
    async createRealisticSession(page) {
        console.log('[Session Manager] Creating realistic browsing session...');
        
        try {
            // Simulate typical LinkedIn browsing behavior
            const actions = [
                async () => {
                    await page.goto('https://www.linkedin.com', { waitUntil: 'domcontentloaded' });
                    await this.randomWait(2000, 5000);
                },
                async () => {
                    await page.evaluate(() => window.scrollTo(0, 400));
                    await this.randomWait(1000, 3000);
                },
                async () => {
                    await page.evaluate(() => window.scrollTo(0, 800));
                    await this.randomWait(1000, 2000);
                },
                async () => {
                    // Try to click on a safe element (if exists)
                    try {
                        await page.click('nav a[href*="feed"]', { timeout: 3000 });
                    } catch (e) {
                        // Ignore if element doesn't exist
                    }
                    await this.randomWait(2000, 4000);
                }
            ];
            
            // Execute random actions
            for (const action of actions.slice(0, 2 + Math.floor(Math.random() * 2))) {
                await action();
            }
            
            // Save the realistic session
            await this.saveCookies(page);
            await this.saveSession({ 
                type: 'realistic_browsing',
                actionsPerformed: actions.length
            });
            
            console.log('[Session Manager] Realistic session created');
            
        } catch (error) {
            console.error('[Session Manager] Error creating realistic session:', error.message);
        }
    }

    /**
     * Random wait helper
     */
    async randomWait(min, max) {
        const delay = min + Math.random() * (max - min);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Export singleton instance
const linkedInSessionManager = new LinkedInSessionManager();

module.exports = { 
    linkedInSessionManager, 
    LinkedInSessionManager 
};

// If run directly, show session status
if (require.main === module) {
    console.log('🔄 LinkedIn Session Manager');
    console.log('═══════════════════════════════════════');
    
    const stats = linkedInSessionManager.getSessionStats();
    console.log('Session Status:', stats);
    
    if (stats.hasActiveSession) {
        console.log('✅ Active session found');
    } else {
        console.log('❌ No active session');
    }
}