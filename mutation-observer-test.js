// MutationObserver HTMLStyleSheet Test
let observers = [];
let testStyleElement;
let testStyleSheet;
let ruleCounter = 0;

function log(message) {
    const logArea = document.getElementById('log-area');
    const timestamp = new Date().toLocaleTimeString();
    logArea.textContent += `[${timestamp}] ${message}\n`;
    logArea.scrollTop = logArea.scrollHeight;
    console.log(message);
}

function clearLog() {
    document.getElementById('log-area').textContent = '';
}

function updateObserverStatus() {
    const statusDiv = document.getElementById('observer-status');
    statusDiv.innerHTML = `
        <p><strong>Active Observers:</strong> ${observers.length}</p>
        <p><strong>Style Element:</strong> ${testStyleElement ? 'Found' : 'Not found'}</p>
        <p><strong>StyleSheet:</strong> ${testStyleSheet ? 'Found' : 'Not found'}</p>
        <p><strong>StyleSheet Rules Count:</strong> ${testStyleSheet ? testStyleSheet.cssRules.length : 'N/A'}</p>
    `;
}

function displayBrowserInfo() {
    const browserInfoDiv = document.getElementById('browser-info');
    browserInfoDiv.innerHTML = `
        <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
        <p><strong>Browser:</strong> ${getBrowserName()}</p>
        <p><strong>Version:</strong> ${getBrowserVersion()}</p>
        <p><strong>Platform:</strong> ${navigator.platform}</p>
    `;
}

function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function getBrowserVersion() {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(Firefox|Chrome|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
}

function setupMutationObservers() {
    testStyleElement = document.getElementById('test-style');

    if (!testStyleElement) {
        log('ERROR: Could not find test style element');
        return;
    }

    testStyleSheet = testStyleElement.sheet;

    if (!testStyleSheet) {
        log('ERROR: Could not access stylesheet from style element');
        return;
    }

    log('Setting up MutationObservers...');

    // Observer 1: Monitor the style element itself
    const styleElementObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            log(`Style Element Observer - Type: ${mutation.type}, Target: ${mutation.target.tagName}`);
            if (mutation.type === 'childList') {
                log(`  Added nodes: ${mutation.addedNodes.length}, Removed nodes: ${mutation.removedNodes.length}`);
            }
            if (mutation.type === 'characterData') {
                log(`  Character data changed: "${mutation.target.textContent}"`);
            }
        });
    });

    styleElementObserver.observe(testStyleElement, {
        childList: true
    });

    observers.push(styleElementObserver);
    log('✓ Style element observer set up');

    // Observer 2: Try to monitor the stylesheet object directly (this is the main test)
    try {
        const stylesheetObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                log(`StyleSheet Observer - Type: ${mutation.type}, Target: ${mutation.target.constructor.name}`);
                if (mutation.type === 'childList') {
                    log(`  Added nodes: ${mutation.addedNodes.length}, Removed nodes: ${mutation.removedNodes.length}`);
                }
            });
        });

        // This is the problematic line - trying to observe a StyleSheet object
        stylesheetObserver.observe(testStyleSheet, {
            childList: true
        });

        observers.push(stylesheetObserver);
        log('✓ StyleSheet observer set up (THIS IS THE MAIN TEST)');
    } catch (error) {
        log(`✗ Failed to set up StyleSheet observer: ${error.message}`);
    }

    // Observer 3: Monitor the document for any style-related changes
    const documentObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target === testStyleElement ||
                (mutation.addedNodes && Array.from(mutation.addedNodes).includes(testStyleElement)) ||
                (mutation.removedNodes && Array.from(mutation.removedNodes).includes(testStyleElement))) {
                log(`Document Observer - Detected change related to test style element`);
            }
        });
    });

    documentObserver.observe(document.head, {
        childList: true
    });

    observers.push(documentObserver);
    log('✓ Document observer set up');

    updateObserverStatus();
}

