#!/usr/bin/env node

/**
 * LinkedIn Troubleshooting Script for Ubuntu Server
 * Comprehensive diagnostic and optimization tool
 */

const puppeteer = require('puppeteer');
const os = require('os');
const fs = require('fs');
const dns = require('dns').promises;

class LinkedInTroubleshooter {
    constructor() {
        this.results = {};
        this.recommendations = [];
        this.issues = [];
    }

    async runAllTests() {
        console.log('🔧 LinkedIn Troubleshooting Started...');
        console.log('═══════════════════════════════════════\n');

        await this.checkSystemResources();
        await this.checkNetworkConnectivity();
        await this.checkBrowserInstallation();
        await this.checkPuppeteerSetup();
        await this.testLinkedInAccess();
        await this.testBasicScraping();
        await this.generateReport();

        console.log('\n🎯 Troubleshooting Complete!');
        this.displayResults();
    }

    async checkSystemResources() {
        console.log('🖥️  Checking System Resources...');
        
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
        const freeMemory = Math.round(os.freemem() / 1024 / 1024 / 1024);
        const cpuCount = os.cpus().length;
        const platform = os.platform();
        const arch = os.arch();

        this.results.system = {
            platform,
            arch,
            totalMemory: `${totalMemory}GB`,
            freeMemory: `${freeMemory}GB`,
            cpuCount,
            nodeVersion: process.version
        };

        console.log(`   Platform: ${platform} ${arch}`);
        console.log(`   Memory: ${freeMemory}GB free / ${totalMemory}GB total`);
        console.log(`   CPUs: ${cpuCount}`);
        console.log(`   Node.js: ${process.version}`);

        // Check for issues
        if (totalMemory < 2) {
            this.issues.push('⚠️  Low memory: Minimum 2GB recommended for LinkedIn extraction');
            this.recommendations.push('Consider upgrading server memory or reducing concurrent extractions');
        }

        if (freeMemory < 1) {
            this.issues.push('⚠️  Low free memory: May cause browser launch failures');
            this.recommendations.push('Free up memory by stopping unnecessary services');
        }

        if (cpuCount < 2) {
            this.issues.push('⚠️  Low CPU count: May cause slow performance');
            this.recommendations.push('Consider upgrading to a multi-core server');
        }

        console.log('   ✅ System resources checked\n');
    }

    async checkNetworkConnectivity() {
        console.log('🌐 Checking Network Connectivity...');

        const testUrls = [
            'linkedin.com',
            'media.licdn.com',
            'static.licdn.com'
        ];

        this.results.network = {};

        for (const url of testUrls) {
            try {
                const startTime = Date.now();
                await dns.lookup(url);
                const duration = Date.now() - startTime;
                
                this.results.network[url] = {
                    reachable: true,
                    duration: `${duration}ms`
                };
                
                console.log(`   ✅ ${url} - ${duration}ms`);
            } catch (error) {
                this.results.network[url] = {
                    reachable: false,
                    error: error.message
                };
                
                console.log(`   ❌ ${url} - ${error.message}`);
                this.issues.push(`❌ Cannot reach ${url}: ${error.message}`);
                this.recommendations.push(`Check firewall settings and DNS resolution for ${url}`);
            }
        }

        console.log('   ✅ Network connectivity checked\n');
    }

    async checkBrowserInstallation() {
        console.log('🌐 Checking Browser Installation...');

        const browserPaths = [
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium'
        ];

        this.results.browsers = {};

        for (const browserPath of browserPaths) {
            if (fs.existsSync(browserPath)) {
                try {
                    // Check if executable
                    const stats = fs.statSync(browserPath);
                    this.results.browsers[browserPath] = {
                        found: true,
                        executable: !!(stats.mode & parseInt('111', 8))
                    };
                    
                    console.log(`   ✅ Found: ${browserPath}`);
                } catch (error) {
                    this.results.browsers[browserPath] = {
                        found: true,
                        executable: false,
                        error: error.message
                    };
                    
                    console.log(`   ⚠️  Found but not executable: ${browserPath}`);
                }
            } else {
                this.results.browsers[browserPath] = {
                    found: false
                };
            }
        }

        const foundBrowsers = Object.values(this.results.browsers).filter(b => b.found).length;
        
        if (foundBrowsers === 0) {
            this.issues.push('❌ No Chrome/Chromium browser found');
            this.recommendations.push('Install Chrome: sudo apt-get install google-chrome-stable');
        } else {
            console.log(`   ✅ Found ${foundBrowsers} browser(s)`);
        }

        console.log('   ✅ Browser installation checked\n');
    }

