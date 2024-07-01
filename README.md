# Mattermost-Seamless-Online-Extension

You can also download it easily via the Chrome Web Store.
<a href="https://chromewebstore.google.com/detail/mattermost-online-status/ckamancjfldifdfjblhacmbgpmefkpoi" target="_blank">Chrome Web Store Link</a>

## Beschreibung
This extension was developed to permanently display users as online in Mattermost. It prevents you from appearing as absent or inactive due to inactivity. The extension ensures that you are always shown as active, even if you are not actively using your computer. This is particularly useful in professional environments where it is important to be continuously available.

## Installation
### INFO it just works on chrome-based browsers for now!

### Chrome
1. Download the latest version of the extension from Github:
   [Download](add link)

2. Open the extension page in Chrome:
```
chrome://extensions
```
3. Activate the developer mode.

4. Click on “Load unpacked” and select the downloaded ZIP file.
___
### Brave
1. Download the latest version of the extension from Github:
   [Download](add link)

2. Open the extension page in Brave:
```
brave://extension
```
3. Activate the developer mode.

4. Click on “Load unpacked” and select the downloaded ZIP file.


## Congratulations

You have successfully added an extension!
Now you can pin the extension like every other.


## Features
1. Automatic Status Update: 
      The extension periodically checks the user's status on any mattermost instance and updates it to "online" if it detects that the status has changed to "away".
2. User Interface: 
      Provides a simple popup interface where users can enable or disable the automatic status update feature and manually trigger a status update.
3. Local Storage Management: 
      Automatically captures and stores necessary authentication tokens and user information from the mattermost domain in the local storage.


## Detailed Functionality
### Background Process (background.js):
Listening for Requests: 
   Monitors outgoing requests to the Mattermost API to capture and store authentication tokens and user IDs.
Periodic Status Check: 
   Sets up a periodic alarm to check the user's current status on Mattermost.
Status Update Logic: 
   If the user's status is "away", the extension sends a request to update the status back to "online".

### Popup Interface (popup.html & popup.js):
User Controls:
   A switch to enable or disable the automatic status update feature.
   A button to manually scan and fetch user information from the Mattermost domain.
   Display Information: Shows the captured Mattermost domain, user ID, and authentication tokens.

Local Storage Handling:
   The extension retrieves local storage from the mattermost domain to extract necessary authentication tokens (MMAUTHTOKEN, MMUSERID, MMCSRF) required for API requests.

### How It Works
 - Initial Setup: 
      When a user navigates to Mattermost and performs actions that trigger certain API requests, the extension captures necessary tokens from these requests.
 - Periodic Check: 
      Every 2 minutes, the extension checks the user’s status on Mattermost. If the user is detected as "away", the extension sends an update request to set the status back to "online".
 - User Interaction: 
      Users can interact with the extension through a popup interface, enabling or disabling automatic status updates and manually fetching user information.
## Usage
 - Enable Automatic Status Updates: 
      Open the extension's popup, toggle the switch to "on", and the extension will automatically keep your status online.
 - Manual Status Update: 
      Press the "Scan" button to fetch the latest user information and manually trigger a status update.
 - View Stored Information: 
      The popup displays the current Mattermost domain, user ID, and tokens for user verification.

### Benefits
1. Prevents Unintended Inactivity: Ensures that users stay online on Mattermost, avoiding disruptions caused by automatic "away" status.
2. Seamless Integration: Runs in the background with minimal user interaction required.
3. User Control: Provides a simple interface for users to manage their online status and view necessary information.