// Test functions
function testAddCSSRule() {
    log('\n--- Testing: Add CSS Rule ---');
    try {
        const newRule = `.dynamic-rule-${++ruleCounter} { color: blue; font-weight: bold; }`;
        testStyleSheet.insertRule(newRule, testStyleSheet.cssRules.length);
        log(`Added rule: ${newRule}`);
        updateObserverStatus();
    } catch (error) {
        log(`Error adding CSS rule: ${error.message}`);
    }
}

function testRemoveCSSRule() {
    log('\n--- Testing: Remove CSS Rule ---');
    try {
        if (testStyleSheet.cssRules.length > 2) {
            const removedRule = testStyleSheet.cssRules[testStyleSheet.cssRules.length - 1].cssText;
            testStyleSheet.deleteRule(testStyleSheet.cssRules.length - 1);
            log(`Removed rule: ${removedRule}`);
            updateObserverStatus();
        } else {
            log('No dynamic rules to remove');
        }
    } catch (error) {
        log(`Error removing CSS rule: ${error.message}`);
    }
}

function testModifyExistingRule() {
    log('\n--- Testing: Modify Existing Rule ---');
    try {
        // Find the .test-element rule and modify it
        for (let i = 0; i < testStyleSheet.cssRules.length; i++) {
            const rule = testStyleSheet.cssRules[i];
            if (rule.selectorText === '.test-element') {
                const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                rule.style.color = randomColor;
                log(`Modified .test-element color to: ${randomColor}`);
                updateObserverStatus();
                return;
            }
        }
        log('Could not find .test-element rule to modify');
    } catch (error) {
        log(`Error modifying CSS rule: ${error.message}`);
    }
}

function testInsertRule() {
    log('\n--- Testing: Insert Rule via insertRule() ---');
    try {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        const newRule = `.inserted-rule-${++ruleCounter} { background-color: ${randomColor}; padding: 5px; }`;
        testStyleSheet.insertRule(newRule, 0);
        log(`Inserted rule at position 0: ${newRule}`);
        updateObserverStatus();
    } catch (error) {
        log(`Error inserting CSS rule: ${error.message}`);
    }
}

function testDeleteRule() {
    log('\n--- Testing: Delete Rule via deleteRule() ---');
    try {
        if (testStyleSheet.cssRules.length > 2) {
            const ruleToDelete = testStyleSheet.cssRules[0].cssText;
            testStyleSheet.deleteRule(0);
            log(`Deleted rule at position 0: ${ruleToDelete}`);
            updateObserverStatus();
        } else {
            log('No rules available to delete');
        }
    } catch (error) {
        log(`Error deleting CSS rule: ${error.message}`);
    }
}

function testDirectTextModification() {
    log('\n--- Testing: Direct Style Element Text Modification ---');
    try {
        const newCSS = `
        .test-element {
            color: green;
            font-size: 18px;
            background-color: lightgray;
        }
        
        .dynamic-class {
            background-color: orange;
        }
        
        .directly-added {
            border: 2px solid purple;
            margin: 5px;
        }`;

        testStyleElement.textContent = newCSS;
        log('Modified style element text content directly');
        updateObserverStatus();
    } catch (error) {
        log(`Error modifying style element text: ${error.message}`);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    log('Page loaded, initializing test...');
    displayBrowserInfo();
    setupMutationObservers();

    log('\n--- Initial State ---');
    log(`StyleSheet has ${testStyleSheet ? testStyleSheet.cssRules.length : 0} rules`);
    if (testStyleSheet) {
        for (let i = 0; i < testStyleSheet.cssRules.length; i++) {
            log(`Rule ${i}: ${testStyleSheet.cssRules[i].cssText}`);
        }
    }

    log('\n--- Instructions ---');
    log('1. Click the test buttons to modify the stylesheet');
    log('2. Watch this log to see which MutationObserver events fire');
    log('3. In Firefox, the StyleSheet observer should NOT fire for CSS rule changes');
    log('4. In other browsers, behavior may differ');
    log('\nReady for testing!');
});

// Cleanup observers when page unloads
window.addEventListener('beforeunload', () => {
    observers.forEach(observer => observer.disconnect());
});
