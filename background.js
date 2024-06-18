/*
MATTERMOST SEAMLESS ONLINE STATUS

CREATED BY @Nightyonlyy
*/

// Check every 2 minute [DEFAULT MATTERMOST INACTIVITY TIMEOUT IS 5 min]
const CHECK_INTERVAL_MINUTES = 2;

// Helper function to get cookies and save to local storage
const saveCookiesToLocalStorage = (cookies) => {
    let xRequestId = null;
    let userId = null;
    let csrfToken = null;

    cookies.forEach(cookie => {
        if (cookie.name === 'MMAUTHTOKEN') {
            xRequestId = cookie.value;
        }
        if (cookie.name === 'MMUSERID') {
            userId = cookie.value;
        }
        if (cookie.name === 'MMCSRF') {
            csrfToken = cookie.value;
        }
    });

    if (xRequestId && userId && csrfToken) {
        chrome.storage.local.set({ xRequestId, userId, csrfToken }, () => {
            console.log('Captured data saved:', { xRequestId, userId, csrfToken });
        });
    } else {
        console.error('Missing data to save:', { xRequestId, userId, csrfToken });
    }
};

// Grabs the current data from a request to save it in the local storage 
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        if (details.url.includes('/api/v4/channels/members/me/view') && details.method === 'POST') {
            chrome.cookies.getAll({ domain: new URL(details.url).hostname }, saveCookiesToLocalStorage);
        }
    },
    { urls: ["<all_urls>"], types: ["xmlhttprequest"] },
    ["requestHeaders", "extraHeaders"]
);

// Helper function to fetch the status
const fetchStatus = async (url, headers) => {
    try {
        const response = await fetch(url, { method: "GET", headers, credentials: 'include' });
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        return data.status;
    } catch (error) {
        console.error("Error fetching status:", error);
        return null;
    }
};

// Helper function to update the status
const updateStatus = async (url, headers, body) => {
    try {
        const response = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body), credentials: 'include' });
        if (!response.ok) throw new Error(response.statusText);
        console.log("Status successfully updated to 'online'");
    } catch (error) {
        console.error("Error updating status:", error);
    }
};

// Creates an alarm which checks if you're still online or away
chrome.alarms.create("checkStatus", { periodInMinutes: CHECK_INTERVAL_MINUTES });

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "checkStatus") {
        const { xRequestId, userId, csrfToken } = await chrome.storage.local.get(["xRequestId", "userId", "csrfToken"]);
        if (xRequestId && userId && csrfToken) {
            const headers = {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "X-CSRF-Token": csrfToken,
                "X-Request-Id": xRequestId
            };

            // Get the URL of the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (tabs.length > 0) {
                    const activeTabUrl = new URL(tabs[0].url);
                    const domain = activeTabUrl.hostname;

                    const statusUrl = `https://${domain}/api/v4/users/${userId}/status`;
                    const status = await fetchStatus(statusUrl, headers);
                    if (status === "away") {
                        await updateStatus(statusUrl, headers, { "user_id": userId, "status": "online" });
                    }
                } else {
                    console.error('No active tab found');
                }
            });
        } else {
            console.error('Missing data on alarm:', { xRequestId, userId, csrfToken });
        }
    }
});


async function sendApiRequest() {
    const secret = 'JBSWY3DPEHPK3PXP'; // Dein geheimer Schlüssel
    const totp = new jsotp.TOTP(secret);
    const token = totp.now(); // Generiere den aktuellen TOTP
    const unixTimestamp = Math.round(new Date().getTime() / 1000); 
  
    fetch('http://localhost:8080/api/v1/tracking/mattermost-persistent-online', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        timestamp: "1718537582",
        switch: "true",
      })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }
  
