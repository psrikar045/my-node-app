#!/usr/bin/env node

/**
 * LinkedIn Anti-Block Configuration
 * Adjust these settings based on your server environment and blocking patterns
 */

const linkedInConfig = {
    // Rate limiting settings
    rateLimiting: {
        // Minimum delay between LinkedIn requests (milliseconds)
        baseDelay: process.env.LINKEDIN_BASE_DELAY || 8000,
        
        // Maximum delay during blocking (milliseconds)
        maxDelay: process.env.LINKEDIN_MAX_DELAY || 30000,
        
        // Burst protection - max requests per hour
        maxRequestsPerHour: process.env.LINKEDIN_MAX_REQUESTS_PER_HOUR || 10,
        
        // Burst protection - delay after burst limit
        burstDelay: process.env.LINKEDIN_BURST_DELAY || 60000,
        
        // Random jitter range (milliseconds)
        jitterRange: process.env.LINKEDIN_JITTER_RANGE || 2000
    },
    
    // Browser session settings
    browser: {
        // Session duration before cycling (milliseconds)
        sessionDuration: process.env.LINKEDIN_SESSION_DURATION || 15 * 60 * 1000,
        
        // User agent rotation enabled
        rotateUserAgent: process.env.LINKEDIN_ROTATE_USER_AGENT !== 'false',
        
        // Human behavior simulation enabled
        humanBehavior: process.env.LINKEDIN_HUMAN_BEHAVIOR !== 'false'
    },
    
    // Anti-block detection settings
    antiBlock: {
        // Cooldown period after blocking detection (milliseconds)
        cooldownPeriod: process.env.LINKEDIN_COOLDOWN_PERIOD || 5 * 60 * 1000,
        
        // Maximum cooldown period (milliseconds)
        maxCooldownPeriod: process.env.LINKEDIN_MAX_COOLDOWN_PERIOD || 60 * 60 * 1000,
        
        // Exponential backoff multiplier
        backoffMultiplier: process.env.LINKEDIN_BACKOFF_MULTIPLIER || 2,
        
        // Auto-reset after successful requests
        autoReset: process.env.LINKEDIN_AUTO_RESET !== 'false'
    },
    
    // Retry settings
    retry: {
        // Maximum retry attempts
        maxAttempts: process.env.LINKEDIN_MAX_ATTEMPTS || 3,
        
        // Base retry delay (milliseconds)
        baseRetryDelay: process.env.LINKEDIN_BASE_RETRY_DELAY || 1000,
        
        // Retry delay multiplier
        retryMultiplier: process.env.LINKEDIN_RETRY_MULTIPLIER || 2
    },
    
    // Timeout settings
    timeouts: {
        // Page navigation timeout (milliseconds)
        navigationTimeout: process.env.LINKEDIN_NAVIGATION_TIMEOUT || 30000,
        
        // Data extraction timeout (milliseconds)
        extractionTimeout: process.env.LINKEDIN_EXTRACTION_TIMEOUT || 45000,
        
        // Overall LinkedIn extraction timeout (milliseconds)
        totalTimeout: process.env.LINKEDIN_TOTAL_TIMEOUT || 240000
    }
};

/**
 * Get current configuration
 */
function getConfig() {
    return linkedInConfig;
}

/**
 * Update configuration
 */
function updateConfig(newConfig) {
    Object.assign(linkedInConfig, newConfig);
    console.log('[LinkedIn Config] Configuration updated');
}

/**
 * Get configuration for different environments
 */
function getEnvironmentConfig(environment = 'production') {
    const baseConfig = { ...linkedInConfig };
    
    switch (environment) {
        case 'development':
            return {
                ...baseConfig,
                rateLimiting: {
                    ...baseConfig.rateLimiting,
                    baseDelay: 2000,
                    maxRequestsPerHour: 20
                },
                antiBlock: {
                    ...baseConfig.antiBlock,
                    cooldownPeriod: 2 * 60 * 1000, // 2 minutes
                }
            };
            
        case 'staging':
            return {
                ...baseConfig,
                rateLimiting: {
                    ...baseConfig.rateLimiting,
                    baseDelay: 5000,
                    maxRequestsPerHour: 15
                }
            };
            
        case 'production':
        default:
            return {
                ...baseConfig,
                rateLimiting: {
                    ...baseConfig.rateLimiting,
                    baseDelay: 8000,
                    maxRequestsPerHour: 10
                }
            };
    }
}

/**
 * Get aggressive anti-block configuration
 */
function getAggressiveConfig() {
    return {
        ...linkedInConfig,
        rateLimiting: {
            ...linkedInConfig.rateLimiting,
            baseDelay: 15000,      // 15 seconds
            maxRequestsPerHour: 5,  // Very conservative
            burstDelay: 120000      // 2 minutes
        },
        antiBlock: {
            ...linkedInConfig.antiBlock,
            cooldownPeriod: 15 * 60 * 1000, // 15 minutes
            maxCooldownPeriod: 2 * 60 * 60 * 1000 // 2 hours
        }
    };
}

/**
 * Apply configuration based on blocking severity
 */
function applyConfigurationBySeverity(severity) {
    console.log(`[LinkedIn Config] Applying ${severity} configuration`);
    
    switch (severity) {
        case 'high':
            updateConfig(getAggressiveConfig());
            break;
            
        case 'medium':
            updateConfig({
                ...linkedInConfig,
                rateLimiting: {
                    ...linkedInConfig.rateLimiting,
                    baseDelay: 12000,
                    maxRequestsPerHour: 8
                }
            });
            break;
            
        case 'low':
            updateConfig({
                ...linkedInConfig,
                rateLimiting: {
                    ...linkedInConfig.rateLimiting,
                    baseDelay: 10000,
                    maxRequestsPerHour: 12
                }
            });
            break;
            
        default:
            // Keep current configuration
            break;
    }
}

module.exports = {
    getConfig,
    updateConfig,
    getEnvironmentConfig,
    getAggressiveConfig,
    applyConfigurationBySeverity,
    linkedInConfig
};

// If run directly, show current configuration
if (require.main === module) {
    console.log('⚙️  LinkedIn Anti-Block Configuration:');
    console.log('═══════════════════════════════════════');
    console.log(JSON.stringify(getConfig(), null, 2));
    console.log('');
    console.log('🔧 Environment Configurations:');
    console.log('Development:', JSON.stringify(getEnvironmentConfig('development'), null, 2));
    console.log('Production:', JSON.stringify(getEnvironmentConfig('production'), null, 2));
}