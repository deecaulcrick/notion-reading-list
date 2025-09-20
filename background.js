// Background service worker for the Notion Reading List extension

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Notion Reading List extension installed');

    // Create context menu item
    chrome.contextMenus.create({
        id: 'save-to-notion',
        title: 'Save to Notion Reading List',
        contexts: ['page', 'link']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'save-to-notion') {
        // Get configuration
        const config = await chrome.storage.sync.get(['notionToken', 'databaseId']);

        if (!config.notionToken || !config.databaseId) {
            // Open popup to configure
            chrome.action.openPopup();
            return;
        }

        // Determine URL and title
        let urlToSave = info.linkUrl || tab.url;
        let titleToSave = info.linkUrl ? info.selectionText || 'Linked Article' : tab.title;

        try {
            await saveToNotion(config.notionToken, config.databaseId, titleToSave, urlToSave);

            // Show success notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Saved to Notion!',
                message: `"${titleToSave}" added to your reading list`
            });

        } catch (error) {
            console.error('Error saving to Notion:', error);

            // Show error notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Error',
                message: 'Failed to save article to Notion'
            });
        }
    }
});

// Function to save article to Notion
async function saveToNotion(token, databaseId, title, url) {
    // Calculate deadline (one week from now)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    const deadlineStr = deadline.toISOString().split('T')[0];
    const notesInput = document.getElementById('notes');

    const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2025-09-03'
        },
        body: JSON.stringify({
            parent: {
                data_source_id: databaseId
            },
            properties: {
                'Title': {
                    title: [
                        {
                            text: {
                                content: title
                            }
                        }
                    ]
                },
                'URL': {
                    url: url
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
                },

            }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save to Notion');
    }

    return await response.json();
}

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveToNotion') {
        saveToNotion(request.token, request.databaseId, request.title, request.url)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Keep message channel open for async response
    }
});