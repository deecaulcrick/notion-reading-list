// Content script for Notion Reading List extension
// This script runs on every page and can interact with the page content

// Add keyboard shortcut listener
document.addEventListener('keydown', async (event) => {
  // Ctrl/Cmd + Shift + N to quickly save current page
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === ';L') {
    event.preventDefault();
    
    // Get configuration
    const config = await chrome.storage.sync.get(['notionToken', 'databaseId']);
    
    if (!config.notionToken || !config.databaseId) {
      // Show message to configure
      showNotification('Please configure the extension first', 'error');
      return;
    }
    
    // Send message to background script to save current page
    chrome.runtime.sendMessage({
      action: 'saveToNotion',
      token: config.notionToken,
      databaseId: config.databaseId,
      title: document.title,
      url: window.location.href
    }, (response) => {
      if (response.success) {
        showNotification('Saved to Notion Reading List!', 'success');
      } else {
        showNotification('Failed to save: ' + response.error, 'error');
      }
    });
  }
});

// Function to show in-page notifications
function showNotification(message, type) {
  // Remove existing notification
  const existing = document.querySelector('.notion-ext-notification');
  if (existing) {
    existing.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notion-ext-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    background: ${type === 'success' ? '#10B981' : '#EF4444'};
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    transform: translateX(400px);
    transition: transform 0.3s ease-out;
  `;
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Listen for selection changes to potentially extract quotes
document.addEventListener('mouseup', () => {
  const selection = window.getSelection().toString().trim();
  if (selection.length > 20) { // Only store substantial selections
    // Store selected text for potential use in popup
    chrome.storage.local.set({
      selectedText: selection,
      selectionUrl: window.location.href,
      selectionTime: Date.now()
    });
  }
});