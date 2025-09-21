// DOM elements
const setupSection = document.getElementById('setup');
const mainSection = document.getElementById('main');
const notionTokenInput = document.getElementById('notionToken');
const databaseIdInput = document.getElementById('databaseId');
const saveConfigBtn = document.getElementById('saveConfig');
const saveArticleBtn = document.getElementById('saveArticle');
const openSettingsBtn = document.getElementById('openSettings');
const statusDiv = document.getElementById('status');
const pageTitle = document.getElementById('pageTitle');
const pageUrl = document.getElementById('pageUrl');
const notesInput = document.getElementById('notes');
const saveText = document.getElementById('saveText');

let currentTab;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab info
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tabs[0];

    // Update page info
    pageTitle.textContent = currentTab.title;
    pageUrl.textContent = currentTab.url;

    // Check if configuration exists
    const config = await chrome.storage.sync.get(['notionToken', 'databaseId']);

    if (config.notionToken && config.databaseId) {
        setupSection.classList.add('hidden');
        mainSection.classList.remove('hidden');
    } else {
        setupSection.classList.remove('hidden');
        mainSection.classList.add('hidden');
    }
});

// Save configuration
saveConfigBtn.addEventListener('click', async () => {
    const token = notionTokenInput.value.trim();
    const dbId = databaseIdInput.value.trim();

    if (!token || !dbId) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    // Test the configuration
    saveConfigBtn.textContent = 'Testing...';
    saveConfigBtn.disabled = true;

    try {
        const response = await fetch(`https://api.notion.com/v1/data_sources/${dbId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Notion-Version': '2025-09-03'
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token or database ID');
        }

        // Save configuration
        await chrome.storage.sync.set({
            notionToken: token,
            databaseId: dbId
        });

        showStatus('Configuration saved!', 'success');

        setTimeout(() => {
            setupSection.classList.add('hidden');
            mainSection.classList.remove('hidden');
            hideStatus();
        }, 1000);

    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        saveConfigBtn.textContent = 'Save Configuration';
        saveConfigBtn.disabled = false;
    }
});

// Save article to Notion
saveArticleBtn.addEventListener('click', async () => {
    const config = await chrome.storage.sync.get(['notionToken', 'databaseId']);

    if (!config.notionToken || !config.databaseId) {
        showStatus('Configuration missing', 'error');
        return;
    }

    saveText.textContent = 'Saving...';
    saveArticleBtn.disabled = true;

    try {
        // Calculate deadline (one week from now)
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
        const deadlineStr = deadline.toISOString().split('T')[0];

        // Create page in Notion
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2025-09-03'
            },
            body: JSON.stringify({
                parent: {
                    data_source_id: config.databaseId
                },
                properties: {
                    'Title': {
                        title: [
                            {
                                text: {
                                    content: currentTab.title
                                }
                            }
                        ]
                    },
                    'URL': {
                        url: currentTab.url
                    },
                    'Status': {
                        status: {
                            name: 'To Read'
                        }
                    },
                    'Deadline': {
                        date: {
                            start: deadlineStr
                        }
                    },
                    'Added': {
                        date: {
                            start: new Date().toISOString().split('T')[0]
                        }
                    }
                },
                children: notesInput.value.trim() ? [
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [
                                {
                                    type: 'text',
                                    text: {
                                        content: notesInput.value.trim()
                                    }
                                }
                            ]
                        }
                    },
                    {
                        object: 'block',
                        type: "bookmark",
                        bookmark: {
                            caption: [],
                            url: currentTab.url
                        }
                    }
                ] : []
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save article');
        }

        showStatus('Article saved to Notion!', 'success');

        // Close popup after success
        setTimeout(() => {
            window.close();
        }, 1500);

    } catch (error) {
        console.error('Error saving article:', error);
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        saveText.textContent = 'Save to Reading List';
        saveArticleBtn.disabled = false;
    }
});

// Open settings
openSettingsBtn.addEventListener('click', () => {
    setupSection.classList.remove('hidden');
    mainSection.classList.add('hidden');

    // Pre-populate fields
    chrome.storage.sync.get(['notionToken', 'databaseId']).then(config => {
        if (config.notionToken) notionTokenInput.value = config.notionToken;
        if (config.databaseId) databaseIdInput.value = config.databaseId;
    });
});

// Utility functions
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
}

function hideStatus() {
    statusDiv.classList.add('hidden');
}