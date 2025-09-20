# Notion Reading List Chrome Extension - Setup Guide

## Prerequisites
- Notion Account: You need a Notion workspace
- Chrome Browser: This extension is built for Chrome

**Step 1: Create Notion Database**
Open Notion and create a new page
Add a database with the following properties:
Title (Title property)
URL (URL property)
Status (Select property with options: "To Read", "Reading", "Completed")
Deadline (Date property)
Added (Date property)
Notes (Text property - optional)

**Step 2: Create Notion Integration**
Go to https://www.notion.so/my-integrations
Click "New integration"
Give it a name (e.g., "Reading List Extension")
Select your workspace
Copy the Integration Token (starts with secret_)

**Step 3: Share Database with Integration**
Go to your reading list database in Notion
Click the "Share" button (top right)
Click "Invite" and select your integration
Give it "Edit" permissions

**Step 4: Get Database ID**
Open your database in Notion
Copy the URL - it looks like: https://notion.so/workspace/DATABASE_ID?v=VIEW_ID
Extract the DATABASE_ID (32 characters between the last / and ?)

**Step 5: Install Extension**
Download all the extension files to a folder
Open Chrome and go to chrome://extensions/
Enable "Developer mode" (top right toggle)
Click "Load unpacked" and select your folder
The extension should now appear in your extensions

**Step 6: Configure Extension**
Click the extension icon in Chrome
Enter your Integration Token and Database ID
Click "Save Configuration"
The extension will test the connection
Usage
Method 1: Extension Popup
Navigate to any article/webpage
Click the extension icon
Add optional notes
Click "Save to Reading List"
Method 2: Context Menu
Right-click on any page or link
Select "Save to Notion Reading List"
Method 3: Keyboard Shortcut
Press Ctrl+Shift+N (or Cmd+Shift+N on Mac)
Article will be saved automatically
How It Works
Automatic Deadline: Sets deadline to 7 days from when article is added
Status Tracking: Newly added articles get "To Read" status
Notes Support: Add personal notes when saving articles
URL Preservation: Keeps original article URL for easy access
Troubleshooting
"Invalid token or database ID"
Double-check your integration token
Ensure the database ID is correct (32 characters)
Make sure the integration has access to the database
"Failed to save article"
Check that all required database properties exist
Ensure property names match exactly (case-sensitive)
Verify the integration has edit permissions
Extension not appearing
Make sure developer mode is enabled
Check for errors in chrome://extensions/
Reload the extension if needed
Database Property Names
The extension expects these exact property names in your Notion database:

Title (Title)
URL (URL)
Status (Select)
Deadline (Date)
Added (Date)
If you use different names, you'll need to modify the extension code accordingly.

Security Note
Your Notion integration token is stored locally in Chrome's sync storage. Never share this token with others as it provides access to your Notion workspace.

