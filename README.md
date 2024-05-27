# Mattermost-Seamless-Online-Extension

You can also download it easily via the Chrome Web Store.
[Chrome Web Store Link](https://blabliblub)

## Beschreibung
This extension was developed to permanently display users as online in Mattermost. It prevents you from appearing as absent or inactive due to inactivity. The extension ensures that you are always shown as active, even if you are not actively using your computer. This is particularly useful in professional environments where it is important to be continuously available.

## Installation

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
   [Download Link](add link)

2. Open the extension page in Brave:
```
brave://extension
```
3. Activate the developer mode.

4. Click on “Load unpacked” and select the downloaded ZIP file.
___
### Safari
1. Download the latest version of the extension from Github:
   [Download Link](add link)

2. Open the settings in Safari and go to the “Extensions” tab

3. Activate the developer mode:
   1. Open Safari and go to “Safari” > “Preferences” > “Advanced”.
   2. Activate the checkbox “Show ‘Developer’ menu in the menu bar”.

4. Open the developer menu and select “Extensions” > “Install extensions from package file...” and select the downloaded ZIP file.
___
### Firefox
1. Download the latest version of the extension from Github:
   [Download Link](add link)

2. Open the add-ons page in Firefox:

3. Click on the gear icon and select “Install add-on from file...” and select the downloaded ZIP file.

## Congratulations

You have successfully added an extension!


##Features
1. Automatic Status Update: The extension periodically checks the user's status on Mattermost and updates it to "online" if it detects that the status has changed to "away".
2. User Interface: Provides a simple popup interface where users can enable or disable the automatic status update feature and manually trigger a status update.
3. Cookie Management: Automatically captures and stores necessary authentication tokens and user information from the Mattermost domain cookies.


##Detailed Functionality
###Background Process (background.js):
Listening for Requests: Monitors outgoing requests to the Mattermost API to capture and store authentication tokens and user IDs.
Periodic Status Check: Sets up a periodic alarm to check the user's current status on Mattermost.
Status Update Logic: If the user's status is "away", the extension sends a request to update the status back to "online".

###Popup Interface (popup.html & popup.js):
User Controls:
A switch to enable or disable the automatic status update feature.
A button to manually scan and fetch user information from the Mattermost domain.
Display Information: Shows the captured Mattermost domain, user ID, and authentication tokens.
Cookie Handling:

The extension retrieves cookies from the Mattermost domain to extract necessary authentication tokens (MMAUTHTOKEN, MMUSERID, MMCSRF) required for API requests.
How It Works
Initial Setup: When a user navigates to Mattermost and performs actions that trigger certain API requests, the extension captures necessary tokens from these requests.
Periodic Check: Every 2 minutes, the extension checks the user’s status on Mattermost. If the user is detected as "away", the extension sends an update request to set the status back to "online".
User Interaction: Users can interact with the extension through a popup interface, enabling or disabling automatic status updates and manually fetching user information.
Usage
Enable Automatic Status Updates: Open the extension's popup, toggle the switch to "on", and the extension will automatically keep your status online.
Manual Status Update: Press the "Scan" button to fetch the latest user information and manually trigger a status update.
View Stored Information: The popup displays the current Mattermost domain, user ID, and tokens for user verification.
Benefits
Prevents Unintended Inactivity: Ensures that users stay online on Mattermost, avoiding disruptions caused by automatic "away" status.
Seamless Integration: Runs in the background with minimal user interaction required.
User Control: Provides a simple interface for users to manage their online status and view necessary information.