    async checkPuppeteerSetup() {
        console.log('🎭 Checking Puppeteer Setup...');

        try {
            // Test basic browser launch
            const startTime = Date.now();
            
            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ],
                timeout: 30000
            });

            const launchTime = Date.now() - startTime;
            const version = await browser.version();
            
            await browser.close();

            this.results.puppeteer = {
                working: true,
                launchTime: `${launchTime}ms`,
                version: version
            };

            console.log(`   ✅ Puppeteer working - ${launchTime}ms launch time`);
            console.log(`   ✅ Browser version: ${version}`);

            if (launchTime > 10000) {
                this.issues.push('⚠️  Slow browser launch time');
                this.recommendations.push('Consider optimizing Chrome flags or increasing server resources');
            }

        } catch (error) {
            this.results.puppeteer = {
                working: false,
                error: error.message
            };

            console.log(`   ❌ Puppeteer failed: ${error.message}`);
            this.issues.push(`❌ Puppeteer launch failed: ${error.message}`);
            this.recommendations.push('Check Chrome installation and dependencies');
        }

        console.log('   ✅ Puppeteer setup checked\n');
    }

    async testLinkedInAccess() {
        console.log('🔗 Testing LinkedIn Access...');

        try {
            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-images'
                ],
                timeout: 30000
            });

            const page = await browser.newPage();
            
            // Set user agent for Linux
            await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36');
            
            const startTime = Date.now();
            
            try {
                await page.goto('https://www.linkedin.com/company/microsoft/', {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000
                });

                const navigationTime = Date.now() - startTime;
                const title = await page.title();
                
                this.results.linkedinAccess = {
                    accessible: true,
                    navigationTime: `${navigationTime}ms`,
                    title: title.substring(0, 50) + '...'
                };

                console.log(`   ✅ LinkedIn accessible - ${navigationTime}ms`);
                console.log(`   ✅ Page title: ${title.substring(0, 50)}...`);

                if (navigationTime > 15000) {
                    this.issues.push('⚠️  Slow LinkedIn navigation');
                    this.recommendations.push('Consider increasing timeouts or optimizing network connection');
                }

            } catch (navError) {
                this.results.linkedinAccess = {
                    accessible: false,
                    error: navError.message
                };

                console.log(`   ❌ LinkedIn navigation failed: ${navError.message}`);
                this.issues.push(`❌ LinkedIn navigation failed: ${navError.message}`);
                
                if (navError.message.includes('timeout')) {
                    this.recommendations.push('Increase navigation timeouts for Ubuntu server environment');
                } else if (navError.message.includes('net::ERR_')) {
                    this.recommendations.push('Check network connectivity and firewall settings');
                }
            }

            await browser.close();

        } catch (error) {
            this.results.linkedinAccess = {
                accessible: false,
                error: error.message
            };

            console.log(`   ❌ LinkedIn test failed: ${error.message}`);
            this.issues.push(`❌ LinkedIn access test failed: ${error.message}`);
        }

        console.log('   ✅ LinkedIn access checked\n');
    }

    async testBasicScraping() {
        console.log('🔍 Testing Basic LinkedIn Scraping...');

        try {
            const browser = await puppeteer.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-images',
                    '--disable-blink-features=AutomationControlled'
                ],
                timeout: 30000
            });

            const page = await browser.newPage();
            
            // Enhanced stealth
            await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36');
            
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
            });

            const startTime = Date.now();
            
            await page.goto('https://www.linkedin.com/company/microsoft/', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Try to extract basic company info
            const companyData = await page.evaluate(() => {
                const getByLabel = (label) => {
                    const items = Array.from(document.querySelectorAll('dt'));
                    for (const dt of items) {
                        if (dt.innerText.trim().toLowerCase() === label.toLowerCase()) {
                            return dt.nextElementSibling?.innerText?.trim() || null;
                        }
                    }
                    return null;
                };

                return {
                    industry: getByLabel('Industry'),
                    companySize: getByLabel('Company size'),
                    headquarters: getByLabel('Headquarters'),
                    founded: getByLabel('Founded')
                };
            });

            const extractionTime = Date.now() - startTime;

            await browser.close();

            const fieldsExtracted = Object.values(companyData).filter(v => v !== null).length;

            this.results.scraping = {
                working: true,
                extractionTime: `${extractionTime}ms`,
                fieldsExtracted: fieldsExtracted,
                sampleData: companyData
            };

            console.log(`   ✅ Basic scraping working - ${extractionTime}ms`);
            console.log(`   ✅ Extracted ${fieldsExtracted} fields`);

            if (fieldsExtracted === 0) {
                this.issues.push('⚠️  No data extracted - LinkedIn may have changed structure');
                this.recommendations.push('Update LinkedIn extraction selectors');
            }

        } catch (error) {
            this.results.scraping = {
                working: false,
                error: error.message
            };

            console.log(`   ❌ Basic scraping failed: ${error.message}`);
            this.issues.push(`❌ LinkedIn scraping failed: ${error.message}`);
        }

        console.log('   ✅ Basic scraping checked\n');
    }

    generateReport() {
        this.results.summary = {
            totalIssues: this.issues.length,
            systemHealth: this.issues.length === 0 ? 'Healthy' : 
                         this.issues.length <= 2 ? 'Minor Issues' : 'Needs Attention',
            timestamp: new Date().toISOString(),
            platform: os.platform(),
            nodeVersion: process.version
        };

        this.results.issues = this.issues;
        this.results.recommendations = this.recommendations;

        // Save report
        const reportFile = `linkedin-troubleshoot-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
        
        this.results.reportFile = reportFile;
        console.log(`📊 Detailed report saved: ${reportFile}`);
    }

    displayResults() {
        console.log('\n🎯 TROUBLESHOOTING RESULTS');
        console.log('═══════════════════════════════════════');
        console.log(`System Health: ${this.results.summary.systemHealth}`);
        console.log(`Issues Found: ${this.issues.length}`);
        console.log('');

        if (this.issues.length > 0) {
            console.log('🚨 ISSUES FOUND:');
            this.issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue}`);
            });
            console.log('');
        }

        if (this.recommendations.length > 0) {
            console.log('💡 RECOMMENDATIONS:');
            this.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
            console.log('');
        }

        if (this.issues.length === 0) {
            console.log('✅ No issues found! Your system appears ready for LinkedIn extraction.');
        }

        console.log(`📁 Full report: ${this.results.reportFile}`);
        console.log('═══════════════════════════════════════');
    }
}

// Run troubleshooting
if (require.main === module) {
    const troubleshooter = new LinkedInTroubleshooter();
    troubleshooter.runAllTests()
        .catch(error => {
            console.error('💥 Troubleshooting failed:', error);
            process.exit(1);
        });
}

module.exports = { LinkedInTroubleshooter };