#!/usr/bin/env node

/**
 * LinkedIn Anti-Block Detection and Mitigation System
 * Advanced handling for "LinkedIn may be blocking requests" scenarios
 */

class LinkedInAntiBlock {
    constructor() {
        this.blockingDetected = false;
        this.lastBlockingTime = null;
        this.blockingCount = 0;
        this.cooldownPeriod = 5 * 60 * 1000; // 5 minutes initial cooldown
        this.maxCooldownPeriod = 60 * 60 * 1000; // 1 hour max cooldown
        this.blockingSignals = [
            'challenge',
            'security check',
            'unusual activity',
            'temporarily blocked',
            'rate limit',
            'please verify',
            'captcha',
            'suspicious activity'
        ];
    }

    /**
     * Check if response indicates LinkedIn is blocking requests
     */
    detectBlocking(pageContent, url, statusCode) {
        const content = pageContent.toLowerCase();
        
        // Check for blocking signals in page content
        const hasBlockingSignal = this.blockingSignals.some(signal => 
            content.includes(signal)
        );
        
        // Check for redirect to LinkedIn login/challenge pages
        const isChallengeRedirect = url.includes('/challenge/') || 
                                   url.includes('/login/') ||
                                   url.includes('/authwall/');
        
        // Check for HTTP status indicators
        const hasBlockingStatus = statusCode === 429 || // Too Many Requests
                                 statusCode === 403 || // Forbidden
                                 statusCode === 401;   // Unauthorized
        
        // Check for empty or minimal content (possible blocking)
        const hasMinimalContent = content.length < 1000;
        
        if (hasBlockingSignal || isChallengeRedirect || hasBlockingStatus) {
            this.onBlockingDetected();
            return {
                blocked: true,
                reason: hasBlockingSignal ? 'Content blocking signal' :
                        isChallengeRedirect ? 'Challenge redirect' :
                        hasBlockingStatus ? `HTTP ${statusCode}` : 'Unknown',
                severity: hasBlockingSignal || isChallengeRedirect ? 'high' : 'medium'
            };
        }
        
        if (hasMinimalContent) {
            return {
                blocked: false,
                suspicious: true,
                reason: 'Minimal content detected',
                severity: 'low'
            };
        }
        
        return { blocked: false };
    }

    /**
     * Handle blocking detection
     */
    onBlockingDetected() {
        this.blockingDetected = true;
        this.lastBlockingTime = Date.now();
        this.blockingCount++;
        
        // Exponential backoff for cooldown period
        this.cooldownPeriod = Math.min(
            this.cooldownPeriod * Math.pow(2, this.blockingCount - 1),
            this.maxCooldownPeriod
        );
        
        console.log(`[LinkedIn Anti-Block] Blocking detected! Count: ${this.blockingCount}, Cooldown: ${this.cooldownPeriod / 1000}s`);
    }

    /**
     * Check if we're currently in cooldown period
     */
    isInCooldown() {
        if (!this.blockingDetected || !this.lastBlockingTime) {
            return false;
        }
        
        const timeSinceBlocking = Date.now() - this.lastBlockingTime;
        const inCooldown = timeSinceBlocking < this.cooldownPeriod;
        
        if (!inCooldown) {
            // Reset blocking detection after cooldown
            this.blockingDetected = false;
            console.log('[LinkedIn Anti-Block] Cooldown period ended, resuming normal operation');
        }
        
        return inCooldown;
    }

    /**
     * Get recommended wait time before next request
     */
    getRecommendedWaitTime() {
        if (this.isInCooldown()) {
            const remainingCooldown = this.cooldownPeriod - (Date.now() - this.lastBlockingTime);
            return Math.max(remainingCooldown, 0);
        }
        
        // Progressive delays based on blocking history
        const baseDelay = 8000; // 8 seconds base
        const historyMultiplier = Math.min(this.blockingCount * 2, 10); // Max 10x multiplier
        
        return baseDelay * historyMultiplier;
    }

    /**
     * Get anti-blocking recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.blockingCount > 0) {
            recommendations.push(`🚨 LinkedIn blocking detected ${this.blockingCount} times`);
        }
        
        if (this.isInCooldown()) {
            const remainingTime = Math.ceil(this.getRecommendedWaitTime() / 1000);
            recommendations.push(`⏳ In cooldown: wait ${remainingTime} seconds`);
        }
        
        if (this.blockingCount >= 3) {
            recommendations.push('💡 Consider using proxy rotation or different server IP');
        }
        
        if (this.blockingCount >= 5) {
            recommendations.push('🔄 Consider changing user agent rotation strategy');
        }
        
        if (this.blockingCount >= 8) {
            recommendations.push('🛑 Consider pausing LinkedIn extraction for 24 hours');
        }
        
        return recommendations;
    }

    /**
     * Generate anti-blocking report
     */
    generateReport() {
        return {
            blockingDetected: this.blockingDetected,
            blockingCount: this.blockingCount,
            lastBlockingTime: this.lastBlockingTime ? new Date(this.lastBlockingTime).toISOString() : null,
            currentCooldownPeriod: this.cooldownPeriod / 1000,
            inCooldown: this.isInCooldown(),
            recommendedWaitTime: this.getRecommendedWaitTime(),
            recommendations: this.getRecommendations(),
            severity: this.blockingCount === 0 ? 'none' :
                     this.blockingCount <= 2 ? 'low' :
                     this.blockingCount <= 5 ? 'medium' : 'high'
        };
    }

    /**
     * Reset blocking detection (use after successful IP change or long pause)
     */
    reset() {
        this.blockingDetected = false;
        this.lastBlockingTime = null;
        this.blockingCount = 0;
        this.cooldownPeriod = 5 * 60 * 1000; // Reset to 5 minutes
        console.log('[LinkedIn Anti-Block] Detection system reset');
    }
}

// Export singleton instance
const linkedInAntiBlock = new LinkedInAntiBlock();

module.exports = { 
    linkedInAntiBlock, 
    LinkedInAntiBlock 
};

// If run directly, show current status
if (require.main === module) {
    console.log('📊 LinkedIn Anti-Block Status:');
    console.log('═══════════════════════════════════════');
    const report = linkedInAntiBlock.generateReport();
    console.log(JSON.stringify(report, null, 2));
}