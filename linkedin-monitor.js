#!/usr/bin/env node

/**
 * LinkedIn Extraction Monitor for Ubuntu Server
 * Monitors and optimizes LinkedIn data extraction performance
 */

const os = require('os');
const fs = require('fs');

class LinkedInMonitor {
    constructor() {
        this.requests = [];
        this.errors = [];
        this.startTime = Date.now();
    }

    logRequest(url, duration, success, error = null) {
        const request = {
            timestamp: Date.now(),
            url,
            duration,
            success,
            error,
            memoryUsage: this.getMemoryUsage()
        };
        
        this.requests.push(request);
        
        if (!success) {
            this.errors.push(request);
        }
        
        console.log(`[Monitor] ${success ? '✅' : '❌'} ${url} - ${duration}ms ${error ? `(${error})` : ''}`);
        
        // Auto-cleanup old requests (keep only last 100)
        if (this.requests.length > 100) {
            this.requests = this.requests.slice(-100);
        }
        
        if (this.errors.length > 50) {
            this.errors = this.errors.slice(-50);
        }
    }

    getMemoryUsage() {
        const used = process.memoryUsage();
        return {
            rss: Math.round(used.rss / 1024 / 1024),
            heapUsed: Math.round(used.heapUsed / 1024 / 1024),
            heapTotal: Math.round(used.heapTotal / 1024 / 1024),
            external: Math.round(used.external / 1024 / 1024)
        };
    }

    getSystemInfo() {
        return {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
            freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB',
            cpus: os.cpus().length,
            uptime: Math.round(os.uptime() / 3600) + 'h'
        };
    }

    getStats() {
        const now = Date.now();
        const uptime = now - this.startTime;
        const recentRequests = this.requests.filter(r => (now - r.timestamp) < 300000); // Last 5 minutes
        const recentErrors = this.errors.filter(e => (now - e.timestamp) < 300000);
        
        const successRate = recentRequests.length > 0 ? 
            ((recentRequests.length - recentErrors.length) / recentRequests.length * 100).toFixed(1) : 0;
        
        const avgDuration = recentRequests.length > 0 ?
            Math.round(recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length) : 0;

        return {
            uptime: Math.round(uptime / 1000),
            totalRequests: this.requests.length,
            recentRequests: recentRequests.length,
            recentErrors: recentErrors.length,
            successRate: successRate + '%',
            avgDuration: avgDuration + 'ms',
            memoryUsage: this.getMemoryUsage(),
            systemInfo: this.getSystemInfo()
        };
    }

    getErrorAnalysis() {
        const errorTypes = {};
        this.errors.forEach(error => {
            const type = error.error || 'Unknown';
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });

        return {
            totalErrors: this.errors.length,
            errorTypes,
            mostCommonError: Object.keys(errorTypes).reduce((a, b) => 
                errorTypes[a] > errorTypes[b] ? a : b, 'None'),
            recentErrors: this.errors.slice(-10).map(e => ({
                timestamp: new Date(e.timestamp).toISOString(),
                url: e.url,
                error: e.error,
                duration: e.duration
            }))
        };
    }

    generateReport() {
        const stats = this.getStats();
        const errorAnalysis = this.getErrorAnalysis();
        
        const report = {
            generatedAt: new Date().toISOString(),
            performance: stats,
            errors: errorAnalysis,
            recommendations: this.getRecommendations(stats, errorAnalysis)
        };

        return report;
    }

    getRecommendations(stats, errorAnalysis) {
        const recommendations = [];
        
        if (parseFloat(stats.successRate) < 80) {
            recommendations.push("🚨 Low success rate detected. Consider increasing timeouts or implementing more robust error handling.");
        }
        
        if (parseInt(stats.avgDuration) > 30000) {
            recommendations.push("⏱️ High average duration. Consider optimizing resource blocking or increasing server resources.");
        }
        
        if (stats.memoryUsage.heapUsed > 500) {
            recommendations.push("💾 High memory usage detected. Consider implementing browser session cleanup or reducing concurrent requests.");
        }
        
        if (errorAnalysis.totalErrors > 10) {
            recommendations.push("❌ High error count. Check network connectivity and LinkedIn rate limiting.");
        }

        if (errorAnalysis.mostCommonError?.includes('timeout')) {
            recommendations.push("⏳ Timeout errors detected. Consider increasing navigation timeouts for Ubuntu server environment.");
        }

        if (errorAnalysis.mostCommonError?.includes('Protocol error')) {
            recommendations.push("🔧 Protocol errors detected. Check Chrome installation and browser compatibility.");
        }

        if (recommendations.length === 0) {
            recommendations.push("✅ System appears to be running optimally!");
        }

        return recommendations;
    }

    saveReport(filename = null) {
        const report = this.generateReport();
        const fileName = filename || `linkedin-monitor-${Date.now()}.json`;
        
        fs.writeFileSync(fileName, JSON.stringify(report, null, 2));
        console.log(`📊 Report saved to: ${fileName}`);
        
        return fileName;
    }

    printSummary() {
        const stats = this.getStats();
        console.log('\n📊 LinkedIn Extraction Monitor Summary:');
        console.log('═══════════════════════════════════════');
        console.log(`🕐 Uptime: ${stats.uptime}s`);
        console.log(`📈 Total Requests: ${stats.totalRequests}`);
        console.log(`🎯 Success Rate: ${stats.successRate}`);
        console.log(`⏱️  Average Duration: ${stats.avgDuration}`);
        console.log(`💾 Memory Usage: ${stats.memoryUsage.heapUsed}MB`);
        console.log(`🖥️  System: ${stats.systemInfo.platform} ${stats.systemInfo.arch}`);
        console.log('═══════════════════════════════════════\n');
    }
}

// Create global monitor instance
const linkedInMonitor = new LinkedInMonitor();

// Export for use in other modules
module.exports = { linkedInMonitor, LinkedInMonitor };

// If run directly, start monitoring
if (require.main === module) {
    console.log('🔍 LinkedIn Monitor started...');
    
    // Print summary every 60 seconds
    setInterval(() => {
        linkedInMonitor.printSummary();
    }, 60000);
    
    // Save report every 10 minutes
    setInterval(() => {
        linkedInMonitor.saveReport();
    }, 600000);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down LinkedIn Monitor...');
        linkedInMonitor.printSummary();
        const reportFile = linkedInMonitor.saveReport();
        console.log(`📁 Final report saved: ${reportFile}`);
        process.exit(0);
    });
}