// MutationObserver HTMLStyleSheet Test
let styleElementObserver;
let testStyleElement;
let testStyleSheet;
let ruleCounter = 0;
let stylesheetCreated = false;

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
        <p><strong>Stylesheet Created:</strong> ${stylesheetCreated ? 'Yes' : 'No'}</p>
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

function createStylesheet() {
    log('\n--- Creating Dynamic Stylesheet ---');

    // Create a new style element
    testStyleElement = document.createElement('style');
    testStyleElement.id = 'test-style';
    testStyleElement.type = 'text/css';
    testStyleElement.media = 'screen';
    testStyleElement.innerText = `
        .test-element {
            color: red;
            font-size: 16px;
            border: 1px solid #000;
            padding: 10px;
            margin: 10px 0;
        }
        
        .dynamic-class {
            background-color: yellow;
        }
    `;

    // Add to document head
    window.document.head.appendChild(testStyleElement);

    // Get the stylesheet reference
    testStyleSheet = testStyleElement.sheet;

    stylesheetCreated = true;

    // Update UI
    document.getElementById('stylesheet-status').innerHTML = '<strong style="color: green;">✓ Stylesheet created successfully!</strong>';
    document.getElementById('test-controls').style.display = 'block';
    document.getElementById('create-btn').disabled = true;
    document.getElementById('create-btn').textContent = 'Stylesheet Created';

    // Now set up observers on the dynamically created stylesheet
    setTimeout(() => {
        setupMutationObservers();
        updateObserverStatus();
    }, 500)
}

function setupMutationObservers() {
    if (!testStyleElement) {
        log('ERROR: No stylesheet created yet');
        return;
    }

    log('Setting up MutationObserver...');

    styleElementObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            log(`Style Element Observer - Type: ${mutation.type}, Target: ${mutation.target.tagName}`);
            if (mutation.type === 'childList') {
                log(`  Added nodes: ${mutation.addedNodes.length}, Removed nodes: ${mutation.removedNodes.length}`);
            }
            if (mutation.type === 'characterData') {
                log(`  Character data changed: "${mutation.target.innerText}"`);
            }
        });
    });

    styleElementObserver.observe(testStyleElement, {
        childList: true
    });

    log('✓ Style element observer set up');

    updateObserverStatus();
}

// Test functions
function testAddCSSRule() {
    if (!stylesheetCreated) {
        log('ERROR: Create a stylesheet first!');
        return;
    }

    try {
        const newRule = `.dynamic-rule-${++ruleCounter} { color: blue; font-weight: bold; }`;
        const currentCSS = testStyleElement.innerText;
        testStyleElement.innerText = currentCSS + '\n' + newRule;
        updateObserverStatus();
    } catch (error) {
        log(`Error adding CSS rule: ${error.message}`);
    }
}

function testRemoveCSSRule() {
    if (!stylesheetCreated) {
        log('ERROR: Create a stylesheet first!');
        return;
    }

    try {
        const currentCSS = testStyleElement.innerText;
        const lines = currentCSS.split('\n').filter(line => line.trim());

        // Find and remove the last dynamic rule
        const dynamicRuleIndex = lines.findLastIndex(line => line.includes('.dynamic-rule-') || line.includes('.inserted-rule-'));

        if (dynamicRuleIndex !== -1) {
            const removedRule = lines[dynamicRuleIndex];
            lines.splice(dynamicRuleIndex, 1);
            testStyleElement.innerText = lines.join('\n');
            updateObserverStatus();
        } else {
            log('No dynamic rules to remove');
        }
    } catch (error) {
        log(`Error removing CSS rule: ${error.message}`);
    }
}

function testModifyExistingRule() {
    if (!stylesheetCreated) {
        log('ERROR: Create a stylesheet first!');
        return;
    }

    log('\n--- Testing: Modify Existing Rule via innerText ---');
    try {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        let currentCSS = testStyleElement.innerText;

        // Replace the color in .test-element rule
        const updatedCSS = currentCSS.replace(
            /(.test-element\s*{[^}]*color:\s*)[^;]+/,
            `$1${randomColor}`
        );

        if (updatedCSS !== currentCSS) {
            testStyleElement.innerText = updatedCSS;
            log(`Modified .test-element color to: ${randomColor} via innerText`);
            updateObserverStatus();
        } else {
            log('Could not find .test-element rule to modify');
        }
    } catch (error) {
        log(`Error modifying CSS rule: ${error.message}`);
    }
}

function testInsertRule() {
    if (!stylesheetCreated) {
        log('ERROR: Create a stylesheet first!');
        return;
    }

    log('\n--- Testing: Insert Rule via innerText ---');
    try {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        const newRule = `.inserted-rule-${++ruleCounter} { background-color: ${randomColor}; padding: 5px; }`;
        const currentCSS = testStyleElement.innerText;

        // Insert at the beginning
        testStyleElement.innerText = newRule + '\n' + currentCSS;
        log(`Inserted rule at beginning via innerText: ${newRule}`);
        updateObserverStatus();
    } catch (error) {
        log(`Error inserting CSS rule: ${error.message}`);
    }
}

function testDeleteRule() {
    if (!stylesheetCreated) {
        log('ERROR: Create a stylesheet first!');
        return;
    }

    log('\n--- Testing: Delete Rule via innerText ---');
    try {
        const currentCSS = testStyleElement.innerText;
        const lines = currentCSS.split('\n').filter(line => line.trim());

        // Remove first rule (that's not .test-element or .dynamic-class)
        const ruleToDeleteIndex = lines.findIndex(line =>
            line.includes('{') &&
            !line.includes('.test-element') &&
            !line.includes('.dynamic-class')
        );

        if (ruleToDeleteIndex !== -1) {
            const ruleToDelete = lines[ruleToDeleteIndex];
            lines.splice(ruleToDeleteIndex, 1);
            testStyleElement.innerText = lines.join('\n');
            log(`Deleted rule via innerText: ${ruleToDelete}`);
            updateObserverStatus();
        } else {
            log('No rules available to delete');
        }
    } catch (error) {
        log(`Error deleting CSS rule: ${error.message}`);
    }
}

function testDirectTextModification() {
    if (!stylesheetCreated) {
        log('ERROR: Create a stylesheet first!');
        return;
    }

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

        testStyleElement.innerText = newCSS;
        log('Modified style element text content directly');
        updateObserverStatus();
    } catch (error) {
        log(`Error modifying style element text: ${error.message}`);
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayBrowserInfo();
    updateObserverStatus();
});

// Cleanup observers when page unloads
window.addEventListener('beforeunload', () => {
    styleElementObserver.disconnect();
});
