#!/usr/bin/env node

/**
 * LinkedIn Extraction Test Script for Ubuntu Server
 * Tests LinkedIn data extraction with various optimizations
 */

// Test LinkedIn extraction by making HTTP requests to the API
const os = require('os');

// Test LinkedIn URLs
const testUrls = [
    'https://www.linkedin.com/company/microsoft/',
    'https://www.linkedin.com/company/google/',
    'https://www.linkedin.com/company/amazon/'
];

async function testLinkedInExtraction() {
    console.log('🧪 Starting LinkedIn Extraction Tests...');
    console.log(`🖥️  Platform: ${os.platform()}`);
    console.log(`💻 Architecture: ${os.arch()}`);
    console.log(`🧠 Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
    console.log(`⚡ CPUs: ${os.cpus().length}`);
    console.log('');

    for (let i = 0; i < testUrls.length; i++) {
        const url = testUrls[i];
        console.log(`🔍 Test ${i + 1}/${testUrls.length}: ${url}`);
        
        const startTime = Date.now();
        
        try {
            console.log(`⏱️  Starting extraction at ${new Date().toISOString()}`);
            
            // Make HTTP request to the API
            const response = await fetch('http://localhost:3000/api/extract-company-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });
            
            const result = await response.json();
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            if (response.ok && result && !result.error) {
                console.log(`✅ Success in ${duration}s`);
                console.log(`📊 Extracted data keys: ${Object.keys(result).join(', ')}`);
                console.log(`📝 Company name: ${result.Name || 'Not found'}`);
                console.log(`🏢 Industry: ${result.Industry || 'Not found'}`);
                console.log(`📍 Location: ${result.Location || 'Not found'}`);
                console.log(`🔗 LinkedIn extraction: ${result.LinkedInError ? 'Failed' : 'Success'}`);
            } else {
                console.log(`❌ Failed in ${duration}s`);
                console.log(`💥 Error: ${result?.error || 'Unknown error'}`);
                console.log(`🔍 Response status: ${response.status}`);
            }
            
        } catch (error) {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            console.log(`💥 Exception in ${duration}s: ${error.message}`);
        }
        
        console.log('');
        
        // Wait between tests to avoid rate limiting
        if (i < testUrls.length - 1) {
            console.log('⏳ Waiting 5 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.log('🎉 LinkedIn extraction tests completed!');
}

// Performance monitoring
function logMemoryUsage() {
    const used = process.memoryUsage();
    console.log(`💾 Memory Usage:`);
    for (let key in used) {
        console.log(`   ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
}

// Run tests
testLinkedInExtraction()
    .then(() => {
        console.log('');
        logMemoryUsage();
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test suite failed:', error);
        logMemoryUsage();
        process.exit(1);
    });